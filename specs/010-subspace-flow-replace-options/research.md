# Research: SubSpace Innovation Flow Replace Options

**Feature Branch**: `010-subspace-flow-replace-options`
**Date**: 2026-01-15

## Executive Summary

This research documents the findings from investigating the existing SubSpace innovation flow implementation and the backend API support needed for the three replace options specified in the feature spec.

## Key Findings

### 1. Existing Implementation

**Current UI Flow:**

- Location: `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/`
- Main component: `InnovationFlowSettingsDialog.tsx`
- Business logic hook: `useInnovationFlowSettings.tsx`
- Template selection dialog: `ApplySpaceTemplateDialog.tsx`

**Current Options (2 options):**

1. "Add posts from template" - Adds template callouts alongside existing ones
2. "Only change the innovation flow" - Replaces flow structure only, keeps existing posts

**Missing Option:**

- Option to delete all existing posts and replace with template posts (Option 1 from spec)

### 2. Backend API Analysis

**Current Mutation:** `updateCollaborationFromSpaceTemplate`

```graphql
type UpdateCollaborationFromSpaceTemplateInput = {
  addCallouts?: Boolean  # Only controls whether to add template callouts
  collaborationID: UUID!
  spaceTemplateID: UUID!
}
```

**API Gap Identified:**
The current backend API does not support deleting existing callouts/posts when applying a new template. The `addCallouts` parameter only controls whether to ADD new callouts, not whether to DELETE existing ones.

**Required Backend Change:**
A new parameter is needed, such as `deleteExistingCallouts: Boolean` to support Option 1.

### 3. Domain Architecture

```
src/domain/collaboration/InnovationFlow/
├── InnovationFlowDialogs/
│   ├── InnovationFlowSettingsDialog.tsx    # Main dialog component
│   ├── useInnovationFlowSettings.tsx       # Business logic hook (extends for new option)
│   ├── InnovationFlowSettings.graphql      # GraphQL operations (mutation needs update)
│   └── InnovationFlowCollaborationToolsBlock.tsx
└── graphql/
    └── (fragments for flow data)

src/domain/templates/components/Dialogs/
└── ApplySpaceTemplateDialog.tsx            # Template options dialog (needs 3rd option)
```

### 4. Related Translations

**Location:** `src/core/i18n/en/translation.en.json`
**Path:** `components.innovationFlowSettings.stateEditor.selectDifferentFlow.importCalloutsDialog`

Existing keys support two options; new keys needed for third option.

## Decisions

### Decision 1: Backend API Extension Required

**Decision:** The backend API must be extended to support Option 1 (delete existing posts).

**Rationale:**

- The current `addCallouts` parameter only controls adding template callouts
- No mechanism exists to delete existing callouts atomically with the flow replacement
- Client-side deletion would require multiple API calls and risk partial failures

**Alternatives Considered:**

1. Client-side post deletion (rejected - non-atomic, poor UX, risk of partial state)
2. Separate bulk delete endpoint (rejected - still non-atomic with flow change)

### Decision 2: UI Extension Approach

**Decision:** Extend the existing `ApplySpaceTemplateDialog` to support three options instead of two.

**Rationale:**

- Follows existing UI patterns and component structure
- Minimizes code changes and reuses tested components
- Aligns with Figma design specifications

**Alternatives Considered:**

1. New separate dialog for the three options (rejected - duplicates existing functionality)
2. Sequential dialogs (rejected - poor UX, adds friction)

### Decision 3: Confirmation Dialog for Destructive Action

**Decision:** Add a secondary confirmation dialog specifically for Option 1 (delete all posts).

**Rationale:**

- Option 1 is destructive and irreversible
- Spec explicitly requires confirmation dialog
- Follows platform patterns for destructive actions (e.g., `ConfirmationDialog` component)

## Technical Implications

### Backend Coordination Required

This feature requires coordination with the backend team to:

1. Add `deleteExistingCallouts: Boolean` parameter to `UpdateCollaborationFromSpaceTemplateInput`
2. Implement atomic deletion of existing callouts when this flag is true
3. Update GraphQL schema

### Client Changes After Backend Ready

Once backend support is available:

1. Run `pnpm codegen` to regenerate GraphQL types
2. Update `InnovationFlowSettings.graphql` mutation call
3. Update `useInnovationFlowSettings.tsx` to pass new parameter
4. Extend `ApplySpaceTemplateDialog` with third option
5. Add confirmation dialog for destructive option
6. Add new translation keys

## Dependencies

| Dependency                 | Status       | Notes                                  |
| -------------------------- | ------------ | -------------------------------------- |
| Backend API extension      | **BLOCKING** | Required for Option 1                  |
| Figma design               | Available    | Referenced in GitHub issue             |
| Existing dialog components | Available    | Reuse `ConfirmationDialog`             |
| Translation system         | Available    | Add new keys to en/translation.en.json |

## Risks

1. **Backend timeline risk**: Feature blocked until backend API is ready
2. **Atomicity risk**: Without backend support, cannot guarantee atomic operation
3. **Data loss risk**: Option 1 permanently deletes user content - must have clear confirmation

## Recommendations

1. **Coordinate with backend team** to prioritize the API extension
2. **Implement UI changes in parallel** once design is finalized, gated behind feature flag if needed
3. **Add comprehensive confirmation** for destructive Option 1 to prevent accidental data loss
