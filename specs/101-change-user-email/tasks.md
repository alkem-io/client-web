---
description: "Task list for feature implementation"
---

# Tasks: Platform-Admin Change User Login Email (Web Client)

**Input**: Design documents from `/specs/101-change-user-email/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/graphql.md, quickstart.md

**Tests**: Test tasks ARE included — the feature spec requests them. `plan.md` Constitution
Check V and `quickstart.md` "Automated test focus" explicitly mandate Vitest coverage of
the four pure-logic units: error mapping, outcome classification, the change-dialog form
schema, and drift derivation. Component/UI behaviour is covered by manual verification
(`quickstart.md`), not automated tests.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3, US4)
- All paths are absolute from the repository root

## Path Conventions

Single web client (this repository). The feature is a self-contained slice under
`src/domain/platformAdmin/domain/users/emailChange/`, with thin touch points in the
existing admin users page, route tree, i18n file, Apollo type policies, generated
GraphQL output, and — for the FR-031 notification preference — the existing user
notification-settings surfaces (`src/domain/community/userAdmin/` and the CRD
notification settings under `src/main/crdPages/`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization

- [x] T001 Create the feature folder `src/domain/platformAdmin/domain/users/emailChange/` and confirm dependencies are current with `pnpm install` (plan.md adds **no new dependencies**)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The GraphQL contract layer. Every user story consumes at least one
generated hook produced here, so this phase blocks all of them.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Author `src/domain/platformAdmin/domain/users/emailChange/AdminUserEmailChange.graphql` — `adminUserEmailChange` mutation taking `userID`, `newEmail`, `reason`, and `approver: EmailChangeApproverInput!`, selecting `{ success, email }` (contracts/graphql.md §1)
- [x] T003 [P] Author `src/domain/platformAdmin/domain/users/emailChange/AdminUserEmailChangeDriftResolve.graphql` — `adminUserEmailChangeDriftResolve` mutation selecting `{ success, email }` (contracts/graphql.md §2)
- [x] T004 [P] Author `src/domain/platformAdmin/domain/users/emailChange/UserEmailChangeAuditEntries.graphql` — paginated `platformAdmin.userEmailChangeAuditEntries` query with `auditEntries` (including `reason` and `approver { name, role, organization }`), inline `pageInfo`, `total` (contracts/graphql.md §3)
- [x] T005 [P] Author `src/domain/platformAdmin/domain/users/emailChange/LatestUserEmailChangeAuditEntry.graphql` — `platformAdmin.latestUserEmailChangeAuditEntry` query selecting `{ id, outcome, oldEmail, newEmail, timestamp }` (contracts/graphql.md §4)
- [x] T005b [P] Author the FR-031 `userEmailChanged` channel selection (`{ email, inApp, push }`) under `platformAdmin` in `src/domain/community/userAdmin/graphql/userSettingsFragment.graphql` and `src/domain/community/userAdmin/graphql/updateUserSettings.graphql` — so the T006 codegen run picks them up (research.md D15; FR-031)
- [x] T006 Run `pnpm codegen` against a backend with server spec 097 deployed (`localhost:4000/graphql`), then commit the regenerated `src/core/apollo/generated/graphql-schema.ts`, `apollo-hooks.ts`, `apollo-helpers.ts` (research.md D3; contracts/graphql.md §6)
- [x] T006b Add `merge: true` to the `PlatformAdminQueryResults` type policy in `src/core/apollo/config/typePolicies.ts` so co-resident `platformAdmin` selections (`platformAdminUsersList`, `userEmailChangeAuditEntries`, `latestUserEmailChangeAuditEntry`) merge instead of clobbering one another (research.md D6 cache note)

**Checkpoint**: Generated hooks (`useAdminUserEmailChangeMutation`, `useAdminUserEmailChangeDriftResolveMutation`, `useUserEmailChangeAuditEntriesQuery`, `useLatestUserEmailChangeAuditEntryQuery`) exist — user story implementation can now begin

---

## Phase 3: User Story 1 - Change a user's login email (Priority: P1) 🎯 MVP

**Goal**: A platform admin opens the per-user row action in `/admin/users`, enters a new
login email with a re-typed confirmation, acknowledges the destructive warning, submits,
and sees success with every view of that user reflecting the new email.

**Independent Test**: Sign in as a platform admin, locate a test user in Global
administration → Users, change their login email to a new valid address, observe the
success confirmation and the updated email; on a dev stack verify the old email can no
longer sign in and the new email can.

### Tests for User Story 1

> Write the test first; ensure it fails before implementing T008.

- [x] T007 [P] [US1] Unit test for the change-dialog form schema in `src/domain/platformAdmin/domain/users/emailChange/changeUserEmailSchema.test.ts` — invalid format, unchanged address (case-insensitive), confirmation mismatch, and missing required reason / approver name / approver role each block submit; a complete valid form passes (data-model.md §4)

### Implementation for User Story 1

- [x] T008 [P] [US1] Create the Formik/Yup schema factory in `src/domain/platformAdmin/domain/users/emailChange/changeUserEmailSchema.ts` — `{ newEmail, confirmEmail, reason, approver: { name, role, organization } }`; `newEmail` uses `emailValidator` and must differ from `currentEmail` case-insensitively; `confirmEmail` must equal `newEmail`; `reason` + `approver.name` + `approver.role` are required `textLengthValidator` fields, `approver.organization` optional (data-model.md §4; research.md D8; FR-006/FR-007/FR-030)
- [x] T009 [P] [US1] Add change-dialog/row-action/success i18n keys under `pages.admin.users.emailChange.*` (dialog title, current-email label, new-email + confirm labels, reason-&-approval section title + reason/approver field labels, session-end warning, submit, row-action tooltip + disabled tooltip, success message naming the new email + user-notified note) to `src/core/i18n/en/translation.en.json` (research.md D10; FR-004/FR-010/FR-012/FR-029/FR-030)
- [x] T010 [P] [US1] Create façade hook `src/domain/platformAdmin/domain/users/emailChange/useChangeUserEmail.ts` — calls `useAdminUserEmailChangeMutation` with context `{ skipGlobalErrorHandler: true }`, passing `reason` + `approver` (trimmed; empty `approver.organization` sent as `undefined`); on success refetches the affected user and `LatestUserEmailChangeAuditEntry` (FR-011) and fires a success `useNotification` (FR-010/FR-012); on error exposes a single generic message for now (replaced in US2); no optimistic update (FR-009) (research.md D4/D12/D14)
- [x] T011 [P] [US1] Modify `src/domain/platformAdmin/domain/users/useAdminGlobalUserList.tsx` — expose each user's `id` and `email` on the row item view model (also adds an optional `email` to `SearchableListItem` in `SimpleSearchableTable.tsx`) so the row action can open the dialog with the correct subject and current email
- [x] T012 [US1] Create `src/domain/platformAdmin/domain/users/emailChange/ChangeUserEmailDialog.tsx` — `DialogWithGrid` + `DialogHeader` + `Actions`, Formik form using `changeUserEmailSchema`, read-only current email, `FormikInputField` for new email + confirm, a "Reason & approval" section (reason multi-line + approver name/role/organization fields), session-end warning copy, submit `Button` with `loading`/`disabled` bound to form validity + mutation in-flight (FR-003/FR-004/FR-006/FR-008/FR-009/FR-030; research.md D7)
- [x] T013 [US1] Create `src/domain/platformAdmin/domain/users/emailChange/UserEmailChangeRowAction.tsx` — email-icon control that owns the dialog open state and renders `ChangeUserEmailDialog`; enabled only when the current user holds `AuthorizationPrivilege.PlatformAdmin` (read via `usePlatformLevelAuthorizationQuery`), otherwise rendered disabled/grayed with an accessible tooltip (FR-001/FR-002; research.md D2)
- [x] T014 [US1] Modify `src/main/admin/users/adminUsers/AdminUsersPage.tsx` — render `UserEmailChangeRowAction` in `getActions`, positioned **before** the existing license-plan and delete row actions, passing the row user `id` + `email` (FR-002; research.md D1)

**Checkpoint**: A platform admin can change a login email end-to-end on the happy path; the users list reflects the new email without a manual refresh.

---

## Phase 4: User Story 2 - Understand why an email change was rejected (Priority: P1)

**Goal**: Every server-side failure of a change is mapped to a distinct, human-readable
English message shown inline; the dialog stays open with input preserved; the
already-in-use message is generic and leaks nothing about the holder.

**Independent Test**: With the change dialog open, drive each failure condition in turn
(invalid format, unchanged address, address in use, no usable identity, identity service
unavailable, write failed with nothing applied, partial-apply/drift) and confirm each
produces its own distinct readable message and the dialog stays open for correction.

### Tests for User Story 2

> Write the test first; ensure it fails before implementing T016.

- [x] T015 [P] [US2] Unit test for `src/domain/platformAdmin/domain/users/emailChange/emailChangeErrorMapping.test.ts` — every documented `extensions.code` maps to a defined message key; an unmapped code falls back to the generic catch-all; `EMAIL_CHANGE_CONFLICT` maps to the fixed generic "already in use" string with no holder detail (data-model.md §5; FR-013/FR-014/SC-004)

### Implementation for User Story 2

- [x] T016 [P] [US2] Create `src/domain/platformAdmin/domain/users/emailChange/emailChangeErrorMapping.ts` — maps each of the 11 `EMAIL_CHANGE_*` codes to a `translation` i18n key, with a generic catch-all for unmapped/unexpected failures; `EMAIL_CHANGE_CONFLICT` → fixed generic message (data-model.md §5; research.md D4; FR-013/FR-014)
- [x] T017 [P] [US2] Add error-message i18n keys under `pages.admin.users.emailChange.errors.*` (one per `EMAIL_CHANGE_*` code, the generic catch-all, and the generic conflict string) to `src/core/i18n/en/translation.en.json` (FR-013/FR-029)
- [x] T018 [US2] Enhance `src/domain/platformAdmin/domain/users/emailChange/useChangeUserEmail.ts` — on `ApolloError`, read `graphQLErrors[0].extensions.code` and resolve a human-readable message through `emailChangeErrorMapping`; expose it as a typed `errorMessage` (research.md D4; FR-013)
- [x] T019 [US2] Update `src/domain/platformAdmin/domain/users/emailChange/ChangeUserEmailDialog.tsx` — render the mapped `errorMessage` inline; keep the dialog open with entered input preserved on rejection; ensure invalid-format/unchanged/mismatch are caught client-side with no server call (FR-007/FR-015/FR-016/FR-017)

**Checkpoint**: Every change failure produces a distinct, safe, human-readable message; US1 + US2 together form the minimum safe-to-ship P1 increment.

---

## Phase 5: User Story 3 - Review a user's email-change history (Priority: P2)

**Goal**: From the change dialog, a platform admin opens a dedicated history route showing
every email-change attempt for that user, newest-first, paginated, with readable outcome
labels and an empty state.

**Independent Test**: For a user with several past email-change attempts, open the
history view (direct URL `/admin/users/<userId>/email-history`) and confirm entries appear
newest-first with all expected fields, outcomes render as readable labels, and Load more
fetches the next page; for a user with none, an empty state appears.

### Tests for User Story 3

> Write the test first; ensure it fails before implementing T021.

- [x] T020 [P] [US3] Unit test for `src/domain/platformAdmin/domain/users/emailChange/emailChangeOutcome.test.ts` — every `UserEmailChangeAuditOutcome` value maps to the correct label + class (`success` / `success-with-warning` / `failure`); an unknown value falls back to a safe neutral label (data-model.md §1.3; research.md D11; FR-020)

### Implementation for User Story 3

- [x] T021 [P] [US3] Create `src/domain/platformAdmin/domain/users/emailChange/emailChangeOutcome.ts` — maps each of the 12 outcomes (incl. `SPACE_ADMIN_NOTIFICATION_FAILED`) to a readable label key and one of three classes; exports the `EmailChangeOutcomeView` view model and mapper; success-with-warning label names the failed follow-up step; unknown value → forward-compatible fallback (data-model.md §1.3/§3.1; research.md D11; FR-020)
- [x] T022 [P] [US3] Add history i18n keys under `pages.admin.users.emailChange.*` (12 outcome labels, history page title, entry field labels incl. reason + approver, empty-state message, "Load more", and the "View change history" link label) to `src/core/i18n/en/translation.en.json` (FR-029)
- [x] T023 [P] [US3] Create façade hook `src/domain/platformAdmin/domain/users/emailChange/useUserEmailChangeHistory.ts` — `useUserEmailChangeAuditEntriesQuery` with `first: 10`, `fetchMore` load-more (`after: pageInfo.endCursor`); maps generated types to `EmailChangeHistoryView` / `EmailChangeHistoryEntryView` (data-model.md §3.2–3.3; research.md D5; FR-021)
- [x] T024 [US3] Create presentational `src/domain/platformAdmin/domain/users/emailChange/EmailChangeOutcomeChip.tsx` — renders an `EmailChangeOutcomeView` as a chip with success / success-with-warning / failure variants (FR-020)
- [x] T025 [US3] Create presentational `src/domain/platformAdmin/domain/users/emailChange/EmailChangeHistoryList.tsx` — newest-first paginated list; each row shows timestamp, `EmailChangeOutcomeChip`, initiator display name, old email, new email, the recorded reason + approver, failure reason when present; empty state instead of an error; Load more control (FR-019/FR-021/FR-022/FR-023)
- [x] T026 [US3] Create `src/domain/platformAdmin/domain/users/pages/UserEmailChangeHistoryPage.tsx` — MUI page in `AdminLayout`, reads the `userId` UUID from the route param (`useParams`), denies direct navigation by non-platform-admins (FR-001), wires `useUserEmailChangeHistory` into `EmailChangeHistoryList` (research.md D5; FR-018)
- [x] T027 [US3] Modify `src/domain/platformAdmin/domain/users/routing/UsersRoute.tsx` — add the `:userId/email-history` route (param is the user UUID) rendering `UserEmailChangeHistoryPage` (research.md D5; FR-018)
- [x] T028 [US3] Update `src/domain/platformAdmin/domain/users/emailChange/ChangeUserEmailDialog.tsx` — add a "View change history" link navigating to `/admin/users/<userId>/email-history` (FR-018)

**Checkpoint**: A platform admin can review and page through a user's complete email-change history.

---

## Phase 6: User Story 4 - Resolve a half-applied (drift) email change (Priority: P3)

**Goal**: When a drifted user's change dialog is opened it shows a drift warning + Resolve
action; Resolve offers exactly the two recorded addresses and reconciles the account. No
per-row drift indicator on the users list (see Clarifications).

**Independent Test**: For a user whose most recent email-change record is a drift state,
open the change dialog and confirm a drift warning appears, open Resolve, confirm exactly
the old and new addresses are offered with no free-text entry, pick one, submit, and
confirm the warning clears.

### Tests for User Story 4

> Write the test first; ensure it fails before implementing T030.

- [x] T029 [P] [US4] Unit test for drift derivation in `src/domain/platformAdmin/domain/users/emailChange/useLatestUserEmailChangeOutcome.test.ts` — `DRIFT_DETECTED` and `DRIFT_RESOLUTION_FAILED` ⇒ drifted; all other latest outcomes ⇒ not drifted (data-model.md §1.4; research.md D6; FR-025)

### Implementation for User Story 4

- [x] T030 [P] [US4] Create façade hook `src/domain/platformAdmin/domain/users/emailChange/useLatestUserEmailChangeOutcome.ts` — `useLatestUserEmailChangeAuditEntryQuery`; pure helper derives a `DriftStateView` (`isDrifted` + the two candidate addresses) from the latest entry (data-model.md §1.4/§3.4; research.md D6; FR-025)
- [x] T031 [P] [US4] Create façade hook `src/domain/platformAdmin/domain/users/emailChange/useResolveUserEmailDrift.ts` — `useAdminUserEmailChangeDriftResolveMutation` with context `{ skipGlobalErrorHandler: true }`; maps errors via `emailChangeErrorMapping`; on success refetches the user + latest audit entry to clear drift (FR-027/FR-028; research.md D4)
- [x] T032 [P] [US4] Add drift i18n keys under `pages.admin.users.emailChange.drift.*` (dialog drift-warning banner, Resolve action + dialog title + description, the two address-choice labels, Resolve submit, success message) to `src/core/i18n/en/translation.en.json`; the "nothing to resolve" case reuses `errors.driftNotFound` (FR-029)
- [x] T033 [US4] Create `src/domain/platformAdmin/domain/users/emailChange/ResolveEmailDriftDialog.tsx` — `DialogWithGrid` + MUI `RadioGroup` offering exactly the `oldEmail` and `newEmail` from the latest drift entry, no free-text input; submits via `useResolveUserEmailDrift` (FR-026/FR-027/FR-028; research.md D9)
- [x] T034 [US4] No per-row drift indicator — superseded by a spec clarification (a per-user query on every users-list load is too heavy for a rare condition). `UserEmailChangeRowAction.tsx` stays drift-free; drift is queried lazily by the dialog instead (FR-024; research.md D6)
- [x] T035 [US4] Update `src/domain/platformAdmin/domain/users/emailChange/ChangeUserEmailDialog.tsx` — call `useLatestUserEmailChangeOutcome` (skipped until the dialog is open) and show a drift warning banner + Resolve action when the user is drifted, opening `ResolveEmailDriftDialog`; hide all drift UI when not drifted (FR-025)

**Checkpoint**: All four user stories are independently functional; drift is surfaced in the change dialog and reconcilable entirely through the UI.

---

## Phase 6b: Platform-admin email-change notification preference (FR-031)

**Goal**: Expose the new server-097 `userEmailChanged` platform-admin notification
preference in the existing user notification-settings surfaces (MUI admin + CRD), so
an administrator can opt in to being notified when any user's login email changes.

**Note**: This phase consumes the same regenerated schema (T006) and is independent of
US1–US4. It is plain plumbing — one entry per platform-admin notification setting
across the same handful of files (research.md D15).

- [x] T040 [P] (no-op — the `userEmailChanged` GraphQL selections are authored in T005b and regenerated by T006; this entry retained for FR-031 traceability)
- [x] T041 [P] Add `userEmailChanged?: NotificationChannels` to `PlatformAdminNotificationSettings` in `src/domain/community/userAdmin/tabs/model/NotificationSettings.model.ts`
- [x] T042 Wire `userEmailChanged` into `src/domain/community/userAdmin/tabs/UserAdminNotificationsPage.tsx` (apply server overrides + build the notification channel) and `src/domain/community/userAdmin/tabs/components/CombinedPlatformNotificationsSettings.tsx` (option + the triple-switch admin grouping)
- [x] T043 [P] Wire `userEmailChanged` into the CRD notification settings — `notificationPayloadBuilders.ts` (`buildPlatformAdmin`) and `userNotificationsMapper.ts` (`mapUserNotifications` row) under `src/main/crdPages/topLevelPages/userPages/settings/notifications/`
- [x] T044 [P] Add the `adminUserEmailChanged` label to `src/core/i18n/en/translation.en.json` (`pages.userNotificationsSettings.platformAdmin.settings.*`) and the `userEmailChanged` label to `src/crd/i18n/contributorSettings/contributorSettings.en.json` (FR-029/FR-031)

**Checkpoint**: A platform admin can toggle the "user email changed" notification in both the MUI and CRD notification-settings surfaces; the preference persists via the existing user-settings update flow.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification across all user stories

- [x] T036 [P] Run `pnpm lint` (TypeScript + Biome + ESLint) and resolve any issues
- [x] T037 [P] Run `pnpm vitest run` and confirm the four feature unit tests (schema, error mapping, outcome, drift derivation) pass
- [x] T038 Accessibility pass (WCAG 2.1 AA) over `ChangeUserEmailDialog.tsx`, `ResolveEmailDriftDialog.tsx`, `UserEmailChangeRowAction.tsx`, `EmailChangeHistoryList.tsx` — dialog labelling/focus, disabled control accessible label/tooltip, radio group semantics (plan.md Constitution Check V)
- [ ] T039 Execute the manual verification in `specs/101-change-user-email/quickstart.md` (sections A–F) and confirm acceptance scenarios for US1–US4, the FR-031 notification preference, and SC-001…SC-009 hold

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (every story imports a generated hook from T006)
- **User Stories (Phase 3–6)**: All depend on Foundational completion
- **Notification preference (Phase 6b)**: the FR-031 GraphQL selections are authored in Phase 2 (T005b) and regenerated by T006; the remaining Phase 6b wiring (T041–T044) depends on Foundational (T006) only and is independent of US1–US4
- **Polish (Phase 7)**: Depends on all targeted user stories and Phase 6b being complete

### User Story Dependencies

- **US1 (P1)**: Base story — depends only on Foundational. No dependency on other stories.
- **US2 (P1)**: Depends on Foundational + **US1** — T018 modifies `useChangeUserEmail.ts` and T019 modifies `ChangeUserEmailDialog.tsx`, both created in US1.
- **US3 (P2)**: Depends on Foundational + **US1** — the history page (T023–T027) is independently testable by direct URL, but T028 modifies the US1 `ChangeUserEmailDialog.tsx` to add the history link.
- **US4 (P3)**: Depends on Foundational + **US1** (T035 modifies the US1 dialog) + **US2** (T031 reuses `emailChangeErrorMapping` from T016).

### Within Each User Story

- The test task (T007 / T015 / T020 / T029) is written first and must fail before its implementation task
- Pure modules (schema, mappings, hooks) before the components that consume them
- Presentational components before the page/route that composes them
- Row-action / page wiring last

### Shared-File Coordination

- `ChangeUserEmailDialog.tsx` is created in US1 (T012) and later modified by US2 (T019), US3 (T028), and US4 (T035) — if US2/US3/US4 are worked in parallel, serialize edits to this file.
- `UserEmailChangeRowAction.tsx` is created in US1 (T013); US4 (T034) adds no per-row drift UI, so it is not modified after US1.
- `useChangeUserEmail.ts` is created in US1 (T010) and modified by US2 (T018).
- `src/core/i18n/en/translation.en.json` is touched by T009, T017, T022, T032 — different key subtrees, but the same file, so those tasks are not parallel with each other.

### Parallel Opportunities

- Foundational: T002–T005 (the four feature `.graphql` documents) and T005b (the FR-031 `.graphql` edits) run in parallel; T006 (codegen) follows and regenerates all of them.
- Once Foundational completes, US1, US2, US3, US4 may be staffed in parallel by different developers — subject to the shared-file coordination above and the story dependencies (US2/US3/US4 build on US1).
- Within each story, tasks marked `[P]` (different files) run in parallel after the story's test task.

---

## Parallel Example: per story

```bash
# Phase 2 — Foundational: author all GraphQL documents/edits together
T002 AdminUserEmailChange.graphql
T003 AdminUserEmailChangeDriftResolve.graphql
T004 UserEmailChangeAuditEntries.graphql
T005 LatestUserEmailChangeAuditEntry.graphql
T005b userSettingsFragment.graphql + updateUserSettings.graphql (FR-031)
# then: T006 pnpm codegen

