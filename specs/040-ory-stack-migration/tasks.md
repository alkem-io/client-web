# Tasks: Ory Stack Migration — Client-Web

**Input**: Design documents from `/specs/040-ory-stack-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/kratos-api-changes.md, quickstart.md

**Tests**: Not explicitly requested — manual E2E testing against Kratos v26.2.0 backend per plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (SDK Upgrade)

**Purpose**: Upgrade the `@ory/kratos-client` dependency and verify the project compiles

- [x] T001 Upgrade `@ory/kratos-client` from `^1.3.8` to `^26.2.0` in `package.json`
- [x] T002 Run `pnpm install` and verify clean lockfile generation with no dependency conflicts
- [x] T003 Run `pnpm lint` to verify zero TypeScript compilation errors with the new SDK types (SC-005)

---

## Phase 2: Foundational (SDK Initialization Verification)

**Purpose**: Confirm core SDK plumbing works with v26.2.0 before adapting individual flows

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Verify `FrontendApi` constructor signature is unchanged in `src/core/auth/authentication/hooks/useKratosClient.ts` — confirm `new FrontendApi(config, undefined, axiosInstance)` compiles and initializes correctly
- [x] T005 [P] Verify `toSession()` call and `Session` type usage in `src/core/auth/authentication/hooks/useWhoami.ts` — confirm session checking works unchanged against v26.2.0
- [x] T006 Run `pnpm vitest run` to verify all existing tests pass with the upgraded SDK (SC-006)

**Checkpoint**: SDK initialization verified — user story implementation can now begin

---

## Phase 3: User Story 1 — Update Kratos Client SDK and Adapt Call Sites (Priority: P1) MVP

**Goal**: All five auth flows (login, registration, recovery, verification, settings) compile and function correctly against Kratos v26.2.0 with zero regressions.

**Independent Test**: Run backend with Kratos v26.2.0, navigate to each flow (/login, /register, recovery from login, verification link, profile settings), and verify end-to-end completion.

### Implementation for User Story 1

- [x] T007 [P] [US1] Add `div` node type detection to the node attribute type guards in `src/core/auth/authentication/components/Kratos/helpers.ts` — add `isUiNodeDivisionAttributes` guard for `node_type: 'div'`
- [x] T008 [P] [US1] Import `UiNodeDivisionAttributes` type and add fallback rendering for `div` nodes in the `rest` group in `src/core/auth/authentication/components/KratosUI.tsx`
- [x] T009 [US1] Verify all five flow type imports (`LoginFlow`, `RegistrationFlow`, `SettingsFlow`, `VerificationFlow`, `RecoveryFlow`) compile without changes across all files under `src/core/auth/authentication/`
- [x] T010 [US1] Verify all existing Kratos type imports (`Configuration`, `FrontendApi`, `UiContainer`, `UiNode`, `UiNodeInputAttributes`, `UiNodeScriptAttributes`, `UiNodeTextAttributes`, `UiNodeAnchorAttributes`, `UiNodeAttributes`, `UiText`, `Session`) are unchanged — spot-check import statements in `useKratosClient.ts`, `useKratosFlow.ts`, `KratosUI.tsx`, `helpers.ts` (lint already run in T003)
- [x] T011 [US1] Run `pnpm build` to confirm the production build succeeds with zero errors after all US1 changes (skip if US1 was verification-only with no code changes — T027 covers final build)

**Checkpoint**: All five auth flows compile and div node type is handled. Test each flow E2E against Kratos v26.2.0.

---

## Phase 4: User Story 2 — Handle Oathkeeper 429-to-401 Mapping (Priority: P1)

**Goal**: Rate-limited users see a lockout message with retry timer when Oathkeeper maps Kratos 429 to 401 and redirects with `?lockout=true&retry_after=N`.

**Independent Test**: Trigger rate limiting on login page (5+ failed attempts), verify page redirects to `/login?lockout=true&retry_after=N` and displays lockout message with retry duration in minutes.

### Implementation for User Story 2

- [x] T012 [US2] Verify existing lockout query parameter detection in `src/core/auth/authentication/pages/LoginPage.tsx` — confirm `params.get('lockout')` and `params.get('retry_after')` parsing is correct and displays a user-friendly lockout message with retry duration
- [x] T013 [US2] Verify i18n key for lockout messaging exists in `src/core/i18n/en/translation.en.json` — if missing, add key for "Too many attempts. Please try again in {minutes} minutes." message
- [x] T014 [US2] Verify edge case: when `retry_after` query parameter is missing or invalid, the UI displays a generic "Too many attempts, please try again later" fallback message in `src/core/auth/authentication/pages/LoginPage.tsx`

**Checkpoint**: Rate-limit lockout UX works correctly regardless of HTTP status code. Test by triggering rate limiting against Kratos v26.2.0 + Oathkeeper v26.2.0.

---

## Phase 5: User Story 3 — Update OIDC Registration Node Group Handling (Priority: P1)

**Goal**: OIDC registration validation errors (now in `default` node group instead of `oidc`) are visible to users in 100% of validation failure scenarios.

**Independent Test**: Initiate OIDC registration with a provider returning incomplete profile data (e.g., missing email), verify validation errors appear in the form.

### Implementation for User Story 3

- [x] T015 [US3] Verify `KratosUI.tsx` renders `default` group nodes — confirm that OIDC validation errors moving from `group: 'oidc'` to `group: 'default'` are still displayed in `src/core/auth/authentication/components/KratosUI.tsx` — also verify that the visual positioning of errors at the top of the form (default group area) is acceptable UX compared to the previous position near OIDC buttons (**Note**: shares `KratosUI.tsx` with T008 — coordinate if running US1 and US3 in parallel)
- [x] T016 [US3] Verify OIDC flow detection logic in `src/core/auth/authentication/pages/RegistrationPage.tsx` — confirm `node.group === 'oidc'` check for Cleverbase detection still works (OIDC submit buttons remain in `oidc` group)
- [x] T017 [US3] Verify `MESSAGE_CODE_CLAIM_MISSING` (4000002) error detection searches all nodes regardless of group in `src/core/auth/authentication/pages/RegistrationPage.tsx` — confirm no group-specific filtering that would miss errors in `default`

**Checkpoint**: OIDC registration validation errors visible in all scenarios. Test with OIDC provider returning incomplete profile data against Kratos v26.2.0.

---

## Phase 6: User Story 4 — Handle OIDC Account Linking 400 Response (Priority: P2)

**Goal**: OIDC account linking failures (HTTP 400 instead of 200 since v25.4.0) are caught and display appropriate error feedback instead of unhandled errors.

**Independent Test**: In settings, attempt to link an OIDC provider where the email is already used by another account. Verify error message is displayed (not a blank page or unhandled error).

### Implementation for User Story 4

- [x] T018 [US4] Update error handling in `src/core/auth/authentication/hooks/useKratosFlow.ts` — in the axios catch block for registration/settings flow submissions, detect HTTP 400 responses, extract the flow object from `error.response.data`, and call `setFlow()` to update flow state so error messages render normally
- [x] T018b [US4] Add unit test in `src/core/auth/authentication/hooks/useKratosFlow.test.ts` verifying that when axios rejects with HTTP 400 and `error.response.data` contains a valid flow object, `setFlow()` is called with the extracted flow — and that non-400 errors are re-thrown
- [x] T019 [P] [US4] Add translation for Kratos message ID `1010016` ("You tried to sign in with {provider}, but that email is already used by another account.") in `src/core/auth/authentication/components/Kratos/messages.tsx`
- [x] T020 [P] [US4] Add i18n key for account linking error message (ID `1010016`) in `src/core/i18n/en/translation.en.json` (**Note**: shares `translation.en.json` with T013 — coordinate if running US2 and US4 in parallel)
- [x] T021 [US4] Verify successful OIDC account linking still works after the 400-handling change — confirm non-400 responses are unaffected in `src/core/auth/authentication/hooks/useKratosFlow.ts`

**Checkpoint**: OIDC account linking failures display user-facing error. Test both failure (HTTP 400) and success paths against Kratos v26.2.0.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Optional improvements and final validation across all stories

- [x] T022 [P] Add translation for disabled identity message ID `4010011` ("This account is disabled.") in `src/core/auth/authentication/components/Kratos/messages.tsx` and corresponding i18n key in `src/core/i18n/en/translation.en.json`
- [x] T023 [P] Verify edge case: unknown node groups beyond `default` and `oidc` render in a fallback section (not silently dropped) in `src/core/auth/authentication/components/KratosUI.tsx`
- [x] T024 [P] Verify edge case: passkey/WebAuthn flow handles new node attributes gracefully — script loading and execution in `src/core/auth/authentication/components/Kratos/` handles unknown attributes without errors
- [x] T025 [P] Verify 410 (Gone) flow expiration handler redirects to restart the flow correctly in `src/core/auth/authentication/hooks/useKratosFlow.ts`
- [x] T026 Run `pnpm lint` and `pnpm vitest run` to confirm zero regressions after all changes
- [x] T027 Run `pnpm build` to confirm production build succeeds
- [ ] T028 Run full E2E verification per `specs/040-ory-stack-migration/quickstart.md` checklist against Kratos v26.2.0 backend — including: (a) all 5 OIDC providers (Microsoft, LinkedIn, GitHub, Apple, Cleverbase) complete login/registration, (b) terms acceptance checkbox works during registration, (c) verify error positioning for OIDC validation errors in `default` group is acceptable UX

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — core SDK adaptation
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1, US3
- **US3 (Phase 5)**: Depends on Phase 2 — can run in parallel with US1, US2
- **US4 (Phase 6)**: Depends on Phase 2 — can run in parallel with US1, US2, US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 2 — independent of US1, US3, US4
- **User Story 3 (P1)**: Can start after Phase 2 — independent of US1, US2, US4
- **User Story 4 (P2)**: Can start after Phase 2 — independent of US1, US2, US3

### Within Each User Story

- Verification tasks before implementation changes
- Type/helper changes before component rendering changes
- Hook changes before page-level changes
- i18n keys added alongside or before component changes that reference them

### Parallel Opportunities

- T004 + T005 (Phase 2): Different files, no shared state
- T007 + T008 (US1): Different files (helpers.ts vs KratosUI.tsx)
- US1, US2, US3, US4 can all proceed in parallel after Phase 2 (different files, independent concerns)
- T019 + T020 (US4): Different files (messages.tsx vs translation.en.json)
- T022 + T023 + T024 + T025 (Phase 7): All independent verification/addition tasks

---

## Parallel Example: All User Stories

```bash
# After Phase 2 completes, launch all stories in parallel:
# Developer A: US1 (T007-T011) — helpers.ts, KratosUI.tsx, build verification
# Developer B: US2 (T012-T014) — LoginPage.tsx, translation.en.json
# Developer C: US3 (T015-T017) — KratosUI.tsx verification, RegistrationPage.tsx
# Developer D: US4 (T018-T021) — useKratosFlow.ts, messages.tsx, translation.en.json

