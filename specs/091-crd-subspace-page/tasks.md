---
description: "Implementation tasks for CRD SubSpace Page (with L0 Banner Community Refinements)"
---

# Tasks: CRD SubSpace Page (with L0 Banner Community Refinements)

**Input**: Design documents from `/specs/091-crd-subspace-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md
**Tests**: Per-story functional tests are NOT included (the spec does not request TDD; per-CRD-spec convention from 042). Targeted unit tests for pure data-mapper logic are added in the Polish phase. Manual verification follows quickstart.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task belongs to (US1 / US2 / US3 / US4 / US5)
- All paths are absolute under `/Users/borislavkolev/WebstormProjects/client-web/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Translation namespace, GraphQL document, and shared URL helper that every later phase depends on.

- [ ] T001 Register the new `crd-subspace` i18n namespace in `src/core/i18n/config.ts` by adding it to `crdNamespaceImports` (lazy-load all 6 languages from `src/crd/i18n/subspace/subspace.<lang>.json`) — mirror the pattern used for `crd-space`
- [ ] T002 Add `'crd-subspace'` to the i18next namespace type union in `@types/i18next.d.ts` (or wherever the existing CRD namespace types are declared) so `useTranslation('crd-subspace')` is type-checked
- [ ] T003 [P] Create `src/crd/i18n/subspace/subspace.en.json` with all keys needed by the four new CRD components: banner badge labels (`badge.subspace`, `badge.subSubspace`), action-icon `aria-label`s (`actions.activity`, `actions.videoCall`, `actions.share`, `actions.settings`), member-stack `aria-label` (`members.viewCommunity`), flow-tabs labels (`flow.editFlow`, `flow.addPost`, `flow.emptyState`), sidebar headings + Quick Action labels (`sidebar.about`, `sidebar.quickActions.community|events|activity|index|subspaces`, `sidebar.virtualContributor.heading`, `sidebar.updates.heading`, `sidebar.updates.placeholder`), community-dialog title (`community.dialogTitle`), visibility-notice variants (already in `crd-space` — reuse), and a11y SR-only descriptions
- [ ] T004 Add new GraphQL document at `src/domain/space/community/CommunityMemberCount.graphql` with the query `CommunityMemberCount($spaceId: UUID!) { lookup { space(ID: $spaceId) { id about { membership { roleSetID } } } } roleSet(ID: $roleSetId) { usersInRole(role: MEMBER) { id } } }` (or the equivalent that returns just member ids — verify the exact root selectors against the schema during implementation per research R1)
- [ ] T005 Run `pnpm codegen` (requires backend on `localhost:4000`) and commit the regenerated files in `src/core/apollo/generated/` (per Constitution Engineering Workflow #2)
- [ ] T006 [P] Add `buildSubspaceSettingsUrl(subspaceUrl: string): string` to `src/main/routing/urlBuilders.ts` returning `${subspaceUrl}/settings` (single migration point per plan D11)

**Checkpoint**: i18n namespace registered, member-count query generated, settings URL helper available — Foundational phase can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the four new CRD presentational components. Every user story depends on these.

**⚠️ CRITICAL**: No user-story integration work can begin until this phase is complete.

- [ ] T007 [P] Create `src/crd/components/space/SubspaceHeader.tsx` per data-model.md `SubspaceBannerData` + `SubspaceHeaderActionsData` + `BannerCommunityData` props. Visual ref: `prototype/src/app/components/space/SubspaceHeader.tsx`. Apply CRD rules: no `react-router` imports (use `<a href>`), no inline-style fonts (use semantic typography tokens — see `docs/crd/migration-guide.md` Typography section), `pickColorFromId` fallbacks for missing parent banner / subspace avatar, all UI text via `t('crd-subspace:...')`, `aria-label` on every icon-only button, layered avatar overlapping the banner via negative margin (parent behind, subspace in front), member avatar stack click → `onMemberClick` callback prop
- [ ] T008 [P] Create `src/crd/components/space/SubspaceFlowTabs.tsx` per data-model.md `SubspaceFlowTabsData` + `SubspaceFlowPhase` props. Sticky pill-tab strip. Renders a double-arrow connector (lucide `ChevronsRight` or similar) between every adjacent pair — connector count is `phases.length - 1`, **never** derived from data (per plan D4). The component's `phases` prop type does **not** include a `count` field (per plan D5 — structurally impossible to regress FR-010). Optional left "Edit Flow" icon button (visible only when `canEditFlow`) and right "Add Post" button (visible only when `canAddPost`) rendered as named slots. Active phase highlighted; clicking another phase calls `onPhaseChange(id)`
- [ ] T009 [P] Create `src/crd/components/space/SubspaceSidebar.tsx` per data-model.md `SubspaceSidebarData` props. Composition: (a) info card (blue panel using primary background) showing `whyMarkdown` (rendered via `MarkdownContent`) or `tagline` fallback + lead block — **no "Challenge Statement" header / icon** (per FR-016, plan D9 / Jeroen #9). (b) "About this Subspace" button rendered **outside and below** the info card (per FR-017, plan D8 / Jeroen #8) — calls `onAboutClick`. (c) Quick Actions list (Community / Events / Recent Activity / Index / Subspaces) — each is a button calling `onQuickActionClick(id)`. (d) Optional Virtual Contributor card — hide section entirely when `virtualContributor` is undefined (per FR-021). (e) "Updates from the Lead" placeholder section with heading + "Coming soon" helper text + JSX comment referencing this spec + a follow-up issue (per FR-022, plan D13)
- [ ] T010 [P] Create `src/crd/components/space/SubspaceCommunityDialog.tsx` per data-model.md `SubspaceCommunityDialogProps`. Thin Radix `Dialog` shell: `DialogContent` with `DialogHeader` (title + optional description) and `children` slot. The connector (T016) injects `<SpaceMembers />` into `children` — the dialog itself owns no business logic
- [ ] T011 [P] Add a standalone preview page at `src/crd/app/pages/SubspacePage.tsx` rendering all four new components (`SubspaceHeader`, `SubspaceFlowTabs`, `SubspaceSidebar`, `SubspaceCommunityDialog`) with mock data, register it in `src/crd/app/CrdApp.tsx` so `pnpm crd:dev` (port 5200) shows it for design iteration without the backend

**Checkpoint**: Four CRD components plus standalone preview ready. User Story 1's integration layer can now be built.

---

## Phase 3: User Story 1 — A SubSpace member can browse and act in the new design system (Priority: P1) 🎯 MVP

**Goal**: Stop the empty-shell behaviour — render the full CRD SubSpace page (banner, breadcrumbs, flow tabs, feed, sidebar, dialogs) for every L1/L2 space when the toggle is on.

**Independent Test**: Per quickstart.md §1–§3 — open a known subspace URL with the toggle ON and confirm every region populates from real data.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create `src/main/crdPages/subspace/dataMappers/subspacePageDataMapper.ts` exporting mappers that produce `SubspaceBannerData`, `SubspaceHeaderActionsData`, `SubspaceFlowTabsData`, `SubspaceSidebarData`, and the aggregator `mapCrdSubspacePageData(...)` returning `CrdSubspacePageData` (per data-model.md). Reuse `mapMemberAvatars`, `mapSpaceVisibility`, `getInitials` from `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts`. Use `pickColorFromId` from `@/crd/lib/pickColorFromId` for parent + subspace fallback colors. `badgeLabel` derives from `space.level` (L1 → `'SubSpace'`, L2 → `'SubSubSpace'`)
- [ ] T013 [P] [US1] Create `src/main/crdPages/subspace/hooks/useCrdSubspaceFlow.ts`. Signature: `useCrdSubspaceFlow(phases: SubspaceFlowPhase[], currentStateId: string | undefined): { activePhaseId: string | undefined; setActivePhaseId: (id: string) => void }`. Resolution: URL `?phase=<id>` (when matches a known phase) → `currentStateId` → `phases[0]?.id`. `setActivePhaseId` writes to URL via `useSearchParams({ phase: id }, { replace: true })` (per plan D9, research R2)
- [ ] T014 [US1] Create `src/main/crdPages/subspace/hooks/useCrdSubspace.ts`. Orchestrates: `useSubspaceContext()` (id, level, about, permissions, parentSpaceId), `useSpaceAboutDetailsQuery({ spaceId: parentSpaceId, skip: !parentSpaceId })` for the parent banner (per research R3), the new `useCommunityMemberCountQuery({ spaceId: subspaceId })` for the true member count (per research R1), `useApplicationButton({ spaceId, parentSpaceId })` for the join/apply CTA (per research R8). Returns `CrdSubspacePageData`. Depends on T012
- [ ] T015 [US1] Create `src/main/crdPages/subspace/tabs/CrdSubspaceCalloutsPage.tsx`. Renders `<SubspaceFlowTabs />` (consuming `useCrdSubspaceFlow`) above a filtered `<SpaceFeed />` (existing component from `src/crd/components/space/SpaceFeed.tsx`). Filters callouts by `activePhaseId`. Reuses `useCrdCalloutList` from `src/main/crdPages/space/hooks/`. Empty state when `phases.length === 0`: render the no-flow message — **no action button** (per clarification Q4 / FR-008 edge case). Depends on T013
- [ ] T016 [P] [US1] Create `src/main/crdPages/subspace/dialogs/CrdSubspaceCommunityDialogConnector.tsx`. Props: `{ open, onOpenChange, spaceId, roleSetId }`. Internally calls `useRoleSetManager(roleSetId)`, maps results to `MemberCardData[]` (use the existing community data mapper at `src/main/crdPages/space/dataMappers/communityDataMapper.ts`), renders `<SubspaceCommunityDialog>{<SpaceMembers members={...} pageSize={9} />}</SubspaceCommunityDialog>`. **This connector is also reused by L0** — see T030
- [ ] T017 [P] [US1] Create `src/main/crdPages/subspace/dialogs/CrdSubspaceEventsDialogConnector.tsx`. Wraps the existing `<TimelineDialog>` (from `src/crd/components/space/timeline/TimelineDialog.tsx`) around `<EventsCalendarView events={...} />` with events fetched from the existing space-level events hook scoped to `spaceId = subspaceId` (per research R5). Find the event-data hook used by L0 timeline / spec 086 and reuse it; do not introduce a new query
- [ ] T018 [P] [US1] Create `src/main/crdPages/subspace/dialogs/CrdSubspaceActivityDialogConnector.tsx`. Wraps `<ActivityFeed />` (from `src/crd/components/dashboard/ActivityFeed.tsx`) inside a Radix `Dialog`. Calls `useLatestContributionsQuery({ variables: { filter: { spaceIDs: [subspaceId] }, limit: 25 } })`, maps via `mapActivityToFeedItems` (already exported from `src/main/crdPages/dashboard/dashboardDataMappers.tsx`) — per research R6
- [ ] T019 [P] [US1] Create `src/main/crdPages/subspace/dialogs/CrdSubspaceIndexDialogConnector.tsx`. A Radix `Dialog` containing a flat list of all subspace callouts grouped by flow phase (the "Index" view). Reuse `useCrdCalloutList` and the same callout primitives as the feed; render as a compact list (no card framing)
- [ ] T020 [P] [US1] Create `src/main/crdPages/subspace/dialogs/CrdSubspaceSubspacesDialogConnector.tsx`. A Radix `Dialog` wrapping the existing `<SpaceSubspacesList />` from `src/crd/components/space/SpaceSubspacesList.tsx`, scoped to children-of-this-subspace (the L2 sub-subspaces)
- [ ] T021 [US1] Create `src/main/crdPages/subspace/layout/CrdSubspacePageLayout.tsx`. Mirrors `CrdSpacePageLayout` for L1: calls `useCrdSubspace()`, renders `<SubspaceHeader />` (with `onMemberClick` opening the Community dialog), `<SubspaceSidebar />` (right column, fixed), and `<Outlet />` for tab content. Manages dialog open/close state for the four Quick Action dialogs (`Community / Events / Activity / Index / Subspaces`) and the About dialog. Calls `useSetBreadcrumbs([{ label: parentSpaceName, href: parentSpaceUrl }, { label: subspaceName }])` (per FR-006). Depends on T007–T010, T014, T016–T020
- [ ] T022 [US1] Create `src/main/crdPages/subspace/routing/CrdSubspaceRoutes.tsx`. Default export is a `<Routes>` block that mounts `<CrdSubspacePageLayout />` as the layout element with: index route → `<CrdSubspaceCalloutsPage />`, `/about` → existing `<CrdSpaceAboutPage />` (lazy-loaded from `src/main/crdPages/space/about/`), and a fall-through `<Route path="*" element={<LegacySubspaceRoutes />} />` that lazy-loads the legacy MUI `SubspaceRoutes` from `@/domain/space/routing/SubspaceRoutes` for everything else (settings, calendar, etc.) per research R10. Depends on T021
- [ ] T023 [US1] Modify `src/main/crdPages/space/routing/CrdSpaceRoutes.tsx`: at line 18, swap the lazy import from `@/domain/space/routing/SubspaceRoutes` to `@/main/crdPages/subspace/routing/CrdSubspaceRoutes`. The route nesting at lines 95–104 and the `SubspaceContextProvider` wrap stay exactly as-is. **Do NOT touch `CrdSpacePageLayout.tsx` — the `!isLevelZero` bailout is load-bearing** (research R10, plan D3). Depends on T022
- [ ] T024 [US1] Manual verification of US1 per quickstart §1–§3: open `/<space>/challenges/<subspace>` with toggle ON; confirm banner inheritance, layered avatar, breadcrumbs, flow tabs with active phase matching `currentState`, sidebar contents (info card, About button, Quick Actions opening their dialogs, Virtual Contributor when present, Updates placeholder)

**Checkpoint**: US1 complete — the SubSpace page renders end-to-end and is independently demoable. MVP boundary.

---

## Phase 4: User Story 2 — A non-member can discover and apply to a SubSpace (Priority: P2)

**Goal**: Apply / Join CTA + visibility notice + signed-out behaviour all work on the new L1 page.

**Independent Test**: Per quickstart.md §4 — as a non-member / invited / applicant / signed-out visitor, confirm the CTA reflects the right state and the About dialog opens.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Wire `<SpaceAboutApplyButton />` (existing CRD component from `src/crd/components/space/SpaceAboutApplyButton.tsx`) inside `CrdSubspacePageLayout`'s banner area. Pass the `applicationButtonProps` already returned by `useCrdSubspace()` (from `useApplicationButton({ spaceId: subspaceId, parentSpaceId })`). Render only when `!applicationButtonProps.isMember`. Per FR-023, research R8. Depends on T021
- [ ] T026 [P] [US2] Render `<SpaceVisibilityNotice />` (existing CRD component from `src/crd/components/space/SpaceVisibilityNotice.tsx`) at the top of `CrdSubspacePageLayout` when `visibility.status !== 'active'`, using the `mapSpaceVisibility` output from the data mapper. Per FR-024. Depends on T021
- [ ] T027 [US2] Verify the About dialog wiring: `SubspaceSidebar`'s `onAboutClick` prop opens the existing `<SpaceAboutDialog />` (from `src/crd/components/space/SpaceAboutDialog.tsx`) populated for the subspace. The dialog state is owned by `CrdSubspacePageLayout`. Per FR-017, US2 acceptance scenario 3
- [ ] T028 [US2] Manual verification of US2 per quickstart §4 + §6: confirm the CTA correctly shows joinable / pending application / pending invitation / parent-membership-required states; confirm signed-out visitors see public details and a sign-in prompt on apply; confirm archived/demo/inactive notice renders

**Checkpoint**: US1 + US2 both work independently. Discovery + apply path complete.

---

## Phase 5: User Story 3 — L0 Space banner shows the real community size and is interactive (Priority: P3)

**Goal**: Fix the L0 banner so the "+N" reflects the true community size and the avatar stack click opens the community dialog.

**Independent Test**: Per quickstart.md §5 — open any L0 space with a known community size, confirm the count, click the avatar stack, see the dialog.

### Implementation for User Story 3

- [ ] T029 [US3] Modify `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts`: extend `mapMemberAvatars` to return `BannerCommunityData = { avatars: MemberAvatar[]; totalCount: number }`. Take `totalCount` as a separate parameter so the caller (which has access to the new `useCommunityMemberCountQuery`) can supply the true number. Update existing call sites to pass it. Per FR-026, plan D7
- [ ] T030 [US3] Modify `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx`: (a) call `useCommunityMemberCountQuery({ variables: { spaceId } })`, (b) pass `memberCount={count}` (instead of today's `memberAvatars.length`) and `onMemberClick={() => setCommunityDialogOpen(true)}` to `<SpaceHeader />`, (c) render `<CrdSubspaceCommunityDialogConnector open={communityDialogOpen} onOpenChange={setCommunityDialogOpen} spaceId={spaceId} roleSetId={roleSetId} />` (the same connector built in T016). The `!isLevelZero` bailout STAYS unchanged. Per FR-026 / FR-027 / plan D6. Depends on T016, T029
- [ ] T031 [US3] Manual verification of US3 per quickstart §5: open an L0 space with a community larger than its lead count, verify the "+N" reflects the true total; click the avatar stack and confirm the dialog opens. Repeat with a zero-member space to confirm FR-028 (avatar stack hidden, no empty group rendered)

**Checkpoint**: US1 + US2 + US3 all work. L0 community count bug fixed. Same dialog used on both L0 and L1.

---

## Phase 6: User Story 4 — Innovation flow tabs render with consistent visual integrity (Priority: P4)

**Goal**: Verify across multiple subspaces that connectors are always rendered between every adjacent phase pair, and no count badges appear.

**Independent Test**: Per quickstart.md §1 (acceptance scenarios for FR-009 / FR-010) — visit subspaces with 1, 2, 3, and 5+ phases.

### Implementation for User Story 4

- [ ] T032 [P] [US4] Verify `SubspaceFlowTabs` (built in T008) rendering across subspaces with 1, 2, 3, and 5+ phases: connectors render in `phases.length - 1` positions, no count badges anywhere. If regressions found, tighten the component
- [ ] T033 [P] [US4] Verify the sticky positioning: scroll the feed long enough to push the tab strip to the top of the viewport, confirm it sticks (matches the prototype's `sticky top-16` behaviour). If the strip jumps or detaches, fix the wrapper element

**Checkpoint**: All visual-integrity acceptance scenarios from US4 pass.

---

## Phase 7: User Story 5 — All text is translated and the page is accessible (Priority: P5)

**Goal**: All 6 supported languages, WCAG 2.1 AA, keyboard navigation.

**Independent Test**: Per quickstart.md §10–§12 — switch language to each non-English language; run accessibility audit; keyboard-only navigation.

### Implementation for User Story 5

- [ ] T034 [P] [US5] Create `src/crd/i18n/subspace/subspace.nl.json` translating every key from `subspace.en.json`
- [ ] T035 [P] [US5] Create `src/crd/i18n/subspace/subspace.es.json` translating every key from `subspace.en.json`
- [ ] T036 [P] [US5] Create `src/crd/i18n/subspace/subspace.bg.json` translating every key from `subspace.en.json`
- [ ] T037 [P] [US5] Create `src/crd/i18n/subspace/subspace.de.json` translating every key from `subspace.en.json`
- [ ] T038 [P] [US5] Create `src/crd/i18n/subspace/subspace.fr.json` translating every key from `subspace.en.json`
- [ ] T039 [US5] Run an automated accessibility audit (axe DevTools or Lighthouse) on `/<space>/challenges/<subspace>` with toggle ON; fix any WCAG 2.1 AA violations found in the new components or in `CrdSubspacePageLayout`. Per FR-035, SC-005
- [ ] T040 [US5] Keyboard-only navigation pass per quickstart §11: Tab through banner actions → flow tabs → feed → sidebar → footer in a logical order; visible focus rings on every interactive element. Per FR-033
- [ ] T041 [US5] Verify icon-only buttons across the SubSpace page expose `aria-label`s using `t('crd-subspace:actions.*')` and `t('crd-subspace:members.viewCommunity')` keys (banner action icons, banner member-stack button, sidebar Quick Action icons, flow-tabs Edit Flow / Add Post icons). Per FR-034

**Checkpoint**: Page is fully translated and accessible across all six languages.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Targeted unit tests for pure logic, lint/test gates, end-to-end verification, legacy regression check.

- [ ] T042 [P] Add a unit test for the extended `mapMemberAvatars` (or new `mapBannerCommunity`) helper at `src/main/crdPages/space/dataMappers/__tests__/spacePageDataMapper.test.ts` (or co-located `.test.ts`): verifies the returned shape is `{ avatars, totalCount }` and that `totalCount` reflects the input total parameter, not `avatars.length`
- [ ] T043 [P] Add a unit test for `useCrdSubspaceFlow` at `src/main/crdPages/subspace/hooks/__tests__/useCrdSubspaceFlow.test.ts` covering the URL → currentState → first resolution priority and the URL-write behaviour on `setActivePhaseId`
- [ ] T044 [P] Add a unit test for the `subspacePageDataMapper` at `src/main/crdPages/subspace/dataMappers/__tests__/subspacePageDataMapper.test.ts`: verifies `badgeLabel` is `'SubSpace'` for L1 input and `'SubSubSpace'` for L2; verifies parent fallback color is deterministic for the same `parentSpaceId`
- [ ] T045 Run `pnpm lint` (Biome + ESLint) and fix any issues
- [ ] T046 Run `pnpm vitest run` and ensure all tests pass (including the three new ones from T042–T044)
- [ ] T047 Run `pnpm crd:dev` (port 5200) and verify the standalone preview page (T011) renders all four CRD components correctly with mock data
- [ ] T048 Toggle CRD OFF in browser localStorage and verify the legacy MUI L0 + L1 pages render unchanged (no regression). Per FR-030, SC-007, quickstart §9
- [ ] T049 Run the full quickstart.md verification checklist (§1–§13) against a real backend; record results in the PR description as evidence per Constitution Engineering Workflow #4

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** has no prereqs — can start immediately
- **Foundational (Phase 2)** requires Setup (T001–T002 needed for `useTranslation('crd-subspace')` to type-check; T006 needed for `SubspaceHeader`'s settings href)
- **US1 (Phase 3)** requires Foundational complete — blocks everything visible
- **US2 (Phase 4)** requires US1 (extends the L1 layout)
- **US3 (Phase 5)** requires Foundational (T010 → T016) but is independent of US1's L1-specific tasks; could run in parallel with US1's late tasks if staffed
- **US4 (Phase 6)** requires US1 (verifies the rendered output)
- **US5 (Phase 7)** requires US1 (translates strings used by L1)
- **Polish (Phase 8)** requires the user stories that contributed the code being tested

### Within-Story Dependencies (callouts)

- T014 (`useCrdSubspace`) depends on T012 (data mapper)
- T015 (`CrdSubspaceCalloutsPage`) depends on T013 (`useCrdSubspaceFlow`)
- T021 (`CrdSubspacePageLayout`) depends on T007–T010 (CRD components), T014, T016–T020 (dialog connectors)
- T022 (`CrdSubspaceRoutes`) depends on T021
- T023 (swap import in `CrdSpaceRoutes.tsx`) depends on T022
- T030 (L0 banner refinement) depends on T016 (shared dialog connector) and T029 (mapper extension)

### Parallel Opportunities

- **Phase 2**: T007, T008, T009, T010, T011 are all in different files with no dependencies — fully parallel.
- **Phase 3**: T012 ‖ T013 (different files); T016, T017, T018, T019, T020 (five dialog connectors, different files) all parallel; then T021 collects them
- **Phase 5**: T029 must complete before T030. T031 is verification only.
- **Phase 7**: All five language files (T034–T038) parallel
- **Phase 8**: Three unit tests (T042–T044) parallel

### Cross-Story Independence

- US3 (L0 banner refinement) is **architecturally independent** of US1's L1 layout work — the only shared dependency is T016 (community dialog connector). Once T016 lands, US3 can ship before US1 if needed.
- US2's Apply CTA depends on US1's L1 layout (T021), so it cannot truly run in parallel with US1.

---

## Parallel Example — Foundational components

```bash
# After Setup completes, launch all four CRD components and the preview page in parallel:
Task: "T007 — SubspaceHeader.tsx"
Task: "T008 — SubspaceFlowTabs.tsx"
Task: "T009 — SubspaceSidebar.tsx"
Task: "T010 — SubspaceCommunityDialog.tsx"
Task: "T011 — Standalone preview page"
```

## Parallel Example — Dialog connectors (US1)

```bash
# All five dialog connectors are independent files:
Task: "T016 — Community dialog connector"
Task: "T017 — Events dialog connector"
Task: "T018 — Activity dialog connector"
Task: "T019 — Index dialog connector"
Task: "T020 — Subspaces dialog connector"
# Then T021 collects them into the layout.
```

## Parallel Example — Translations (US5)

```bash
# Five language files are pure content:
Task: "T034 — subspace.nl.json"
Task: "T035 — subspace.es.json"
Task: "T036 — subspace.bg.json"
Task: "T037 — subspace.de.json"
Task: "T038 — subspace.fr.json"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 (Setup) — namespace, codegen, URL helper.
2. Phase 2 (Foundational) — four CRD components + preview.
3. Phase 3 (US1) — full L1 page including all five Quick Action dialogs.
4. **STOP and validate** per quickstart §1–§3 + §7. The L1 page is now usable end-to-end and the empty-shell bug is fixed.
5. Demo / merge as MVP.

### Incremental Delivery

1. MVP (Setup + Foundational + US1) → demo: SubSpace works.
2. Add US2 (Apply CTA + visibility) → demo: non-member discovery.
3. Add US3 (L0 banner refinement) → demo: L0 shows true community count.
4. Add US4 (visual-integrity verification) → demo: flow tabs polished across the board.
5. Add US5 (translations + a11y) → ready for production rollout.

### Parallel Team Strategy

With multiple developers after Phase 2:

- **Developer A**: US1 integration (T012–T024). Owns the L1 layout, routing, and connectors.
- **Developer B**: US3 (T029–T031). Can begin as soon as T016 ships from Developer A. Touches only `src/main/crdPages/space/`.
- **Developer C**: US5 translations (T034–T038). Can start after Setup if the EN file (T003) is reasonably complete; just needs key parity.
- **Reviewer / QA**: US4 verification (T032–T033) and Polish (T039–T049) in parallel with the late tasks.

---

## Notes

- All tasks marked [P] touch different files with no incomplete dependencies — safe to run in parallel.
- The `!isLevelZero` bailout in `CrdSpacePageLayout.tsx:133` is **load-bearing**: it prevents the L0 banner from wrapping the L1 outlet. Do NOT remove it. (See research R10 for the corrected analysis.)
- The L1 settings icon links to the legacy URL via `buildSubspaceSettingsUrl` (T006); the legacy MUI settings page renders via the fall-through route in `CrdSubspaceRoutes` (T022). When L1 settings is migrated in a future spec, those two locations are the single migration points.
- Per Constitution Engineering Workflow #2, `pnpm codegen` (T005) MUST commit the regenerated files in the same PR.
- Per Constitution Engineering Workflow #4, accessibility / performance / test evidence MUST be in the PR description (covered by T039–T040, T046, T049).
- Stop at the end of any phase to validate that story independently.