# US1: after T007 (schema test), run the [P] batch together
T008 changeUserEmailSchema.ts
T009 translation.en.json (change-dialog keys)
T010 useChangeUserEmail.ts
T011 useAdminGlobalUserList.tsx
# then sequential: T012 → T013 → T014

# US3: after T020 (outcome test), run the [P] batch together
T021 emailChangeOutcome.ts
T022 translation.en.json (history keys)
T023 useUserEmailChangeHistory.ts
# then sequential: T024 → T025 → T026 → T027 → T028
```

---

## Implementation Strategy

### MVP First

1. Phase 1: Setup
2. Phase 2: Foundational (CRITICAL — blocks all stories)
3. Phase 3: US1 — change a login email (demoable happy-path slice)
4. Phase 4: US2 — error handling. **US1 + US2 together are the minimum safe-to-ship P1 increment** — per spec.md, the change feature is not safe to release without US2.
5. **STOP and VALIDATE**: run quickstart.md sections A–C

### Incremental Delivery

1. Setup + Foundational → contract layer ready
2. US1 + US2 → test → ship the P1 increment
3. US3 → test independently → ship
4. US4 → test independently → ship
5. Phase 7 polish → final lint/test/a11y/manual verification

---

## Notes

- `[P]` = different files, no dependency on an incomplete task
- `[Story]` label maps each task to its user story for traceability
- The change-email feature itself is built entirely in MUI / `src/core/ui/` (spec A8, research.md D13). The only CRD touch point is the FR-031 notification preference, which extends an existing setting that already has both MUI and CRD renderings (research.md D15)
- `pnpm codegen` (T006) requires a running backend with server spec 097 deployed
- No optimistic UI (FR-009); no manual `useMemo`/`useCallback`/`memo` (React Compiler)
- Commit after each task or logical group; commit generated GraphQL artifacts with T006
