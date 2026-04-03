# Tasks: CRD Dashboard Page Migration

**Input**: Design documents from `/specs/041-crd-dashboard-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Port primitives, create i18n namespace, register translations

- [ ] T001 [P] Port Switch primitive from `prototype/src/app/components/ui/switch.tsx` to `src/crd/primitives/switch.tsx` — update `cn()` import to `@/crd/lib/utils`, verify zero MUI imports
- [ ] T002 [P] Port ScrollArea primitive from `prototype/src/app/components/ui/scroll-area.tsx` to `src/crd/primitives/scroll-area.tsx` — update `cn()` import to `@/crd/lib/utils`, verify zero MUI imports
- [ ] T003 [P] Create English translation file at `src/crd/i18n/dashboard/dashboard.en.json` with all keys: sidebar menu items (invitations, tipsAndTricks, myAccount, createSpace, activityView), activity feed labels (spacesTitle, personalTitle, filter.space.label, filter.space.all, filter.role.label, filter.role.all, showMore, noActivity), recent spaces labels (title, exploreAll, homeSpacePlaceholder.title, homeSpacePlaceholder.subtitle), dialog titles, banner text, invitation actions (accept, decline), campaign text, empty states, unauthenticated view (signUp, createSpace)
- [ ] T004 Create translated files at `src/crd/i18n/dashboard/dashboard.{nl,es,bg,de,fr}.json` — AI-assisted translations matching the English keys (depends on T003)
- [ ] T005 Register `crd-dashboard` namespace in `src/core/i18n/config.ts` under `crdNamespaceImports` with lazy imports for all 6 languages, following the same pattern as `crd-exploreSpaces` (depends on T003, T004)
- [ ] T006 Add `crd-dashboard` type declarations in `@types/i18next.d.ts` following the existing `crd-exploreSpaces` pattern (depends on T005)

**Checkpoint**: Primitives and i18n ready — CRD component development can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared data mappers, layout component, route wiring, and page entry point that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create `src/main/crdPages/dashboard/dashboardDataMappers.ts` with all mapping functions: `mapRecentSpacesToCompactCards()`, `mapActivityToFeedItems()`, `mapResourcesToSidebarItems()`, `mapMembershipsToTree()`, `mapInvitationsToCards()`, `mapDashboardSpaces()` — reference GraphQL types from existing hooks in `src/main/topLevelPages/myDashboard/`, output plain TypeScript types per `specs/041-crd-dashboard-page/contracts/`
- [ ] T008 Create `DashboardLayout` CRD component at `src/crd/components/dashboard/DashboardLayout.tsx` — three-zone CSS Grid: sidebar (~240px fixed) + two equal content columns. Use Tailwind responsive: `hidden md:block` for sidebar on mobile, `grid-cols-1 md:grid-cols-[240px_1fr_1fr]`. Accept `sidebar: ReactNode` and `children: ReactNode` props. Add `<nav>` landmark with `aria-label` for sidebar region, `<main>` for content area (FR-033)
- [ ] T009 Create `src/main/crdPages/dashboard/useDashboardDialogs.ts` — manage open/close state for TipsAndTricks, MyActivity, MySpaceActivity, MyMemberships dialogs. Read `?dialog=invitations` URL search param on mount and trigger `onPendingMembershipsClick` callback if present (FR-016). Follow pattern from existing `src/main/topLevelPages/myDashboard/DashboardMenu/useMyDashboardDialogs.ts`
- [ ] T010 Create `src/main/crdPages/dashboard/DashboardPage.tsx` — main page entry point. Use `useCurrentUserContext()` for auth state, `useLatestContributionsSpacesFlatQuery()` for membership check. Render `DashboardUnauthenticated`, `DashboardWithoutMemberships`, or `DashboardWithMemberships` based on state. Wire `usePendingMembershipsDialog()` callback. Follow pattern from `src/main/topLevelPages/myDashboard/MyDashboard.tsx`
- [ ] T011 Add CRD dashboard lazy import and conditional route in `src/main/routing/TopLevelRoutes.tsx` — add `const CrdDashboardPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/dashboard/DashboardPage'))`. Add conditional `crdEnabled` block for `/home` route: CRD path wraps in `<CrdLayoutWrapper />`, MUI path keeps existing `<HomePage />`. Follow same pattern as the `/spaces` CRD route

