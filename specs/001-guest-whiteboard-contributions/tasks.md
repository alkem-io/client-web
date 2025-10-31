# Tasks: Guest Whiteboard Contributions Toggle

**Input**: Design documents from `/specs/001-guest-whiteboard-contributions/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Tests**: No explicit tests requested in specification - focusing on implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Tag Constitution coverage where relevant:
  - `Domain` for updates in `src/domain`/`src/core` façades or `src/main` shells wiring them.
  - `GraphQL` when queries, fragments, generated hooks, or `pnpm run codegen` are involved.
  - `React19` for new components adopting Suspense/transitions/Actions or documenting legacy
    concurrency risks.
  - `Quality` for accessibility checks, performance safeguards, required tests, or observability
    instrumentation.

## Path Conventions

- Single React project: `src/` at repository root
- Paths assume single project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify backend GraphQL schema includes allowGuestContributions field in SpaceSettingsCollaboration type
- [ ] T002 [P] Run pnpm install to ensure dependencies are current

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [GraphQL] Update SpaceSettings.graphql fragment to include allowGuestContributions field in src/domain/spaceAdmin/SpaceAdminSettings/graphql/SpaceSettings.graphql
- [ ] T005 [GraphQL] Update UpdateSpaceSettings.graphql mutation to include allowGuestContributions input in src/domain/spaceAdmin/SpaceAdminSettings/graphql/UpdateSpaceSettings.graphql
- [ ] T006 [GraphQL] Run pnpm run codegen to regenerate GraphQL types and hooks
- [ ] T007 [Domain] Update SpaceSettingsModel.ts interface to include allowGuestContributions field in src/domain/space/settings/SpaceSettingsModel.ts
- [ ] T008 [P] [Domain] Update SpaceDefaultSettings.tsx to include allowGuestContributions: false in collaboration defaults in src/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Enables Guest Contributions at Space Level (Priority: P1) 🎯 MVP

**Goal**: Space admins can enable/disable guest contributions toggle in space settings with persistence and optimistic updates

**Independent Test**: Navigate to space settings as admin, toggle guest contributions on/off, verify persistence across page reloads and appropriate warning messages

### Implementation for User Story 1

- [ ] T009 [P] [US1] [Domain] Create useSpaceGuestContributions hook in src/domain/space/settings/useSpaceGuestContributions.ts
- [ ] T010 [US1] [React19] Add optimistic state management to SpaceAdminSettingsPage.tsx using useOptimistic and useTransition
- [ ] T011 [US1] [Domain] Add allowGuestContributions parameter to handleUpdateSettings function in src/domain/spaceAdmin/SpaceAdminSettings/SpaceAdminSettingsPage.tsx
- [ ] T012 [US1] Add guest contributions toggle UI component to Member Actions section in src/domain/spaceAdmin/SpaceAdminSettings/SpaceAdminSettingsPage.tsx
- [ ] T013 [P] [US1] Add translation keys for guest contributions toggle labels and messages in public/locales/en/translation.json
- [ ] T014 [US1] [Quality] Implement error handling with automatic optimistic reversion and toast notifications in SpaceAdminSettingsPage.tsx
- [ ] T015 [US1] [Quality] Add ARIA labels and keyboard navigation support to toggle component for WCAG 2.1 AA compliance

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Whiteboard Creator Shares Publicly (When Enabled) (Priority: P2)

**Goal**: Whiteboard creators and admins can see public sharing checkbox in Share dialog when space-level setting is enabled

**Independent Test**: With guest contributions enabled at space level, open whiteboard Share dialog and verify checkbox appears for whiteboard owners/creators

### Implementation for User Story 2

- [ ] T016 [P] [US2] [Domain] Integrate useSpaceGuestContributions hook into whiteboard Share dialog component (location TBD - deferred to implementation)
- [ ] T017 [US2] Add conditional rendering of "Allow public contributions" checkbox based on space setting and user authorization in Share dialog
- [ ] T018 [US2] [Quality] Implement authorization check to show checkbox only to whiteboard creators and space admins
- [ ] T019 [P] [US2] Add translation keys for Share dialog public contributions checkbox in public/locales/en/translation.json
- [ ] T020 [US2] Add placeholder UI for public URL display when checkbox is enabled (actual URL generation deferred)
- [ ] T021 [US2] Add "Share with guests" button visibility logic for space members to view public URLs

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Guest Contributions Disabled State (Priority: P2)

**Goal**: When admin disables guest contributions, all public sharing UI is hidden and URLs become inaccessible

**Independent Test**: Toggle space-level setting off and verify Share dialog checkboxes disappear and public URLs return 404

### Implementation for User Story 3

- [ ] T022 [US3] [Domain] Update Share dialog to hide public sharing controls when allowGuestContributions is false
- [ ] T023 [US3] Add reactive UI updates when space setting changes while Share dialog is open
- [ ] T024 [P] [US3] Update useSpaceGuestContributions hook to handle real-time setting changes via Apollo cache
- [ ] T025 [US3] [Quality] Add visual feedback when public sharing becomes unavailable due to space setting change
- [ ] T026 [US3] Document public URL 404 behavior for backend coordination (implementation deferred)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - No Inheritance Between Spaces and Subspaces (Priority: P3)

**Goal**: Subspaces maintain independent guest contribution settings regardless of parent space configuration

**Independent Test**: Create parent space and subspace with different toggle states and verify independence

### Implementation for User Story 4

- [ ] T027 [P] [US4] [Domain] Verify useSpaceGuestContributions hook queries space-specific settings without inheritance
- [ ] T028 [US4] Document space hierarchy independence behavior in component comments and documentation

**Checkpoint**: Space setting independence verified and documented

---

## Phase 7: User Story 5 - Visibility Status Indicators on Callout Pages (Priority: P3)

**Goal**: Whiteboard callout pages show guest contribution status for transparency

**Independent Test**: View whiteboard callout pages in spaces with different guest contribution settings and verify status indicators

### Implementation for User Story 5

- [ ] T029 [P] [US5] [Domain] Integrate useSpaceGuestContributions hook into whiteboard callout page components
- [ ] T030 [US5] Add conditional status indicator to whiteboard callout pages showing "Guest contributions enabled" when appropriate
- [ ] T031 [P] [US5] Add translation keys for status indicators in public/locales/en/translation.json
- [ ] T032 [US5] [Quality] Ensure status indicators are informational-only for non-admin users

**Checkpoint**: All user stories complete with status transparency

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T033 [P] [Quality] Run performance audit using Lighthouse to verify <500ms mutation timing and no regressions
- [ ] T034 [P] [Quality] Conduct accessibility audit using axe-core to verify WCAG 2.1 AA compliance for all new UI elements
- [ ] T035 [Quality] Test with spaces containing 10-20 whiteboards to verify scale performance per success criteria
- [ ] T036 [P] Update documentation in docs/ with new domain hook patterns and extensibility points
- [ ] T037 [Quality] Run quickstart.md validation checklist to verify all success criteria met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 domain hook but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses US1 and US2 components but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Uses US1 domain hook but independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Uses US1 domain hook but independently testable

### Within Each User Story

- Domain hooks before UI components
- Translation keys in parallel with implementation
- Quality checks after core implementation
- Error handling and accessibility after base functionality

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Translation keys within each story can be done in parallel with implementation
- Quality tasks in Polish phase can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for User Story 1:
Task T009: "Create useSpaceGuestContributions hook" (Domain)
Task T013: "Add translation keys for guest contributions toggle" (i18n)

# Sequential dependencies for User Story 1:
T009 → T010 → T011 → T012 → T014 → T015
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify backend ready)
2. Complete Phase 2: Foundational (GraphQL updates + codegen)
3. Complete Phase 3: User Story 1 (admin toggle functionality)
4. **STOP and VALIDATE**: Test toggle independently with quickstart.md checklist
5. Deploy/demo admin toggle functionality

### Incremental Delivery

1. Complete Setup + Foundational → GraphQL foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP admin toggle!)
3. Add User Story 2 → Test independently → Deploy/Demo (Share dialog integration)
4. Add User Story 3 → Test independently → Deploy/Demo (disabled state handling)
5. Add User Story 4 → Test independently → Deploy/Demo (space independence)
6. Add User Story 5 → Test independently → Deploy/Demo (status indicators)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (admin toggle - MVP)
   - Developer B: User Story 2 (Share dialog integration)
   - Developer C: User Story 4 & 5 (independence + status)
3. Stories complete and integrate independently

---

## Constitution Compliance Tags

- **Domain**: T007, T008, T009, T016, T022, T024, T027, T029 - Domain-driven boundaries maintained
- **GraphQL**: T004, T005, T006 - Contract fidelity with generated hooks
- **React19**: T010, T023 - Concurrent UX with useOptimistic and useTransition
- **Quality**: T014, T015, T018, T025, T032-T037 - Experience quality safeguards

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend coordination required before T001 (GraphQL schema verification)
- Public URL generation and Share dialog location TBD during implementation
- Focus on admin toggle as MVP - other stories add incremental value
