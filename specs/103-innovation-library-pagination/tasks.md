---
description: "Task list for Paginated Innovation Library (Client Adoption)"
---

# Tasks: Paginated Innovation Library (Client Adoption)

**Input**: Design documents from `/specs/103-innovation-library-pagination/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Branch**: `crd-fixes-innovation-library` (no new branch — `SPECIFY_FEATURE=103-innovation-library-pagination`)

**Tests**: Included — the repo has an existing `__tests__/` suite for this page and the constitution (Principle V) mandates test evidence for non-trivial logic.

**Organization**: Grouped by user story. US1 (templates pagination) and US2 (server-side filter) are both P1 and share the templates query/hook; US3 (packs) is P2 and independent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (Setup, Foundational, Polish carry no story label)

## Path Conventions

Single-project frontend. CRD design-system layer `src/crd/`, integration layer `src/main/crdPages/`, Apollo data layer `src/core/apollo/`.

---

## Phase 1: Setup

**Purpose**: Confirm the cross-repo prerequisite that gates operation-hook generation.

> **Note**: The server-101 **schema types have already landed** in
> `src/core/apollo/generated/graphql-schema.ts` (verified: `templatesPaginated`,
> `innovationPacksPaginated`, `PaginatedLibraryTemplateResults`,
> `PaginatedInnovationPacks`, `LibraryTemplatesFilterInput`, `TemplateResult` all
> present, with flat `after: UUID` / `first: Int` args and `total: Float`). The
> remaining codegen work (Phase 2, T005) is only generating the two operation
> **hooks** from the new `.graphql` docs — not the schema.

- [x] T001 Confirm a backend exposing the server-101 fields is reachable at `localhost:3000/graphql` (needed for T005 hook generation) and that `SPECIFY_FEATURE=103-innovation-library-pagination` is exported for any spec-kit scripts.
- [x] T002 [P] Re-confirm the generated schema still contains the new types — `grep -n "templatesPaginated\|innovationPacksPaginated\|PaginatedInnovationPacks\|PaginatedLibraryTemplateResults\|LibraryTemplatesFilterInput" src/core/apollo/generated/graphql-schema.ts` returns matches (already true on this branch; this is a regression guard, the schema is not regenerated here).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data layer that ALL stories depend on — the two paginated operation documents, their generated hooks, and the relay cache policies.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Author `src/main/crdPages/innovationLibrary/InnovationLibraryTemplatesPaginated.graphql` — query `InnovationLibraryTemplatesPaginated($first: Int!, $after: UUID, $filter: LibraryTemplatesFilterInput)` selecting `platform.library.templatesPaginated(first: $first, after: $after, filter: $filter) { total templateResults { template { ...TemplateProfileInfo callout { id } contentSpace { id about { id profile { id cardBanner: visual(type: CARD) { ...VisualModel } } } } } innovationPack { id profile { id displayName url } provider { id profile { id displayName avatar: visual(type: AVATAR) { id uri } url } } } } pageInfo { startCursor endCursor hasNextPage hasPreviousPage } }`. Flat field args (no `pagination:` wrapper). Source of truth: `contracts/client-operations.graphql`.
- [x] T004 [P] Author `src/main/crdPages/innovationLibrary/InnovationLibraryPacksPaginated.graphql` — query `InnovationLibraryPacksPaginated($first: Int!, $after: UUID)` selecting `platform.library.innovationPacksPaginated(first: $first, after: $after) { total innovationPacks { id profile { id displayName description tagset { ...TagsetDetails } url } templatesSet { id calloutTemplatesCount spaceTemplatesCount communityGuidelinesTemplatesCount postTemplatesCount whiteboardTemplatesCount } provider { ...InnovationPackProviderProfileWithAvatar } } pageInfo { startCursor endCursor hasNextPage hasPreviousPage } }`.
- [x] T005 Run `pnpm codegen` (server-101 backend up) to generate the **operation hooks** for the two new docs and commit the regenerated `src/core/apollo/generated/apollo-hooks.ts` (and `graphql-schema.ts` if codegen re-touches it — the schema types already landed); confirm `useInnovationLibraryTemplatesPaginatedQuery` and `useInnovationLibraryPacksPaginatedQuery` now exist (they do **not** yet — depends on T003, T004).
- [x] T006 [P] Register `Library` field policies in `src/core/apollo/config/typePolicies.ts`: add a `Library: { fields: { templatesPaginated: paginationFieldPolicy(['filter'], 'TemplateResult'), innovationPacksPaginated: paginationFieldPolicy(false, 'InnovationPack') } }` entry (import `paginationFieldPolicy` already present). `keyArgs: ['filter']` on templates makes a filter change auto-reset paging (FR-007).
- [x] T007 [P] Add a `PAGE_SIZE = 10` module constant in `src/main/crdPages/innovationLibrary/useInnovationLibrary.ts` (2 rows of 5 cards on wide screens; server caps at 100 — FR-012).

**Checkpoint**: Generated hooks + cache merge + page size ready; story work can begin.

---

## Phase 3: User Story 1 - Browse templates without loading the whole catalogue (Priority: P1) 🎯 MVP

**Goal**: The templates section loads a bounded first page (newest-first) with a total count and an appending "Load More", instead of the full catalogue.

**Independent Test**: Open `/innovation-library`; the Templates section shows ≤10 cards + a total; "Load More" appends the next ≤10 with no duplicates and disappears on the last page; Network shows a bounded `InnovationLibraryTemplatesPaginated` request (not the unbounded `InnovationLibrary`).

### Implementation for User Story 1

- [x] T008 [US1] In `src/main/crdPages/innovationLibrary/useInnovationLibrary.ts`, replace the unpaginated templates path: call `useInnovationLibraryTemplatesPaginatedQuery({ variables: { first: PAGE_SIZE } })`; map `data.platform.library.templatesPaginated.templateResults` to `TemplateCardData[]` via the existing `mapTemplateToCardData(row.template, providerName ?? packName)` (preserve server order — newest-first; remove any client-side sort).
- [x] T009 [US1] In the same hook, expose templates pagination state: `templatesTotal` (`templatesPaginated.total`), `templatesLoading` (first-page `loading`), `hasMoreTemplates` (`pageInfo.hasNextPage`), `loadingMoreTemplates`, and `onLoadMoreTemplates` calling `fetchMore({ variables: { first: PAGE_SIZE, after: pageInfo.endCursor } })` (forward-only; mirrors `useSpaceExplorer.fetchMoreSpaces`).
- [x] T010 [US1] Add stale-cursor recovery to the templates `onLoadMoreTemplates`: wrap `fetchMore` so a rejection (server `EntityNotFoundException` on an unresolvable `after`) triggers `refetch()` of the first page rather than surfacing an error (FR-014).
- [x] T011 [P] [US1] In `src/crd/components/innovationLibrary/InnovationLibraryView.tsx`, add templates-section props (`templatesTotal`, `hasMoreTemplates`, `loadingMoreTemplates`, `onLoadMoreTemplates`) per `contracts/view-props.contract.ts`; render the total in the section heading **and** an **"X of T" progress count** (X = `templates.length` loaded, T = `templatesTotal`) **immediately adjacent to** a "Load More" `<button>` (count label via the page namespace, e.g. `t('crd-templates:library.loadedOfTotal', { loaded, total })`; button label `t('crd-common:loadMore')`, `aria-busy={loadingMoreTemplates}`, hidden when `!hasMoreTemplates`); the "X of T" count remains visible (reading "T of T") when the button is hidden on the last page (FR-003); keep the skeleton grid for first-load only (do not clear visible cards on load-more).
- [x] T012 [US1] In `src/main/crdPages/innovationLibrary/CrdInnovationLibraryPage.tsx`, thread the new templates props from `useInnovationLibrary` into `InnovationLibraryView`.
- [x] T013 [US1] Update `src/main/crdPages/innovationLibrary/__tests__/` (e.g. `useInnovationLibrary.test.tsx`): mock the templates-paginated hook — assert bounded first page, `onLoadMoreTemplates` requests `after: endCursor` and appends, `hasMoreTemplates` drives Load-More visibility, total is exposed, and a `fetchMore` rejection triggers a first-page refetch (FR-014). **Also assert preview-during-paging (FR-010 / SC-006):** after appending ≥1 extra page, `onTemplatePreview(id)` for a template from an appended page still resolves `previewTemplate`/`previewContent` (lazy `useTemplateContentLazyQuery` called with that id) and does **not** reset paging (loaded templates / `hasMoreTemplates` unchanged after preview open + `closePreview`).

**Checkpoint**: Templates paginate with Load More + total, newest-first, stale-cursor safe.

---

## Phase 4: User Story 2 - Filter templates by type with server-side paging (Priority: P1)

**Goal**: The template-type filter is sent to the server so totals and paging reflect the filtered set; in-browser filtering is removed.

**Independent Test**: Select a type — total and first page reflect only that type; paging stays within the filter; changing/clearing the filter resets to the first page; a type with no templates shows the empty state, total 0, no Load More.

### Implementation for User Story 2

- [x] T014 [US2] In `src/main/crdPages/innovationLibrary/useInnovationLibrary.ts`, derive the query `filter` variable from `activeTypeFilter`: `'all'` ⇒ `undefined`; an array ⇒ `{ types: value.map(toGqlTemplateType) }` (import `toGqlTemplateType` from `@/main/crdPages/templates/templateCardMapper`). Pass it into `useInnovationLibraryTemplatesPaginatedQuery` variables and **remove the in-browser `allTemplates.filter(...)`** (FR-004).
- [x] T015 [US2] Verify filter-change paging reset: because the `templatesPaginated` cache policy keys on `['filter']` (T006), switching the filter naturally serves a fresh first page; confirm `onChangeTypeFilter` only updates local filter state (no manual cache reset needed) and `hasMoreTemplates`/`templatesTotal` track the filtered list (FR-007, SC-004).
- [x] T016 [US2] Confirm the empty filtered set renders the existing `TemplateGallery` empty state with total 0 and no Load-More (the `hasMoreTemplates`/`templatesTotal` props already gate this from US1) — adjust the view only if the empty/total/Load-More interaction needs it (FR-013).
- [x] T017 [US2] Update tests in `__tests__/`: filtered query narrows `total` + first page; changing filter re-keys to a fresh first page; `'all'` sends no `filter`; empty filter result hides Load More.

**Checkpoint**: Type filtering is server-side; totals and paging are filter-accurate.

---

## Phase 5: User Story 3 - Browse innovation packs a page at a time (Priority: P2)

**Goal**: The packs section loads a bounded first page (newest-first) with a total and appending "Load More"; the page stops requesting the unpaginated lists entirely.

**Independent Test**: The Innovation Packs section shows ≤10 cards + total; "Load More" appends the next ≤10 newest-first with no duplicates and disappears on the last page.

### Implementation for User Story 3

- [x] T018 [US3] In `src/main/crdPages/innovationLibrary/innovationLibraryMapper.ts`, change `GqlLibraryPack` to the new packs-paginated pack shape (`InnovationLibraryPacksPaginatedQuery['platform']['library']['innovationPacksPaginated']['innovationPacks'][number]`); keep `packTemplateCount` / `mapPackToInnovationPackCardData` logic unchanged.
- [x] T019 [US3] In `src/main/crdPages/innovationLibrary/useInnovationLibrary.ts`, add the packs path: `useInnovationLibraryPacksPaginatedQuery({ variables: { first: PAGE_SIZE } })`; map `innovationPacksPaginated.innovationPacks` via `mapPackToInnovationPackCardData`; expose `packsTotal`, `packsLoading`, `hasMorePacks`, `loadingMorePacks`, `onLoadMorePacks` (fetchMore with `after: endCursor`) with the same stale-cursor reset as T010.
- [x] T020 [US3] In `src/main/crdPages/innovationLibrary/useInnovationLibrary.ts`, remove the legacy `useInnovationLibraryQuery` import and all use of the unpaginated `platform.library.templates` / `innovationPacks` selections (FR-009); the CRD page now relies solely on the two paginated hooks. (Leave the legacy `InnovationLibrary.graphql` doc in `src/main/topLevelPages/InnovationLibraryPage/` untouched — the MUI page still uses it.)
- [x] T021 [P] [US3] In `src/crd/components/innovationLibrary/InnovationLibraryView.tsx`, add packs-section props (`packsTotal`, `hasMorePacks`, `loadingMorePacks`, `onLoadMorePacks`) and render the packs total + the **"X of T" progress count** (X = `packs.length`, T = `packsTotal`) adjacent to "Load More" exactly as the templates section (T011).
- [x] T022 [US3] In `src/main/crdPages/innovationLibrary/CrdInnovationLibraryPage.tsx`, thread the new packs props into `InnovationLibraryView`.
- [x] T023 [US3] Update tests in `__tests__/`: packs first page bounded, `onLoadMorePacks` appends via `after: endCursor`, `hasMorePacks` drives Load-More visibility, total exposed; assert the legacy unpaginated query is no longer called.

**Checkpoint**: Both sections paginate; the unbounded request is gone (SC-005).

---

## Phase 5b: User Story 4 - Filter each section by a search term (Priority: P2)

**Goal**: A debounced text search per section, applied **server-side** via
`searchTerm`, so totals/pages/Load-More reflect the searched (and, for templates,
type-filtered) set. Reuses the existing server-filter + reset-paging machinery.

**⚠️ Gated on server 101 name filter**: requires the backend to expose
`LibraryTemplatesFilterInput.searchTerm` and the new `LibraryInnovationPacksFilterInput`
+ `innovationPacksPaginated(filter:)`. Until the backend at `localhost:3000` serves
these, T029 (codegen) and everything after it cannot run.

**Independent Test**: Type in the Packs search → total + first batch reflect only
matching packs; page within it; clear → full set returns. Repeat for Templates;
term + type filter together return only the intersection; blank term = no filter.

### Implementation for User Story 4

- [x] T028 [US4] Add `$filter: LibraryInnovationPacksFilterInput` + `innovationPacksPaginated(first, after, filter: $filter)` to `src/main/crdPages/innovationLibrary/InnovationLibraryPacksPaginated.graphql` (the templates op is unchanged — `searchTerm` rides inside the existing `$filter`). Source of truth: `contracts/client-operations.graphql`.
- [x] T029 [US4] Run `pnpm codegen` (server-101 name-filter backend up) and commit the regenerated `apollo-hooks.ts` / `graphql-schema.ts`; confirm `LibraryTemplatesFilterInput.searchTerm` and `LibraryInnovationPacksFilterInput` now exist in the generated types (depends on T028 + backend).
- [x] T030 [US4] In `src/core/apollo/config/typePolicies.ts`, change the packs policy from `paginationFieldPolicy(false, 'InnovationPack')` to `paginationFieldPolicy(['filter'], 'InnovationPack')` so a pack search term re-keys to a fresh first page (FR-017). Templates already key on `['filter']`.
- [x] T031 [US4] In `src/main/crdPages/innovationLibrary/useInnovationLibrary.ts`, add per-section raw search state (`templatesSearch`/`packsSearch`) + a debounce (e.g. ~300ms) producing the debounced term; fold the debounced term into the query `filter`: templates `{ types?, searchTerm? }` (extend `toTemplatesFilter`), packs `{ searchTerm? }`; omit `searchTerm` when blank/whitespace; expose `onChangeTemplatesSearch`/`onChangePacksSearch` (FR-015–FR-018).
- [x] T032 [P] [US4] In `src/crd/components/innovationLibrary/InnovationLibraryView.tsx`, add a `SearchField` (`@/crd/forms/SearchField`) beside the **Innovation Packs** heading and to the right of the template **type** filter; props `packsSearch`/`onChangePacksSearch`, `templatesSearch`/`onChangeTemplatesSearch`, with placeholders from the `crd-templates` namespace.
- [x] T033 [US4] Thread the new search props through `src/main/crdPages/innovationLibrary/CrdInnovationLibraryPage.tsx`.
- [x] T034 [P] [US4] Add search placeholder strings (`library.packs.searchPlaceholder`, `library.templates.searchPlaceholder`) to `src/crd/i18n/templates/templates.<lang>.json` for all six languages.
- [x] T035 [US4] Tests: searched query narrows `total` + first page; blank/whitespace term sends no `searchTerm`; changing term re-keys to a fresh first page; templates term + type filter compose; packs policy keyArgs change verified.

**Checkpoint**: Both sections searchable server-side; totals + paging stay search-accurate.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T024 [P] i18n: add the library count strings to `src/crd/i18n/templates/templates.<lang>.json` for all six languages (en, nl, es, bg, de, fr) — at minimum a `library.loadedOfTotal` key with interpolation (en: `"{{loaded}} of {{total}}"`) for the "X of T" progress count (FR-003), plus any section-total label; reuse the shared `crd-common:loadMore` label for the button (verify the `crd-common` key exists — it is used by `SpaceExplorer`).
- [x] T025 Run `pnpm lint` (TypeScript + Biome + ESLint/react-compiler) and `pnpm vitest run src/main/crdPages/innovationLibrary --reporter=basic`; fix any issues.
- [ ] T026 Execute the `quickstart.md` manual walkthrough; confirm via DevTools Network that only the two bounded paginated requests fire and the unbounded `InnovationLibrary` request is gone (SC-001, SC-002, SC-005).
- [x] T027 [P] Sanity-check the `after` variable scalar in the committed operations is `UUID` (matches the field arg) and `total` is consumed as a plain `number` (it is `Float` in the schema).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. T005 depends on T003+T004. **Blocks all user stories.**
- **US1 (Phase 3)**: Depends on Foundational. MVP.
- **US2 (Phase 4)**: Depends on US1 (extends the same templates query/hook/view). Both are P1; US1→US2 is the natural order.
- **US3 (Phase 5)**: Depends on Foundational only — independent of US1/US2 (different query, different view section). Can run in parallel with US1/US2 if staffed; T020 (remove legacy query) should land after US1 templates path exists to avoid breaking the page mid-migration.
- **Polish (Phase 6)**: After the desired stories.

### Within Each Story

- Hook data path → hook pagination state → view rendering → page wiring → tests.
- Tasks editing the same file (`useInnovationLibrary.ts`, `InnovationLibraryView.tsx`, `CrdInnovationLibraryPage.tsx`) are sequential, not `[P]`.

### Parallel Opportunities

- T002 with the rest of Setup.
- Foundational: T003 ∥ T004 (different `.graphql` files); T006 ∥ T007 (different files); T005 waits on the two docs.
- US1 T011 (view) can be built in parallel with the hook tasks against the fixed `view-props.contract.ts`.
- US3 can proceed in parallel with US1/US2 (distinct files), except T020.
- Polish T024 and T027 are `[P]`.

---

## Parallel Example: Foundational

```bash
# Author both operation documents together (different files):
Task: "Author InnovationLibraryTemplatesPaginated.graphql"   # T003
Task: "Author InnovationLibraryPacksPaginated.graphql"        # T004
# Then run codegen once (T005), then in parallel:
Task: "Register Library cache field policies in typePolicies.ts"  # T006
Task: "Add PAGE_SIZE constant in useInnovationLibrary.ts"          # T007
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1 → **STOP & VALIDATE** (templates paginate with Load More + total) → demo.

### Incremental Delivery

Foundation → US1 (templates pagination, MVP) → US2 (server-side filter) → US3 (packs pagination + drop unbounded query) → Polish (i18n, lint/tests, quickstart). Each story is a shippable increment; US3's T020 finalizes FR-009.

---

## Notes

- `[P]` = different files, no incomplete dependency. `[Story]` maps to spec.md user stories.
- Args are **flat** on the paginated fields (`first/after/filter`) — no `pagination:` wrapper (verified against the generated schema).
- Cursor scalar is `UUID`; `total` is `Float` (consumed as `number`).
- No manual `useMemo`/`useCallback`/`React.memo` (React Compiler).
- Legacy MUI Innovation Library page + its `InnovationLibrary.graphql` are out of scope and stay on the unpaginated fields.
- Commit after each task or logical group; signed commits.
