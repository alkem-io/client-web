# Research: Default Post Template for Flow Steps

**Feature Branch**: `001-flow-post-template` | **Date**: 2026-01-09
**Related**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Overview

This document captures the architectural research and decisions made during planning for the default post template feature. It focuses on data flow patterns, component hierarchy, and integration points.

## Backend Integration Points

### GraphQL Schema (Already Implemented)

The backend has completed all necessary schema changes:

1. **InnovationFlowState Extension**:

   ```graphql
   type InnovationFlowState {
     id: UUID!
     displayName: String!
     description: String!
     defaultCalloutTemplate: Template # NEW: nullable reference
     # ... other fields
   }
   ```

2. **Mutations Available**:
   - `setDefaultCalloutTemplateOnInnovationFlowState(stateData: SetDefaultCalloutTemplateOnInnovationFlowStateInput!): InnovationFlowState`
   - `removeDefaultCalloutTemplateOnInnovationFlowState(removeData: RemoveDefaultCalloutTemplateOnInnovationFlowStateInput!): InnovationFlowState`

3. **Input Types**:

   ```graphql
   input SetDefaultCalloutTemplateOnInnovationFlowStateInput {
     innovationFlowStateID: UUID!
     defaultTemplateID: UUID!
   }

   input RemoveDefaultCalloutTemplateOnInnovationFlowStateInput {
     innovationFlowStateID: UUID!
   }
   ```

4. **Template Type**:
   ```graphql
   type Template {
     id: UUID!
     profile: Profile!
     type: TemplateType!
     callout: Callout
     # ... other fields
   }
   ```

### Authorization Rules

Setting/removing default templates requires:

- `UPDATE` privilege on the InnovationFlow
- Same authorization as editing flow states
- Standard admin role permissions

## Data Flow Architecture

### Admin Configuration Flow

```
SpaceAdminLayoutPage
  └─> InnovationFlowCollaborationToolsBlock
      └─> InnovationFlowDragNDropEditor
          ├─> InnovationFlowStateMenu (three-dot menu)
          │   └─> onClick: setSetDefaultTemplateStateId(state.id)
          └─> SetDefaultTemplateDialog
              ├─> Shows ImportTemplatesDialog filtered to CALLOUT type
              ├─> Displays currentTemplate if set
              ├─> onSelectTemplate: calls mutation with (stateId, templateId)
              └─> Duplicate prevention: if templateId === currentTemplate.id, no-op
```

**Key Decision**: Reuse existing `ImportTemplatesDialog` component

- **Rationale**: Maintains UI consistency, leverages existing template browsing logic
- **Trade-off**: Need to add subtitle display for current template status
- **Implementation**: Wrap in `SetDefaultTemplateDialog` to add custom subtitle and action buttons

### Member Post Creation Flow (To Be Implemented)

```
CalloutPage (has callout with classification.flowState)
  └─> CalloutView
      └─> ContributionsCardsExpandable
          └─> CreateContributionButtonPost
              ├─> Opens: PostCreationDialog
              ├─> Needs: flowStateDefaultTemplateId
              └─> Loads: useFlowStateDefaultTemplate(templateId)
                  └─> Queries: TemplateContentQuery
                      └─> Returns: template.callout.contributionDefaults.postDescription
```

**Challenge**: Linking flow state name to template ID

The callout has `classification.flowState.tags[0]` (e.g., "Ideation"), but we need the `InnovationFlowState.id` to get the `defaultCalloutTemplate.id`.

**Solution Options**:

1. **Option A: Query innovation flow in CreateContributionButtonPost**
   - Pro: Self-contained, uses Apollo cache
   - Con: Extra query, component needs collaborationId
   - Status: ❌ Rejected - requires collaborationId not available at that level

2. **Option B: Pass template ID from parent component**
   - Pro: Explicit, parent already has innovation flow data
   - Con: Requires prop drilling through multiple levels
   - Status: ✅ **CHOSEN** - aligns with domain-driven architecture

3. **Option C: Enhance backend to include templateId in callout response**
   - Pro: Optimal data loading, no prop drilling
   - Con: Requires backend changes (out of scope)
   - Status: ❌ Rejected - backend is "done"

### Prop Flow for Template ID

Path: `CalloutPage` → `CalloutView` → `ContributionsCardsExpandable` → `CreateContributionButtonPost`

**CalloutPage** (or parent container):

- Already queries collaboration and innovation flow
- Has access to `innovationFlow.states[]` with `defaultCalloutTemplate.id`
- Needs to map `callout.classification.flowState.tags[0]` to flow state

