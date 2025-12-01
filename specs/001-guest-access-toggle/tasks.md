# Tasks: Whiteboard Guest Access Toggle

**Input**: Design documents from `/specs/001-guest-access-toggle/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit/interaction tests are included where the specification demands regression coverage. Tests focus on Share dialog behavior and toggle outcomes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Tag Constitution coverage where relevant: `Domain`, `GraphQL`, `React19`, `Quality`

---

## Phase 1: Setup (Shared Infrastructure)

_No new setup tasks required beyond existing workspace configuration._

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core updates required before any user story can be implemented.

- [x] T001 Add `guestContributionsAllowed` to whiteboard fragments (Domain, GraphQL) in `src/domain/collaboration/whiteboard/containers/WhiteboardQueries.graphql`
- [x] T002 Create guest access toggle mutation document (Domain, GraphQL) at `src/domain/collaboration/whiteboard/WhiteboardDialog/graphql/UpdateWhiteboardGuestAccess.graphql`
- [x] T003 Execute `pnpm codegen` to regenerate Apollo hooks with guest access types (GraphQL) touching `src/core/apollo/generated/apollo-hooks.ts`
- [x] T004 Extend whiteboard TypeScript models with `guestContributionsAllowed` (Domain) in `src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialog.tsx`

**Checkpoint**: GraphQL schema and generated types support guest access flows. Guest share URL generation remains a placeholder until a dedicated feature delivers the backend contract.

---

## Phase 3: User Story 1 - Enable guest access for collaboration (Priority: P1) 🎯 MVP

**Goal**: Allow PUBLIC_SHARE facilitators to toggle guest access on, immediately surfacing the guest link and warning when the backend confirms.

**Independent Test**: As a privileged user, toggle guest access on in the Share dialog, observe the public link and warning appear, and verify denial handling when privilege is revoked mid-action.

### Implementation

- [x] T006 [US1] Create `useWhiteboardGuestAccess` hook exposing state + mutation (Domain, GraphQL) in `src/domain/collaboration/whiteboard/hooks/useWhiteboardGuestAccess.ts`
- [x] T007 [US1] Inject guest access hook into whiteboard header share button (Domain, React19) in `src/domain/collaboration/whiteboard/WhiteboardsManagement/WhiteboardView.tsx`
- [x] T008 [US1] Extend ShareDialog/ShareButton props to accept guest access controls (Domain, React19) in `src/domain/shared/components/ShareDialog/ShareDialog.tsx` and `src/domain/shared/components/ShareDialog/ShareButton.tsx`
- [x] T009 [US1] Add guest access toggle component with `startTransition` rollback handling (React19, Quality) at `src/domain/shared/components/ShareDialog/GuestAccessToggle.tsx`
- [x] T010 [US1] Render share dialog guest warning banner when toggle is active (Quality) in `src/domain/shared/components/ShareDialog/ShareDialog.tsx`
- [x] T011 [P] [US1] Add i18n copy for guest toggle labels/warnings (Quality) in `src/core/i18n/en/translation.en.json` (propagate English fallback to other locale files)
- [x] T012 [US1] Add vitest coverage for toggle success and denial flows (Quality) in `src/domain/shared/components/ShareDialog/__tests__/ShareDialogGuestToggle.test.tsx`

**Checkpoint**: Privileged users can enable guest access, see the new warning, and recover gracefully from backend denials.

---

## Phase 4: User Story 2 - Share link visibility for members (Priority: P2)

**Goal**: Ensure all space members see the read-only guest link and warning whenever guest access is active, regardless of their privileges.

**Independent Test**: With guest access already active, open the Share dialog as a standard member and confirm the public link field and warning banner render without toggle controls.

### Implementation

- [x] T013 [US2] Extend `WhiteboardProvider` to expose guest access state and computed guest link (Domain) in `src/domain/collaboration/whiteboard/containers/WhiteboardProvider.tsx`
- [x] T014 [US2] Pass guest access props to ShareButton across whiteboard entry points (Domain) in `src/domain/collaboration/calloutContributions/whiteboard/CalloutContributionDialogWhiteboard.tsx`, `src/domain/collaboration/callout/CalloutFramings/CalloutFramingWhiteboard.tsx`, and `src/domain/collaboration/whiteboard/EntityWhiteboardPage/WhiteboardPage.tsx`
- [x] T015 [US2] Make ShareDialog render read-only guest link & copy controls only when `guestContributionsAllowed` is true (Quality) in `src/domain/shared/components/ShareDialog/ShareDialog.tsx`
- [x] T016 [US2] Add vitest to verify member view shows/hides link correctly (Quality) in `src/domain/shared/components/ShareDialog/__tests__/ShareDialogMemberView.test.tsx`

**Checkpoint**: Any space member can view and copy the guest link when active, with UI reflecting backend truth.

---

## Phase 5: User Story 3 - Revoke guest access and surface safeguards (Priority: P3)

**Goal**: Let facilitators disable guest access, immediately retract warnings/link, and display safeguards within the whiteboard editor.

**Independent Test**: Toggle guest access off and confirm the link and warnings vanish in both Share dialog and whiteboard editor; reopen the dialog to verify state sync.

### Implementation

- [x] T017 [US3] Synchronize ShareDialog state with Apollo updates and clear optimistic toggles on denials (React19, Quality) in `src/domain/shared/components/ShareDialog/ShareDialog.tsx`
- [x] T018 [US3] Surface guest access warning banner in whiteboard editor footer (Domain, Quality) in `src/domain/collaboration/whiteboard/WhiteboardDialog/WhiteboardDialogFooter.tsx`
- [x] T019 [US3] Emit telemetry events for guest access toggle attempts/outcomes (Quality) in `src/core/analytics/events/collaborationGuestAccess.ts`
- [x] T020 [US3] Add vitest ensuring disabling guest access hides link/warnings everywhere (Quality) in `src/domain/shared/components/ShareDialog/__tests__/ShareDialogGuestDisable.test.tsx`

**Checkpoint**: Guest access can be revoked safely with immediate UI feedback and telemetry.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wrap-up tasks that span multiple user stories.

- [x] T021 Update developer guidance for guest access validation in `docs/development-setup.md`
- [x] T022 Run project quality gates (`pnpm lint` & `pnpm vitest run --reporter=basic`) to validate changes in `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 2** (Foundational) must complete before any user story work.
2. **Phase 3 (US1)** delivers the MVP; required before US2/US3 for consistent state.
3. **Phase 4 (US2)** depends on the hook/props created in US1.
4. **Phase 5 (US3)** depends on prior phases so state management and warnings exist.
5. **Phase 6** follows once desired user stories are complete.

