# Phase 1 Data Model: Callout Publisher Meta

This feature adds two fields to the in-memory Callout view-model and to the GraphQL fragment that populates it. Backend schema is unchanged — `publishedBy` and `publishedDate` already exist on the `Callout` type.

## Entities

### Callout (already in `src/core/apollo/generated/graphql-schema.ts`)

| Field | Type | Optionality | Notes |
|-------|------|-------------|-------|
| `id` | UUID | required | Already queried |
| `createdBy` | `User` | nullable on schema, **always populated in practice** | Already queried; the user that originally drafted the callout |
| `createdDate` | `DateTime` | required on schema | **Newly added to the fragment** |
| `publishedBy` | `User` | nullable | **Newly added to the fragment**; populated only for published callouts |
| `publishedDate` | `DateTime` | nullable | Already queried; populated only for published callouts |
| (other fields — `framing`, `settings`, `comments`, etc.) | various | unchanged | Out of scope |

### User (already in schema; unchanged)

The `publishedBy` selection mirrors `createdBy`:

```graphql
{
  id
  profile {
    id
    displayName
    avatar: visual(type: AVATAR) { id uri }
  }
}
```

This produces the same normalized cache shape — Apollo will dedupe `User` entities by `id` regardless of which field referenced them.

## Client-side view models

### `CalloutModelExtension<T>` (in `src/domain/collaboration/callout/models/CalloutModelLight.ts`)

```ts
// Existing (lines 42–63 today)
export type CalloutModelExtension<T> = T & {
  // … unchanged …
  publishedDate?: Date | undefined;
  createdBy?:
    | { id: string; profile?: { displayName: string; avatar?: { id: string; uri: string } } }
    | undefined;
};
```

**Delta** — add two fields, keep ordering predictable (place `createdDate` adjacent to `createdBy`, place `publishedBy` adjacent to `publishedDate`):

```ts
export type CalloutModelExtension<T> = T & {
  // … unchanged …
  publishedDate?: Date | undefined;
  publishedBy?:
    | { id: string; profile?: { displayName: string; avatar?: { id: string; uri: string } } }
    | undefined;
  createdDate?: Date | undefined;
  createdBy?:
    | { id: string; profile?: { displayName: string; avatar?: { id: string; uri: string } } }
    | undefined;
};
```

The shapes for `publishedBy` and `createdBy` are intentionally identical — both feed the same `<Authorship>` / `PostCard` author prop, and matching shapes make the `??` fallback type-safe without casting.

### `CalloutModelLightExtended` (derived; unchanged structurally — gains the two fields transitively)

No edit required — `CalloutModelExtension` is the source of truth.

### CRD presentation prop shapes (already in `src/crd/components/`)

The three CRD components (`PostCard`, `CalloutDetailDialog`) already accept author + timestamp as plain TypeScript props. The mapping layer (`calloutDataMapper.ts`) decides which underlying entity supplies each value. **No edits to CRD components.**

```ts
// PostCardData (existing, unchanged)
type PostCardData = {
  // … unchanged …
  author?: { name: string; avatarUrl?: string };
  timestamp?: string;
  // …
};

// CalloutDetailDialogData (existing, unchanged)
type CalloutDetailDialogData = {
  // … unchanged …
  author?: { name: string; avatarUrl?: string };
  timestamp?: string;
  // …
};
```

## State / Lifecycle

The Callout entity has two states relevant to this feature:

```text
                 publish
   ┌──────────┐ ─────────►  ┌──────────────┐
   │  Draft   │              │  Published    │
   │  ────    │              │  ─────────    │
   │  publishedBy = null    │  publishedBy != null (usually)
   │  publishedDate = null  │  publishedDate != null
   │  createdBy != null     │  createdBy != null (unchanged from draft)
   │  createdDate != null   │  createdDate != null (unchanged from draft)
   └──────────┘              └──────────────┘
```

- A callout always has `createdBy` and `createdDate`.
- Once published, `publishedBy` and `publishedDate` are typically populated atomically by the backend.
- The fallback rule (FR-002) handles every cell of the 2×2 truth table for `(publishedBy present?, publishedDate present?)` — see "Edge Cases" in [spec.md](./spec.md).

## Validation

| Rule | Source | Enforced by |
|------|--------|-------------|
| `publishedBy` and `createdBy` share an identical structural shape so `??` is type-safe | D1, D4 | TypeScript at consumer (`pnpm lint`) |
| `publishedDate` and `createdDate` are both `Date \| undefined` after `useCalloutDetails` runs | D3 | TypeScript at consumer; runtime parse in the hook |
| The fragment ships with regenerated `apollo-hooks.ts` | Constitution III | Codegen step + PR review |

### Search-result presentation prop shape (already in `src/crd/components/search/PostResultCard.tsx`)

```ts
// PostResultCardData (existing, unchanged)
type PostResultCardData = {
  // … unchanged …
  author: { name: string; avatarUrl?: string };
  date: string;
  // …
};
```

The mapping today populates `author.name` from `result.callout` with a hard-coded `unknownLabel` because `createdBy` / `publishedBy` aren't queried; once they are, the same fallback chain used for whiteboard / memo / post mapping is applied: `(publishedBy ?? createdBy)?.profile?.displayName ?? unknownLabel`.

## Mapping to Functional Requirements

| FR | Data-model implication |
|----|-----------------------|
| FR-001 | Both fields independently queried (in *both* the main Callout fragment and the `SearchResultCallout` fragment) so consumers can prefer the published variant |
| FR-002 | Both creator and publisher fields available simultaneously to enable independent fallback |
| FR-003 | Two fragment edits — main Callout fragment + `SearchResultCallout` — together reach every callout-meta surface (header + summary + dialog + search-result card) |
| FR-004 | MUI binding and CRD mappings (callout + search) consume the same view-model shape conceptually |
| FR-005 | Presentation prop shapes (`PostCardData.author`, `CalloutDetailDialogData.author`, `PostResultCardData.author`, `<Authorship>` `author` prop) unchanged — only their values change |
| FR-006 | Fragment edits are confined to `Callout` selections; `Post` / `Whiteboard` / `Memo` fragments untouched |
| FR-007 | No edits to comment, message, or calendar event fragments or components |
