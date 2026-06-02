# Research: Paginated Innovation Library (Client Adoption)

**Feature**: 103-innovation-library-pagination
**Date**: 2026-06-02

All spec-level unknowns were resolved in `/speckit.clarify` (newest-first / no
sort; stale-cursor → reset section; show totals; Load More; drop unpaginated
fields). The decisions below are the **client implementation** choices, grounded
in existing patterns already in this repo.

---

## Decision 1 — Reuse the house relay merge, registered on the `Library` type

**Decision**: Register a `Library` type policy in
`src/core/apollo/config/typePolicies.ts`:
- `templatesPaginated: paginationFieldPolicy(['filter'], 'TemplateResult')`
- `innovationPacksPaginated: paginationFieldPolicy(false, 'InnovationPack')`

**Rationale**: `paginationFieldPolicy` (`src/core/apollo/config/paginationPolicy.ts`)
already implements the relay forward/backward splice the server's `pageInfo`
needs, and is the pattern used for `spacesPaginated` / `usersPaginated`. Putting
`['filter']` in `keyArgs` for templates means **each distinct type-filter keeps
its own cached, independently-paged list** — so changing the filter naturally
starts a fresh first page (satisfies FR-007 with zero extra code). Packs have no
filter ⇒ `keyArgs: false`.

**Alternatives considered**:
- Apollo's built-in `relayStylePagination()` — rejected; the repo's custom policy
  carries the `client-4586` duplicate-cursor fix and is the established house
  pattern.
- Manual array concatenation in React state (like the legacy `fetchedSpacesWithSubspaces`)
  — rejected; bypasses the cache, duplicates merge logic, and fights the
  React-Compiler/Suspense model.

---

## Decision 2 — Forward-only cursor paging via direct query hooks + `fetchMore`

**Decision**: Mirror the most recent CRD example (`crdPages/spaces/useSpaceExplorer.ts`):
call each generated query hook directly with `variables: { first: PAGE_SIZE }`,
read `pageInfo` from the result, and implement `fetchMore({ variables: { first, after: endCursor } })`. The client only ever pages **forward** (`first` + `after`)
— never `last`/`before` — so the server's mutually-exclusive-direction validation
is never triggered.

**Rationale**: `useSpaceExplorer` is the canonical, recently-reviewed CRD
pagination integration; matching it keeps the codebase consistent and is simpler
than the generic `usePaginatedQuery` wrapper for this two-collection page.
`PAGE_SIZE = 15` (3 rows of 5 cards on wide screens; FR-012); the server caps at 100
regardless.

**Alternatives considered**:
- `src/domain/shared/pagination/usePaginatedQuery.ts` — viable, but its lazy/non-lazy
  generic adds indirection; the direct pattern is clearer for two independent
  collections plus a filter and is what the sibling CRD page uses.
- One combined query selecting both paginated fields — rejected; any variable
  change (filter, or either cursor) would refetch both collections. **Two separate
  operation documents** let templates and packs page independently and let a
  filter change refetch only templates (Decision 4).

---

## Decision 3 — Server-side type filter via the existing `toGqlTemplateType`

**Decision**: The `templatesPaginated` query takes `filter: LibraryTemplatesFilterInput`
(`{ types: [TemplateType!] }`). Map the CRD `TemplateTypeFilterValue`:
`'all'` ⇒ `filter` omitted (undefined); an array ⇒ `{ types: value.map(toGqlTemplateType) }`.
Remove the in-browser `allTemplates.filter(...)` from `useInnovationLibrary`.

**Rationale**: `toGqlTemplateType` already exists in
`src/main/crdPages/templates/templateCardMapper.ts`; reusing it (DRY, constitution
6f) avoids a second enum mapping. Pushing the filter to the server makes the
`total` and `hasNextPage` reflect the filtered set (FR-004, SC-004).

