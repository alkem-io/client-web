# Tasks: Enhanced Error Handling with Server Error Extensions

**Input**: Design documents from `/specs/013-error-handling-extensions/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec - omitting test tasks. Manual verification per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add i18n translations needed by all user stories

- [x] T001 [P] Add error message translations (notFound section) to `src/core/i18n/en/translation.en.json`
- [x] T002 [P] Add error message translations (authorization section) to `src/core/i18n/en/translation.en.json`
- [x] T003 [P] Add error message translations (validation section) to `src/core/i18n/en/translation.en.json`
- [x] T004 [P] Add error message translations (operations section) to `src/core/i18n/en/translation.en.json`
- [x] T005 [P] Add error message translations (system + fallback section) to `src/core/i18n/en/translation.en.json`
- [x] T006 [P] Add support mailto translations (linkText, emailSubject, emailBody) to `src/core/i18n/en/translation.en.json`

**Checkpoint**: All i18n translations in place - user story implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model changes that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Extend `Notification` type with optional `numericCode` field in `src/core/state/global/notifications/notificationMachine.ts`
- [x] T008 Update `PUSH_NOTIFICATION` event payload to include optional `numericCode` in `src/core/state/global/notifications/notificationMachine.ts`
- [x] T009 Update XState machine assign action to store `numericCode` in notification context in `src/core/state/global/notifications/notificationMachine.ts`
- [x] T010 Update `useNotification` hook to accept optional `numericCode` parameter in `src/core/ui/notifications/useNotification.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Meaningful Error Messages (Priority: P1) 🎯 MVP

**Goal**: Display localized error messages using server-provided `userMessage` as i18n translation key

**Independent Test**: Trigger any server error with `userMessage` extension and verify the translated message appears in the notification

### Implementation for User Story 1

- [x] T011 [US1] Create helper function `getTranslationForUserMessage` to look up `userMessage` as i18n key with fallback in `src/core/apollo/hooks/useApolloErrorHandler.ts`
- [x] T012 [US1] Update `getTranslationForCode` to check `userMessage` extension first before falling back to existing `code`-based logic in `src/core/apollo/hooks/useApolloErrorHandler.ts`
- [x] T013 [US1] Extract `numericCode` from `error.extensions.numericCode` in `handleGraphQLErrors` function in `src/core/apollo/hooks/useApolloErrorHandler.ts`
- [x] T014 [US1] Pass extracted `numericCode` to `notify()` call in `handleGraphQLErrors` function in `src/core/apollo/hooks/useApolloErrorHandler.ts`

**Checkpoint**: User Story 1 complete - error notifications now show translated messages from `userMessage` key

---

## Phase 4: User Story 2 - Extended Time to Read and Act on Errors (Priority: P2)

**Goal**: Display error notifications for 15 seconds instead of 6 seconds

**Independent Test**: Trigger any error and measure the notification display duration (should be 15 seconds)

### Implementation for User Story 2

- [x] T015 [US2] Update `NOTIFICATION_AUTO_HIDE_DURATION` constant from 6000 to 15000 in `src/core/ui/notifications/constants.ts`

**Checkpoint**: User Story 2 complete - notifications now display for 15 seconds

---

## Phase 5: User Story 3 - Contact Support Directly from Error Notification (Priority: P3)

**Goal**: Add "Contact Support" mailto link to error notifications with pre-filled error code

**Independent Test**: Trigger any error with `numericCode` and click the support link to verify mailto opens with correct pre-filled content

### Implementation for User Story 3

- [x] T016 [P] [US3] Create `generateSupportMailtoUrl` helper function in `src/core/ui/notifications/generateSupportMailtoUrl.ts`
- [x] T017 [US3] Create `ErrorNotificationContent` component with message display and support link in `src/core/ui/notifications/ErrorNotificationContent.tsx`
- [x] T018 [US3] Update `NotificationHandler` to use `ErrorNotificationContent` for error-severity notifications in `src/core/ui/notifications/NotificationHandler.tsx`
- [x] T019 [US3] Pass `numericCode` from notification context to `ErrorNotificationContent` in `src/core/ui/notifications/NotificationHandler.tsx`

**Checkpoint**: User Story 3 complete - error notifications now include clickable "Contact Support" link with pre-filled mailto

---

## Phase 6: User Story 4 - Error Boundary Shows Enhanced Error Details (Priority: P4)

**Goal**: Enhance ErrorPage to display error code and include code in support mailto

