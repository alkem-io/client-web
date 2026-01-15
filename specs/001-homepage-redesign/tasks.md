# Tasks: Homepage Redesign

**Input**: Design documents from `/specs/001-homepage-redesign/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, quickstart.md ✓

**Tests**: Not explicitly requested - focusing on manual testing per quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation

- [x] T001 Verify development environment: Node 20+, pnpm 10+, backend running on `http://localhost:3000`
- [x] T002 Ensure on feature branch `001-homepage-redesign` and dependencies installed via `pnpm install`
- [x] T003 [P] Start development server via `pnpm start` and navigate to `http://localhost:3000/home` to establish baseline

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Note**: This feature has minimal foundational work - primarily validation and translation keys

- [x] T005 [P] Add translation keys to `src/core/i18n/en/translation.en.json` for resource group titles:
  - `pages.home.sections.resources.spaces`
  - `pages.home.sections.resources.virtualContributors`
  - `pages.home.sections.resources.innovationPacks`
- [x] T006 Verify existing components are available and documented in research.md:
  - `PlatformNavigationBar` (src/main/ui/platformNavigation/PlatformNavigationBar.tsx)
  - `TopLevelPageBanner` (src/main/ui/layout/topLevelPageLayout/TopLevelPageBanner.tsx)
  - `RecentSpacesList` (from DashboardActivity.tsx)
  - `MyResources` (src/main/topLevelPages/myDashboard/MyResources.tsx)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Homepage with Simplified Header (Priority: P1) 🎯 MVP

**Goal**: Show only platform menu on `/home`, remove banner and background visuals

**Independent Test**: Navigate to `/home` → header shows only platform menu, no banner. Navigate to any other route → banner still appears.

**Acceptance Criteria from Spec**:

1. Header on `/home` displays only platform menu without banner or background visuals
2. Other routes maintain existing header design (banner, breadcrumbs, etc.)
3. Mobile viewport renders simplified header correctly without layout issues

### Implementation for User Story 1

- [x] T007 [P] [US1] Import `useLocation` hook from `react-router-dom` in `src/main/topLevelPages/Home/HomePageLayout.tsx`
- [x] T008 [US1] Add route detection logic in `HomePageLayout` component to check if current path is `/home`
- [x] T009 [US1] Conditionally render `TopLevelPageBanner` component - only show when NOT on `/home` route in `src/main/topLevelPages/Home/HomePageLayout.tsx`
- [x] T010 [US1] Ensure `PlatformNavigationBar` always renders regardless of route in `src/main/topLevelPages/Home/HomePageLayout.tsx`
- [ ] T011 [US1] Test navigation flow: Desktop - `/home` → `/spaces` → back to `/home` → verify banner behavior
- [ ] T012 [US1] Test navigation flow: Mobile (< 600px) - `/home` → verify simplified header renders without layout breaks
- [ ] T013 [US1] Test navigation flow: Tablet (600-1199px) - verify header transitions work correctly
- [ ] T014 [US1] Verify keyboard navigation: Tab through header elements on `/home` and other routes
- [ ] T015 [US1] Test browser back/forward navigation between `/home` and other routes - verify header updates correctly

**Checkpoint**: User Story 1 complete - simplified header functional and tested independently

---

## Phase 4: User Story 2 - View Activity Dashboard with Spaces Section Prioritized (Priority: P2)

**Goal**: Position Spaces section above both InfoColumn and ContentColumn with special grid layout: first card takes 3 columns (matching InfoColumn width), remaining cards take 3 columns each across the remaining 9 columns

**Independent Test**: Load `/home` as authenticated user → Spaces section appears above both activity columns. First space card aligns with InfoColumn width, remaining cards distributed across ContentColumn width. On mobile: 1 card only.

**Acceptance Criteria from Spec**:

1. Authenticated user on `/home` → Spaces section appears above both infoColumn and contentColumn with correct grid alignment
2. Desktop: First card = 3 columns (InfoColumn width), remaining cards = 3 columns each (3 cards across 9 columns)
3. Mobile: 1 card at full width (4 columns on mobile grid)

### Implementation for User Story 2