**Mapping Logic**:

```typescript
const flowStateName = callout.classification?.flowState?.tags[0];
const flowState = innovationFlow?.states.find(s => s.displayName === flowStateName);
const flowStateDefaultTemplateId = flowState?.defaultCalloutTemplate?.id;
```

**Propagation**:

1. CalloutPage calculates `flowStateDefaultTemplateId`
2. Passes to CalloutView as new prop
3. CalloutView passes to ContributionsCardsExpandable
4. ContributionsCardsExpandable passes to CreateContributionButtonPost
5. CreateContributionButtonPost uses `useFlowStateDefaultTemplate(flowStateDefaultTemplateId)`

## Template Content Loading

### GraphQL Query Design

**Query Name**: `TemplateContent`

**Purpose**: Fetch template content for pre-filling post creation dialog

**Fields Needed**:

- `template.callout.contributionDefaults.postDescription` (markdown text)

**Query Document** (see contracts/TemplateContent.graphql):

```graphql
query TemplateContent($templateId: UUID!) {
  lookup {
    template(ID: $templateId) {
      id
      callout {
        contributionDefaults {
          postDescription
        }
      }
    }
  }
}
```

**Usage Pattern**:

- Lazy query (load on-demand when dialog opens)
- Cache via Apollo Client (subsequent opens are instant)
- Loading state handled by hook return value

### Hook Design: useFlowStateDefaultTemplate

**Location**: `src/domain/collaboration/InnovationFlow/hooks/useFlowStateDefaultTemplate.ts`

**Interface**:

```typescript
interface UseFlowStateDefaultTemplateProps {
  templateId?: string | null;
  enabled?: boolean; // only load when dialog is open
}

interface UseFlowStateDefaultTemplateReturn {
  defaultDescription: string | undefined;
  loading: boolean;
  error: ApolloError | undefined;
}
```

**Behavior**:

- If `templateId` is null/undefined, returns `undefined` (no template)
- If `enabled` is false, skips query
- Uses `useLazyQuery` to load only when needed
- Returns loading state for dialog to show spinner
- Extracts `postDescription` from query result

**Error Handling**:

- If template query fails, returns `undefined` (graceful degradation)
- User sees empty form (same as no-template behavior)
- No error toast (progressive enhancement pattern)

## Component Updates Required

### 1. CalloutPage (or equivalent container)

**File**: Needs investigation - find where CalloutView is rendered with callout data

**Changes**:

- Add logic to map flow state name to template ID
- Pass `flowStateDefaultTemplateId` prop to CalloutView

### 2. CalloutView

**File**: `src/domain/collaboration/callout/CalloutView/CalloutView.tsx`

**Changes**:

- Add `flowStateDefaultTemplateId?: string` to props interface
- Pass through to ContributionsCardsExpandable

### 3. ContributionsCardsExpandable

**File**: `src/domain/collaboration/calloutContributions/contributionsCardsExpandable/ContributionsCardsExpandable.tsx`

**Changes**:

- Add `flowStateDefaultTemplateId?: string` to props interface
- Pass through to CreateContributionButtonPost

### 4. CreateContributionButtonPost

**File**: `src/domain/collaboration/calloutContributions/post/CreateContributionButtonPost.tsx`

**Changes**:

- Add `flowStateDefaultTemplateId?: string` to props interface
- Import and use `useFlowStateDefaultTemplate` hook
- Merge template description with callout defaults
- Pass loading state to PostCreationDialog

**Priority Logic**:

1. If `templateDescription` exists (from hook), use it
2. Else fall back to `callout.contributionDefaults.postDescription`
3. Else empty string (existing behavior)

### 5. PostCreationDialog

**File**: `src/domain/collaboration/calloutContributions/post/PostCreationDialog.tsx`

**Changes**: None required (already accepts `defaultDescription` prop)

## Duplicate Prevention Strategy

**Requirement**: Selecting the same template that's already set = no-op

**Implementation** (in SetDefaultTemplateDialog):

```typescript
const handleSelectTemplate = async (template: AnyTemplate) => {
  // Duplicate prevention
  if (template.id === currentTemplate?.id) {
    return; // Early return, no API calls, dialog stays open
  }

  // Normal flow
  await onSelectTemplate(template.id);
  onClose();
};
```

**Button State**:

```typescript
<Button
  disabled={template.id === currentTemplate?.id || loading}
>
  {t('buttons.select')}
</Button>
```

**Rationale**: UI-only prevention (no backend validation needed)

