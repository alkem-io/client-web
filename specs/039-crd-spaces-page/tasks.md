# Tasks: CRD Spaces Page Migration

**Input**: Design documents from `/specs/039-crd-spaces-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story. CRD routes get a fully separate page shell (header, content, footer) — no MUI layout wraps CRD pages.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure the build pipeline for Tailwind CSS alongside MUI

- [x] T001 Install devDependencies: `pnpm add -D @tailwindcss/vite tailwindcss class-variance-authority`
- [x] T002 Install runtime dependencies: `pnpm add lucide-react @radix-ui/react-slot @radix-ui/react-select @radix-ui/react-dropdown-menu @radix-ui/react-avatar clsx tailwind-merge`
- [x] T003 Add `tailwindcss()` plugin to the plugins array in `vite.config.mjs` — import from `@tailwindcss/vite`
- [x] T004 Import CRD stylesheet in app entry: add `import '@/crd/styles/crd.css'` to `src/index.tsx`
- [x] T005 Run `pnpm build` and verify it succeeds with no regressions — existing MUI pages must render identically

---

## Phase 2: Foundational (Port Primitives from Prototype)

**Purpose**: Port required shadcn/ui primitives from `prototype/src/app/components/ui/` to `src/crd/primitives/`. Each primitive is a direct copy with import paths updated to use `@/crd/lib/utils` for `cn()`.

**CRITICAL**: No CRD composite components can be built until primitives are in place

- [x] T006 [P] Port `button.tsx` from `prototype/src/app/components/ui/button.tsx` to `src/crd/primitives/button.tsx` — update `cn()` import to `@/crd/lib/utils`
- [x] T007 [P] Port `input.tsx` from `prototype/src/app/components/ui/input.tsx` to `src/crd/primitives/input.tsx` — update `cn()` import to `@/crd/lib/utils`
- [x] T008 [P] Port `badge.tsx` from `prototype/src/app/components/ui/badge.tsx` to `src/crd/primitives/badge.tsx` — update `cn()` import to `@/crd/lib/utils`
- [x] T009 [P] Port `avatar.tsx` from `prototype/src/app/components/ui/avatar.tsx` to `src/crd/primitives/avatar.tsx` — update `cn()` import to `@/crd/lib/utils`
- [x] T010 [P] Port `select.tsx` from `prototype/src/app/components/ui/select.tsx` to `src/crd/primitives/select.tsx` — update `cn()` import, update lucide-react icon imports
- [x] T011 [P] Port `dropdown-menu.tsx` from `prototype/src/app/components/ui/dropdown-menu.tsx` to `src/crd/primitives/dropdown-menu.tsx` — update `cn()` import, update lucide-react icon imports
- [x] T012 [P] Port `skeleton.tsx` from `prototype/src/app/components/ui/skeleton.tsx` to `src/crd/primitives/skeleton.tsx` — update `cn()` import to `@/crd/lib/utils`
- [x] T013 Verify all ported primitives compile: run `pnpm build` and confirm no type errors in `src/crd/primitives/`

**Checkpoint**: All 7 primitives ported and compiling. CRD composite development can begin.

---

## Phase 3: User Story 1 — Full CRD Page Shell (Priority: P0)

**Goal**: CRD routes render with a completely new layout — CRD Header, content area, CRD Footer. The `/spaces` route is wrapped in this shell with a placeholder content area. No MUI `TopLevelLayout` wraps CRD routes.

**Independent Test**: Navigate to `/spaces`. Verify the entire page renders with the CRD Header (sticky, logo, nav icons, profile dropdown) and CRD Footer (links, language selector). Navigate to another page — it renders with the MUI layout. **STOP here and validate before proceeding to Phase 4.**

### Layout Components (presentational, in `src/crd/`)

- [x] T014 [P] [US1] Create `AlkemioLogo` SVG component in `src/crd/components/common/AlkemioLogo.tsx` — port from `prototype/src/imports/AlkemioSymbolSquare.tsx`. Render the Alkemio square symbol SVG. Accept `className` prop for sizing. No prototype-specific import paths
- [x] T015 [P] [US1] Create CRD `Header` component in `src/crd/layouts/Header.tsx` — port visual design from `prototype/src/app/components/layout/Header.tsx`. Accept props per `CrdHeaderProps` contract (`specs/039-crd-spaces-page/contracts/crd-layout.ts`). Must render: sticky header (h-16, border-b), Alkemio logo (links to `navigationHrefs.home` via `<a>` tag), navigation icons (Search, MessageSquare, Bell, LayoutGrid from lucide-react) linking to their respective `navigationHrefs` via `<a>` tags, profile avatar with dropdown menu (Dashboard, Profile, Settings, Logout). Use `useTranslation('crd')` for UI text. Replace prototype's `react-router` `Link` with `<a>` tags using `href` props. Replace prototype's `useSearch` context with `onSearch` callback prop (or omit search overlay for now). Notifications dropdown: show visual-only placeholder (no real data)
- [x] T016 [P] [US1] Create CRD `Footer` component in `src/crd/layouts/Footer.tsx` — port visual design from `prototype/src/app/components/layout/Footer.tsx`. Must render: copyright text, Terms/Privacy/Security/Support/About links (as `<a>` tags), centered Alkemio logo, language selector dropdown. Use `useTranslation('crd')` for text. Replace prototype's `useLanguage` context with `useTranslation` from react-i18next. Accept `className` prop
- [x] T017 [US1] Create CRD `CrdLayout` component in `src/crd/layouts/CrdLayout.tsx` — port structure from `prototype/src/app/layouts/MainLayout.tsx`. Accept props per `CrdLayoutProps` contract. Render: `<div className="crd-root">` → flex column → `<Header>` + `<main className="flex-1 flex flex-col">{children}</main>` + `<Footer>`. Pass user/auth/navigation props through to Header. No sidebar for now (sidebar is dashboard-only in prototype)

### Smart Wrapper (in `src/main/`, connects to app data)

- [x] T018 [US1] Create `CrdLayoutWrapper` in `src/main/ui/layout/CrdLayoutWrapper.tsx` — smart container that wraps `CrdLayout`. Reads auth state from existing auth hooks, reads user profile (name, avatar) from existing user hooks, constructs `navigationHrefs` from route constants (`TopLevelRoutePath`), provides `onLogout` callback. Wraps children in a React error boundary for graceful fallback on CRD rendering errors. Renders `CrdLayout` with all props + `<Outlet />` as children (React Router nested routing)

### Route Wiring

- [x] T019 [US1] Wire CRD routes in `TopLevelRoutes.tsx` — wrap the `/spaces` route in `CrdLayoutWrapper` instead of having `SpaceExplorerPage` wrap itself in `TopLevelPageLayout`. Structure: `<Route element={<CrdLayoutWrapper />}>` → `<Route path="/spaces" element={<SpaceExplorerPage />} />` → `</Route>`. Remove `TopLevelPageLayout` wrapper from `SpaceExplorerPage.tsx` for CRD — the page now renders directly inside the CRD layout
- [x] T020 [US1] Modify `SpaceExplorerPage.tsx` — remove `TopLevelPageLayout` wrapper (the CRD layout provides header/footer). Keep `useSpaceExplorer()` hook and page title. Render `SpaceExplorerCrdView` directly (which is currently a placeholder)

### i18n Keys

- [x] T021 [US1] Add i18n keys for CRD layout components to `src/core/i18n/en/translation.en.json` under a `crd` namespace — include: header nav labels (search, messages, notifications, spaces), profile menu items (dashboard, profile, settings, logout), footer links (terms, privacy, security, support, about), footer copyright, language names

**Checkpoint**: `/spaces` renders with full CRD shell (Header + placeholder content + Footer). Other pages render with MUI layout. **STOP and validate before Phase 4.**

---

## Phase 4: User Story 2 — Browse Spaces with New Design (Priority: P1) MVP

**Goal**: The `/spaces` page renders the actual space cards inside the CRD shell, displaying all space data from existing GraphQL queries with the prototype's visual design.

**Independent Test**: Navigate to `/spaces`. Verify spaces load, cards show name/tagline/banner/tags/leads/privacy badge, search and filter work, and "Load More" pagination functions.

### Implementation for User Story 2

- [x] T022 [P] [US2] Define SpaceCardData, SpaceLead, SpaceCardParent, and SpaceCardProps types in `src/crd/components/space/SpaceCard.tsx` — use contracts from `specs/039-crd-spaces-page/contracts/crd-space-card.ts` as reference (drop `memberCount` field)
- [x] T023 [P] [US2] Define SpaceExplorerProps type in `src/crd/components/space/SpaceExplorer.tsx` — use contracts from `specs/039-crd-spaces-page/contracts/crd-space-card.ts` as reference
- [x] T024 [P] [US2] Create data mapper functions (`mapSpaceToCardData`, `getInitials`, `getAvatarColor`) in `src/main/topLevelPages/topLevelSpaces/spaceCardDataMapper.ts` — map `SpaceWithParent` → `SpaceCardData` per field mapping in `specs/039-crd-spaces-page/data-model.md`. Include lead flattening (leadUsers as 'person' + leadOrganizations as 'org'), parent info mapping, and derived fields (initials, avatarColor)
- [x] T025 [US2] Build CRD SpaceCard component in `src/crd/components/space/SpaceCard.tsx` — port visual design from `prototype/src/app/components/space/SpaceCard.tsx`. Renders: banner image with default fallback via `getDefaultSpaceVisualUrl`, space name, tagline, tags via `Badge` primitive, lead avatars (first 4 + overflow "+N"), privacy Lock/Globe icon, parent info for subspaces. Accepts `href` + optional `onClick` prop for navigation. Uses `useTranslation()` for UI text. No `react-router-dom` Link
- [x] T026 [US2] Build CRD SpaceExplorer component in `src/crd/components/space/SpaceExplorer.tsx` — port layout from `prototype/src/app/pages/BrowseSpacesPage.tsx`. Includes: `TagsInput` form component for tag-based search, Sort dropdown (Recent/Alphabetical/Active), Filters dropdown (Membership server-side + Privacy + Type client-side), responsive CSS Grid (`repeat(auto-fill, minmax(280px, 1fr))`) in `max-w-[1600px]` container, "Load More" button, results count, active filter chips. Client-side sorting and filtering applied on top of server results
- [x] T027 [US2] Replace placeholder in `SpaceExplorerCrdView.tsx` — import `SpaceExplorer` from `@/crd/components/space/SpaceExplorer`, call `mapSpaceToCardData` to transform data, pass mapped data + callbacks to SpaceExplorer component
- [x] T028 [US2] Add i18n keys for CRD space components to `src/core/i18n/en/translation.en.json` under the `crd` namespace — include: filter labels ("All", "Member", "Public"), search placeholder, "Load More" button text, empty state message, results count text, privacy labels ("Public", "Private")

**Checkpoint**: `/spaces` renders with CRD shell + real space cards. Cards show real data. Search, filter, and pagination work.

---

## Phase 5: User Story 3 — MUI and CRD Coexistence (Priority: P1)

**Goal**: CRD `/spaces` page (full CRD shell) and MUI pages (full MUI shell) coexist without style conflicts. Navigating between them works seamlessly.

**Independent Test**: Navigate from `/spaces` (full CRD page) to any other page (full MUI page) and back. Verify no style leakage, no console errors, no broken layouts on either side.

### Implementation for User Story 3

- [x] T029 [US3] Verify `.crd-root` class is applied on the CrdLayout root element in `src/crd/layouts/CrdLayout.tsx` — Tailwind resets in `src/crd/styles/crd.css` are scoped to this class
- [x] T030 [US3] Navigate between `/spaces` (CRD) and at least 3 MUI pages (e.g., home, a space detail page, user profile). Verify: no Tailwind style leakage to MUI pages, MUI pages render identically to before, no console errors during navigation, layout transitions are clean (CRD header/footer disappear, MUI header/footer appear)
- [x] T031 [US3] Run `pnpm build` and verify the production build succeeds with both styling systems

**Checkpoint**: Both design systems coexist at the layout level. MUI pages are visually identical to before.

---

## Phase 6: User Story 4 — Responsive Space Cards (Priority: P2)

**Goal**: The CRD card grid adapts to viewport width — 3-4 columns on desktop, 2-3 on tablet, 1 on mobile. Header and footer are also responsive.

**Independent Test**: Resize browser from mobile to desktop widths. Cards reflow correctly at all breakpoints. Header collapses gracefully.

### Implementation for User Story 4

- [x] T032 [US4] Verify the CSS Grid in SpaceExplorer (`src/crd/components/space/SpaceExplorer.tsx`) uses `repeat(auto-fill, minmax(280px, 1fr))` matching the prototype. Adjust min width if cards are too narrow or too wide at tablet breakpoints (768-1200px)
- [x] T033 [US4] Verify SpaceCard (`src/crd/components/space/SpaceCard.tsx`) content does not overflow at narrow widths — banner image, name, and tagline must be visible without horizontal scroll at 320px viewport width
- [x] T034 [US4] Verify search/filter bar in SpaceExplorer is responsive — stacks vertically on mobile, horizontal row on desktop. Adjust Tailwind responsive classes if needed
- [x] T035 [US4] Verify CRD Header is responsive — mobile menu button visible on small screens, nav icons adjust spacing

**Checkpoint**: Cards render correctly at desktop (>1200px), tablet (768-1200px), and mobile (<768px). Header/footer adapt.

---

## Phase 7: User Story 5 — Loading and Empty States (Priority: P2)

**Goal**: Show skeleton cards during loading and a meaningful empty state when no spaces match filters.

**Independent Test**: Throttle network to observe skeletons. Search for nonexistent tag to see empty state.

### Implementation for User Story 5

- [x] T036 [P] [US5] Create `SpaceCardSkeleton` component in `src/crd/components/space/SpaceCard.tsx` — use Skeleton primitive from `src/crd/primitives/skeleton.tsx` to mimic card layout (banner placeholder, text lines, avatar circles). Export alongside SpaceCard
- [x] T037 [P] [US5] Add empty state UI to `src/crd/components/space/SpaceExplorer.tsx` — show a centered icon (FolderOpen from lucide-react) with descriptive message when `spaces` array is empty and `loading` is false. Use translated text from `crd` i18n namespace
- [x] T038 [US5] Wire loading and empty states in `src/crd/components/space/SpaceExplorer.tsx` — show grid of SpaceCardSkeleton (6-8 items) when `loading` is true, show empty state when `spaces.length === 0` and not loading, show card grid when spaces are available

**Checkpoint**: Loading skeletons appear during data fetch. Empty state shows when no results match.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all success criteria

- [x] T039 Verify SC-005: run `grep -r "@mui" src/crd/` and confirm zero results — no MUI imports in any CRD file
- [x] T040 Verify SC-006: review all files in `src/crd/` against the component checklist in `src/crd/CLAUDE.md` — no domain imports, plain TS props, Tailwind-only styling, no barrel exports, icons from lucide-react only
- [x] T041 Run `pnpm lint` and `pnpm vitest run` — verify all type checks and existing tests pass with no regressions
- [ ] T042 Verify edge cases: space with no banner shows initials fallback, space with no leads renders without leads section, space with >4 leads shows "+N" overflow, unauthenticated user sees no lead avatars and no "Member" filter
- [ ] T043 Verify SC-008 (performance): compare LCP of `/spaces` CRD version vs MUI version using browser DevTools Performance tab — CRD must be equal to or better
- [ ] T044 Verify SC-004 + a11y: test keyboard navigation on CRD `/spaces` page (Tab through cards, Enter to navigate, filter controls accessible, header nav keyboard-accessible) — Radix UI provides built-in a11y but verify end-to-end
- [x] T045 Verify SC-007 (documentation): document the CRD migration pattern (CRD layout shell + data mapper + CRD view wrapper + route wiring) in a brief section in `specs/039-crd-spaces-page/` so the next page migration can follow the same steps

---

## Phase 9: Post-Implementation Refinements (User Feedback)

**Purpose**: Adjustments made during user testing after the initial implementation was complete

- [x] T046 [US2] Fix banner fallback — use `getDefaultSpaceVisualUrl(VisualType.Card, space.id)` in `spaceCardDataMapper.ts` instead of gradient fallback when `cardBanner?.uri` is empty. Same deterministic default banners as MUI version
- [x] T047 [US2] Replace filter buttons with prototype-matching UI — replaced All/Member/Public buttons in `SpaceExplorer.tsx` with Sort dropdown (Recent/Alphabetical/Active) + Filters dropdown (Membership, Privacy, Type sections). Added client-side sorting and privacy/type filtering on top of server-side membership filter
- [x] T048 [US2] Create `TagsInput` form component in `src/crd/forms/tags-input.tsx` — reusable tag-based input (type + Enter = chip, Backspace removes last). Extracted from inline search input in SpaceExplorer. Accepts `value`, `onChange`, `placeholder`, `className`, `icon`
- [x] T049 [US2] Add `onClick` prop to SpaceCard — optional callback that prevents default `<a>` navigation when provided, allowing consumers to wire custom navigation (e.g., React Router)
- [x] T050 [US2] Use `Badge` primitive for SpaceCard tags — replaced inline `<span>` tags with `Badge variant="secondary"` for visible tags and `Badge variant="outline"` for "+N" overflow
- [x] T051 [US2] Fix container width — changed SpaceExplorer root from `max-w-7xl` (1280px) to `max-w-[1600px]` and `px-4` to `px-6` matching the prototype, enabling 5 cards per row on wide screens

---

## Phase 10: CRD Standalone App (Designer Preview)

**Purpose**: Make `src/crd/` runnable as an independent application with mock data, so designers can preview CRD components without the full Alkemio backend. Reuses the same components the main client uses.

**Independent Test**: Run `pnpm crd:dev`, navigate to `http://localhost:5200/spaces`. The spaces page renders with the CRD layout and mock data. No backend required.

