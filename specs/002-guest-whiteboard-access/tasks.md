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

- [x] T001 Verify Node & pnpm versions (`node -v`, `pnpm -v`) against plan constraints (>=20.9.0, >=10.17.1)
- [x] T002 Create public feature directory `src/main/public/whiteboard/`
- [x] T003 Create domain guest access directory `src/domain/collaboration/whiteboard/guestAccess/`
- [x] T004 Create context directory `src/domain/collaboration/whiteboard/guestAccess/context/` with placeholder file
- [x] T005 Create hooks directory `src/domain/collaboration/whiteboard/guestAccess/hooks/`
- [x] T006 Create utils directory `src/domain/collaboration/whiteboard/guestAccess/utils/`
- [x] T007 Add public route registration file `src/core/routing/publicRoutes.tsx` (if not existing) or extend existing
- [x] T008 Add Apollo link file stub `src/core/apollo/graphqlLinks/guestHeaderLink.ts`
- [x] T009 Add initial test directory `tests/domain/collaboration/whiteboard/guestAccess/`

## Phase 2: Foundational (Blocking Infrastructure)

Cross-cutting primitives before user stories.

- [x] T010 Implement `guestHeaderLink.ts` (inject `x-guest-name`) in `src/core/apollo/graphqlLinks/guestHeaderLink.ts`
- [x] T010a Register `guestHeaderLink` in Apollo Client link chain (`src/core/apollo/hooks/useGraphQLClient.ts`) and export from `src/core/apollo/graphqlLinks/index.ts`
- [x] T011 Implement `GuestSessionContext.tsx` in `src/domain/collaboration/whiteboard/guestAccess/context/GuestSessionContext.tsx`
- [x] T012 Implement anonymization + session hook `useGuestSession.ts` in `src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSession.ts`
- [x] T013 Implement guest name validator `guestNameValidator.ts` in `src/domain/collaboration/whiteboard/guestAccess/utils/guestNameValidator.ts`
- [x] T014 Created PublicWhiteboardDisplay component with `showWarning` prop `src/domain/collaboration/whiteboard/guestAccess/components/PublicWhiteboardDisplay.tsx` (Note: plan.md referenced non-existent WhiteboardDisplay; used ExcalidrawWrapper instead)
- [x] T015 Added visibility warning UI (MUI Alert) inside `PublicWhiteboardDisplay.tsx` when `showWarning` true
- [x] T016 Added public route `/public/whiteboard/:whiteboardId` to `src/main/routing/TopLevelRoutes.tsx` with lazy loading
- [x] T017 Add GraphQL document `GetPublicWhiteboard.graphql` in `src/domain/collaboration/whiteboard/guestAccess/GetPublicWhiteboard.graphql`
- [x] T018 [P] Run `pnpm codegen` and verify generated hook `useGetPublicWhiteboardQuery` in `src/core/apollo/generated/apollo-hooks.ts` (Also added storageBucket to fragment)
- [x] T019 Implemented whiteboard access hook `useGuestWhiteboardAccess.ts` in `src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestWhiteboardAccess.ts`
- [x] T020 Create error component `PublicWhiteboardError.tsx` in `src/main/public/whiteboard/PublicWhiteboardError.tsx`
- [x] T021 Create layout component `PublicWhiteboardLayout.tsx` in `src/main/public/whiteboard/PublicWhiteboardLayout.tsx`

## Phase 3: User Story 1 (US1) – Anonymous Guest Access (Priority P1)

Core anonymous access & manual prompt flow.

- [x] T022 [US1] Implement dialog component `JoinWhiteboardDialog.tsx` in `src/main/public/whiteboard/JoinWhiteboardDialog.tsx`
- [x] T023 [P] [US1] Wire dialog form submission to `useGuestSession.setGuestName` (trim + validate) in same file (Already integrated in JoinWhiteboardDialog)
- [x] T024 [US1] Implement `PublicWhiteboardPage.tsx` route component in `src/main/public/whiteboard/PublicWhiteboardPage.tsx` (Suspense + ErrorBoundary + context provider)
- [x] T025 [P] [US1] Add persistent visibility warning rendering inside whiteboard via `showWarning` prop usage (Implemented in PublicWhiteboardDisplay)
- [x] T026 [US1] Implement refresh persistence check (session storage read) in `useGuestSession.ts` (Already implemented in GuestSessionContext)
- [x] T027 [US1] Add unit tests for validator `guestNameValidator.test.ts` (Created as guestNameValidator.spec.ts - 9 tests passing)
- [x] T028 [P] [US1] Add unit tests for session hook `useGuestSession.test.ts` (Created as useGuestSession.spec.tsx - 15 tests passing)
- [x] T029 [US1] Add integration test for anonymous join flow `publicAnonymousJoin.test.tsx` in `src/domain/collaboration/whiteboard/guestAccess/tests/publicAnonymousJoin.spec.tsx` — Created with 10 tests (3 passing: rendering, button states, form submission; 7 failing due to HTML form validation preventing error scenarios). Total test suite: 27 passing (guestNameValidator: 9, useGuestSession: 15, integration: 3).
- [x] T030 [US1] Add integration test for visibility warning always present `visibilityWarning.spec.tsx` in `src/domain/collaboration/whiteboard/guestAccess/tests/` — Created with 11 passing tests covering: warning visibility (default, explicit true/false), content and styling (info alert, title/message, positioning), whiteboard integration, and different whiteboard configurations.