## Performance Considerations

### Template Content Loading

**Target**: <500ms from dialog open to content displayed

**Optimizations**:

1. **Lazy Loading**: Only query when dialog opens (`enabled` prop)
2. **Apollo Cache**: Subsequent opens are instant (cache hit)
3. **Concurrent Rendering**: Dialog opens immediately, content streams in
4. **Loading State**: Skeleton/spinner while loading (non-blocking)

**Measurement**:

- Apollo DevTools: Query timing
- React DevTools: Component render times

### Admin Dialog Performance

**Template Library**: Existing component already optimized

- Paginated template list
- Virtualized rendering for large libraries
- Search/filter capabilities

**No Additional Optimizations Needed**: Reusing proven component

## Edge Case Handling

### 1. Template Deleted After Being Set as Default

**Backend Behavior**: `defaultCalloutTemplate` becomes null (cascade delete)

**Frontend Behavior**:

- Admin sees "No default template set" when opening dialog
- Members see empty post form (graceful degradation)
- No error messages (expected state)

**No Special Handling Required**: Null reference is valid state

### 2. Flow State Name Changed

**Backend Behavior**: `InnovationFlowState.displayName` can be updated

**Frontend Impact**:

- Callout still has `classification.flowState.tags[0]` with old name
- Mapping logic: `flowState = states.find(s => s.displayName === flowStateName)`
- If name doesn't match, mapping returns undefined
- Result: No template loaded (same as no-template case)

**Mitigation**: Flow state names are rarely changed (admin action)

### 3. Multiple Flow Steps with Same Template

**Backend Behavior**: Multiple states can reference same template

**Frontend Behavior**:

- Each state's dialog shows the shared template as "Current template"
- Changing template content (via template editor) affects all referencing states
- Changing which template is selected is per-state (independent)

**No Special Handling Required**: Works as designed

### 4. Callout Has Both Flow Template AND Callout Defaults

**Priority**:

1. Flow state default template (if set)
2. Callout contributionDefaults.postDescription (if set)
3. Empty string

**Implementation**:

```typescript
const finalDefaultDescription = templateDescription ?? callout.contributionDefaults.postDescription ?? '';
```

## Testing Strategy

### Admin Flow Testing

**Manual Tests**:

1. Open flow state menu, verify "Set Default Post Template" appears
2. Click option, verify dialog shows CALLOUT templates only
3. Select template, verify mutation succeeds and dialog closes
4. Reopen dialog, verify current template displayed
5. Select same template, verify no API call and dialog stays open
6. Remove template, verify mutation succeeds

**Verification**:

- Apollo DevTools: Inspect mutation calls and cache updates
- Network tab: Verify no duplicate calls on same-template selection

### Member Flow Testing

**Manual Tests**:

1. Navigate to flow step with template, click "Add Post"
2. Verify dialog opens with template content pre-filled
3. Edit content and create post successfully
4. Navigate to flow step without template, click "Add Post"
5. Verify dialog opens empty (or with callout default)

**Verification**:

- React DevTools: Inspect `defaultDescription` prop value
- Apollo DevTools: Verify TemplateContent query fires only when dialog opens

### Performance Testing

**Metrics**:

- Template dialog open time: <500ms (target)
- Template content loading: <500ms (target)
- No UI blocking during template fetch

**Tools**:

- Browser DevTools Performance tab
- React DevTools Profiler
- Apollo DevTools Query timeline

## Open Questions & Decisions

### ✅ Resolved: How to Pass Template ID to Post Creation?

**Decision**: Prop drilling from parent component with innovation flow data

**Rationale**: Aligns with domain-driven architecture, explicit data flow

### ✅ Resolved: When to Load Template Content?

**Decision**: Lazy loading when dialog opens (not on page load)

**Rationale**: Avoids unnecessary queries, optimizes initial page load

### ✅ Resolved: How to Handle Template Load Failures?

**Decision**: Graceful degradation - show empty form

**Rationale**: Template is progressive enhancement, not critical functionality

### ⚠️ Needs Investigation: Which Component Renders CalloutView?

**Status**: Requires code exploration to identify exact parent component

**Next Step**: Use Grep to find `<CalloutView` usage and confirm data availability

## References

- **Spec**: [spec.md](./spec.md) - Functional requirements and user stories
- **Plan**: [plan.md](./plan.md) - Implementation steps
- **Constitution**: Referenced in plan.md - Architecture compliance validation
- **Backend Schema**: Available via `pnpm codegen` introspection
