# Tasks: CRD Search Dialog Migration

**Input**: Design documents from `/specs/043-crd-search-dialog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the spec. Test tasks are limited to validation phase (lint, vitest, manual testing).

**Organization**: Tasks grouped by user story. US1–US3 are all P1 (core MVP) and tightly coupled — they form the MVP together. US4–US7 are P2 features built on top. US8–US9 are P3 polish.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: i18n namespace and foundational infrastructure

- [x] T001 [P] Create `src/crd/i18n/search/search.en.json` with all keys: search input placeholder, category labels (spaces, posts, responses, users, organizations), filter options (all, spacesOnly, subspacesOnly, whiteboards, memos, posts), state messages (emptyState, noResults, loading, disclaimer), load more, scope labels, and accessibility labels (searchInput, closeSearch, removeTag, activeTags, resultCategories, searchResults, categoryResults) — see `quickstart.md` i18n structure
- [x] T002 [P] Create `src/crd/i18n/search/search.{nl,es,bg,de,fr}.json` — AI-assisted translations of all keys from `search.en.json`
- [x] T003 Register `crd-search` namespace in `src/core/i18n/config.ts` under `crdNamespaceImports` — add lazy import entries for all 6 languages following the existing `crd-exploreSpaces` pattern

---

## Phase 2: Foundational (SearchContext + Data Mapper)

**Purpose**: Shared integration infrastructure that all user stories depend on. MUST complete before any CRD component work.

**Warning**: No user story work can begin until this phase is complete.

- [x] T004 Create `src/main/search/SearchContext.tsx` — React context provider with `isOpen`, `openSearch(initialQuery?, initialScope?)`, `closeSearch()`, `toggleSearch()`, `initialQuery`, `initialScope`, `clearInitialQuery()` per `contracts/search-context.ts`. Export `SearchProvider` component and `useSearch()` hook. Uses `useState` only — no side effects.
- [x] T005 Create `src/main/search/searchDataMapper.ts` — mapping functions per `contracts/data-mapper.ts`:
  - `mapSpaceResults()` — `SearchResultSpaceFragment[]` → `SpaceCardData[]` (reuse existing SpaceCard type)
  - `mapPostResults()` — calloutResults + framingResults (interlaced via existing `interlaceAndFilterArrays` logic) → `PostResultCardData[]`
  - `mapResponseResults()` — contributionResults → `ResponseResultCardData[]`
  - `mapUserResults()` — actorResults filtered to USER → `UserResultCardData[]`
  - `mapOrgResults()` — actorResults filtered to ORGANIZATION → `OrgResultCardData[]`
  - `assembleCategories()` — combines all mapped results with filter state, visible counts, callbacks → `SearchCategoryData[]`

**Checkpoint**: Integration infrastructure ready — CRD component work can begin

---

## Phase 3: User Stories 1–3 — Core Search Overlay (Priority: P1) — MVP

**Goal**: A fully functional CRD search overlay that opens, accepts tag-based input, displays categorized results with 5 dedicated card types, and navigates to results. This phase covers US1 (overlay + input), US2 (categories + sidebar), and US3 (result cards) together because they are tightly coupled — you cannot test one without the others.

**Independent Test**: Enable CRD → trigger search → type a term → press Enter → verify results appear in 5 categorized sections with correct cards → click a result → verify navigation + overlay close.

### CRD Result Card Components (US3)

- [x] T006 [P] [US3] Create `src/crd/components/search/PostResultCard.tsx` — button element with: banner image (16:9 aspect, or muted placeholder with type icon), author row (Avatar 22px + name), title (2-line clamp, group-hover:text-primary), snippet (2-line clamp), meta row (type badge via PostTypeIcon + date), space context ("in: {spaceName}"), hover state (elevation shadow + primary-tinted border). Props: `PostResultCardData` + `onClick`. Uses `useTranslation('crd-search')`. All Tailwind, no MUI.
- [x] T007 [P] [US3] Create `src/crd/components/search/ResponseResultCard.tsx` — button element with: author row (Avatar 24px + name + date), title (2-line clamp), snippet (2-line clamp), parent context (MessageSquare icon + "Response to: {parentPostTitle}"), type badge + space name footer. Props: `ResponseResultCardData` + `onClick`. Hover state matching PostResultCard.
- [x] T008 [P] [US3] Create `src/crd/components/search/UserResultCard.tsx` — centered button with: Avatar 56px (initials fallback with primary bg), name, role, email (all truncated). Props: `UserResultCardData` + `onClick`. Hover state matching other cards.
- [x] T009 [P] [US3] Create `src/crd/components/search/OrgResultCard.tsx` — centered button with: 56px square logo container (Building2 icon fallback), name, type badge (pill), tagline (2-line clamp). Props: `OrgResultCardData` + `onClick`. Hover state matching other cards.

### CRD Overlay Structure Components (US1 + US2)

- [x] T010 [US1] Create `src/crd/components/search/SearchTagInput.tsx` — top bar component with: Search icon (20px, muted), text input (bg-transparent, outline-none), scope dropdown (conditional, DropdownMenu from primitives — shows "All Spaces" / current space name with primary pill styling when scoped), close button (X icon, rounded, hover:bg-accent). Below input: tag chips row (`role="list"`, each `role="listitem"` with term text + X remove button with `aria-label`). Props: `SearchTagInputProps` from contracts. Enter key creates tag, max 5, min 2 chars.
- [x] T011 [US2] Create `src/crd/components/search/SearchCategorySidebar.tsx` — two layouts:
  - Desktop (`hidden md:flex`): `<nav aria-label>` column with category buttons (icon + label + count badge), active state (left-2 border-primary, bg-accent, font-semibold), click-to-scroll callback
  - Mobile (`md:hidden`): horizontal scrollable flex row of pill buttons (rounded-full, active = bg-primary text-primary-foreground), each with label + count
  Props: `SearchCategorySidebarProps` from contracts.
- [x] T012 [US2] Create `src/crd/components/search/SearchResultSection.tsx` — `<section aria-label="{category} results">` with: header row (category icon + h3 title + count badge + optional DropdownMenu filter), responsive result card grid (`<ul role="list">` with `<li>` items, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4), centered "Load more" Button (variant=outline, size=sm). Props: `SearchCategoryData` + children (rendered cards). Filter dropdown shows options from `filterConfig`, highlights active filter with primary color.
- [x] T013 [US1] Create `src/crd/components/search/SearchOverlay.tsx` — top-level overlay using `createPortal(el, document.body)`:
  - Backdrop: `fixed inset-0 z-[100]` with `bg-foreground/50 backdrop-blur-sm`, click closes
  - Overlay container: `fixed inset-0 z-[101] grid grid-cols-12`, content in `col-span-12 lg:col-start-2 lg:col-span-10`, bg-background, border, rounded-xl, shadow
  - CSS transition: `transition-all duration-200 ease-out` toggling `opacity-0 scale-[0.97] translate-y-2.5` ↔ `opacity-100 scale-100 translate-y-0`
  - Top bar: `SearchTagInput`
  - Body: 4 states based on `state` prop:
    - `'empty'`: centered Search icon + instructional text
    - `'loading'`: centered Loader2 animate-spin + "Searching..." text
    - `'no-results'`: centered message with quoted terms, suggestion text, optional "Search all Spaces" button
    - `'results'`: grid-cols-10 with `SearchCategorySidebar` (col-span-2) + scrollable results pane (col-span-8) with disclaimer banner + `SearchResultSection` per category
  - Scroll tracking: `onScroll` handler calculates active section from `sectionRefs`, updates `activeCategoryId`
  - `role="dialog"`, `aria-modal="true"`, `aria-label` from i18n
  - Escape key handler calls `onClose`
  - Focus trap via tabindex management
  Props: `SearchOverlayProps` from contracts.

### Integration Component (US1 + US2 + US3)

- [x] T014 [US1] Create `src/main/search/CrdSearchOverlay.tsx` — integration component that:
  - Consumes `useSearch()` context for `isOpen`, `closeSearch`, `initialQuery`, `initialScope`
  - Uses existing `useSearchViewState` and `useSearchTerms` for GraphQL data + pagination
  - Calls `searchDataMapper` functions to transform results into CRD prop types
  - Manages local state: `searchTags`, `inputValue`, `sectionFilters`, `visibleCounts`, `activeCategoryId`, `scope`
  - Handles `onTagAdd` (add to terms, trigger search), `onTagRemove`, `onFilterChange`, `onLoadMore`, `onScopeChange`, `onCategoryClick`, card `onClick` (`closeSearch()` + `navigate(href)`)
  - On open with `initialQuery`: creates tag + triggers search immediately
  - On open with URL params (`?search-terms=...`): reads terms and triggers search
  - Renders `SearchOverlay` CRD component with all assembled props
  - Renders result cards per category: SpaceCard (reused), PostResultCard, ResponseResultCard, UserResultCard, OrgResultCard

**Checkpoint**: Core search overlay fully functional — all 5 categories, tag input, navigation, empty/loading/no-results states

---

## Phase 4: User Story 4 — Keyboard Shortcut and Triggers (Priority: P2)

**Goal**: Users can open search via Cmd+K / Ctrl+K, close via Escape / backdrop / X button. Header search trigger wired to SearchContext.

**Independent Test**: Press Cmd+K on any page → overlay opens. Press Escape → closes. Click backdrop → closes. Click header search → opens.

- [x] T015 [US4] Wire `SearchContext.Provider` into `src/main/ui/layout/CrdLayoutWrapper.tsx` — wrap existing content with `SearchProvider`. Render `CrdSearchOverlay` inside the provider (lazy-loaded, always mounted when CRD enabled).
- [x] T016 [US4] Add Cmd+K / Ctrl+K global keydown listener in `src/main/ui/layout/CrdLayoutWrapper.tsx` — `useEffect` with `keydown` handler: if `(e.metaKey || e.ctrlKey) && e.key === 'k'`, call `e.preventDefault()` + `openSearch()`. Clean up on unmount.
- [x] T017 [US4] Wire CRD Header search button to `openSearch()` — pass `onSearchClick` callback prop from `CrdLayoutWrapper` to `CrdLayout` Header, calling `openSearch(query)` instead of URL navigation when CRD enabled.

**Checkpoint**: Cmd+K opens overlay, all close mechanisms work, header search integrated

---

## Phase 5: User Story 5 — Per-Section Filters (Priority: P2)

**Goal**: Users can filter results within Spaces (All/Spaces only/Subspaces only), Posts (All/Whiteboards/Memos), and Responses (All/Posts/Whiteboards/Memos) categories. Filters apply client-side.

**Independent Test**: Search → click Spaces filter → select "Subspaces only" → verify only subspaces shown. Same for Posts and Responses filters.

- [x] T018 [US5] Add filter configuration constants in `src/main/search/searchDataMapper.ts` — define `SPACES_FILTER_CONFIG`, `POSTS_FILTER_CONFIG`, `RESPONSES_FILTER_CONFIG` with options matching FR-026/FR-027/FR-028. Labels use `t()` from `crd-search` namespace. Attach to categories in `assembleCategories()`.
- [x] T019 [US5] Add client-side filter logic in `src/main/search/CrdSearchOverlay.tsx` — maintain `sectionFilters` state (`Record<SearchCategoryId, string>`), apply filters before passing items to categories: Spaces filters by SPACE/SUBSPACE type, Posts filters by WHITEBOARD/MEMO framing type, Responses filters by POST/WHITEBOARD/MEMO contribution type. Pass `onFilterChange` callback to update state.

**Checkpoint**: Per-section filters functional for all 3 filterable categories

---

## Phase 6: User Story 6 — Scope Switching (Priority: P2)

**Goal**: When inside a space, users see a scope dropdown to toggle between "All Spaces" and the current space. Changing scope re-executes the search.

**Independent Test**: Navigate to a space page → open search → verify scope dropdown visible → select current space → verify scoped results → switch back to "All Spaces".

- [x] T020 [US6] Add scope detection in `src/main/search/CrdSearchOverlay.tsx` — detect current space from URL pathname (reuse existing `SEARCH_SPACE_URL_PARAM` logic from `useSearchViewState`). Pass `SearchScopeData` to `SearchOverlay` when inside a space (null otherwise). Wire `onScopeChange` to update scope state and re-execute search via `useSearchViewState`.
- [x] T021 [US6] Add "Search all Spaces instead" button in no-results state — in `SearchOverlay.tsx`, when `state === 'no-results'` and `scope?.activeScope !== 'all'`, render a Button calling `onSearchAll` prop which changes scope to 'all' and re-searches.

**Checkpoint**: Scope switching works inside spaces, "Search all Spaces instead" appears when scoped search returns empty

---

## Phase 7: User Story 7 — Load More Pagination (Priority: P2)

**Goal**: Each section shows up to 4 results initially, with "Load more" revealing 4 more per click.

**Independent Test**: Search with a term that returns >4 results in a category → verify "Load more" button → click → 4 more results appear → repeat until all shown.

- [x] T022 [US7] Add pagination state management in `src/main/search/CrdSearchOverlay.tsx` — maintain `visibleCounts` state (`Record<SearchCategoryId, number>`, initial: 4 per category). On "Load more": increment visible count by 4. If all fetched items are shown and backend has more (`canLoadMore` from `useSearchViewState`), call `fetchMore()` with cursor. Pass `hasMore` and `onLoadMore` to each `SearchCategoryData`.

**Checkpoint**: Load more works for all categories, reveals additional results incrementally

---

## Phase 8: User Story 8 — CRD Toggle and MUI Fallback (Priority: P3)

**Goal**: CRD search overlay is only rendered when CRD toggle is enabled. MUI SearchDialog continues to work unchanged when CRD is off.

**Independent Test**: Toggle CRD off → trigger search → verify MUI dialog. Toggle CRD on → trigger search → verify CRD overlay. Toggle back off → verify MUI again.

- [x] T023 [US8] Verify MUI SearchDialog remains unchanged — ensure `src/main/ui/layout/TopLevelLayout.tsx` still renders `SearchDialog` (MUI) as before. The CRD overlay is only rendered inside `CrdLayoutWrapper.tsx` which is only active when CRD is enabled. No changes needed to TopLevelLayout — just verify no regressions.

**Checkpoint**: Both MUI and CRD search paths work correctly based on toggle state

---

## Phase 9: User Story 9 — Responsive Layout (Priority: P3)

**Goal**: Overlay adapts to mobile (full-screen, pill tabs, single-column cards), tablet (2-column cards), and desktop (sidebar + 4-column cards).

**Independent Test**: Resize browser → mobile: full-screen overlay, horizontal pill tabs, 1-col grid. Tablet: 2-col grid. Desktop: sidebar + 4-col grid.

- [x] T024 [US9] Verify responsive Tailwind classes in all CRD search components — review and adjust breakpoints in:
  - `SearchOverlay.tsx`: `max-md:p-0` for full-screen mobile, `lg:col-start-2 lg:col-span-10` for desktop centering
  - `SearchCategorySidebar.tsx`: `hidden md:flex` for sidebar, `md:hidden` for pill tabs
  - `SearchResultSection.tsx`: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for card grids (users/orgs: `md:grid-cols-3 lg:grid-cols-4`)
  - `SearchTagInput.tsx`: scope dropdown may hide on very small screens

**Checkpoint**: Responsive layout works across all viewport sizes

---

## Phase 10: Validation & Cross-Cutting Concerns

**Purpose**: Final verification across all user stories

- [x] T025 Run `pnpm lint` to verify TypeScript compilation and lint rules pass across all new files
- [x] T026 Run `pnpm vitest run` to verify all existing tests still pass
- [x] T027 Validate against `specs/043-crd-search-dialog/quickstart.md` testing checklist: verify all 5 categories, all filters, Cmd+K, scope switching, load more, all card types, all close mechanisms, responsive layout, CRD toggle off → MUI unchanged
- [x] T028 Accessibility audit: keyboard navigation through all interactive elements (tags, cards, filters, sidebar, close), focus trap in overlay, `role="dialog"` + `aria-modal`, screen reader test with VoiceOver/NVDA, contrast ratios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (i18n keys referenced by data mapper labels) — BLOCKS all user stories
- **User Stories 1–3 (Phase 3)**: Depends on Phase 2 completion. These 3 stories are tightly coupled (overlay needs categories needs cards) and form the MVP together.
- **User Story 4 (Phase 4)**: Depends on Phase 3 (needs CrdSearchOverlay to wire into CrdLayoutWrapper)
- **User Stories 5–7 (Phases 5–7)**: Depend on Phase 3 — independent of each other, can run in parallel
- **User Stories 8–9 (Phases 8–9)**: Depend on Phase 4 (need wiring complete). Can run in parallel.
- **Validation (Phase 10)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1+US2+US3 (P1)**: MVP bundle. Can start after Phase 2. No dependencies on other stories.
- **US4 (P2)**: Depends on US1–US3 (needs CrdSearchOverlay to exist for wiring)
- **US5 (P2)**: Can start after Phase 3. Independent of US4, US6, US7.
- **US6 (P2)**: Can start after Phase 3. Independent of US4, US5, US7.
- **US7 (P2)**: Can start after Phase 3. Independent of US4, US5, US6.
- **US8 (P3)**: Depends on US4 (toggle verification requires wiring)
- **US9 (P3)**: Can start after Phase 3. Independent — just Tailwind class adjustments.

### Within Phase 3 (MVP)

1. T006–T009: All 4 result card components can run in parallel (different files)
2. T010–T012: Overlay structure components (TagInput → Sidebar → Section → Overlay) — sequential, each builds on previous
3. T013: SearchOverlay composes all structure components (depends on T010–T012)
4. T014: Integration component (depends on T005 data mapper + T013 SearchOverlay)

### Parallel Opportunities

**Phase 1**: T001 and T002 can run in parallel (different files)
**Phase 2**: T004 and T005 can run in parallel (different files)
**Phase 3**: T006–T009 all in parallel (4 independent card components)
**Phases 5–7**: US5, US6, US7 all in parallel (independent features)
**Phases 8–9**: US8 and US9 in parallel

---

## Parallel Example: Phase 3 (MVP)

```bash
# Launch all 4 result card components together (different files, no dependencies):
Task: T006 — PostResultCard.tsx
Task: T007 — ResponseResultCard.tsx
Task: T008 — UserResultCard.tsx
Task: T009 — OrgResultCard.tsx