- [x] T016 [P] [US2] Extract `RecentSpacesList` component import and usage from `src/main/topLevelPages/myDashboard/DashboardWithMemberships/DashboardActivity.tsx`
- [x] T017 [US2] Add `RecentSpacesList` to `src/main/topLevelPages/myDashboard/DashboardWithMemberships/MyDashboardWithMemberships.tsx` before InfoColumn/ContentColumn layout
- [x] T018 [US2] Wrap `RecentSpacesList` in `PageContentColumn` with `columns={12}` for full-width display in `src/main/topLevelPages/myDashboard/DashboardWithMemberships/MyDashboardWithMemberships.tsx`
- [x] T019 [US2] Modify `useSpaceCardLayout` hook in `src/main/topLevelPages/myDashboard/useSpaceCardLayout.ts` to return `firstCardColumns: 3` and `remainingCardColumns: 3` for desktop (columns >= 8)
- [x] T020 [US2] Update `RecentSpacesList` in `src/main/topLevelPages/myDashboard/recentSpaces/RecentSpacesList.tsx` to apply different column widths: first `GridItem` uses 3 columns, subsequent items use 3 columns (styling change only)
- [x] T021 [US2] Ensure mobile behavior: when columns < 8, all cards use full width (1 card visible per `visibleSpaces` logic)
- [x] T022 [US2] Remove `RecentSpacesList` from `DashboardActivity.tsx` to avoid duplication (keep only activity blocks)
- [ ] T023 [US2] Test desktop (>= 1200px): Verify first space card aligns with InfoColumn (3 cols), remaining 3 cards align with ContentColumn (3 cols each)
- [ ] T024 [US2] Test tablet (600-1199px): Verify grid adapts correctly (8 columns total: first card ~3 cols, remaining distributed)
- [ ] T025 [US2] Test mobile (< 600px): Verify only 1 card shows at full width (4 columns)
- [ ] T026 [US2] Test authenticated user with 1 space: Verify single card uses 3 columns and aligns with InfoColumn
- [ ] T027 [US2] Test authenticated user with 4+ spaces: Verify first card = 3 cols, next 3 cards = 3 cols each, "See More" button appears
- [ ] T028 [US2] Verify responsive behavior: Resize browser from desktop → mobile → verify grid reflows correctly without layout breaks

**Checkpoint**: User Stories 1 AND 2 complete - both work independently and together

---

## Phase 5: User Story 3 - Browse Grouped Resources in InfoColumn (Priority: P3)

**Goal**: Add visual grouping with titles to resources in InfoColumn: Spaces, VirtualContributors, InnovationPacks

**Independent Test**: Load `/home` → InfoColumn shows three distinct groups with titles. Each group contains only its resource type. Empty groups are hidden.

**Acceptance Criteria from Spec**:

1. InfoColumn displays groups with titles: "Spaces", "VirtualContributors", "InnovationPacks"
2. Each group contains only resources of its designated type
3. Resources appear in order: Spaces, VirtualContributors, InnovationPacks
4. Empty resource groups are hidden or show appropriate empty state

### Implementation for User Story 3

