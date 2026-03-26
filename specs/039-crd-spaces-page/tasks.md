# Tasks: CRD Spaces Page Migration

**Input**: Design documents from `/specs/039-crd-spaces-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story. No runtime toggle — routes are wired directly to CRD at the code level (per spec clarifications).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure the build pipeline for Tailwind CSS alongside MUI

- [ ] T001 Install devDependencies: `pnpm add -D @tailwindcss/vite tailwindcss class-variance-authority`
- [ ] T002 Install runtime dependencies: `pnpm add lucide-react @radix-ui/react-slot @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-avatar`
- [ ] T003 Add `tailwindcss()` plugin to the plugins array in `vite.config.mjs` — import from `@tailwindcss/vite`
- [ ] T004 Import CRD stylesheet in app entry: add `import '@/crd/styles/crd.css'` to `src/index.tsx`
- [ ] T005 Run `pnpm build` and verify it succeeds with no regressions — existing MUI pages must render identically

---

## Phase 2: Foundational (Port Primitives from Prototype)

**Purpose**: Port required shadcn/ui primitives from `prototype/src/app/components/ui/` to `src/crd/primitives/`. Each primitive is a direct copy with import paths updated to use `@/crd/lib/utils` for `cn()`.

**⚠️ CRITICAL**: No CRD composite components can be built until primitives are in place

- [ ] T006 [P] Port `button.tsx` from `prototype/src/app/components/ui/button.tsx` to `src/crd/primitives/button.tsx` — update `cn()` import to `@/crd/lib/utils`
- [ ] T007 [P] Port `input.tsx` from `prototype/src/app/components/ui/input.tsx` to `src/crd/primitives/input.tsx` — update `cn()` import to `@/crd/lib/utils`
- [ ] T008 [P] Port `badge.tsx` from `prototype/src/app/components/ui/badge.tsx` to `src/crd/primitives/badge.tsx` — update `cn()` import to `@/crd/lib/utils`
- [ ] T009 [P] Port `avatar.tsx` from `prototype/src/app/components/ui/avatar.tsx` to `src/crd/primitives/avatar.tsx` — update `cn()` import to `@/crd/lib/utils`
- [ ] T010 [P] Port `select.tsx` from `prototype/src/app/components/ui/select.tsx` to `src/crd/primitives/select.tsx` — update `cn()` import, update lucide-react icon imports
- [ ] T011 [P] Port `dropdown-menu.tsx` from `prototype/src/app/components/ui/dropdown-menu.tsx` to `src/crd/primitives/dropdown-menu.tsx` — update `cn()` import, update lucide-react icon imports
- [ ] T012 [P] Port `skeleton.tsx` from `prototype/src/app/components/ui/skeleton.tsx` to `src/crd/primitives/skeleton.tsx` — update `cn()` import to `@/crd/lib/utils`
- [ ] T013 Verify all ported primitives compile: run `pnpm build` and confirm no type errors in `src/crd/primitives/`

**Checkpoint**: All 7 primitives ported and compiling. CRD composite development can begin.

---

## Phase 3: User Story 1 — Browse Spaces with New Design (Priority: P1) 🎯 MVP

**Goal**: The `/spaces` page renders using CRD shadcn/ui components, displaying all space data from existing GraphQL queries with the prototype's visual design.

**Independent Test**: Navigate to `/spaces`. Verify spaces load, cards show name/tagline/banner/tags/leads/privacy badge, search and filter work, and "Load More" pagination functions.

### Implementation for User Story 1

- [ ] T014 [P] [US1] Define SpaceCardData, SpaceLead, SpaceCardParent, and SpaceCardProps types in `src/crd/components/space/SpaceCard.tsx` — use contracts from `specs/039-crd-spaces-page/contracts/crd-space-card.ts` as reference (drop `memberCount` field)
- [ ] T015 [P] [US1] Define SpaceExplorerProps type in `src/crd/components/space/SpaceExplorer.tsx` — use contracts from `specs/039-crd-spaces-page/contracts/crd-space-card.ts` as reference
- [ ] T016 [P] [US1] Create data mapper functions (`mapSpaceToCardData`, `getInitials`, `getAvatarColor`) in `src/main/topLevelPages/topLevelSpaces/spaceCardDataMapper.ts` — map `SpaceWithParent` → `SpaceCardData` per field mapping in `specs/039-crd-spaces-page/data-model.md`. Include lead flattening (leadUsers as 'person' + leadOrganizations as 'org'), parent info mapping, and derived fields (initials, avatarColor)
- [ ] T017 [US1] Build CRD SpaceCard component in `src/crd/components/space/SpaceCard.tsx` — port visual design from `prototype/src/app/components/space/SpaceCard.tsx`. Must render: banner image with fallback (initials + avatarColor when no banner), space name, tagline, tags via Badge, lead avatars (first 4 + overflow "+N"), privacy Lock/Globe icon, parent info for subspaces. Accept `href` prop for navigation (render as `<a>` tag), use `useTranslation('crd')` for UI text. No `react-router-dom` Link
- [ ] T018 [US1] Build CRD SpaceExplorer component in `src/crd/components/space/SpaceExplorer.tsx` — port layout from `prototype/src/app/pages/BrowseSpacesPage.tsx`. Must include: search input (tag-based), membership filter buttons (All/Member/Public — hide Member when not authenticated), responsive CSS Grid for cards (`repeat(auto-fill, minmax(280px, 1fr))`), "Load More" button for pagination, results count display. Replace prototype's mock data with props from SpaceExplorerProps. Use `useTranslation('crd')` for UI text
- [ ] T019 [US1] Create CRD view wrapper in `src/main/topLevelPages/topLevelSpaces/SpaceExplorerCrdView.tsx` — imports `SpaceExplorer` from `@/crd/components/space/SpaceExplorer`, receives `SpaceExplorerViewProps` (same as existing MUI view), calls `mapSpaceToCardData` to transform data, wraps content in `<div className="crd-root">` for CSS scoping, wrap in React error boundary for graceful fallback on rendering errors
- [ ] T020 [US1] Wire `/spaces` route to CRD view: modify `src/main/topLevelPages/topLevelSpaces/SpaceExplorerPage.tsx` to import and render `SpaceExplorerCrdView` instead of `SpaceExplorerView`. Keep `TopLevelPageLayout` wrapper unchanged. Data hook `useSpaceExplorer()` remains untouched
- [ ] T021 [US1] Add i18n keys for CRD space components to `src/core/i18n/en/translation.en.json` under a `crd` namespace — include: filter labels ("All", "Member", "Public"), search placeholder, "Load More" button text, empty state message, results count text, privacy labels ("Public", "Private")

**Checkpoint**: `/spaces` renders with CRD components. Cards show real data. Search, filter, and pagination work.

---

## Phase 4: User Story 2 — MUI and CRD Coexistence (Priority: P1)

**Goal**: CRD `/spaces` page and MUI pages coexist without style conflicts. Navigating between them works seamlessly.

**Independent Test**: Navigate from `/spaces` (CRD) to any other page (MUI) and back. Verify no style leakage, no console errors, no broken layouts.

### Implementation for User Story 2

- [ ] T022 [US2] Verify `.crd-root` class is applied on the CRD view wrapper root element in `src/main/topLevelPages/topLevelSpaces/SpaceExplorerCrdView.tsx` — Tailwind resets in `src/crd/styles/crd.css` are scoped to this class
- [ ] T023 [US2] Navigate between `/spaces` (CRD) and at least 3 MUI pages (e.g., home, a space detail page, user profile). Verify: no Tailwind style leakage to MUI pages, MUI pages render identically to before, no console errors during navigation
- [ ] T024 [US2] Run `pnpm build` and verify the production build succeeds with both styling systems. Check that Tailwind CSS output is scoped and does not bloat the main CSS bundle for MUI pages

**Checkpoint**: Both design systems coexist. MUI pages are visually identical to before.

---

## Phase 5: User Story 3 — Responsive Space Cards (Priority: P2)

**Goal**: The CRD card grid adapts to viewport width — 3-4 columns on desktop, 2-3 on tablet, 1 on mobile.

**Independent Test**: Resize browser from mobile to desktop widths. Cards reflow correctly at all breakpoints.

### Implementation for User Story 3

- [ ] T025 [US3] Verify the CSS Grid in SpaceExplorer (`src/crd/components/space/SpaceExplorer.tsx`) uses `repeat(auto-fill, minmax(280px, 1fr))` matching the prototype. Adjust min width if cards are too narrow or too wide at tablet breakpoints (768-1200px)
- [ ] T026 [US3] Verify SpaceCard (`src/crd/components/space/SpaceCard.tsx`) content does not overflow at narrow widths — banner image, name, and tagline must be visible without horizontal scroll at 320px viewport width
- [ ] T027 [US3] Verify search/filter bar in SpaceExplorer is responsive — stacks vertically on mobile, horizontal row on desktop. Adjust Tailwind responsive classes if needed

**Checkpoint**: Cards render correctly at desktop (>1200px), tablet (768-1200px), and mobile (<768px).

---

## Phase 6: User Story 4 — Loading and Empty States (Priority: P2)

**Goal**: Show skeleton cards during loading and a meaningful empty state when no spaces match filters.

**Independent Test**: Throttle network to observe skeletons. Search for nonexistent tag to see empty state.

### Implementation for User Story 4

- [ ] T028 [P] [US4] Create `SpaceCardSkeleton` component in `src/crd/components/space/SpaceCard.tsx` — use Skeleton primitive from `src/crd/primitives/skeleton.tsx` to mimic card layout (banner placeholder, text lines, avatar circles). Export alongside SpaceCard
- [ ] T029 [P] [US4] Add empty state UI to `src/crd/components/space/SpaceExplorer.tsx` — show a centered icon (FolderOpen from lucide-react) with descriptive message when `spaces` array is empty and `loading` is false. Use translated text from `crd` i18n namespace
- [ ] T030 [US4] Wire loading and empty states in `src/crd/components/space/SpaceExplorer.tsx` — show grid of SpaceCardSkeleton (6-8 items) when `loading` is true, show empty state when `spaces.length === 0` and not loading, show card grid when spaces are available

**Checkpoint**: Loading skeletons appear during data fetch. Empty state shows when no results match.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all success criteria

- [ ] T031 Verify SC-004: run `grep -r "@mui" src/crd/` and confirm zero results — no MUI imports in any CRD file
- [ ] T032 Verify SC-005: review all files in `src/crd/` against the component checklist in `src/crd/CLAUDE.md` — no domain imports, plain TS props, Tailwind-only styling, no barrel exports, icons from lucide-react only
- [ ] T033 Run `pnpm lint` and `pnpm vitest run` — verify all type checks and existing tests pass with no regressions
- [ ] T034 Verify edge cases: space with no banner shows initials fallback, space with no leads renders without leads section, space with >4 leads shows "+N" overflow, unauthenticated user sees no lead avatars and no "Member" filter
- [ ] T035 Verify SC-007 (performance): compare LCP of `/spaces` CRD version vs MUI version using browser DevTools Performance tab — CRD must be equal to or better
- [ ] T036 Verify SC-003 + a11y: test keyboard navigation on CRD `/spaces` page (Tab through cards, Enter to navigate, filter controls accessible) — Radix UI provides built-in a11y but verify end-to-end
- [ ] T037 Verify SC-006 (documentation): document the CRD migration pattern (data mapper + CRD view wrapper + route wiring) in a brief section in `specs/039-crd-spaces-page/` so the next page migration can follow the same steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T005) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (T006-T013) — BLOCKS US2, US3, US4
- **US2 (Phase 4)**: Depends on US1 completion — validation of coexistence
- **US3 (Phase 5)**: Depends on US1 (SpaceExplorer must exist) — can run in parallel with US2
- **US4 (Phase 6)**: Depends on US1 (SpaceExplorer must exist) — can run in parallel with US2 and US3
- **Polish (Phase 7)**: Depends on all user stories being complete (T031-T037)

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational phase — no other story dependencies
- **US2 (P1)**: Depends on US1 — validates that US1's output coexists with MUI
- **US3 (P2)**: Depends on US1 — refines responsive behavior of US1's components
- **US4 (P2)**: Depends on US1 — adds loading/empty states to US1's components

### Within User Story 1

1. Types (T014, T015) and Mapper (T016) — parallelizable, different files
2. SpaceCard (T017) — depends on types (T014) + primitives (Phase 2)
3. SpaceExplorer (T018) — depends on SpaceCard (T017) + types (T015)
4. CRD View Wrapper (T019) — depends on SpaceExplorer (T018) + Mapper (T016)
5. Route Wiring (T020) — depends on CRD View Wrapper (T019)
6. i18n Keys (T021) — can be done in parallel with T017-T019 but must be complete before T020

### Parallel Opportunities

- **Phase 2**: All 7 primitive ports (T006-T012) can run in parallel
- **Phase 3**: T014, T015, T016 can run in parallel (different files)
- **Phase 3**: T021 (i18n) can run in parallel with T017-T018
- **Phases 4-6**: US2, US3, US4 can run in parallel after US1 completes (different concerns)
- **Phase 6**: T028, T029 can run in parallel (skeleton vs empty state, different concerns)

---

## Parallel Example: Phase 2 (Primitives)

```bash
# Launch all 7 primitive ports together — they are independent files:
T006: Port button.tsx to src/crd/primitives/button.tsx
T007: Port input.tsx to src/crd/primitives/input.tsx
T008: Port badge.tsx to src/crd/primitives/badge.tsx
T009: Port avatar.tsx to src/crd/primitives/avatar.tsx
T010: Port select.tsx to src/crd/primitives/select.tsx
T011: Port dropdown-menu.tsx to src/crd/primitives/dropdown-menu.tsx
T012: Port skeleton.tsx to src/crd/primitives/skeleton.tsx
```

## Parallel Example: User Story 1 (Types + Mapper)

```bash
# Launch types and mapper together — different files, no dependencies:
T014: Define SpaceCardData types in src/crd/components/space/SpaceCard.tsx
T015: Define SpaceExplorerProps type in src/crd/components/space/SpaceExplorer.tsx
T016: Create data mapper in src/main/topLevelPages/topLevelSpaces/spaceCardDataMapper.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational — port primitives (T006-T013)
3. Complete Phase 3: User Story 1 (T014-T021)
4. **STOP and VALIDATE**: Navigate to `/spaces`, verify cards show real data, search/filter/pagination work
5. This is the PoC deliverable — demonstrates the full CRD migration pipeline

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 → `/spaces` renders with CRD — **MVP!**
3. US2 → Validated that MUI pages are unaffected
4. US3 + US4 (parallel) → Responsive polish + loading/empty states
5. Polish → Final verification against all success criteria

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- No runtime toggle — `/spaces` is wired directly to CRD view at code level
- The old MUI SpaceExplorerView.tsx is kept in the codebase but no longer imported by SpaceExplorerPage
- Prototype features requiring data layer changes (e.g., member count) are omitted per spec clarification
- All CRD components must pass the checklist in `src/crd/CLAUDE.md`
