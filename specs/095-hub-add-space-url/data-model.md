# Data Model: Innovation Hub — Add Space by URL

**Phase**: 1 (Design)
**Date**: 2026-05-09

## Scope

This is a frontend-only workaround. **No new GraphQL types, no new persistent entities, no schema changes.** All backend types referenced here already exist in `src/core/apollo/generated/graphql-schema.ts`.

## Reused server entities

### `InnovationHub` (existing)
Relevant field for this feature:
- `spaceListFilter: Space[]` — the ordered list of Spaces displayed in the Hub. Identity for inclusion is `Space.id` (UUID).

The mutation `updateInnovationHub(updateData: { ID: UUID, spaceListFilter: [UUID] })` replaces the entire list. To add a Space we send `[...currentIds, newId]`.

### `Space` (existing)
Relevant fields used by the resolver:
- `id: UUID`
- `level: number` — `0` = top-level Space (L0), `>0` = subspace.
- `levelZeroSpaceID: UUID` — only used incidentally (returned by resolver fragment); not consumed by this feature.

### `UrlResolverQueryResults` (existing, see `graphql-schema.ts:9372–9384`)
Returned by `urlResolver(url: $url)` query.
- `state: UrlResolverResultState` — `Resolved | Forbidden | NotFound`.
- `type: UrlType` — relevant value: `UrlType.Space`. Anything else → generic error.
- `space?: { id, level, levelZeroSpaceID, … }` — present when `type === Space`.

## Client-side view models

The new dialog has trivial local state. No model classes; just local React state:

```ts
type AddByUrlDialogState = {
  url: string;          // raw input
  status:
    | { kind: 'idle' }
    | { kind: 'validating' }
    | { kind: 'invalid' }       // generic "not a valid top level space"
    | { kind: 'duplicate' };    // already in this Hub
};
```

State transitions:

| From | Trigger | To |
|---|---|---|
| `idle` | user types in input (any change) | `idle` (clear any prior error) |
| `idle` | submit clicked AND input parses as URL | `validating` |
| `validating` | resolver returns success + L0 + not duplicate | (parent `onChange` invoked, dialog closes — state discarded) |
| `validating` | resolver returns success + L0 + duplicate | `duplicate` |
| `validating` | resolver returns anything else, OR Apollo errors | `invalid` |
| `invalid` or `duplicate` | user types in input | `idle` |

## Identity & uniqueness rules

- A Space is uniquely identified inside the Hub by `Space.id` (UUID).
- Duplicate detection is a string-equality check between the resolved `space.id` and the IDs already present in the Hub's `spaceListFilter` (mapped to `string[]` before the check).
- No ordering guarantee for new additions: the new Space is appended to the end of the existing order. The existing drag-and-drop sortable list lets the admin reorder afterwards.

## Validation rules

| Rule | Where enforced | Error |
|---|---|---|
| Input must be a syntactically valid URL | Client (submit button disabled until `new URL(value)` succeeds) | n/a (button disabled) |
| URL must resolve to a Space on the current instance | Server (`urlResolver`) | Generic "URL is not a valid top level space" |
| `urlResolver.type === Space` | Client (after server response) | Generic |
| `urlResolver.space.level === 0` | Client (after server response) | Generic |
| `urlResolver.state === Resolved` (not `Forbidden`/`NotFound`) | Client (after server response) | Generic |
| Resolved Space ID not already in `spaceListFilter` | Client (compare against current list) | Distinct "already added" |

## Out of scope

- Removal of a Space from the Hub (existing flow, unchanged).
- Reordering of Spaces (existing drag-and-drop, unchanged).
- Bulk-add (multiple URLs).
- Server-side URL resolver changes.
- Migration of the surrounding admin page to the CRD design system.