- [x] T052 Extract CRD translations into `src/crd/i18n/en.json` — a proper i18next JSON resource loaded as the `'crd'` namespace. The main app's `src/core/i18n/config.ts` imports it as an additional namespace. The standalone app imports the same file as its default namespace. Components use `useTranslation('crd')` with prefixless keys: `t('spaces.title')`
- [x] T053 Create standalone app entry at `src/crd/app/main.tsx` — imports CRD styles, initializes i18next with CRD translations, renders `<CrdApp />` into the DOM
- [x] T054 Create `src/crd/app/CrdApp.tsx` — root component with i18n provider and `react-router-dom` `BrowserRouter`. Renders `CrdLayout` with mock user data and `<Routes>`
- [x] T055 Create mock data at `src/crd/app/data/spaces.ts` — reuse space data from `prototype/src/app/pages/BrowseSpacesPage.tsx`, adapting it to `SpaceCardData` type (drop `slug`/`memberCount`, add `href`/`bannerImageUrl`/`avatarColor`)
- [x] T056 Create `src/crd/app/pages/SpacesPage.tsx` — renders `SpaceExplorer` with mock data. Implements client-side search/filter/sort/pagination (all local state, no GraphQL)
- [x] T057 Create `src/crd/app/vite.config.ts` — standalone Vite config with `@tailwindcss/vite`, `@vitejs/plugin-react`, path alias `@/crd` → `src/crd/`. Dev server on port 5200
- [x] T058 Create `src/crd/app/index.html` — HTML entry point for the standalone app
- [x] T059 Add scripts to root `package.json`: `"crd:dev": "vite --config src/crd/app/vite.config.ts"`, `"crd:build": "vite build --config src/crd/app/vite.config.ts"`
- [x] T060 Update `src/crd/CLAUDE.md` — document the standalone app architecture, how to run it, and the i18n separation pattern
- [x] T061 Verify standalone app runs: `pnpm crd:build` succeeds (1.2s, 445kB JS). Main app build (38s) and tests (569 passing) unaffected