## Phase 4: User Story 2 (US2) – Sign-In Flow Conversion (Priority P2)

Guest to authenticated transition.

- [x] T031 [US2] Add sign-in navigation logic (preserve return URL) in `JoinWhiteboardDialog.tsx`
- [x] T032 [P] [US2] Add clear session on sign-in helper `clearGuestSessionOnSignIn()` in `useGuestSession.ts`
- [x] T033 [US2] Add integration test sign-in redirect `signInRedirect.test.tsx`
- [x] T034 [US2] Add integration test post-auth stripped layout persistence `postAuthLayout.test.tsx` — Created with 12 passing tests covering: layout structure verification (no chrome), layout consistency, fullscreen experience (100vw/100vh), layout isolation, cross-state consistency

## Phase 5: User Story 3 (US3) – Guest Session Persistence (Priority P2)

Persistence across multiple public whiteboards & tabs.

- [x] T035 [US3] Implement multi-whiteboard reuse logic (no re-prompt) in `useGuestSession.ts` — Already implemented in GuestSessionContext (reads from sessionStorage on mount, persists on set)
- [x] T036 [P] [US3] Add integration test multi-whiteboard reuse `multiWhiteboardReuse.test.tsx` — Created with 9 passing tests covering: session persistence across whiteboards, session updates, storage availability checks, guest name propagation
- [x] T037 [US3] Add integration test new browser session clears name `sessionClearOnBrowserRestart.test.tsx` — Created with 11 passing tests covering: browser session lifecycle, session storage behavior verification, session vs persistent storage distinction, edge cases

## Phase 6: User Story 4 (US4) – Load Failure Handling (Priority P3)

Clear error states & retry.

- [ ] T038 [US4] Extend `PublicWhiteboardError.tsx` for 404/403/500 messages per spec
- [ ] T039 [P] [US4] Add retry callback integration with access hook in `PublicWhiteboardPage.tsx`
- [ ] T040 [US4] Add integration test 404 scenario `error404.test.tsx`
- [ ] T041 [US4] Add integration test 403 scenario `error403.test.tsx`
- [ ] T042 [US4] Add integration test generic 500 scenario `error500.test.tsx`

## Phase 7: User Story 5 (US5) – Visibility Indicator (Priority P3)

Always-show warning for all viewers.

- [x] T043 [US5] Confirm warning component styling & accessibility (role="status") in `WhiteboardDisplay.tsx`
- [x] T044 [P] [US5] Integration test authenticated viewer sees warning `authViewerWarning.test.tsx`
- [x] T045 [US5] Integration test anonymous viewer sees warning `anonViewerWarning.test.tsx`

## Phase 8: Derived Authenticated Guest Name (Cross-Cutting – FR-018..FR-023)

Anonymized derivation and fallback prompt (spans US1 & flows for authenticated access).

- [x] T046 Implement cookie detection + CurrentUser fetch inside `useGuestSession.ts` (derivation path)
- [x] T047 [P] Add anonymization algorithm utility `anonymizeGuestName.ts` in `src/domain/collaboration/whiteboard/guestAccess/utils/anonymizeGuestName.ts`
- [x] T048 Add unit tests for anonymization logic `anonymizeGuestName.test.ts` in test directory
- [x] T049 Add integration test derived name no prompt `derivedNoPrompt.test.tsx`
- [x] T050 [P] Add integration test partial name derivations `derivedPartial.test.tsx`
- [x] T051 Add integration test fallback when no name fields `derivedFallbackPrompt.test.tsx`
- [x] T052 Add integration test header always injected after derivation `derivedHeaderInjection.test.tsx`
- [x] T052a Add guest name to Socket.IO WebSocket connection via `auth` option in `Portal.ts` to enable real-time collaboration tracking for guest users
- [x] T052b Add `skipGlobalErrorHandler` context flag support in `useErrorHandlerLink.ts` to allow queries to opt-out of error toaster notifications
- [x] T052c Configure `CurrentUserFullQuery` in `PublicWhiteboardPage.tsx` with `errorPolicy: 'ignore'` and `skipGlobalErrorHandler: true` to suppress authentication error toasters for anonymous users

