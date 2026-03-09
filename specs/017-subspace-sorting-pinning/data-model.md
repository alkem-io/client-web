# Data Model: Subspace Sorting & Pinning (Client)

**Branch**: `017-subspace-sorting-pinning` | **Date**: 2026-03-06

## GraphQL Schema Changes (from server)

These fields are added by the server (branch `041-subspace-sorting-pinning`). After running `pnpm codegen`, the generated types will include:

### New Enum

```graphql
enum SpaceSortMode {
  ALPHABETICAL
  CUSTOM
}
```

### Extended Types

```graphql
# Added to Space type
type Space {
  # ...existing fields...
  pinned: Boolean! # NEW — whether subspace is pinned
}

# Added to SpaceSettings type
type SpaceSettings {
  # ...existing fields...
  sortMode: SpaceSortMode! # NEW — default ALPHABETICAL
}
```

### New Mutation

```graphql
input UpdateSubspacePinnedInput {
  spaceID: UUID!
  subspaceID: UUID!
  pinned: Boolean!
}

type Mutation {
  updateSubspacePinned(pinnedData: UpdateSubspacePinnedInput!): Space!
}
```

### Extended Input

```graphql
input UpdateSpaceSettingsEntityInput {
  # ...existing fields...
  sortMode: SpaceSortMode # NEW — optional
}
```

## Client-Side Data Shapes

### Subspace Sort Item (settings list)

Used in the admin settings subspaces list for display and drag-and-drop:

```typescript
type SubspaceSortItem = {
  id: string;
  name: string;
  sortOrder: number;
  pinned: boolean;
};
```

### Sorted Subspaces (display logic)

The client sorting hook receives subspaces + sortMode and returns them in display order:

```text
Input:  subspaces[] + sortMode (ALPHABETICAL | CUSTOM)
Output: [...pinnedSubspaces (by sortOrder), ...nonPinnedSubspaces (by sortOrder or name)]
```

- **ALPHABETICAL**: pinned first (by sortOrder), then non-pinned (by name A-Z)
- **CUSTOM**: all items by sortOrder (pinned flag is cosmetic only — no separation)

## GraphQL Documents to Create/Modify

### New Documents

| File                                                                             | Purpose            |
| -------------------------------------------------------------------------------- | ------------------ |
| `src/domain/spaceAdmin/SpaceAdminSubspaces/graphql/UpdateSubspacePinned.graphql` | Pin/unpin mutation |

### Modified Documents

| File                                                                                        | Change                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------- |
| `src/domain/spaceAdmin/SpaceAdminSubspaces/SubspacesSortDialog/SubspacesSortDialog.graphql` | Add `pinned` to mutation response      |
| `src/domain/space/graphql/queries/Subspaces.graphql`                                        | Add `pinned` field to subspace queries |
| Space settings query (wherever `SpaceSettings` is fetched)                                  | Add `sortMode` field                   |
| Subspace card fragments                                                                     | Add `pinned` field                     |

## Affected Query/Fragment Hierarchy

```text
SubspacesInSpace query
  └─ space.subspaces
      ├─ id
      ├─ sortOrder (existing)
      ├─ pinned (NEW)
      └─ about { ...SpaceAboutCardBanner }

SpaceSettings query
  └─ space.settings
      ├─ privacy (existing)
      ├─ membership (existing)
      ├─ collaboration (existing)
      └─ sortMode (NEW)
```
