# Data Model: Paginated Innovation Library (Client Adoption)

**Feature**: 103-innovation-library-pagination
**Date**: 2026-06-02

No persisted data, no DB, no new domain model. This is a **client** feature:
the "data model" is (a) the GraphQL query-variable / response shapes consumed
from the server, (b) the Apollo cache field policies, and (c) the in-component
view-models. The CRD presentational types (`TemplateCardData`,
`InnovationPackCardData`) are **unchanged**.

---

## Consumed server contract (from server 101 — read-only here)

### Inputs
- Pagination args are exposed **flat on the field** — `first`, `after`, `before`,
  `last` (the server resolver spreads `PaginationArgs` via an unnamed NestJS
  `@Args()`, so there is **no nested `pagination:` input**). `after`/`before` are
  `UUID`. Client uses **forward only**: `(first: …, after?: …)`, where `after` is a
  `pageInfo.endCursor` from a prior page.
- `LibraryTemplatesFilterInput { types: [TemplateType!] }` — reused; client builds
  it from the active filter via `toGqlTemplateType`.

### Outputs (relay connections)
- `PaginatedLibraryTemplateResults { total: Float!, templateResults: [TemplateResult!]!, pageInfo: PageInfo! }`
  where `TemplateResult { template: Template!, innovationPack: InnovationPack! }`.
- `PaginatedInnovationPacks { total: Float!, innovationPacks: [InnovationPack!]!, pageInfo: PageInfo! }`.
  (`total` is `Float` in the generated schema — consumed as a plain `number`.)
- `PageInfo { startCursor, endCursor, hasNextPage!, hasPreviousPage! }` — client
  reads `endCursor` (next-page anchor) and `hasNextPage` (Load-More visibility).

Order is fixed **newest-first**; there are no ordering arguments.

---

## Apollo cache field policies (new)

Registered on the `Library` type in `src/core/apollo/config/typePolicies.ts`:

| Field | `keyArgs` | typeName | Effect |
|-------|-----------|----------|--------|
| `templatesPaginated` | `['filter']` | `'TemplateResult'` | One independently-paged cached list **per filter** (`filter` = `{ types?, searchTerm? }`) ⇒ changing the type filter **or the search term** starts a fresh first page (FR-007, FR-017). |
| `innovationPacksPaginated` | `['filter']` | `'InnovationPack'` | Packs now take a `filter` (`{ searchTerm? }`), so the policy keys on it too ⇒ changing the pack search term starts a fresh first page (FR-017). **(Was `false` before the name filter.)** |

`paginationFieldPolicy.merge` concatenates `prefix + incoming` when `after` is
present and replaces the list when `after`/`before` are absent (the basis for the
stale-cursor reset — Decision 5). For `templateResults` (non-normalized) the
id-dedup is a no-op; correctness relies on stable `rowId`-DESC cursors.

---

## Query-variable shapes (client operations)

| Operation | Variables | Notes |
|-----------|-----------|-------|
| `InnovationLibraryTemplatesPaginated` | `{ first: Int!, after?: UUID, filter?: LibraryTemplatesFilterInput }` | Flat field args `templatesPaginated(first, after, filter)`. `filter = { types?, searchTerm? }`; omitted entirely when type is `'all'` AND the term is blank; `searchTerm` omitted when blank/whitespace. |
| `InnovationLibraryPacksPaginated` | `{ first: Int!, after?: UUID, filter?: LibraryInnovationPacksFilterInput }` | Flat field args `innovationPacksPaginated(first, after, filter)`. `filter = { searchTerm? }`; omitted when the term is blank/whitespace. |

`PAGE_SIZE = 15` (module constant; 3 rows of 5 cards on wide screens, ≤ server max 100).

---

## Hook view-model — `useInnovationLibrary()` return (revised)

```text
UseInnovationLibraryResult {
  // templates
  templates: TemplateCardData[]          // mapped from templateResults, server order (newest-first)
  templatesTotal: number                 // PaginatedLibraryTemplateResults.total (filtered)
  templatesLoading: boolean              // first-page load
  loadingMoreTemplates: boolean          // subsequent-page load (non-blocking)
  hasMoreTemplates: boolean              // pageInfo.hasNextPage
  onLoadMoreTemplates: () => Promise<void>

  // packs
  packs: InnovationPackCardData[]
  packsTotal: number
  packsLoading: boolean
  loadingMorePacks: boolean
  hasMorePacks: boolean
  onLoadMorePacks: () => Promise<void>

  // type filter (now server-side)
  activeTypeFilter: TemplateTypeFilterValue
  onChangeTypeFilter: (next: TemplateTypeFilterValue) => void

  // text search (server-side; debounced; per section)
  templatesSearch: string                 // raw input value (immediate, for the controlled input)
  onChangeTemplatesSearch: (next: string) => void
  packsSearch: string
  onChangePacksSearch: (next: string) => void
  // The hook debounces each raw value and feeds the debounced term into the query
  // `filter.searchTerm` (blank/whitespace ⇒ omitted). Changing the debounced term
  // re-keys the cache (keyArgs `['filter']`) ⇒ fresh first page.

  // preview (unchanged)
  onTemplatePreview: (templateId: string) => void
  previewTemplate?: TemplateCardData
  previewContent?: TemplateContent
  previewLoading: boolean
  closePreview: () => void
}
```

State transitions:
- **Filter change** → `activeTypeFilter` updates → templates query re-keys on
  `filter` → first page of the filtered set loads; appended pages discarded.
- **Load More (templates/packs)** → `fetchMore({ first: PAGE_SIZE, after: endCursor })`
  → relay merge appends → `hasMore*` recomputed from new `pageInfo`.
- **Stale cursor on Load More** → `fetchMore` rejects → `refetch()` that section
  → fresh first page replaces the cached list.
- **Preview select** → unchanged (lazy `useTemplateContentLazyQuery`).

---

## Mapper changes (`innovationLibraryMapper.ts`)

- Input type changes from `InnovationLibraryQuery['platform']['library']['innovationPacks'][number]`
  to the new packs-paginated pack shape; `packTemplateCount` /
  `mapPackToInnovationPackCardData` logic is otherwise unchanged.
- Templates continue to map via `mapTemplateToCardData(row.template, providerName ?? packName)`,
  now reading from `templateResults[]` instead of `templates[]`.

CRD prop types (`TemplateCardData`, `InnovationPackCardData`) are **unchanged**.