# After cards complete, build overlay structure sequentially:
Task: T010 — SearchTagInput.tsx
Task: T011 — SearchCategorySidebar.tsx
Task: T012 — SearchResultSection.tsx
Task: T013 — SearchOverlay.tsx (composes T010–T012)

# After overlay complete:
Task: T014 — CrdSearchOverlay.tsx (integration)
```

---

## Implementation Strategy

### MVP First (User Stories 1–3)

1. Complete Phase 1: Setup (i18n namespace)
2. Complete Phase 2: Foundational (SearchContext + data mapper)
3. Complete Phase 3: User Stories 1–3 (overlay + categories + cards)
4. **STOP and VALIDATE**: Test search end-to-end — open overlay, search, view results, navigate
5. Deploy/demo if ready — core search experience is complete

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1–US3 (Core search overlay) → Test → Deploy (MVP)
3. Add US4 (Cmd+K wiring) → Test → Deploy
4. Add US5–US7 (Filters + Scope + Pagination) → Test → Deploy (in parallel)
5. Add US8–US9 (Toggle + Responsive polish) → Test → Deploy
6. Each story adds value without breaking previous stories

### Sequential Execution (Single Developer)

Recommended order: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 9 → Phase 8 → Phase 10

- Follows priority order (P1 → P2 → P3)
- Each phase builds on the previous without rework
- Natural validation checkpoints after each phase

---

## Notes

- All search hooks pre-exist — this is frontend-only presentation-layer work
- CRD components MUST follow `src/crd/CLAUDE.md`: no MUI, no business logic, plain TS props, Tailwind-only, event handlers as props, WCAG 2.1 AA
- Commit after each task or logical group
- Prototype reference: `prototype/src/app/components/search/SearchOverlay.tsx` — use for visual/structural reference, but convert inline styles to Tailwind and respect CRD golden rules
- Existing `SpaceCard` CRD component reused for space search results — no new space card needed
- All user-visible strings must use `t()` from `crd-search` namespace — no hardcoded text
