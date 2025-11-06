# Implementation Tasks: Public Whiteboard Guest Access

**Feature**: Public Whiteboard Guest Access Page
**Branch**: `002-guest-whiteboard-access`
**Spec**: `specs/002-guest-whiteboard-access/spec.md`
**Plan**: `specs/002-guest-whiteboard-access/plan.md`
**Data Model**: `specs/002-guest-whiteboard-access/data-model.md`
**Contracts**: `specs/002-guest-whiteboard-access/contracts/api-contract.md`
**Research**: `specs/002-guest-whiteboard-access/research.md`

---

## Phase 1: Setup

Environment + structural groundwork. No user story labels.

- [ ] T001 Verify Node & pnpm versions (`node -v`, `pnpm -v`) against plan constraints (>=20.9.0, >=10.17.1)
- [ ] T002 Create public feature directory `src/main/public/whiteboard/`
- [ ] T003 Create domain guest access directory `src/domain/collaboration/whiteboard/guestAccess/`
- [ ] T004 Create context directory `src/domain/collaboration/whiteboard/guestAccess/context/` with placeholder file
- [ ] T005 Create hooks directory `src/domain/collaboration/whiteboard/guestAccess/hooks/`
- [ ] T006 Create utils directory `src/domain/collaboration/whiteboard/guestAccess/utils/`
- [ ] T007 Add public route registration file `src/core/routing/publicRoutes.tsx` (if not existing) or extend existing
- [ ] T008 Add Apollo link file stub `src/core/apollo/graphqlLinks/guestHeaderLink.ts`
- [ ] T009 Add initial test directory `tests/domain/collaboration/whiteboard/guestAccess/`

## Phase 2: Foundational (Blocking Infrastructure)

Cross-cutting primitives before user stories.

- [ ] T010 Implement `guestHeaderLink.ts` (inject `x-guest-name`) in `src/core/apollo/graphqlLinks/guestHeaderLink.ts`
- [ ] T011 Implement `GuestSessionContext.tsx` in `src/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext.tsx`
- [ ] T012 Implement anonymization + session hook `useGuestSession.ts` in `src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession.ts`
- [ ] T013 Implement guest name validator `guestNameValidator.ts` in `src/domain/collaboration/whiteboard/guestAccess/utils/guestNameValidator.ts`
- [ ] T014 Modify whiteboard display component to accept `showWarning` prop `src/domain/collaboration/whiteboard/WhiteboardDisplay/WhiteboardDisplay.tsx`
- [ ] T015 Add visibility warning UI (MUI Alert) inside `WhiteboardDisplay.tsx` when `showWarning` true
- [ ] T016 Add public route to root routing composition `src/root.tsx` utilizing `publicRoutes`
- [ ] T017 Add GraphQL document `GetPublicWhiteboard.graphql` in `src/domain/collaboration/whiteboard/guestAccess/GetPublicWhiteboard.graphql`
- [ ] T018 [P] Run `pnpm codegen` and verify generated hook `useGetPublicWhiteboardQuery` in `src/core/apollo/generated/apollo-hooks.ts`
- [ ] T019 Implement whiteboard access hook `useGuestWhiteboardAccess.ts` in `src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestWhiteboardAccess.ts`
- [ ] T020 Create error component `PublicWhiteboardError.tsx` in `src/main/public/whiteboard/PublicWhiteboardError.tsx`
- [ ] T021 Create layout component `PublicWhiteboardLayout.tsx` in `src/main/public/whiteboard/PublicWhiteboardLayout.tsx`

## Phase 3: User Story 1 (US1) – Anonymous Guest Access (Priority P1)

Core anonymous access & manual prompt flow.

- [ ] T022 [US1] Implement dialog component `JoinWhiteboardDialog.tsx` in `src/main/public/whiteboard/JoinWhiteboardDialog.tsx`
- [ ] T023 [P] [US1] Wire dialog form submission to `useGuestSession.setGuestName` (trim + validate) in same file
- [ ] T024 [US1] Implement `PublicWhiteboardPage.tsx` route component in `src/main/public/whiteboard/PublicWhiteboardPage.tsx` (Suspense + ErrorBoundary + context provider)
- [ ] T025 [P] [US1] Add persistent visibility warning rendering inside whiteboard via `showWarning` prop usage
- [ ] T026 [US1] Implement refresh persistence check (session storage read) in `useGuestSession.ts`
- [ ] T027 [US1] Add unit tests for validator `guestNameValidator.test.ts` in `tests/domain/collaboration/whiteboard/guestAccess/guestNameValidator.test.ts`
- [ ] T028 [P] [US1] Add unit tests for session hook `useGuestSession.test.ts` in `tests/domain/collaboration/whiteboard/guestAccess/useGuestSession.test.ts`
- [ ] T029 [US1] Add integration test for anonymous join flow `publicAnonymousJoin.test.tsx` in `tests/domain/collaboration/whiteboard/guestAccess/publicAnonymousJoin.test.tsx`
- [ ] T030 [US1] Add integration test for visibility warning always present `visibilityWarning.test.tsx`

