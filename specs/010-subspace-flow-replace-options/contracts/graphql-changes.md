# GraphQL Contract Changes: SubSpace Innovation Flow Replace Options

**Feature Branch**: `001-subspace-flow-replace-options`
**Date**: 2026-01-15

## Summary

This document specifies the GraphQL contract changes required to support the three innovation flow replacement options.

## Backend API Change Required

### Input Type Extension

**File (Backend)**: GraphQL Schema Definition

```graphql
# Current Schema
input UpdateCollaborationFromSpaceTemplateInput {
  """
  Add the Callouts from the Collaboration Template
  """
  addCallouts: Boolean
  """
  ID of the Collaboration to be updated
  """
  collaborationID: UUID!
  """
  The Space Template whose Collaboration that will be used for updates
  """
  spaceTemplateID: UUID!
}

# Required Update
input UpdateCollaborationFromSpaceTemplateInput {
  """
  Add the Callouts from the Collaboration Template
  """
  addCallouts: Boolean
  """
  Delete all existing Callouts before applying the template
  """
  deleteExistingCallouts: Boolean # NEW PARAMETER
  """
  ID of the Collaboration to be updated
  """
  collaborationID: UUID!
  """
  The Space Template whose Collaboration that will be used for updates
  """
  spaceTemplateID: UUID!
}
```

### Expected Behavior Matrix

| deleteExistingCallouts | addCallouts | Behavior                                                  |
| ---------------------- | ----------- | --------------------------------------------------------- |
| true                   | true        | Delete all existing callouts, then add template callouts  |
| true                   | false       | Delete all existing callouts, don't add template callouts |
| false (default)        | true        | Keep existing callouts, add template callouts             |
| false (default)        | false       | Keep existing callouts, don't add template callouts       |

### UI Option to API Parameter Mapping

| UI Option | Description                      | deleteExistingCallouts | addCallouts |
| --------- | -------------------------------- | ---------------------- | ----------- |
| Option 1  | Replace flow and all posts       | `true`                 | `true`      |
| Option 2  | Replace flow, add template posts | `false`                | `true`      |
| Option 3  | Replace flow only                | `false`                | `false`     |

## Client-Side Mutation Update

**File**: `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettings.graphql`

### Current Mutation

```graphql
mutation UpdateCollaborationFromSpaceTemplate($collaborationId: UUID!, $spaceTemplateId: UUID!, $addCallouts: Boolean) {
  updateCollaborationFromSpaceTemplate(
    updateData: { collaborationID: $collaborationId, spaceTemplateID: $spaceTemplateId, addCallouts: $addCallouts }
  ) {
    id
    innovationFlow {
      id
      states {
        displayName
        description
      }
      currentState {
        displayName
        description
      }
    }
  }
}
```

### Updated Mutation

```graphql
mutation UpdateCollaborationFromSpaceTemplate(
  $collaborationId: UUID!
  $spaceTemplateId: UUID!
  $addCallouts: Boolean
  $deleteExistingCallouts: Boolean
) {
  updateCollaborationFromSpaceTemplate(
    updateData: {
      collaborationID: $collaborationId
      spaceTemplateID: $spaceTemplateId
      addCallouts: $addCallouts
      deleteExistingCallouts: $deleteExistingCallouts
    }
  ) {
    id
    innovationFlow {
      id
      states {
        displayName
        description
      }
      currentState {
        displayName
        description
      }
    }
  }
}
```

## Hook Interface Update

**File**: `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings.tsx`

### Current Function Signature

```typescript
const handleImportInnovationFlowFromSpaceTemplate = (
  spaceTemplateId: string,
  addCallouts?: boolean
) => { ... }
```

### Updated Function Signature

```typescript
interface ImportFlowOptions {
  addCallouts?: boolean;
  deleteExistingCallouts?: boolean;
}

const handleImportInnovationFlowFromSpaceTemplate = (
  spaceTemplateId: string,
  options: ImportFlowOptions
) => { ... }
```

## Codegen Impact

After backend schema update:

1. Run `pnpm codegen`
2. Verify `UpdateCollaborationFromSpaceTemplateInput` type includes new field
3. Update mutation calls to pass new parameter

## Error Handling

The backend should return appropriate errors for:

- Invalid collaboration ID
- Invalid template ID
- Insufficient permissions to delete callouts
- Atomic operation failure (should rollback)

Client should display user-friendly error messages using existing error handling patterns.