**Checkpoint**: `pnpm crd:dev` launches a standalone CRD preview app at port 5200. Designers can browse `/spaces` with mock data. Main app unaffected.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — DONE
- **Foundational (Phase 2)**: Depends on Setup (T001-T005) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (T006-T013) — BLOCKS US2, US3
- **US2 (Phase 4)**: Depends on US1 (CRD shell must exist) — BLOCKS US3
- **US3 (Phase 5)**: Depends on US2 (need real content to validate coexistence)
- **US4 (Phase 6)**: Depends on US2 (SpaceExplorer must exist) — can run in parallel with US3
- **US5 (Phase 7)**: Depends on US2 (SpaceExplorer must exist) — can run in parallel with US3 and US4
- **Polish (Phase 8)**: Depends on all user stories being complete (T039-T045)

### Within User Story 1 (Phase 3)

1. AlkemioLogo (T014), Header (T015), Footer (T016) — parallelizable, different files
2. CrdLayout (T017) — depends on Header (T015) + Footer (T016)
3. CrdLayoutWrapper (T018) — depends on CrdLayout (T017)
4. Route Wiring (T019) + Page Modification (T020) — depends on CrdLayoutWrapper (T018)
5. i18n Keys (T021) — can be done in parallel with T015-T016 but must be complete before T019