**Checkpoint**: Foundation ready — navigating to `/home` with CRD enabled renders the page shell with correct view branching

---

## Phase 3: User Story 1 + User Story 2 — Main Dashboard with Sidebar (Priority: P1) 🎯 MVP

**Goal**: Authenticated user with memberships sees the full CRD dashboard: recent spaces row, sidebar with navigation + resource lists, two-column activity feeds with filters, and Activity View toggle to switch between activity and spaces views.

**Independent Test**: Enable CRD toggle, log in as a user with space memberships, navigate to `/home`. Verify: recent spaces row with home space, sidebar menu items trigger correct actions, resource lists show spaces/VCs/hubs/packs, activity feeds display with working Space/Role filters, Activity View toggle switches between feeds and spaces view.

### CRD Components (Presentational)

- [ ] T012 [P] [US1] Create `CompactSpaceCard` CRD component at `src/crd/components/dashboard/CompactSpaceCard.tsx` — renders space card with banner image (fallback to gradient), space name, lock icon (lucide `Lock`) for private spaces, home pin indicator. Props: `CompactSpaceCardData` from contracts. Use `<a href>` for navigation. Add `CompactSpaceCardSkeleton` for loading state
- [ ] T013 [P] [US1] Create `HomeSpacePlaceholder` CRD component at `src/crd/components/dashboard/HomeSpacePlaceholder.tsx` — dashed-border card with "Set your Home Space" text and link. Props: `{ settingsHref: string }`. Use `useTranslation('crd-dashboard')` for text
- [ ] T014 [P] [US1] Create `ActivityItem` CRD component at `src/crd/components/dashboard/ActivityItem.tsx` — single row: Avatar (left) + user name + action text + target link (center) + relative timestamp (right). Props: `ActivityItemData` from contracts. Target name as `<a href>` if `targetHref` provided. Use `<time>` element for timestamp. Ensure screen readers get full content (FR-032)
- [ ] T015 [P] [US2] Create `SidebarResourceItem` CRD component at `src/crd/components/dashboard/SidebarResourceItem.tsx` — Avatar (image or initials with color) + truncated name. Rendered as `<a href>` link. Props: `SidebarResourceData` from contracts
- [ ] T016 [US1] Create `RecentSpaces` CRD component at `src/crd/components/dashboard/RecentSpaces.tsx` — horizontal `flex` row of up to 4 `CompactSpaceCard` components + optional `HomeSpacePlaceholder` (first position if no home space). "Explore all your Spaces" link below, triggers `onExploreAllClick` callback. Loading state renders 4 `CompactSpaceCardSkeleton`. Use `useTranslation('crd-dashboard')` (depends on T012, T013)
- [ ] T017 [US1] Create `ActivityFeed` CRD component at `src/crd/components/dashboard/ActivityFeed.tsx` — title heading, filter dropdowns (shadcn `Select` for Space filter; Role filter shown only when `variant='spaces'`), scrollable list of `ActivityItem` components inside `ScrollArea`, "Show more" link at bottom. Props: `ActivityFeedProps` from contracts. Filters have visible `<label>` or `aria-label` (FR-025). Empty state uses `role="status"` (FR-034). Loading state uses `aria-busy="true"` (depends on T014)
- [ ] T018 [US2] Create `DashboardSidebar` CRD component at `src/crd/components/dashboard/DashboardSidebar.tsx` — renders inside `<nav aria-label="Dashboard navigation">` (FR-022). Menu items as `<a>` (for href) or `<button>` (for onClick), each with lucide icon + label + optional Badge count. Resource sections with heading + list of `SidebarResourceItem`. Activity View toggle using `Switch` primitive with `<label htmlFor>` association (FR-024). All text via `useTranslation('crd-dashboard')`. Invitations badge uses `aria-label="Invitations, N pending"` (FR-030) (depends on T001, T015)
- [ ] T019 [P] [US1] Create `SpaceHierarchyCard` CRD component at `src/crd/components/dashboard/SpaceHierarchyCard.tsx` — parent space card with banner image, name, tagline, home pin indicator, + list of subspace name links below. Props: `SpaceHierarchyCardData` from contracts
- [ ] T020 [US1] Create `DashboardSpaces` CRD component at `src/crd/components/dashboard/DashboardSpaces.tsx` — renders list of `SpaceHierarchyCard` components + "Load More" button + optional "See More Subspaces" trigger per card. Loading skeleton state. Props: `DashboardSpacesProps` from contracts (depends on T019)