## Phase 4: User Story 2 (US2) – Sign-In Flow Conversion (Priority P2)

Guest to authenticated transition.

- [ ] T031 [US2] Add sign-in navigation logic (preserve return URL) in `JoinWhiteboardDialog.tsx`
- [ ] T032 [P] [US2] Add clear session on sign-in helper `clearGuestSessionOnSignIn()` in `useGuestSession.ts`
- [ ] T033 [US2] Add integration test sign-in redirect `signInRedirect.test.tsx`
- [ ] T034 [US2] Add integration test post-auth stripped layout persistence `postAuthLayout.test.tsx`

## Phase 5: User Story 3 (US3) – Guest Session Persistence (Priority P2)

Persistence across multiple public whiteboards & tabs.

- [ ] T035 [US3] Implement multi-whiteboard reuse logic (no re-prompt) in `useGuestSession.ts`
- [ ] T036 [P] [US3] Add integration test multi-whiteboard reuse `multiWhiteboardReuse.test.tsx`
- [ ] T037 [US3] Add integration test new browser session clears name `sessionClearOnBrowserRestart.test.tsx`

## Phase 6: User Story 4 (US4) – Load Failure Handling (Priority P3)

Clear error states & retry.

- [ ] T038 [US4] Extend `PublicWhiteboardError.tsx` for 404/403/500 messages per spec
- [ ] T039 [P] [US4] Add retry callback integration with access hook in `PublicWhiteboardPage.tsx`
- [ ] T040 [US4] Add integration test 404 scenario `error404.test.tsx`
- [ ] T041 [US4] Add integration test 403 scenario `error403.test.tsx`
- [ ] T042 [US4] Add integration test generic 500 scenario `error500.test.tsx`

## Phase 7: User Story 5 (US5) – Visibility Indicator (Priority P3)

Always-show warning for all viewers.

- [ ] T043 [US5] Confirm warning component styling & accessibility (role="status") in `WhiteboardDisplay.tsx`
- [ ] T044 [P] [US5] Integration test authenticated viewer sees warning `authViewerWarning.test.tsx`
- [ ] T045 [US5] Integration test anonymous viewer sees warning `anonViewerWarning.test.tsx`

## Phase 8: Derived Authenticated Guest Name (Cross-Cutting – FR-018..FR-023)

Anonymized derivation and fallback prompt (spans US1 & flows for authenticated access).

- [ ] T046 Implement cookie detection + CurrentUser fetch inside `useGuestSession.ts` (derivation path)
- [ ] T047 [P] Add anonymization algorithm utility `anonymizeGuestName.ts` in `src/domain/collaboration/whiteboard/guestAccess/utils/anonymizeGuestName.ts`
- [ ] T048 Add unit tests for anonymization logic `anonymizeGuestName.test.ts` in test directory
- [ ] T049 Add integration test derived name no prompt `derivedNoPrompt.test.tsx`
- [ ] T050 [P] Add integration test partial name derivations `derivedPartial.test.tsx`
- [ ] T051 Add integration test fallback when no name fields `derivedFallbackPrompt.test.tsx`
- [ ] T052 Add integration test header always injected after derivation `derivedHeaderInjection.test.tsx`

## Phase 9: Performance & Accessibility Polish

Refinements & audits.

- [ ] T053 Lighthouse performance audit public whiteboard build (document in PR) using `pnpm build` + `pnpm serve:dev`
- [ ] T054 [P] Accessibility manual test (keyboard, focus trap, screen reader) for dialog and warning
- [ ] T055 Validate Suspense fallback loader usage remains consistent (`ApplicationLoader` reuse)
- [ ] T056 [P] Bundle analysis verify code splitting (`pnpm analyze`) logs chunk size

## Phase 10: Documentation & Observability

Finalize docs, analytics, and logging.

