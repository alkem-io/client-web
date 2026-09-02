# Research: Innovation Hub UI (story #9910)

## Reuse map (verified against the worktree)

| Concern | Existing asset | Decision |
|---|---|---|
| Smaller Space card | `src/crd/components/space/SpaceCard.tsx` (`SpaceCard`, `SpaceCardData`, `SpaceCardSkeleton`) | Reuse as-is. It is already the compact explore card the story wants. |
| Search input | `src/crd/forms/tags-input.tsx` (`TagsInput`) | Reuse. Tag-style multi-term input with search icon, already used by `SpaceExplorer`. |
| Search + counter + load-more pattern | `src/crd/components/space/SpaceExplorer.tsx` | Adapt the patterns (not mount verbatim — see below). |
| Load-more label | `crd-common:loadMore` ("Load More") | Reuse the shared key. |
| Auto-fill grid | `grid-cols-[repeat(auto-fill,minmax(280px,1fr))]` (used in `SpaceExplorer`) | Reuse the same grid treatment for the denser hub grid. |
| Hub data resolution | `src/main/crdPages/innovationHub/hooks/useInnovationHubHomeData.ts` + `dataMappers/mapInnovationHubToHomeData.ts` | Unchanged. Already resolves the hub's full ordered `SpaceCardData[]` and a `spacesLoading` flag. |
| Empty state | existing `home.spacesSection.empty` + the `FolderOpen` dashed-card pattern from `SpaceExplorer` | Keep the existing "no Spaces in hub" copy; add a distinct "no search results" empty state. |

## Decision 1 — Client-side search & pagination

**Chosen**: Client-side, over the already-resolved `SpaceCardData[]`.

**Why**: `useInnovationHubHomeData` fetches the hub's entire configured Space set in a single `useDashboardSpacesQuery` and `mapInnovationHubSpaces` returns a complete, ordered in-memory list. There is no cursor/`pageInfo` to page through. A hub is a bounded, curated set; substring matching and `slice`-based batching over tens of items is trivial and instantaneous.

**Alternative rejected**: Mirror `useSpaceExplorer`'s server-side search (`useSpaceExplorerSearchQuery`) + cursor pagination. Rejected because (a) it would re-fetch from the platform-wide Spaces index, which is **not** the hub's curated set — it would break the hub-scoping guardrail (FR-004/FR-011); (b) it adds a query, `no-cache` policy, and pagination state for no benefit on a bounded set; (c) it could surface non-hub Spaces.

## Decision 2 — Extract/adapt, don't mount `SpaceExplorer`

**Chosen**: Compose the explore-spaces sub-patterns inside the hub Spaces section (a new `HubSpacesSection` CRD component), not render `<SpaceExplorer>`.

**Why**: `SpaceExplorer` bakes in a page header (`spaces.title`/`spaces.subtitle`), a three-section membership/privacy/type filter dropdown, server-driven `hasMore`/`onLoadMore` props, and `crd-exploreSpaces` page copy — none of which fit a single hub home. Mounting it would either show wrong copy and irrelevant filters or require so many overrides that it stops being reuse. Composing the shared *primitives* (`TagsInput`, `Button`, `SpaceCard`, `SpaceCardSkeleton`) plus the same Tailwind grid/counter/empty-state treatment captures the reuse value while keeping the hub UI clean and CRD-pure.

**Alternative rejected**: Generalize `SpaceExplorer` with a "hub mode" flag. Rejected — adds conditional complexity to a shared component for one consumer (violates OCP/ISP spirit); a focused `HubSpacesSection` is simpler.

## Decision 3 — Visual state lives in the CRD component

**Chosen**: `searchTerms` and `visibleCount` are `useState` inside the presentational component; the full ordered `SpaceCardData[]` flows in as a prop.

**Why**: This is purely visual display state — it doesn't fetch, mutate, or know about GraphQL/routing — so it is permitted CRD visual state (same category as open/expanded/active-tab). It mirrors the prototype exactly and avoids threading `onSearchTermsChange`/`onLoadMore` callbacks through the page for what is entirely client-side display paging. The integration container keeps owning data only.

**Alternative rejected**: Lift state to `CrdInnovationHubHomePage` and pass callbacks (the `SpaceExplorer` contract). Rejected — unnecessary indirection here since there is no server round-trip on search/load-more; would add container code for no behavioral gain.

## Decision 4 — Search-only (no filter dropdown)

**Chosen**: Ship search; do not add the membership/privacy/type filter dropdown.

**Why**: The story's criterion is "filtering and/or search"; search satisfies it. A curated single-hub set doesn't benefit from membership/privacy/type filters the way the unbounded platform explorer does, and the dropdown would pull in `crd-exploreSpaces` filter copy and server-side membership semantics that don't apply to a hub.

## Decision 5 — i18n

**Chosen**: New keys under `home.spacesSection.*` in `crd-innovationHub`; reuse `crd-common:loadMore`. All six locales updated with parity.

New keys (en, mirrored/translated in nl/es/bg/de/fr):
- `home.spacesSection.searchPlaceholder` — "Search Spaces..."
- `home.spacesSection.showing` — "Showing" (or a count phrase — see data-model)
- `home.spacesSection.spacesLabel` — "Spaces"
- `home.spacesSection.noResultsTitle` — "No Spaces found"
- `home.spacesSection.noResultsMessage` — "Try a different search term."
- `home.spacesSection.clearSearch` — "Clear search"
- `home.spacesSection.searchAria` — "Search Spaces in this hub"
- `home.spacesSection.loadingMore` (if a busy label is needed) — reuse existing `crd-common` busy pattern if present; otherwise add.

Existing reused: `home.spacesSection.title`, `home.spacesSection.empty`, `home.spacesSection.loading`, `crd-common:loadMore`.

## Decision 6 — Constants & match semantics

- `BATCH_SIZE = 12` (named constant), matching the prototype.
- Match: case-insensitive substring against `name`, `description`, and `tags.join(' ')`; a Space matches when **every** entered term matches at least one of those fields.
- Search box hidden when the hub's set is empty (only the "no Spaces in hub" empty state shows).