### Secondary Components (shared across US1/US3)

- [ ] T021 [P] [US1] Create `CampaignBanner` CRD component at `src/crd/components/dashboard/CampaignBanner.tsx` — simple banner with descriptive text + CTA button. Props: `{ onAction: () => void }`. Use `useTranslation('crd-dashboard')` for text. Render inside `<aside>` (FR-033)
- [ ] T022 [P] [US1] Create `ReleaseNotesBanner` CRD component at `src/crd/components/dashboard/ReleaseNotesBanner.tsx` — dismissible banner with title, content, optional link, close button with `aria-label="Dismiss banner"` (FR-023). Props: `ReleaseNotesBannerProps` from contracts. Render inside `<aside>` (FR-033)

### Integration Layer

- [ ] T023 [US2] Create `src/main/crdPages/dashboard/useDashboardSidebar.ts` — aggregates sidebar data: build menu items array (Invitations with `usePendingInvitationsCount()`, Tips & Tricks, My Account via `buildUserAccountUrl()`, Create Space via `useCreateSpaceLink()`), build 4 resource sections from `useMyResourcesQuery()` mapped via `mapResourcesToSidebarItems()`. Return typed data ready for `DashboardSidebar` props
- [ ] T024 [US1] Create `src/main/crdPages/dashboard/DashboardWithMemberships.tsx` — orchestrates the "with memberships" view. Uses `useRecentSpacesQuery()`, `useHomeSpaceLookupQuery()`, `useHomeSpaceSettings()` for recent spaces. Uses `useLatestContributionsQuery()` for space activity feed. Uses `useLatestContributionsGroupedQuery()` for personal activity feed. Uses `useDashboardWithMembershipsLazyQuery()` for dashboard spaces view. Maps all data via `dashboardDataMappers`. Manages `activityEnabled` state (boolean toggle). Renders: `RecentSpaces`, `DashboardSidebar` (via `useDashboardSidebar`), two `ActivityFeed` components OR `DashboardSpaces` based on toggle, `CampaignBanner` (conditional on roles/entitlements), `ReleaseNotesBanner` (conditional on `useLatestReleaseDiscussionQuery`). Wires dialog callbacks from `useDashboardDialogs`. Wraps in `DashboardLayout` (depends on T007-T010, T016-T018, T020-T023)

**Checkpoint**: User Stories 1+2 complete — main dashboard view fully functional with sidebar, recent spaces, activity feeds, filters, Activity View toggle, resource lists, and banners

---

## Phase 4: User Story 3 — Authenticated without Memberships (Priority: P2)

**Goal**: Authenticated user with no space memberships sees simplified dashboard with invitations, explore spaces, create space CTA, and contextual banners.

**Independent Test**: Log in as user with no space memberships, navigate to `/home` with CRD enabled. Verify: InvitationsBlock with accept/decline, SpaceExplorer (reuse), Create Space button, CampaignBanner (if eligible), ReleaseNotesBanner.