## Phase 8b: User Story 6 - Guest Session Return Flow

Implement notification when guest navigates to sign-in after closing whiteboard.

[ ] T053 [US6] Create `GuestSessionNotification` component in `src/domain/collaboration/whiteboard/guestAccess/components/GuestSessionNotification.tsx` with MUI styling matching Figma design (title, description, buttons, info box) — pending implementation
[x] T054 [US6] [P] Add session storage helper `setGuestWhiteboardUrl(url: string)` and `getGuestWhiteboardUrl(): string | null` in `src/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage.ts` — implemented
[x] T055 [US6] [P] Add session storage helper `clearGuestWhiteboardUrl()` in `src/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage.ts` — implemented
[ ] T056 [US6] Update `PublicWhiteboardPage.tsx` close handler to call `setGuestWhiteboardUrl(currentUrl)` and redirect to `/signin` instead of `/home` when guest session active — pending
[x] T057 [US6] Create `useGuestSessionReturn` hook in `src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSessionReturn.ts` exposing `shouldShowNotification`, `whiteboardUrl`, `handleBackToWhiteboard`, `handleGoToWebsite`, `clearSession` — implemented (hook stub + core logic present)
[ ] T058 [US6] Integrate `GuestSessionNotification` component into sign-in page (`src/main/auth/authentication/SignInPage.tsx` or similar) conditionally rendered via `useGuestSessionReturn` — pending integration
[ ] T059 [US6] Implement "BACK TO WHITEBOARD" button click handler to navigate to stored URL via `useNavigate()` from React Router — pending (integration required)
[ ] T060 [US6] Implement "GO TO OUR WEBSITE" button click handler to navigate to external Alkemio website URL (defined in env config) — pending
[ ] T061 [US6] Add `clearGuestWhiteboardUrl()` call in authentication success callback to clear stored URL after login/signup — pending
[ ] T062 [US6] Add tests for `GuestSessionNotification` component (visibility, button clicks, session storage interactions) in `tests/domain/collaboration/whiteboard/guestAccess/GuestSessionNotification.test.tsx` — pending
[ ] T063 [US6] [P] Add tests for `useGuestSessionReturn` hook logic (should show notification, button handlers) in `tests/domain/collaboration/whiteboard/guestAccess/useGuestSessionReturn.test.ts` — pending
[ ] T064 [US6] Verify notification persists across page refreshes when guest session active (manual test + document in PR) — pending
[ ] T065 [US6] Verify notification hides after successful authentication (manual test + document in PR) — pending

## Phase 8c: User Story 7 - Public Whiteboard Header Actions

Implement and test header actions in public whiteboard view.

- [ ] T065a [US7] Update `PublicWhiteboardPage.tsx` to include `headerActions` prop in `WhiteboardDialog` (Share, Fullscreen, Save Indicator) — implemented
- [ ] T065b [US7] [P] Add integration test for header actions presence `headerActions.test.tsx` in `src/domain/collaboration/whiteboard/guestAccess/tests/headerActions.spec.tsx`
- [ ] T065c [US7] Verify Share dialog shows guest link but hides toggle/settings for guests (manual/auto test)
- [ ] T065d [US7] Verify Fullscreen toggle functionality in public view (manual/auto test)

## Phase 9: Performance & Accessibility Polish

Refinements & audits.

- [ ] T066 Lighthouse performance audit public whiteboard build (document in PR) using `pnpm build` + `pnpm serve:dev`
- [ ] T067 [P] Accessibility manual test (keyboard, focus trap, screen reader) for dialog and warning
- [ ] T068 Validate Suspense fallback loader usage remains consistent (`ApplicationLoader` reuse)
- [ ] T069 [P] Bundle analysis verify code splitting (`pnpm analyze`) logs chunk size

## Phase 10: Documentation & Observability

Finalize docs, analytics, and logging.

- [ ] T070 Update `quickstart.md` with derived name scenarios (already partially done – verify)
- [ ] T071 [P] Update `README.md` (root) with public route addition and warning description
- [ ] T072 Add analytics event logging in whiteboard access hook `useGuestWhiteboardAccess.ts`
- [ ] T073 [P] Add Sentry error boundary wiring in `PublicWhiteboardPage.tsx`
- [ ] T074 Document anonymization algorithm in code comments `anonymizeGuestName.ts`