# Note: US1 and US3 both touch KratosUI.tsx — if parallelizing, coordinate on that file.
# US2 and US4 both touch translation.en.json — coordinate on i18n key additions.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (SDK upgrade)
2. Complete Phase 2: Foundational (SDK initialization verification)
3. Complete Phase 3: User Story 1 (core SDK adaptation + div node support)
4. **STOP and VALIDATE**: Test all five auth flows E2E against Kratos v26.2.0
5. Deploy/demo if ready — platform works with new Kratos

### Incremental Delivery

1. Complete Setup + Foundational -> SDK compiles and initializes
2. Add User Story 1 -> All flows work -> Deploy (MVP!)
3. Add User Story 2 -> Rate-limit UX verified -> Deploy
4. Add User Story 3 -> OIDC registration errors visible -> Deploy
5. Add User Story 4 -> Account linking errors handled -> Deploy
6. Polish -> Edge cases, optional improvements -> Final deploy

### Recommended Sequence (Single Developer)

Since this is a migration with coordinated deploy:
1. Phase 1 + 2 (Setup + Foundation): ~30 min
2. Phase 3 (US1): ~1 hr — verify all flows compile
3. Phase 4 (US2): ~30 min — mostly verification
4. Phase 5 (US3): ~30 min — mostly verification
5. Phase 6 (US4): ~1 hr — actual code change in useKratosFlow.ts
6. Phase 7 (Polish): ~30 min — optional items + final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US2 and US3 are primarily verification tasks — existing code may already handle the behavioral changes correctly
- US4 is the only story requiring a significant code change (400 response handling in useKratosFlow.ts)
- This is a coordinated deploy with backend — all changes ship together, no dual-version support
- All commits must be signed per project requirements
- Run `pnpm lint` and `pnpm vitest run` before staging changes