- [ ] T025 [P] [US3] Create `InvitationsBlock` CRD component at `src/crd/components/dashboard/InvitationsBlock.tsx` — list of invitation cards, each showing sender avatar + space name + role + accept/decline buttons. Accept/decline buttons use `aria-label="Accept invitation to {spaceName}"` and `aria-label="Decline invitation to {spaceName}"` (FR-029). Props: `InvitationsBlockProps` from contracts. Loading skeleton state
- [ ] T026 [US3] Create `src/main/crdPages/dashboard/DashboardWithoutMemberships.tsx` — renders compact `DashboardSidebar` (via `useDashboardSidebar`), `InvitationsBlock` (via `usePendingInvitationsQuery` + `mapInvitationsToCards` + accept/decline callbacks from `useInvitationActions`), `SpaceExplorer` (reuse existing CRD component from `src/crd/components/space/SpaceExplorer.tsx` with data from `useExploreSpaces`), "Create your own Space" CTA button (href from `useCreateSpaceLink`), `CampaignBanner` (conditional), `ReleaseNotesBanner` (conditional). Wraps in `DashboardLayout` (depends on T025, T023)

**Checkpoint**: User Story 3 complete — without-memberships view fully functional

---

## Phase 5: User Story 4 — Unauthenticated User (Priority: P2)

**Goal**: Unauthenticated visitor sees public space explorer and sign up button.

**Independent Test**: Navigate to `/home` without logging in with CRD enabled. Verify: SpaceExplorer showing public spaces, Sign Up button linking to registration.

- [ ] T027 [US4] Create `src/main/crdPages/dashboard/DashboardUnauthenticated.tsx` — renders existing CRD `SpaceExplorer` component (from `src/crd/components/space/SpaceExplorer.tsx`) with data from `useExploreSpaces` hook, + Sign Up button as `<a href={AUTH_SIGN_UP_PATH}>` styled with CRD Button. Use `useTranslation('crd-dashboard')` for sign-up text

**Checkpoint**: User Story 4 complete — unauthenticated view fully functional

---

## Phase 6: User Story 5 — Dashboard Dialogs (Priority: P2)

**Goal**: Users can open TipsAndTricks, MyActivity, MySpaceActivity, and MyMemberships dialogs from sidebar menu items or "Show more" links.

**Independent Test**: On the main dashboard, click each sidebar dialog trigger and "Show more" links. Verify each dialog opens with correct content, traps focus, closes on Escape, returns focus to trigger element.

- [ ] T028 [P] [US5] Create `TipsAndTricksDialog` CRD component at `src/crd/components/dashboard/TipsAndTricksDialog.tsx` — uses CRD `Dialog` primitive. Renders list of tip items (avatar, title, description, optional link) + "Find more" link to `/forum`. Props: `TipsAndTricksDialogProps` from contracts. Focus trap, Escape dismiss, focus return (FR-027)
- [ ] T029 [P] [US5] Create `ActivityDialog` CRD component at `src/crd/components/dashboard/ActivityDialog.tsx` — uses CRD `Dialog` primitive. Renders `ActivityFeed` component inside dialog with full height scrolling. Props: `{ open, onClose, title, children }`. Reused for both MyActivity and MySpaceActivity dialogs (FR-027)
- [ ] T030 [P] [US5] Create `MembershipsTreeDialog` CRD component at `src/crd/components/dashboard/MembershipsTreeDialog.tsx` — uses CRD `Dialog` primitive. Renders expandable tree of `MembershipTreeNodeData`: each node has avatar, name (as `<a href>`), role badges, expand/collapse button with `aria-expanded` (FR-028). Recursive rendering for child nodes. "See more spaces" link + "Create Space" link at bottom. Props: `MembershipsTreeDialogProps` from contracts (FR-027)
- [ ] T031 [US5] Wire dialog components into `DashboardWithMemberships.tsx` — render `TipsAndTricksDialog` (tips from i18n keys), `ActivityDialog` ×2 (one for MyActivity wrapping personal `ActivityFeed`, one for MySpaceActivity wrapping space `ActivityFeed`), `MembershipsTreeDialog` (data from `useMyMembershipsQuery` mapped via `mapMembershipsToTree`). Open/close state from `useDashboardDialogs`. Connect "Show more" links in inline activity feeds to dialog open callbacks (depends on T028-T030)