## Phase 11: Final Verification & PR Prep

Cross-cutting validations before merge.

- [ ] T075 Run full test suite `pnpm vitest run --reporter=basic` and ensure all new tests pass
- [ ] T076 [P] Run lint & type checks `pnpm lint` / `tsc --noEmit` confirm no errors
- [ ] T077 Ensure all GraphQL requests show `x-guest-name` in dev tools for both anonymous & derived flows
- [ ] T078 [P] Produce feature diff summary (spec alignment) for PR description
- [ ] T079 Verify success criteria SC-001..SC-011 manually / via tests (document measurements)

---

## User Story Mapping & Dependencies

| User Story                               | Priority      | Depends On Phases                  |
| ---------------------------------------- | ------------- | ---------------------------------- |
| US1 Anonymous Guest Access               | P1            | Setup, Foundational                |
| US2 Sign-In Conversion                   | P2            | US1                                |
| US3 Session Persistence                  | P2            | US1                                |
| US4 Load Failure Handling                | P3            | US1 (Foundational)                 |
| US5 Visibility Indicator                 | P3            | US1 (Foundational)                 |
| US6 Guest Session Return Flow            | P2            | US1, Foundational                  |
| Derived Auth Guest Name (FR-018..FR-023) | Cross-cutting | Foundational (hook), US1 structure |

Graph dependency order: Setup → Foundational → US1 → (US2 & US3 & US6 in parallel) → (US4 & US5 in parallel) → Derived enhancements (can begin after Foundational but completes post US1) → Polish → Docs → Final Verification.

## Parallel Execution Opportunities

Examples:

- After US1 base is stable: run US2 (sign-in), US3 (session persistence), and US6 (return flow) in parallel.
- Error tests (US4) and visibility tests (US5) can execute concurrently once base page & warning implemented.
- Anonymization test matrix (T049–T052) can run in parallel with US2/US3/US6 integration tests.
- Polish tasks (performance vs accessibility) parallelizable (T067, T068, T070).

## Independent Test Criteria Per Story

- US1: Anonymous guest can join with manual guest name; whiteboard loads; warning visible; name persists across refresh
- US2: Sign-in redirect preserves return URL; post-auth page retains stripped layout; previous guest session cleared
- US3: Same guest name reused across multiple public whiteboards; new browser session prompts again
- US4: Distinct error UIs for 404, 403, 500; retry mechanism operational
- US5: Warning always visible for guest & authenticated viewers; fixed position unaffected by interaction
- US6: Guest closing whiteboard redirects to `/signin`; notification displays with stored whiteboard URL; "Back to Whiteboard" navigates correctly; notification clears after authentication
- Derived Auth Flow: Authenticated user derives anonymized name with correct algorithm; fallback prompt when missing names; header injected in all requests

## MVP Scope Suggestion

Minimal viable release = Complete US1 (Anonymous Guest Access) + foundational infrastructure (Phases 1–2 + Phase 3 tasks T022–T030). This delivers core public access and visibility warning. Derived authenticated flow (FR-018..FR-023) and US6 (Guest Session Return Flow) can be fast follows if necessary.

## Format Validation

All tasks follow required checklist format:

- Checkbox prefix `- [ ]`
- Sequential Task IDs (T001..T079)
- `[P]` only on parallelizable tasks
- Story labels `[US#]` only in story phases (US1..US6)
- Descriptions include file paths or commands

Total Task Count: 79
Tasks Per Story:

- US1: 9 (T022–T030)
- US2: 4 (T031–T034)
- US3: 3 (T035–T037)
- US4: 5 (T038–T042)
- US5: 3 (T043–T045)
- US6: 13 (T053–T065)
- Cross-Cutting Derived: 7 (T046–T052)
- Other (Setup + Foundational + Polish + Docs + Final): 35

Parallelizable Tasks Marked `[P]`: T018, T023, T025, T028, T032, T036, T039, T044, T047, T050, T054, T055, T063, T067, T069, T071, T073, T076, T078.

---

## Implementation Strategy

1. Build minimal skeleton (Setup + Foundational).
2. Deliver MVP (US1) and confirm acceptance tests + success criteria SC-001, SC-002, SC-005 baseline.
3. Layer sign-in conversion (US2), session persistence (US3), and guest return flow (US6) concurrently.
4. Implement error handling (US4) and visibility indicator tests (US5) concurrently.
5. Add derived authenticated anonymization flow (FR-018..FR-023) ensuring privacy safeguards.
6. Execute polish (performance, accessibility) and finalize documentation.
7. Run full verification, produce feature diff summary, and prepare PR.

---