**Independent Test**: Trigger a render error and verify the ErrorPage shows the error code and mailto includes it

### Implementation for User Story 4

- [x] T020 [US4] Add optional `numericCode` prop to `ErrorPage` component in `src/core/pages/Errors/ErrorPage.tsx`
- [x] T021 [US4] Display `numericCode` in error message area when available in `src/core/pages/Errors/ErrorPage.tsx`
- [x] T022 [US4] Update support mailto link to use `generateSupportMailtoUrl` with `numericCode` in `src/core/pages/Errors/ErrorPage.tsx`
- [x] T023 [US4] Update Sentry error boundary to pass `numericCode` to `ErrorPage` when available in `src/core/analytics/SentryErrorBoundaryProvider.tsx`

**Checkpoint**: User Story 4 complete - error boundary pages now show error code and enhanced mailto

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T024 Verify all i18n keys are properly structured and accessible
- [x] T025 Run `pnpm lint` to ensure no linting errors
- [x] T026 Run `pnpm vitest run` to ensure no test regressions
- [x] T027 Validate feature using quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately; all T001-T006 are parallel
- **Foundational (Phase 2)**: Can start in parallel with Setup; T007-T009 are sequential (same file), T010 depends on T009
- **User Story 1 (Phase 3)**: Depends on Foundational (T010) completion
- **User Story 2 (Phase 4)**: Depends only on Setup (i18n) - can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational (T010) and US1 (T014) for full flow
- **User Story 4 (Phase 6)**: Depends on US3 (T016 for mailto helper)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Setup (T001-T006)     Foundational (T007-T010)
       │                      │
       │                      ▼
       │              US1 (T011-T014) ─────┐
       │                      │            │
       ▼                      ▼            │
US2 (T015) ◄──────── US3 (T016-T019) ◄────┘
       │                      │
       │                      ▼
       │              US4 (T020-T023)
       │                      │
       ▼                      ▼
       └──────────► Polish (T024-T027)
```

### Within Each User Story

- US1: T011 → T012 → T013 → T014 (sequential, same file modifications)
- US2: T015 only (single task)
- US3: T016 (parallel) → T017 → T018 → T019 (sequential)
- US4: T020 → T021 → T022 (same file) → T023 (different file)

### Parallel Opportunities

**Phase 1 (Setup)**: All 6 translation tasks can run in parallel

```
T001 ║ T002 ║ T003 ║ T004 ║ T005 ║ T006
```

**Phase 2 + User Story 2**: Can run in parallel with Setup

```
T007 → T008 → T009 → T010   ║   T015 (US2)
```

**User Story 3**: Mailto helper can start while US1 completes

```
T016 (mailto helper) ║ T011-T014 (US1 finishing)
```

---

## Parallel Example: Setup Phase

```bash
# Launch all translation tasks together:
Task: "Add error message translations (notFound section) to src/core/i18n/en/translation.en.json"
Task: "Add error message translations (authorization section) to src/core/i18n/en/translation.en.json"
Task: "Add error message translations (validation section) to src/core/i18n/en/translation.en.json"
Task: "Add error message translations (operations section) to src/core/i18n/en/translation.en.json"
Task: "Add error message translations (system + fallback section) to src/core/i18n/en/translation.en.json"
Task: "Add support mailto translations to src/core/i18n/en/translation.en.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup (i18n translations)
2. Complete Phase 2: Foundational (notification data model)
3. Complete Phase 3: User Story 1 (meaningful messages)
4. Complete Phase 4: User Story 2 (15-second display)
5. **STOP and VALIDATE**: Test error messages display correctly for 15 seconds
6. Deploy/demo if ready

### Full Feature Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (meaningful messages)
3. Add User Story 2 → Test independently (15-second display)
4. Add User Story 3 → Test independently (support mailto link)
5. Add User Story 4 → Test independently (error boundary enhancement)
6. Polish phase → Full validation

### Suggested MVP Scope

**Minimum viable**: User Story 1 + User Story 2 (T001-T015)

- Users see meaningful translated error messages
- Users have time to read them (15 seconds)
- ~15 tasks, core value delivered

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Translation tasks (T001-T006) modify same file but different sections - treat as mergeable
- Notification machine tasks (T007-T009) must be sequential (same file, same types)
- Error handler tasks (T011-T014) must be sequential (same file, interdependent logic)
- Verify behavior manually using quickstart.md scenarios
- Commit after each task or logical group