**Checkpoint**: User Story 5 complete — all 4 dialogs open and function correctly

---

## Phase 7: User Story 6 — CRD Toggle and MUI Fallback (Priority: P3)

**Goal**: CRD toggle correctly gates the dashboard — CRD ON renders new dashboard, CRD OFF renders existing MUI dashboard unchanged.

**Independent Test**: Toggle CRD on/off and verify each version renders correctly without errors.

- [ ] T032 [US6] Verify CRD toggle behavior in `src/main/routing/TopLevelRoutes.tsx` — confirm that with `alkemio-crd-enabled` absent or `false`, the MUI `HomePage` renders at `/home` unchanged. With `true`, the CRD `DashboardPage` renders. Verify lazy-loading: only the active version's chunk is fetched (check Network tab). Verify no console errors on toggle switch + reload

**Checkpoint**: User Story 6 verified — toggle works correctly in both directions

---

## Phase 8: User Story 7 — Responsive Layout (Priority: P3)

**Goal**: Dashboard adapts to mobile/tablet viewports with collapsed sidebar and stacked activity columns.

**Independent Test**: Resize browser to mobile width (360px). Verify sidebar collapses to hamburger menu, activity columns stack vertically, recent spaces scroll horizontally.

- [ ] T033 [US7] Add mobile sidebar behavior to `DashboardLayout` at `src/crd/components/dashboard/DashboardLayout.tsx` — on `< md` breakpoint (detected via `useMediaQuery` from `src/crd/hooks/useMediaQuery.ts`), hide sidebar column and show hamburger button that opens sidebar content in a sheet/drawer (using CRD `Dialog` primitive). Use `useState` for open/close toggle. Hamburger button has `aria-label="Open menu"`
- [ ] T034 [US7] Add responsive stacking to `DashboardWithMemberships.tsx` at `src/main/crdPages/dashboard/DashboardWithMemberships.tsx` — activity feeds container uses `grid-cols-1 lg:grid-cols-2` so columns stack on mobile/tablet. Recent spaces row uses `overflow-x-auto` with `flex-nowrap` for horizontal scrolling on narrow viewports

**Checkpoint**: User Story 7 complete — responsive layout works on mobile, tablet, and desktop

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, accessibility audit, and build validation

- [ ] T035 [P] Run `pnpm lint` and fix any TypeScript or ESLint errors across all new files
- [ ] T036 [P] Run `pnpm vitest run` and verify all existing tests pass with zero regressions
- [ ] T037 Accessibility audit across all dashboard views — verify: keyboard navigation through all interactive elements (Tab/Shift+Tab), visible focus indicators (FR-021), dialog focus trapping and Escape dismiss (FR-027), `aria-expanded` on tree nodes (FR-028), `aria-label` on all icon-only buttons (FR-023), landmark regions `<main>`, `<nav>`, `<aside>` (FR-033), contrast ratios meet 4.5:1 for text (FR-031), loading states use `aria-busy` (FR-034)
- [ ] T038 Edge case verification — test: empty recent spaces (only placeholder shown), empty activity feeds (empty state message), dismissed release notes banner persists across reload, `?dialog=invitations` URL param with no pending invitations shows empty dialog, invitation accept/decline updates badge count in sidebar
- [ ] T039 Visual parity check — compare CRD dashboard side-by-side with MUI dashboard for each view (with memberships, without memberships, unauthenticated). Verify information density, navigation paths, and interactive behaviors match

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion (T001-T006) — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 completion — the MVP milestone
- **US3 (Phase 4)**: Depends on Phase 2 + shares sidebar from Phase 3 (T018, T023)
- **US4 (Phase 5)**: Depends on Phase 2 only — can run in parallel with Phase 3
- **US5 (Phase 6)**: Depends on Phase 3 (dialogs wire into the main dashboard view)
- **US6 (Phase 7)**: Depends on Phase 2 (route wiring) — mostly verification
- **US7 (Phase 8)**: Depends on Phase 3 (adds responsive behavior to existing components)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1+US2 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US3 (P2)**: Reuses `DashboardSidebar` (T018) and `useDashboardSidebar` (T023) from US2 — can start after those are complete
- **US4 (P2)**: Independent — can start after Phase 2, parallel with US1/US2
- **US5 (P2)**: Depends on US1 (dialogs integrate into DashboardWithMemberships)
- **US6 (P3)**: Independent verification — can run anytime after Phase 2
- **US7 (P3)**: Depends on US1 (modifies DashboardLayout and DashboardWithMemberships)

