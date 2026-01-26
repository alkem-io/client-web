# Quickstart: SubSpace Innovation Flow Replace Options

**Feature Branch**: `001-subspace-flow-replace-options`
**Date**: 2026-01-15

## Prerequisites

- Backend API updated with `deleteExistingCallouts` parameter
- `pnpm codegen` run after backend schema changes

## Implementation Order

### Phase 1: Backend Coordination (BLOCKING)

1. Coordinate with backend team to add `deleteExistingCallouts` parameter
2. Wait for backend deployment
3. Run `pnpm codegen` to regenerate types

### Phase 2: GraphQL Layer

1. Update mutation in `InnovationFlowSettings.graphql`
2. Update hook in `useInnovationFlowSettings.tsx`

### Phase 3: UI Components

1. Create new option type and extend `ApplySpaceTemplateDialog`
2. Add confirmation dialog for destructive Option 1
3. Add translations

### Phase 4: Testing & Polish

1. Manual testing of all three options
2. Edge case testing (no posts, no template callouts)
3. Accessibility verification

## Files to Modify

| File                                                                                           | Change                                      |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettings.graphql` | Add `deleteExistingCallouts` parameter      |
| `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings.tsx`  | Update handler signature and mutation call  |
| `src/domain/templates/components/Dialogs/ApplySpaceTemplateDialog.tsx`                         | Add third option, confirmation for Option 1 |
| `src/core/i18n/en/translation.en.json`                                                         | Add new translation keys                    |

## Key Code Changes

### 1. Update GraphQL Mutation

```graphql
# In InnovationFlowSettings.graphql
mutation UpdateCollaborationFromSpaceTemplate(
  $collaborationId: UUID!
  $spaceTemplateId: UUID!
  $addCallouts: Boolean
  $deleteExistingCallouts: Boolean  # ADD THIS
) {
  updateCollaborationFromSpaceTemplate(
    updateData: {
      collaborationID: $collaborationId
      spaceTemplateID: $spaceTemplateId
      addCallouts: $addCallouts
      deleteExistingCallouts: $deleteExistingCallouts  # ADD THIS
    }
  ) { ... }
}
```

### 2. Update Hook Handler

```typescript
// In useInnovationFlowSettings.tsx
interface ImportFlowOptions {
  addCallouts?: boolean;
  deleteExistingCallouts?: boolean;
}

const handleImportInnovationFlowFromSpaceTemplate = (spaceTemplateId: string, options: ImportFlowOptions) => {
  return updateCollaborationFromSpaceTemplate({
    variables: {
      collaborationId,
      spaceTemplateId,
      addCallouts: options.addCallouts,
      deleteExistingCallouts: options.deleteExistingCallouts,
    },
    // ... refetch queries
  });
};
```

### 3. Extend Dialog Options

```typescript
// In ApplySpaceTemplateDialog.tsx
enum FlowReplaceOption {
  REPLACE_ALL = 'replace_all',
  ADD_TEMPLATE_POSTS = 'add_template',
  FLOW_ONLY = 'flow_only',
}

const OPTIONS = [
  {
    value: FlowReplaceOption.REPLACE_ALL,
    titleKey: '...replaceAll' as TranslationKey,
    descriptionKey: '...replaceAllDescription' as TranslationKey,
    requiresConfirmation: true,
  },
  {
    value: FlowReplaceOption.ADD_TEMPLATE_POSTS,
    titleKey: '...yes' as TranslationKey, // Existing
    descriptionKey: '...yesDescription' as TranslationKey,
    requiresConfirmation: false,
  },
  {
    value: FlowReplaceOption.FLOW_ONLY,
    titleKey: '...no' as TranslationKey, // Existing
    descriptionKey: '...noDescription' as TranslationKey,
    requiresConfirmation: false,
  },
];
```

### 4. Add Translations

```json
// In translation.en.json under importCalloutsDialog
{
  "replaceAll": "Replace current $t(common.posts) with $t(common.template) $t(common.posts)",
  "replaceAllDescription": "This will permanently delete all existing $t(common.posts) and replace them with the $t(common.posts) from the $t(common.template).",
  "confirmDelete": {
    "title": "Delete all existing $t(common.posts)?",
    "description": "This action cannot be undone. All existing $t(common.posts) in this $t(common.subspace) will be permanently deleted.",
    "confirm": "Delete and Replace"
  }
}
```

## Testing Checklist

- [ ] Option 1: Verify confirmation dialog appears
- [ ] Option 1: Verify existing posts are deleted after confirmation
- [ ] Option 1: Verify template posts are added
- [ ] Option 1: Verify cancel returns to option selection
- [ ] Option 2: Verify existing posts remain
- [ ] Option 2: Verify template posts are added
- [ ] Option 3: Verify existing posts remain
- [ ] Option 3: Verify no new posts are added
- [ ] Edge: Option 1 with no existing posts (skip confirmation)
- [ ] Edge: Template with no callouts
- [ ] Edge: Error handling for failed operation
- [ ] Accessibility: Keyboard navigation works
- [ ] Accessibility: Screen reader announces options correctly

## Commands

```bash
# After backend update
pnpm codegen

# Development
pnpm start

# Type checking
pnpm lint

# Tests (if applicable)
pnpm vitest run
```
