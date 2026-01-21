# Data Model: SubSpace Innovation Flow Replace Options

**Feature Branch**: `001-subspace-flow-replace-options`
**Date**: 2026-01-15

## Overview

This feature extends existing entities and UI state - no new domain entities are created. The main changes are to the mutation input type and UI component state.

## Existing Entities (Reference)

### SubSpace (Space)

- Contains a `Collaboration` which holds the `InnovationFlow` and `CalloutsSet`
- Innovation flow changes target the `collaborationId`

### InnovationFlow

- Defines the stages/phases of the innovation process
- Contains `states` array with `displayName`, `description`, `sortOrder`
- Has a `currentState` reference

### Callout

- Container for contributions (posts, links, whiteboards)
- Has `classification.flowState` tagset mapping it to an innovation flow state
- Ordered by `sortOrder`

### CalloutContribution (Post)

- User-created content within a callout
- Linked to a callout via `calloutId`

## API Input Changes

### Current: UpdateCollaborationFromSpaceTemplateInput

```typescript
type UpdateCollaborationFromSpaceTemplateInput = {
  collaborationID: UUID!;
  spaceTemplateID: UUID!;
  addCallouts?: Boolean; // true = add template callouts, false = don't add
};
```

### Required: Extended Input (Backend Change)

```typescript
type UpdateCollaborationFromSpaceTemplateInput = {
  collaborationID: UUID!;
  spaceTemplateID: UUID!;
  addCallouts?: Boolean; // true = add template callouts alongside existing
  deleteExistingCallouts?: Boolean; // NEW: true = delete all existing callouts first
};
```

**Option Mapping:**
| UI Option | addCallouts | deleteExistingCallouts |
|-----------|-------------|------------------------|
| Option 1: Replace all | true | true |
| Option 2: Keep existing + add template | true | false (default) |
| Option 3: Keep existing only | false | false (default) |

## UI State Model

### FlowReplaceOption (New Type)

```typescript
enum FlowReplaceOption {
  REPLACE_ALL = 'replace_all', // Option 1: Delete existing + add template
  ADD_TEMPLATE_POSTS = 'add_template', // Option 2: Keep existing + add template
  FLOW_ONLY = 'flow_only', // Option 3: Keep existing, no new posts
}
```

### Dialog State Changes

**Current ApplySpaceTemplateDialog state:**

```typescript
const [addCallouts, setAddCallouts] = useState(true);
```

**New state:**

```typescript
const [selectedOption, setSelectedOption] = useState<FlowReplaceOption>(
  FlowReplaceOption.ADD_TEMPLATE_POSTS // Default to safest option that adds value
);
```

### Confirmation Dialog State

```typescript
interface ConfirmDeleteDialogState {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

## Validation Rules

1. **Option 1 (REPLACE_ALL)**:
   - MUST show confirmation dialog before executing
   - MUST warn user that all existing posts will be permanently deleted
   - MUST NOT proceed without explicit user confirmation

2. **Option 2 & 3**:
   - No confirmation required (non-destructive)
   - Execute immediately on selection confirmation

3. **Edge Cases**:
   - If SubSpace has no existing posts: Option 1 should skip confirmation (nothing to delete)
   - If template has no callouts: Options 1 & 2 should still work (delete existing for Option 1, no new posts for both)

## State Transitions

```
User clicks "Use Template"
        │
        ▼
┌─────────────────────────┐
│ ApplySpaceTemplateDialog │
│ (3 radio options)       │
└───────────┬─────────────┘
            │
            ▼
    ┌───────┴───────┐
    │ Option 1?     │
    └───────┬───────┘
      Yes   │   No
        ▼   │   ▼
┌───────────┐ │ ┌─────────────┐
│ Confirm   │ │ │ Execute     │
│ Delete    │ │ │ Option 2/3  │
│ Dialog    │ │ └──────┬──────┘
└─────┬─────┘ │        │
      │       │        │
  Confirm     │        │
      │       │        │
      ▼       │        │
┌─────────────┴────────┴──────┐
│ Call mutation with params   │
│ based on selected option    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Refetch innovation flow     │
│ settings and close dialogs  │
└─────────────────────────────┘
```

## Related GraphQL Operations

### Query: InnovationFlowSettings

No changes required - used to check if posts exist (for conditional confirmation).

### Mutation: UpdateCollaborationFromSpaceTemplate

**File**: `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettings.graphql`

```graphql
# Current
mutation UpdateCollaborationFromSpaceTemplate(
  $collaborationId: UUID!
  $spaceTemplateId: UUID!
  $addCallouts: Boolean
) {
  updateCollaborationFromSpaceTemplate(
    updateData: {
      collaborationID: $collaborationId
      spaceTemplateID: $spaceTemplateId
      addCallouts: $addCallouts
    }
  ) {
    # ...response fields
  }
}

# After backend update - add deleteExistingCallouts parameter
mutation UpdateCollaborationFromSpaceTemplate(
  $collaborationId: UUID!
  $spaceTemplateId: UUID!
  $addCallouts: Boolean
  $deleteExistingCallouts: Boolean  # NEW
) {
  updateCollaborationFromSpaceTemplate(
    updateData: {
      collaborationID: $collaborationId
      spaceTemplateID: $spaceTemplateId
      addCallouts: $addCallouts
      deleteExistingCallouts: $deleteExistingCallouts  # NEW
    }
  ) {
    # ...response fields
  }
}
```