### Within Each User Story

- CRD components (presentational) before integration layer (data wiring)
- Leaf components before composites (e.g., ActivityItem before ActivityFeed)
- Data mappers before integration pages

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 can all run in parallel (different files)
- **Phase 3**: T012, T013, T014, T015, T019, T021, T022 can all run in parallel (independent CRD components)
- **Phase 6**: T028, T029, T030 can all run in parallel (independent dialog components)
- **Phase 9**: T035, T036 can run in parallel

---

## Parallel Example: Phase 3 (US1+US2 CRD Components)

```bash
# Launch all independent CRD components together:
Task: "CompactSpaceCard in src/crd/components/dashboard/CompactSpaceCard.tsx"
Task: "HomeSpacePlaceholder in src/crd/components/dashboard/HomeSpacePlaceholder.tsx"
Task: "ActivityItem in src/crd/components/dashboard/ActivityItem.tsx"
Task: "SidebarResourceItem in src/crd/components/dashboard/SidebarResourceItem.tsx"
Task: "SpaceHierarchyCard in src/crd/components/dashboard/SpaceHierarchyCard.tsx"
Task: "CampaignBanner in src/crd/components/dashboard/CampaignBanner.tsx"
Task: "ReleaseNotesBanner in src/crd/components/dashboard/ReleaseNotesBanner.tsx"

# Then composites (depend on leaf components):
Task: "RecentSpaces in src/crd/components/dashboard/RecentSpaces.tsx"
Task: "ActivityFeed in src/crd/components/dashboard/ActivityFeed.tsx"
Task: "DashboardSidebar in src/crd/components/dashboard/DashboardSidebar.tsx"
Task: "DashboardSpaces in src/crd/components/dashboard/DashboardSpaces.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 1: Setup (primitives + i18n)
2. Complete Phase 2: Foundational (data mappers, layout, routing, page entry)
3. Complete Phase 3: US1+US2 (main dashboard with sidebar)
4. **STOP and VALIDATE**: Test authenticated-with-memberships view independently
5. This alone provides full value for the majority of users

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1+US2 → Main dashboard (MVP!)
3. US3 → Without-memberships view
4. US4 → Unauthenticated view (can be parallel with US3)
5. US5 → Dialogs
6. US6+US7 → Toggle verification + responsive
7. Polish → Final checks

### Parallel Team Strategy

With multiple developers after Phase 2:
- Developer A: US1+US2 (main dashboard — largest scope)
- Developer B: US4 (unauthenticated — independent, smallest scope)
- Developer C: US3 (without memberships — after sidebar from US2 is ready)
- Then: Developer B picks up US5 (dialogs), Developer C picks up US7 (responsive)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 and US2 are combined in Phase 3 because they share the same view (DashboardWithMemberships) and are both P1 priority
- CRD components MUST have zero `@mui/*` imports — verify after each component
- All CRD component text MUST use `useTranslation('crd-dashboard')` — no hardcoded strings
- Reference existing MUI components (listed in plan.md "Key Files Reference") for behavior parity
- Reference prototype components (listed in plan.md) for visual design guidance
