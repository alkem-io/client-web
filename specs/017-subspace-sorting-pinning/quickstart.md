# Quickstart: Subspace Sorting & Pinning

**Branch**: `017-subspace-sorting-pinning` | **Date**: 2026-03-06

## Prerequisites

1. Server branch `041-subspace-sorting-pinning` deployed and running at `localhost:3000`
2. Run `pnpm codegen` to generate new types/hooks from the updated schema
3. Verify `SpaceSortMode` enum and `updateSubspacePinned` mutation are in generated output

## Key Workflows

### 1. Fetch subspaces with sort/pin data

```typescript
// Query returns pinned + sortOrder on each subspace, and sortMode on settings
const { data } = useSubspacesInSpaceQuery({ variables: { spaceId } });
const subspaces = data?.lookup.space?.subspaces; // each has { id, pinned, sortOrder, ... }
const sortMode = data?.lookup.space?.settings?.sortMode; // ALPHABETICAL | CUSTOM
```

### 2. Sort subspaces for display

```typescript
// Domain hook: useSubspacesSorted
const sortedSubspaces = useSubspacesSorted(subspaces, sortMode);

// Logic:
// ALPHABETICAL: pinned first (by sortOrder), then non-pinned (by name A-Z)
// CUSTOM: all by sortOrder (flat list, pin is cosmetic only)
```

### 3. Pin/unpin a subspace

```typescript
const [updatePinned] = useUpdateSubspacePinnedMutation();

await updatePinned({
  variables: {
    pinnedData: {
      spaceID: parentSpaceId,
      subspaceID: subspaceId,
      pinned: true, // or false to unpin
    },
  },
});
```

### 4. Change sort mode

```typescript
const [updateSettings] = useUpdateSpaceSettingsMutation();

await updateSettings({
  variables: {
    settingsData: {
      spaceID: spaceId,
      sortMode: SpaceSortMode.Custom, // or SpaceSortMode.Alphabetical
    },
  },
});
```

### 5. Reorder subspaces (drag-and-drop)

```typescript
// Same existing mutation, now used inline instead of in dialog
const [updateSortOrder] = useUpdateSubspacesSortOrderMutation();

// On drag end:
const reorderedIds = newOrder.map(item => item.id);
await updateSortOrder({
  variables: {
    spaceID: parentSpaceId,
    subspaceIds: reorderedIds,
  },
});
```

### 6. Display pin icon on cards

```typescript
// Pass pin indicator as iconOverlay prop (same pattern as HomeSpacePinButton)
<SpaceCard
  iconOverlay={subspace.pinned ? <SubspacePinIndicator /> : undefined}
  compact={false}
  // ...other props
/>
```

## Development Flow

1. Ensure server is running with the new schema
2. `pnpm codegen` — generates types and hooks
3. Add `pinned` field to existing `.graphql` query documents
4. Add `sortMode` field to space settings query documents
5. Create `UpdateSubspacePinned.graphql` mutation document
6. Build domain hook `useSubspacesSorted` for client-side sorting logic
7. Update `SpaceAdminSubspacesPage` with sort mode dropdown and inline drag-and-drop
8. Add pin icon to `SpaceCard` via `iconOverlay` prop
9. Update `SpaceSubspacesPage` to use sorted subspaces

## Testing

```bash
pnpm vitest run  # Run all tests
pnpm lint        # Type check + lint
```