**Note on per-type chip counts**: `TemplateTypeFilter` accepts an optional
`counts` prop. With server-side pagination we no longer hold the full list, so
accurate per-type counts would require extra count queries. **Out of scope** —
leave `counts` undefined (it already is). Only the overall `total` is shown
(FR-003).

---

## Decision 4 — Two independent operation documents

**Decision**: Author two documents under `crdPages/innovationLibrary/`:
- `InnovationLibraryTemplatesPaginated.graphql` → `platform.library.templatesPaginated(first, after, filter)` returning `{ total, templateResults { template {…}, innovationPack {…} }, pageInfo { endCursor, hasNextPage } }`.
- `InnovationLibraryPacksPaginated.graphql` → `platform.library.innovationPacksPaginated(first, after)` returning `{ total, innovationPacks { … }, pageInfo { endCursor, hasNextPage } }`.

The pagination args are **flat on the field** (no nested `pagination:` input — the
server spreads `PaginationArgs` via an unnamed NestJS `@Args()`, matching
`spacesPaginated`). Cursor scalar is `UUID`.

Reuse the **same template/pack selection sets and fragments** the current
`InnovationLibrary.graphql` uses (so the mappers and the preview keep their
fields).

**Rationale**: Independent paging + independent loading states; a filter change
only re-keys/refetches the templates list. Keeps each query's cache entry under
its own `Library` field policy.

**Alternatives considered**: single combined doc — rejected (Decision 2).

---

## Decision 5 — Stale / invalid cursor recovery

**Decision**: Wrap the templates and packs `fetchMore` in a guard: if it rejects
(the server throws `EntityNotFoundException` for an unresolvable `after` cursor),
**reset that section to its first page** by calling the query's `refetch()` (or
re-issuing with no `after`), so the relay merge replaces the cached list with a
fresh first page. Do not surface a hard error (clarified answer).

**Rationale**: Cursor pagination's failure mode (an item removed mid-browse) is
new vs. the old single-fetch model. Resetting is graceful and keeps the user
browsing; it is rare. The `paginationFieldPolicy` `merge` already replaces the
list when called with no `after`/`before`, so a plain `refetch()` is sufficient.

**Alternatives considered**: inline error + retry (more friction); silently
stop appending (strands the rest of the collection) — both rejected in
clarification.

---

## Decision 6 — Newest-first ordering & dropping the unpaginated fields

**Decision**: Render both collections exactly in the server's returned order
(newest-first / `rowId` DESC). Remove any client-side sorting. Stop importing /
using the unpaginated `templates` / `innovationPacks` selections; the legacy
`InnovationLibrary.graphql` document stays for the legacy MUI page only.

**Rationale**: The paginated fields expose no ordering options (server spec
FR-015); the clarified decision is to accept newest-first with no sort control.
Today the CRD page effectively shows templates in the unpaginated list's
(alphabetical) order — this is an accepted, documented behaviour change.

**Risk noted (Complexity Tracking)**: `TemplateResult` is a non-normalized
wrapper (no own `id`), so the relay merge's id-based dedup is a no-op for
templates; correctness relies on the server's stable `rowId`-DESC cursors never
returning overlapping pages. Acceptable per the server's continuity guarantee
(SC-004 server-side).

---

## Decision 7 — Load-More UI reuses the CRD pattern

**Decision**: Add a per-section Load-More control + total to the CRD
`InnovationLibraryView`, driven entirely by new props
(`templatesTotal`, `hasMoreTemplates`, `loadingMoreTemplates`, `onLoadMoreTemplates`,
and the pack equivalents). Reuse the `crd-common:loadMore` label and the
`SpaceExplorer` button treatment (real `<button>`, `aria-busy`, hidden when
`!hasMore`).

**Rationale**: Keeps `InnovationLibraryView` presentational (CRD rule); matches
the existing CRD Load-More UX; satisfies FR-002/FR-005/FR-008/FR-011 and WCAG.