### User Story Dependencies

- **US1 → US2**: Member visibility relies on guest access state and props built in US1.
- **US1 → US3**: Revocation logic builds on the same toggle and warning infrastructure.
- **US2 ↔ US3**: Independent after US1; can proceed in parallel once US1 is complete.

### Within Each User Story

- Implement hooks and props before UI work.
- UI changes precede translations and tests.
- Tests conclude each story to validate functionality.

---

## Parallel Opportunities

- T011 (translations) can run in parallel with UI wiring once strings are identified.
- T014 updates three entry points independently and can be split among contributors.
- Vitest tasks (T012, T016, T020) can execute concurrently after their respective implementations.
- Phase 6 tasks can run in parallel once all user stories targeted for release are complete.

---

## Independent Test Criteria (per User Story)

- **US1**: Toggle guest access on as a PUBLIC_SHARE user; link and warning appear; denial reverts state with notification.
- **US2**: As a regular member, open Share dialog while guest access is active; read-only link and warning display without toggle controls.
- **US3**: Disable guest access and verify warnings/link disappear in Share dialog and whiteboard editor; reopening shows state synced.

---

## MVP Scope

- Ship after completing Phase 3 (US1). This enables facilitators to control guest access and surfaces immediate feedback, unlocking primary value.

---

## Implementation Strategy

1. Complete Phase 2 to establish GraphQL and helper foundations.
2. Deliver MVP by finishing US1 (Phase 3).
3. Evaluate deployment; then tackle US2 (Phase 4) for broader visibility.
4. Implement US3 (Phase 5) for revocation safeguards and telemetry.
5. Wrap up with Phase 6 polish tasks prior to final validation.