- [ ] T057 Update `quickstart.md` with derived name scenarios (already partially done – verify)
- [ ] T058 [P] Update `README.md` (root) with public route addition and warning description
- [ ] T059 Add analytics event logging in whiteboard access hook `useGuestWhiteboardAccess.ts`
- [ ] T060 [P] Add Sentry error boundary wiring in `PublicWhiteboardPage.tsx`
- [ ] T061 Document anonymization algorithm in code comments `anonymizeGuestName.ts`

## Phase 11: Final Verification & PR Prep

Cross-cutting validations before merge.

- [ ] T062 Run full test suite `pnpm vitest run --reporter=basic` and ensure all new tests pass
- [ ] T063 [P] Run lint & type checks `pnpm lint` / `tsc --noEmit` confirm no errors
- [ ] T064 Ensure all GraphQL requests show `x-guest-name` in dev tools for both anonymous & derived flows
- [ ] T065 [P] Produce feature diff summary (spec alignment) for PR description
- [ ] T066 Verify success criteria SC-001..SC-006 manually / via tests (document measurements)

---

## User Story Mapping & Dependencies

| User Story                               | Priority      | Depends On Phases                  |
| ---------------------------------------- | ------------- | ---------------------------------- |
| US1 Anonymous Guest Access               | P1            | Setup, Foundational                |
| US2 Sign-In Conversion                   | P2            | US1                                |
| US3 Session Persistence                  | P2            | US1                                |
| US4 Load Failure Handling                | P3            | US1 (Foundational)                 |
| US5 Visibility Indicator                 | P3            | US1 (Foundational)                 |
| Derived Auth Guest Name (FR-018..FR-023) | Cross-cutting | Foundational (hook), US1 structure |

Graph dependency order: Setup → Foundational → US1 → (US2 & US3 in parallel) → (US4 & US5 in parallel) → Derived enhancements (can begin after Foundational but completes post US1) → Polish → Docs → Final Verification.

## Parallel Execution Opportunities

Examples:

- After US1 base is stable: run US2 (sign-in) and US3 (session persistence) in parallel.
- Error tests (US4) and visibility tests (US5) can execute concurrently once base page & warning implemented.
- Anonymization test matrix (T049–T052) can run in parallel with US2/US3 integration tests.
- Polish tasks (performance vs accessibility) parallelizable (T053, T054, T056).

## Independent Test Criteria Per Story

- US1: Anonymous guest can join with manual guest name; whiteboard loads; warning visible; name persists across refresh
- US2: Sign-in redirect preserves return URL; post-auth page retains stripped layout; previous guest session cleared
- US3: Same guest name reused across multiple public whiteboards; new browser session prompts again
- US4: Distinct error UIs for 404, 403, 500; retry mechanism operational
- US5: Warning always visible for guest & authenticated viewers; fixed position unaffected by interaction
- Derived Auth Flow: Authenticated user derives anonymized name with correct algorithm; fallback prompt when missing names; header injected in all requests

## MVP Scope Suggestion

Minimal viable release = Complete US1 (Anonymous Guest Access) + foundational infrastructure (Phases 1–2 + Phase 3 tasks T022–T030). This delivers core public access and visibility warning. Derived authenticated flow (FR-018..FR-023) can be a fast follow if necessary.

## Format Validation

All tasks follow required checklist format:

- Checkbox prefix `- [ ]`
- Sequential Task IDs (T001..T066)
- `[P]` only on parallelizable tasks
- Story labels `[US#]` only in story phases (US1..US5)
- Descriptions include file paths or commands

Total Task Count: 66
Tasks Per Story:

- US1: 9 (T022–T030)
- US2: 4 (T031–T034)
- US3: 3 (T035–T037)
- US4: 5 (T038–T042)
- US5: 3 (T043–T045)
- Cross-Cutting Derived: 7 (T046–T052)
  Other (Setup + Foundational + Polish + Docs + Final): 35

Parallelizable Tasks Marked `[P]`: T018, T023, T025, T028, T032, T036, T039, T044, T047, T050, T054, T056, T058, T060, T063, T065.

---

## Implementation Strategy

1. Build minimal skeleton (Setup + Foundational).
2. Deliver MVP (US1) and confirm acceptance tests + success criteria SC-001, SC-002, SC-005 baseline.
3. Layer sign-in conversion (US2) & session persistence (US3) concurrently.
4. Implement error handling (US4) and visibility indicator tests (US5) concurrently.
5. Add derived authenticated anonymization flow (FR-018..FR-023) ensuring privacy safeguards.
6. Execute polish (performance, accessibility) and finalize documentation.
7. Run full verification, produce feature diff summary, and prepare PR.

---