### Within User Story 2 (Phase 4)

1. Types (T022, T023) and Mapper (T024) — parallelizable, different files
2. SpaceCard (T025) — depends on types (T022) + primitives (Phase 2)
3. SpaceExplorer (T026) — depends on SpaceCard (T025) + types (T023)
4. Replace placeholder (T027) — depends on SpaceExplorer (T026) + Mapper (T024)
5. i18n Keys (T028) — can be done in parallel with T025-T026 but must be complete before T027

### Parallel Opportunities

- **Phase 2**: All 7 primitive ports (T006-T012) can run in parallel
- **Phase 3**: T014, T015, T016 can run in parallel (different files)
- **Phase 3**: T021 (i18n) can run in parallel with T015-T016
- **Phase 4**: T022, T023, T024 can run in parallel (different files)
- **Phase 4**: T028 (i18n) can run in parallel with T025-T026
- **Phases 5-7**: US3, US4, US5 can run in parallel after US2 completes (different concerns)
- **Phase 7**: T036, T037 can run in parallel (skeleton vs empty state, different concerns)

---

## Implementation Strategy

### Milestone 1: CRD Shell (Phase 1-3)

1. Phase 1: Setup — DONE
2. Phase 2: Port primitives (T006-T013)
3. Phase 3: CRD layout shell (T014-T021)
4. **STOP and VALIDATE**: Navigate to `/spaces` — verify full CRD shell (header + placeholder + footer). Navigate to other pages — verify MUI layout still works.

### Milestone 2: Real Content (Phase 4)

5. Phase 4: Space cards and explorer (T022-T028)
6. **STOP and VALIDATE**: Navigate to `/spaces` — verify cards show real data, search/filter/pagination work.

### Milestone 3: Polish (Phases 5-8)

7. Phases 5-7 (parallel): Coexistence validation, responsiveness, loading/empty states
8. Phase 8: Final verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- No runtime toggle — `/spaces` is wired directly to CRD layout at route level
- The old MUI SpaceExplorerView.tsx and TopLevelPageLayout are kept in the codebase but no longer used for `/spaces`
- CRD layout components (Header, Footer, CrdLayout) are presentational — they live in `src/crd/layouts/` and receive all data via props
- CrdLayoutWrapper in `src/main/ui/layout/` is the smart container that connects the CRD shell to app data
- Prototype features requiring data layer changes (e.g., member count) are omitted per spec clarification
- All CRD components must pass the checklist in `src/crd/CLAUDE.md`
- CRD Header interactive features (search overlay, real notifications, real messages) are deferred — icons link to existing pages
