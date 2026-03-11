# GraphQL Documents: Subspace Sorting & Pinning (Client)

**Branch**: `017-subspace-sorting-pinning` | **Date**: 2026-03-06

## New Mutation Document

### UpdateSubspacePinned.graphql

```graphql
mutation UpdateSubspacePinned($pinnedData: UpdateSubspacePinnedInput!) {
  updateSubspacePinned(pinnedData: $pinnedData) {
    id
    pinned
    sortOrder
  }
}
```

## Modified Documents

### Subspaces query — add `pinned` field

Wherever subspaces are fetched for display (both admin settings and public subspaces page), add `pinned` to the selection set:

```graphql
# In SubspacesInSpace query and SubspaceCard fragment:
subspaces {
  id
  sortOrder
  pinned          # NEW
  about { ... }
}
```

### Space settings — add `sortMode` field

Wherever `SpaceSettings` is queried, add `sortMode`:

```graphql
settings {
  privacy { ... }
  membership { ... }
  collaboration { ... }
  sortMode          # NEW — returns SpaceSortMode enum
}
```

### Update space settings — add `sortMode` to input

When calling `updateSpaceSettings`, the input can now include `sortMode`:

```graphql
mutation UpdateSpaceSettings($settingsData: UpdateSpaceSettingsEntityInput!) {
  updateSpaceSettings(settingsData: $settingsData) {
    id
    settings {
      sortMode # NEW
      # ...existing fields
    }
  }
}
```

## Generated Hooks (after codegen)

After running `pnpm codegen`, these hooks will be available:

| Hook                               | Purpose                                   |
| ---------------------------------- | ----------------------------------------- |
| `useUpdateSubspacePinnedMutation`  | Pin/unpin a subspace                      |
| `SpaceSortMode` enum               | TypeScript enum for ALPHABETICAL / CUSTOM |
| Updated `useSubspacesInSpaceQuery` | Returns `pinned` on subspaces             |
| Updated space settings queries     | Returns `sortMode`                        |
