# Tasks: Simplify Codebase — Dependency Cleanup & Hooks-First Architecture

**Input**: Design documents from `/specs/022-simplify-deps-hooks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Not explicitly requested. Existing tests (247+ across 19+ files) must continue passing after each task.

**Organization**: Tasks grouped by user story. Each story is independently testable. Verification after each phase: `pnpm install && pnpm lint && pnpm vitest run && pnpm build`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Baseline)

**Purpose**: Capture baseline metrics before any changes

- [ ] T001 Run `pnpm analyze` and record baseline bundle sizes in build/stats.html
- [ ] T002 Run `pnpm vitest run` and confirm all 247+ tests pass as baseline

**Checkpoint**: Baseline recorded — ready to begin dependency cleanup

---

## Phase 2: User Story 1 — Remove Unused Dependencies (Priority: P1) MVP

**Goal**: Remove 7 packages with zero or obsolete imports. Zero code changes except package.json.

**Independent Test**: `pnpm install && pnpm lint && pnpm vitest run && pnpm build` — all pass with no errors.

### Implementation for User Story 1

- [ ] T003 [P] [US1] Remove `@atlaskit/pragmatic-drag-and-drop` from dependencies in package.json
- [ ] T004 [P] [US1] Remove `date-fns` from dependencies in package.json
- [ ] T005 [P] [US1] Remove `@sentry/tracing` from dependencies in package.json
- [ ] T006 [P] [US1] Remove `@elastic/apm-rum-react` from dependencies in package.json
- [ ] T007 [P] [US1] Remove `@types/jest` from devDependencies in package.json
- [ ] T008 [P] [US1] Remove `source-map-explorer` from devDependencies in package.json
- [ ] T009 [P] [US1] Remove `@types/yup` from devDependencies in package.json
- [ ] T010 [US1] Run `pnpm install` to update lockfile after all removals
- [ ] T011 [US1] Verify: `pnpm lint && pnpm vitest run && pnpm build` — all pass

**Checkpoint**: 7 unused packages removed. Build and tests pass. No code changes needed.

---

## Phase 3: User Story 3 — Replace XState with useReducer (Priority: P2)

**Goal**: Replace the XState notification state machine with useReducer + Context. Remove xstate and @xstate/react.

**Independent Test**: Trigger success/error/info notifications in the app. Verify they appear, stack, and dismiss correctly.

### Implementation for User Story 3

- [ ] T012 [US3] Create `src/core/state/global/notifications/useNotifications.ts` — define NotificationAction union type (`PUSH | CLEAR`), implement notificationReducer (PUSH appends with UUID, CLEAR filters by id), export useNotifications() hook returning `[notifications, dispatch]`
- [ ] T013 [US3] Update `src/core/state/GlobalStateProvider.tsx` — replace `useActorRef(notificationMachine)` with `useNotifications()`, update Context value to provide notifications and dispatch
- [ ] T014 [US3] Update `src/core/ui/notifications/NotificationHandler.tsx` — replace `useSelector` from `@xstate/react` with `useContext`, replace `send()` calls with `dispatch()` calls
- [ ] T015 [US3] Delete `src/core/state/global/notifications/notificationMachine.ts`
- [ ] T016 [US3] Remove `xstate` and `@xstate/react` from dependencies in package.json
- [ ] T017 [US3] Run `pnpm install && pnpm lint && pnpm vitest run && pnpm build` — all pass, no xstate imports remain

**Checkpoint**: Notification system uses useReducer + Context. ~25 KB removed from vendor bundle.

---

## Phase 4: User Story 2 — Consolidate D&D to @dnd-kit (Priority: P2)

**Goal**: Migrate 5 files from `@hello-pangea/dnd` render-prop API to `@dnd-kit` hook API. Remove `@hello-pangea/dnd`.

**Independent Test**: Perform drag operations in each migrated component — verify correct reordering/movement.

### Implementation for User Story 2

- [ ] T018 [P] [US2] Migrate `src/domain/collaboration/InnovationFlow/InnovationFlowDragNDropEditor.tsx` — replace `DragDropContext`/`Droppable`/`Draggable` with `DndContext`/`SortableContext` using `horizontalListSortingStrategy`, replace `OnDragEndResponder` with `DragEndEvent` handler
- [ ] T019 [P] [US2] Migrate `src/domain/innovationHub/InnovationHubsSettings/InnovationHubSpacesField.tsx` — replace `DragDropContext`/`Droppable`/`Draggable` with `DndContext`/`SortableContext` using `verticalListSortingStrategy`
- [ ] T020 [P] [US2] Migrate `src/domain/collaboration/callout/CalloutContributionsSortDialog.tsx` — replace render-prop D&D with `SortableContext` + `useSortable()` hooks
- [ ] T021 [P] [US2] Migrate `src/domain/collaboration/InnovationFlow/InnovationFlowCollaborationToolsBlock.tsx` — replace `Draggable` render-prop with `useSortable()` hook
- [ ] T022 [P] [US2] Migrate `src/domain/collaboration/PageContentBlock.tsx` — replace `DroppableProvidedProps` type import with `useDroppable()` return type/ref
- [ ] T023 [US2] Remove `@hello-pangea/dnd` from dependencies in package.json
- [ ] T024 [US2] Run `pnpm install && pnpm lint && pnpm vitest run && pnpm build` — all pass, no `@hello-pangea/dnd` imports remain

**Checkpoint**: Single D&D library (@dnd-kit) in dependency tree. All drag interactions use hooks API.

---

## Phase 5: User Story 4 — Replace Trivial Libraries with Native APIs (Priority: P3)

**Goal**: Replace react-scroll (1 file), cross-env (scripts), and react-resize-detector (8 files) with native alternatives.

**Independent Test**: Calendar event scrolling works; component resize detection works; all build/dev scripts work.

### 5a: react-scroll replacement

- [ ] T025 [US4] Replace `scroller.scrollTo()` with `element.scrollIntoView({ behavior: 'smooth' })` in `src/domain/timeline/calendar/views/CalendarEventDetailView.tsx`
- [ ] T026 [US4] Remove `react-scroll` from dependencies in package.json

### 5b: cross-env replacement

- [ ] T027 [US4] Update package.json scripts — replace all `cross-env NODE_ENV=production node ...` with `NODE_ENV=production node ...`
- [ ] T028 [US4] Remove `cross-env` from devDependencies in package.json

### 5c: react-resize-detector replacement

- [ ] T029 [US4] Create `src/core/ui/hooks/useResizeObserver.ts` — wrap native `ResizeObserver` API, return `{ ref, width, height }` matching `useResizeDetector` interface
- [ ] T030 [P] [US4] Replace `useResizeDetector` with `useResizeObserver` in `src/main/ui/platformNavigation/PlatformNavigationBar.tsx`
- [ ] T031 [P] [US4] Replace `useResizeDetector` with `useResizeObserver` in `src/core/ui/cookieConsent/CookieConsent.tsx`
- [ ] T032 [P] [US4] Replace `useResizeDetector` with `useResizeObserver` in `src/domain/timeline/calendar/views/CalendarEventDetailView.tsx`
- [ ] T033 [P] [US4] Replace `useResizeDetector` with `useResizeObserver` in `src/core/ui/typography/LinesFitter.tsx`
- [ ] T034 [P] [US4] Replace `useResizeDetector` with `useResizeObserver` in `src/core/ui/tags/TwoLinesTagsContainer.tsx`
- [ ] T035 [P] [US4] Replace `useResizeDetector` with `useResizeObserver` in `src/main/search/SearchBox.tsx`
- [ ] T036 [P] [US4] Replace `useResizeDetector` with `useResizeObserver` in `src/core/ui/overflow/AutomaticOverflowGradient.tsx`
- [ ] T037 [P] [US4] Replace `useResizeDetector` with `useResizeObserver` in `src/core/ui/content/PageContentBlockHeader.tsx`
- [ ] T038 [US4] Remove `react-resize-detector` from dependencies in package.json
- [ ] T039 [US4] Run `pnpm install && pnpm lint && pnpm vitest run && pnpm build` — all pass, no removed package imports remain

**Checkpoint**: 3 libraries replaced with native APIs. Custom useResizeObserver hook serves all 8 consumers.

---

## Phase 6: User Story 5 — Replace Immer with Spread Syntax (Priority: P3)

**Goal**: Replace all 9 `produce()` calls with explicit object spread. Remove immer.

**Independent Test**: Auth forms work, Apollo subscriptions propagate, toolbar actions work, dashboard navigation works.

### Implementation for User Story 5

- [ ] T040 [P] [US5] Replace `produce()` with spread syntax in `src/core/auth/authentication/pages/LoginPage.tsx` — Kratos form UI state update
- [ ] T041 [P] [US5] Replace `produce()` with spread syntax in `src/core/auth/authentication/pages/RegistrationPage.tsx` — Kratos form UI state update
- [ ] T042 [P] [US5] Replace `produce()` with spread syntax in `src/core/auth/authentication/pages/SignUp.tsx` — Kratos form UI state update
- [ ] T043 [P] [US5] Replace `produce()` with spread syntax in `src/core/auth/authentication/pages/VerificationPage.tsx` — Kratos form UI state update
- [ ] T044 [P] [US5] Replace `produce()` with spread syntax in Apollo subscription cache update in `src/domain/shared/subscriptions/useSubscriptionToSubEntity.ts`
- [ ] T045 [P] [US5] Replace `produce()` with spread syntax in `src/core/ui/forms/MarkdownInputControls/ToolbarButton.tsx` — editor state update
- [ ] T046 [P] [US5] Replace `produce()` with spread syntax in `src/core/ui/forms/MarkdownInputControls/ToolbarMenuItem.tsx` — editor state update
- [ ] T047 [P] [US5] Replace `produce()` with spread syntax in `src/domain/space/components/spaceDashboardNavigation/DashboardNavigation.tsx` — viewport snap state
- [ ] T048 [P] [US5] Replace `produce()` with spread syntax in `src/main/admin/storage/useStorageAdminTree.tsx` — tree state update
- [ ] T049 [US5] Remove `immer` from dependencies in package.json
- [ ] T050 [US5] Run `pnpm install && pnpm lint && pnpm vitest run && pnpm build` — all pass, no immer imports remain

**Checkpoint**: All 9 produce() calls replaced with native spread syntax. Immer removed.

---

## Phase 7: User Story 6a — Hooks-First Refactoring: Containers (Priority: P4)

**Goal**: Convert 10 render-prop Container components to custom hooks. Delete SimpleContainerProps.

**Independent Test**: Each feature (application button, callout settings, invitations, etc.) works identically after migration.

### Implementation for User Story 6 — Containers (leaf nodes first)

- [ ] T051 [P] [US6] Refactor `src/core/ui/language/LanguageSelect.tsx` — extract render-prop logic to `useLanguageSelect()` hook, update consumer to use hook directly
- [ ] T052 [P] [US6] Simplify `src/core/ui/forms/CharacterCountContext.tsx` — remove render-prop pattern, simplify to context-only provider
- [ ] T053 [P] [US6] Refactor `src/domain/community/invitations/InvitationActionsContainer.tsx` — create `useInvitationActions.ts` hook returning `InvitationActionsContainerProvided`, update consumer, delete Container
- [ ] T054 [P] [US6] Refactor `src/domain/community/community/CommunityGuidelines/CommunityGuidelinesContainer.tsx` — create `useCommunityGuidelines.ts` hook returning `CommunityGuidelinesContainerProvided`, update consumer, delete Container
- [ ] T055 [P] [US6] Refactor `src/domain/collaboration/whiteboard/containers/WhiteboardActionsContainer.tsx` — create `useWhiteboardActions.ts` hook returning `WhiteboardChildProps`, update consumer, delete Container
- [ ] T056 [US6] Refactor `src/domain/collaboration/calloutsSet/CalloutsView/CalloutsInViewWrapper.tsx` — create `useCalloutDetails.ts` hook returning `CalloutDetailsContainerProvided`, update ~3 consumers, delete wrapper
- [ ] T057 [US6] Refactor `src/domain/collaboration/callout/calloutBlock/CalloutSettingsContainer.tsx` — create `useCalloutSettings.ts` hook returning dialog state interface, update ~5 consumers, delete Container
- [ ] T058 [US6] Refactor `src/domain/access/ApplicationsAndInvitations/ApplicationButtonContainer.tsx` — create `useApplicationButton.ts` hook returning `ApplicationButtonProps & { shouldShow }`, update ~3 consumers, delete Container
- [ ] T059 [P] [US6] Refactor `src/main/topLevelPages/topLevelSpaces/SpaceExplorerContainer.tsx` — create `useSpaceExplorer.ts` hook, update consumer, delete Container
- [ ] T060 [P] [US6] Refactor `src/main/topLevelPages/myDashboard/ExploreSpaces/ExploreSpacesContainer.tsx` — create `useExploreSpaces.ts` hook, update consumer, delete Container
- [ ] T061 [US6] Refactor hydrators in `src/domain/community/pendingMembership/PendingMemberships.tsx` — replace `InvitationHydrator` and `ApplicationHydrator` render-props with `useInvitationHydrator()` and `useApplicationHydrator()` hooks
- [ ] T062 [US6] Delete `src/core/container/SimpleContainer.ts` and the `SimpleContainerProps` type after all consumers are migrated
- [ ] T063 [US6] Run `pnpm lint && pnpm vitest run && pnpm build` — all pass, no render-prop Container patterns remain

**Checkpoint**: All 10 render-prop Containers converted to hooks. SimpleContainerProps deleted.

---

## Phase 8: User Story 6b — Hooks-First Refactoring: Impure Views (Priority: P4)

**Goal**: Audit and refactor 17 View files — extract business logic to custom hooks, leave Views as pure presentation.

**Independent Test**: Each View's parent feature works identically. Views contain only JSX + useTranslation + UI-only state.

### Implementation for User Story 6 — Impure Views

#### Collaboration domain (3 files)

- [ ] T064 [P] [US6] Audit `CalloutView.tsx` — extract business logic (custom hooks like useCalloutComments) to colocated hook, keep View as pure presentation
- [ ] T065 [P] [US6] Audit `CalloutsGroupView.tsx` — extract business logic to colocated hook or merge into parent
- [ ] T066 [P] [US6] Audit `WhiteboardView.tsx` — extract business logic to colocated hook or merge into parent

#### Communication domain (3 files)

- [ ] T067 [P] [US6] Audit `MessageWithRepliesView.tsx` — extract business logic to colocated hook or merge into parent
- [ ] T068 [P] [US6] Audit `DiscussionView.tsx` — extract business logic to colocated hook or merge into parent
- [ ] T069 [P] [US6] Audit `UserMessagingConversationView.tsx` — extract UI state + effects to colocated hook

#### Community domain (4 files)

- [ ] T070 [P] [US6] Audit `AssociatesView.tsx` — extract business logic to colocated hook or merge into parent
- [ ] T071 [P] [US6] Audit `CommunityUpdatesView.tsx` — extract business logic to colocated hook or merge into parent
- [ ] T072 [P] [US6] Audit `AccountResourcesView.tsx` — extract business logic to colocated hook or merge into parent
- [ ] T073 [P] [US6] Audit `ContributorAccountView.tsx` — extract business logic to colocated hook or merge into parent

#### Space domain (3 files)

- [ ] T074 [P] [US6] Audit `SpaceDashboardView.tsx` — extract 4 state pieces + localStorage effects to `useSpaceDashboard.ts` hook, merge remaining View into `SpaceDashboardPage.tsx` if trivial
- [ ] T075 [P] [US6] Audit `SubspaceView.tsx` — extract business logic to colocated hook or merge into parent
- [ ] T076 [P] [US6] Audit `DashboardNavigationItemView.tsx` — extract business logic to colocated hook or merge into parent

#### Timeline domain (1 file)

- [ ] T077 [P] [US6] Audit `CalendarEventDetailView.tsx` — extract business logic to colocated hook or merge into parent

#### Main (3 files)

- [ ] T078 [P] [US6] Audit `SpaceExplorerView.tsx` — extract business logic to colocated hook or merge into parent Page
- [ ] T079 [P] [US6] Audit `ExploreSpacesView.tsx` — extract business logic to colocated hook or merge into parent Page
- [ ] T080 [P] [US6] Audit `SearchView.tsx` — extract business logic to colocated hook or merge into parent

- [ ] T081 [US6] Run `pnpm lint && pnpm vitest run && pnpm build` — all pass, all View files are pure presentation

**Checkpoint**: All 17 impure Views refactored. Every View is now pure presentation.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all stories

- [ ] T082 Run `pnpm analyze` and compare vendor bundle sizes against baseline from T001
- [ ] T083 Verify no imports from removed packages remain: grep for `xstate`, `@xstate/react`, `immer`, `react-scroll`, `react-resize-detector`, `@hello-pangea/dnd`, `@atlaskit/pragmatic-drag-and-drop`, `date-fns`, `@sentry/tracing`, `@elastic/apm-rum-react`
- [ ] T084 Verify zero `*Container.tsx` files use `SimpleContainerProps` render-prop pattern
- [ ] T085 Run full verification: `pnpm install && pnpm lint && pnpm vitest run && pnpm build`
- [ ] T086 Run quickstart.md manual testing checklist validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — capture baseline
- **US1 (Phase 2)**: Depends on Setup — zero-risk, zero code changes
- **US3 (Phase 3)**: Depends on US1 (cleaner dependency tree)
- **US2 (Phase 4)**: Depends on US1 (pragmatic-drag-and-drop already removed)
- **US4 (Phase 5)**: Independent of US2/US3 — can run in parallel with them
- **US5 (Phase 6)**: Independent of US2/US3/US4 — can run in parallel
- **US6a (Phase 7)**: Depends on US2-US5 completion (codebase should be lean before structural refactoring)
- **US6b (Phase 8)**: Depends on US6a (Containers refactored first, then Views)
- **Polish (Phase 9)**: Depends on all stories complete

### User Story Dependencies

- **US1 (P1)**: No dependencies — start immediately after baseline
- **US2 (P2)**: Depends on US1 (removes @atlaskit/pragmatic-drag-and-drop first)
- **US3 (P2)**: Can start after US1 — independent of US2
- **US4 (P3)**: Can start after US1 — independent of US2/US3
- **US5 (P3)**: Can start after US1 — independent of US2/US3/US4
- **US6 (P4)**: Depends on US2-US5 — structural refactoring after dependency cleanup

### Within Each User Story

- Package removal tasks marked [P] can run in parallel (different entries in package.json)
- File migration tasks marked [P] can run in parallel (different source files)
- Package.json removal depends on all file migrations completing
- Verification task runs last in each phase

### Parallel Opportunities

Within Phase 2 (US1): T003-T009 are all parallel (7 independent package removals)
Within Phase 4 (US2): T018-T022 are all parallel (5 independent file migrations)
Within Phase 5 (US4): T030-T037 are all parallel (8 independent file updates, after T029)
Within Phase 6 (US5): T040-T048 are all parallel (9 independent file updates)
Within Phase 7 (US6a): T051-T055, T059-T060 are parallel (leaf containers with 1 consumer)
Within Phase 8 (US6b): T064-T080 are all parallel (17 independent View audits)

---

## Parallel Example: User Story 5 (Immer)

```bash
# Launch all 9 file migrations in parallel (different files, no dependencies):
Task: "Replace produce() in LoginPage.tsx"
Task: "Replace produce() in RegistrationPage.tsx"
Task: "Replace produce() in SignUp.tsx"
Task: "Replace produce() in VerificationPage.tsx"
Task: "Replace produce() in useSubscriptionToSubEntity.ts"
Task: "Replace produce() in ToolbarButton.tsx"
Task: "Replace produce() in ToolbarMenuItem.tsx"
Task: "Replace produce() in DashboardNavigation.tsx"
Task: "Replace produce() in useStorageAdminTree.tsx"

# Then sequentially:
Task: "Remove immer from package.json"
Task: "Verify build + tests pass"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Baseline capture
2. Complete Phase 2: Remove 7 unused packages
3. **STOP and VALIDATE**: Build passes, tests pass, lockfile smaller
4. Zero-risk win — can be merged immediately

### Incremental Delivery

1. US1 (7 packages removed) → merge
2. US3 (XState → useReducer, 2 packages removed) → merge
3. US2 (D&D consolidated, 1 package removed) → merge
4. US4 (3 trivial libs replaced) → merge
5. US5 (Immer removed) → merge
6. US6a (10 Containers → hooks) → merge
7. US6b (17 Views purified) → merge

Each merge is independently valuable and testable.

### Parallel Team Strategy

With multiple developers after US1 is merged:
- Developer A: US2 (D&D consolidation — 5 files)
- Developer B: US3 (XState — 3 files) + US4 (trivial libs — 10 files)
- Developer C: US5 (Immer — 9 files)
- Then converge on US6 (Containers + Views — largest phase)

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- All tasks preserve zero user-facing behavior changes
- No new useMemo/useCallback — React Compiler handles memoization
- Avoid: modifying GraphQL generated files, adding barrel exports, introducing new dependencies