- [x] T028 [P] [US3] Import `Box` and `Typography` from `@mui/material` in `src/main/topLevelPages/myDashboard/MyResources.tsx`
- [x] T029 [P] [US3] Import `useTranslation` hook from `react-i18next` in `src/main/topLevelPages/myDashboard/MyResources.tsx`
- [x] T030 [US3] Wrap Spaces resources in a group with title using `<Typography variant="subtitle2">` and translation key `pages.home.sections.resources.spaces`
- [x] T031 [US3] Wrap VirtualContributors resources in a group with title using `<Typography variant="subtitle2">` and translation key `pages.home.sections.resources.virtualContributors`
- [x] T032 [US3] Wrap InnovationPacks resources in a group with title using `<Typography variant="subtitle2">` and translation key `pages.home.sections.resources.innovationPacks`
- [x] T033 [US3] Add conditional rendering to hide groups when empty: `{spaces.length > 0 && <Box>...</Box>}` for each resource type
- [x] T034 [US3] Add consistent spacing between groups using `<Box mb={2}>` or MUI `Stack` component with gap`
- [x] T035 [US3] Verify group order: Spaces → VirtualContributors → InnovationPacks in `src/main/topLevelPages/myDashboard/MyResources.tsx`
- [ ] T036 [US3] Test desktop: Verify all three groups display with clear visual separation and correct titles
- [ ] T037 [US3] Test user with only Spaces: Verify only Spaces group shows, others hidden
- [ ] T038 [US3] Test user with all resource types: Verify all groups display in correct order
- [ ] T039 [US3] Test user with no resources: Verify appropriate handling (empty state or hidden InfoColumn section)
- [ ] T040 [US3] Verify group titles use correct typography variant and are properly translated
- [ ] T041 [US3] Test responsive: Verify groups adapt correctly on tablet/mobile (note: InfoColumn hidden on mobile per research.md)

**Checkpoint**: All user stories complete - homepage redesign fully functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, performance, and accessibility checks across all user stories

- [ ] T042 [P] Visual comparison: Compare `/home` against Figma design reference (https://www.figma.com/design/urACTDAZyc5ACExQw0EhPD/Home-Space?node-id=1-7&m=dev)
- [ ] T043 [P] Measure final LCP on `/home` route and compare to baseline from T004 (must be < baseline + 100ms per SC-007)
- [ ] T044 [P] Accessibility audit: Run keyboard navigation test across all three user stories on `/home`
- [ ] T045 [P] Accessibility audit: Test screen reader (VoiceOver/NVDA) - verify heading hierarchy and group labels
- [ ] T046 [P] Accessibility audit: Verify focus indicators are visible on all interactive elements
- [ ] T047 Test complete navigation flow: Home → Space → back to Home → verify all three user stories work together
- [ ] T048 Test edge case: Direct URL navigation to `/home` vs in-app navigation - verify consistent behavior
- [ ] T049 Test edge case: Browser resize while on `/home` - verify responsive transitions work smoothly
- [ ] T050 Test edge case: Very long space names and resource titles - verify text truncation/wrapping works correctly
- [ ] T051 Verify no visual regressions on other routes: Test header on `/spaces`, `/organizations`, `/users` routes
- [ ] T052 [P] Run existing Vitest test suite: `pnpm vitest run --reporter=basic` - ensure no regressions
- [ ] T053 [P] Run linter: `pnpm lint` - ensure code quality standards met
- [ ] T054 Document any manual testing results or screenshots in `specs/001-homepage-redesign/` directory
- [ ] T055 Final validation: Run through all acceptance scenarios from spec.md for all three user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Phase 2 - No dependencies on other stories
  - User Story 2 (P2): Can start after Phase 2 - Technically independent but builds on same dashboard
  - User Story 3 (P3): Can start after Phase 2 - Completely independent
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Completely independent - can be implemented and shipped alone (MVP)
- **User Story 2 (P2)**: Technically independent but touches same dashboard layout
  - Recommended: Implement after US1 to avoid merge conflicts
  - Can be worked on in parallel by different developer if needed
- **User Story 3 (P3)**: Completely independent - different component (MyResources vs HomePageLayout/DashboardActivity)
  - Can be implemented in parallel with US1 or US2

### Within Each User Story

- Tests are manual (per quickstart.md) - validation happens after implementation
- Implementation tasks follow logical dependency order (imports → logic → conditional rendering → testing)
- Each story has independent test checkpoint before moving to next priority

### Parallel Opportunities

**Within Setup (Phase 1)**:

- T003 and T004 can run in parallel (different validation activities)

**Within Foundational (Phase 2)**:

- T005 and T006 can run in parallel (translation keys vs component verification)

**Across User Stories (Phase 3-5)** - If team has multiple developers:

- US1 and US3 can be fully parallelized (different files, no conflicts)
- US2 should wait for US1 or require careful merge coordination (both touch dashboard layout)

**Within User Story 1 (Phase 3)**:

- T007 can run in parallel with any other US1 task (just an import)

**Within User Story 2 (Phase 4)**:

- T016 can run in parallel with other analysis tasks

**Within User Story 3 (Phase 5)**:

- T028 and T029 can run in parallel (both are imports)

**Within Polish (Phase 6)**:

- T042, T043, T044, T045, T046, T052, T053 can all run in parallel (independent validation activities)

---

## Parallel Execution Example: Full Feature

**Minimum Time Path (Single Developer, Sequential)**:

1. Setup + Foundational: 30 min (T001-T006)
2. User Story 1: 2-3 hours (T007-T015)
3. User Story 2: 2-3 hours (T016-T027)
4. User Story 3: 1-2 hours (T028-T041)
5. Polish: 1 hour (T042-T055)

**Total: 6-9 hours (matches quickstart.md estimate)**

**Optimized Path (Multiple Developers)**:

1. Setup + Foundational: 30 min (all developers)
2. **Parallel Sprint**:
   - Dev 1: User Story 1 (2-3 hours)
   - Dev 2: User Story 3 (1-2 hours) → then helps with US2 or Polish
   - Dev 3: User Story 2 (2-3 hours) - starts after US1 merge to avoid conflicts
3. Polish: 1 hour (can parallelize validation tasks)

**Total: 4-5 hours (with 2-3 developers)**

---

## MVP Scope Recommendation

**Minimal Viable Product**: User Story 1 ONLY (P1 - Simplified Header)

**Why**:

- Delivers immediate visual improvement (simplified, focused header)
- Can be independently tested and shipped
- No dependencies on other stories
- Low risk (isolated to HomePageLayout component)
- Fast delivery: 3-4 hours including setup and polish

**Incremental Delivery Path**:

1. **v1.0 (MVP)**: Ship US1 → Get user feedback on simplified header
2. **v1.1**: Add US2 → Improve dashboard hierarchy
3. **v1.2**: Add US3 → Complete resource organization

This approach allows for early user feedback and reduces risk of large-scale changes.

---

## Implementation Strategy Summary

**Total Tasks**: 54 tasks

- Setup: 3 tasks
- Foundational: 2 tasks
- User Story 1 (P1): 9 tasks
- User Story 2 (P2): 13 tasks
- User Story 3 (P3): 14 tasks
- Polish: 14 tasks

**Task Distribution by User Story**:

- US1 (Simplified Header): 9 tasks (~2-3 hours)
- US2 (Spaces Section Grid Layout): 13 tasks (~2-3 hours)
- US3 (Grouped Resources): 14 tasks (~1-2 hours)

**Parallel Opportunities**: 15 tasks marked [P] can run concurrently

**Independent Test Criteria**: Each user story has clear acceptance scenarios and can be validated independently

**Suggested MVP**: User Story 1 only (fast, low-risk, immediate value)

**Format Validation**: ✅ All 54 tasks follow the required checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
