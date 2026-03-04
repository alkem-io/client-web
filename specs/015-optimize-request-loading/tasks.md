# Tasks: Optimize Request Loading Performance

**Input**: Design documents from `/specs/015-optimize-request-loading/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted. Existing test suite (`pnpm vitest run`) serves as regression gate.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Apollo Batching Infrastructure) — DROPPED

**Purpose**: ~~Add BatchHttpLink to the Apollo link chain — prerequisite for all query batching optimizations.~~

> **Dropped**: BatchHttpLink adds 10ms forced delay per query and holds fast queries back until the slowest in a batch completes. HTTP/2 multiplexing already handles concurrent requests efficiently. Batching made things slower, not faster. All downstream tasks that depended on batching were re-evaluated and found to work without it (queries fire in parallel via simplified skip conditions instead).

- [ ] ~~T001~~ DROPPED
- [ ] ~~T002~~ DROPPED
- [ ] ~~T003~~ DROPPED

---

## Phase 2: Foundational (Retry Tuning)

**Purpose**: Quick, low-risk change that improves error recovery across all pages.

- [x] T004 Reduce retry link initial delay from `1000` to `300` in `src/core/apollo/graphqlLinks/retryLink.ts` (line ~12, change `initial: 1000` to `initial: 300`, keep `max: 5000` and `jitter: true`)

**Checkpoint**: Retry behavior improved. No functional change for happy path.

---

## Phase 3: User Story 1 — Faster Auth Page Load (Priority: P1) 🎯 MVP

**Goal**: Auth pages (login, signup, signin) load without WebSocket overhead, geo-location calls, or analytics initialization.

**Independent Test**: Load `/login` in DevTools — verify no WebSocket connection in WS tab, no geo-location request, config and auth check run concurrently in Network timeline.

### Implementation for User Story 1

- [x] T005 [US1] Set `lazy: true` on the `graphql-ws` client in `src/core/apollo/graphqlLinks/httpLink.ts` (change `lazy: false` to `lazy: true`, replace `onNonLazyError` with `on: { error: ... }` handler) — see `contracts/apollo-link-chain.md` WebSocket section
- [x] T006 [P] [US1] Add auth page skip condition in `src/core/analytics/geo/UserGeoProvider.tsx` — use `useLocation()` to detect paths starting with `/login`, `/registration`, `/sign_up` and skip geo-location fetch when on those paths
- [x] T007 [P] [US1] Add auth page skip condition in `src/core/analytics/apm/context/ApmProvider.tsx` — same route check pattern as T006, skip APM initialization on auth pages
- [x] T008 [US1] Smoke test: navigate to `/login`, `/registration`, `/sign_up` — verify no WebSocket connection, no geo request, page loads and auth flow works correctly. Then navigate to home page — verify WebSocket connects on-demand when notifications component renders.

**Checkpoint**: Auth pages are fully functional with reduced overhead. WebSocket only connects when subscriptions are needed.

---

## Phase 4: User Story 2 — Faster Home Page Load (Priority: P2)

**Goal**: Eliminate redundant queries and optimize fetch policies on the home page dashboard.

**Independent Test**: Load `/home` as authenticated user in DevTools — verify CampaignBlockCredentials query is absent, InnovationHubBannerWide query is absent, PendingInvitations skipped when count=0. Count total GraphQL requests and compare to HAR baseline (15).

### Implementation for User Story 2

- [x] T009 [US2] Replace `useCampaignBlockCredentialsQuery` in `src/main/topLevelPages/myDashboard/Campaigns/CampaignBlock.tsx` with data from `useCurrentUserContext()` — read `platformRoles` (replaces `platform.roleSet.myRoles`) and `accountEntitlements` (replaces `me.user.account.license.availableEntitlements`). Remove the query import and call. Keep the rendering logic and conditional checks intact. See `contracts/query-consolidation.md` CampaignBlockCredentials section.
- [x] T010 [P] [US2] Eliminate `InnovationHubBannerWide` query from `src/domain/innovationHub/useSpaceBreadcrumbsTopLevelItem.ts` — instead of firing a separate `useInnovationHubBannerWideQuery`, read the banner data from the `useInnovationHub` hook result (preferred over raw cache reads for maintainability). Ensure the breadcrumb root item still displays the Innovation Hub banner. See `research.md` R-009.
- [x] T011 [P] [US2] Add conditional skip to PendingInvitations query in `src/main/topLevelPages/myDashboard/InvitationsBlock/InvitationsBlock.tsx` — pass a `skip` option to `usePendingInvitationsQuery` that skips when the pending invitations count is 0. This requires reading the count from `usePendingInvitationsCount` hook or context and passing it as a skip condition. See `research.md` R-010.
- [x] T012 [P] [US2] Set `fetchPolicy: 'cache-first'` on `useInnovationHubQuery` in `src/domain/innovationHub/useInnovationHub/useInnovationHub.ts` — Innovation Hub data rarely changes during a session. Existing cache is populated on first load. See `research.md` R-011 for root cause analysis.
- [x] T013 [P] [US2] Set `fetchPolicy: 'cache-first'` on `usePendingInvitationsCountQuery` in `src/domain/community/pendingMembership/usePendingInvitationsCount.ts` — count only changes after user action (accept/reject), which already explicitly refetches. See `research.md` R-011.
- [ ] ~~T014~~ NOT APPLICABLE — HomeSpaceLookup and RecentSpaces queries were not present in the measured HAR trace (user had no space memberships, so a different dashboard path renders). This optimization remains valid for users with space memberships but was not implemented in this iteration.
- [x] T015 [US2] Smoke test: load `/home` as authenticated user — verify CampaignBlock renders correctly using context data, breadcrumbs show Innovation Hub banner without separate query, invitation count badge works, InnovationHub and PendingInvitationsCount don't refetch on in-app navigation, HomeSpaceLookup fires without waiting for RecentSpaces.

**Checkpoint**: Home page fires fewer queries with no redundant data fetching. All dashboard features remain functional.

---

## Phase 5: User Story 3 — Eliminate Authentication Waterfall (Priority: P3)

**Goal**: Parallelize config + auth startup and eliminate the CurrentUserFull → PlatformLevelAuthorization waterfall.

**Independent Test**: Load any page in DevTools Network timeline — verify config and Kratos whoami fire concurrently (overlapping bars), and CurrentUserFull + PlatformLevelAuthorization fire in parallel (no 550ms gap).

### Implementation for User Story 3

- [x] T016 [US3] Simplify `usePlatformLevelAuthorizationQuery` skip condition in `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx` — change `skip: !user || !isAuthenticated` to `skip: !isAuthenticated`. This allows PlatformLevelAuthorization to fire in the same tick as CurrentUserFull (in parallel via HTTP/2 multiplexing). See `contracts/provider-tree.md` UserProvider section and `research.md` R-003.
- [x] T017 [US3] Move `AuthenticationProvider` above `BrowserRouter` in `src/root.tsx` — this replaced the originally planned `ParallelStartupProvider` component. Investigation revealed AuthenticationProvider has zero router dependencies (`useWhoami` → `useKratosClient` → `useConfig` are all router-free). Previous failure was caused by a concurrent Kratos 502 backend outage, not the provider tree change. Simple reordering achieved the same parallelization goal.
- [x] T018 [US3] Verify all router-dependent components (UserGeoProvider, ApmProvider, NavigationHistoryTracker, TopLevelRoutes) remain inside BrowserRouter after restructuring.
- [x] T019 [US3] Smoke test: load `/home` and `/login` — verify in Network timeline that config query and Kratos whoami fire concurrently (overlapping), CurrentUserFull and PlatformLevelAuthorization fire in parallel, Sentry and APM still initialize correctly, all existing functionality works.

**Checkpoint**: App startup waterfall is reduced by ~754ms. Config and auth are parallel. User + authorization queries fire in parallel.

---

## Phase 6: User Story 4 — Deferred Non-Essential Connections (Priority: P4)

**Goal**: WebSocket connects only when a subscription is first activated, not on page load.

**Independent Test**: Already achieved by T005 (lazy WebSocket). This phase validates the broader behavior across all pages.

### Implementation for User Story 4

- [x] T020 [US4] Validate lazy WebSocket behavior across all page types — navigate to: (a) `/login` — no WS connection, (b) `/home` as authenticated user — WS connects when notification subscription activates, (c) public space page — no WS connection unless real-time feature is present, (d) whiteboard page — WS connects for collaboration. Document any pages where lazy connection causes issues.
- [x] T021 [US4] No issues found with lazy WebSocket (e.g., subscription errors, delayed connections, reconnection failures), fix them in `src/core/apollo/graphqlLinks/httpLink.ts` by adjusting the `graphql-ws` client configuration (retry attempts, connection timeout, etc.)

**Checkpoint**: WebSocket is fully lazy across all pages. No regressions in real-time features.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and regression testing.

- [x] T022 Run full test suite: `pnpm vitest run` — all 247 tests must pass with no regressions (SC-006)
- [x] T023 Run linter: `pnpm lint` — no new warnings or errors introduced
- [x] T024 Remove unused imports and dead code from modified files — specifically: unused `CampaignBlockCredentials` query/hook imports in `CampaignBlock.tsx`, unused `InnovationHubBannerWide` query/hook imports in `useSpaceBreadcrumbsTopLevelItem.ts`, `onNonLazyError` references in `httpLink.ts`
- [x] T025 [P] HAR comparison test: record new HAR file on `/home` and compare to baseline — verify: (a) total GraphQL requests reduced from 15 to ~12, (b) no CampaignBlockCredentials or InnovationHubBannerWide in the trace, (c) CurrentUserFull + PlatformLevelAuthorization fire in parallel (no 550ms gap)
- [x] T026 [P] Run quickstart.md testing checklist — work through each item in `specs/015-optimize-request-loading/quickstart.md` Testing Checklist section

---

## Dependencies & Execution Order

### Phase Dependencies (updated post-implementation)

- **Phase 1 (Setup)**: DROPPED — batching not used.
- **Phase 2 (Foundational)**: No dependencies — start immediately.
- **Phase 3 (US1)**: No dependencies (Phase 1 dropped).
- **Phase 4 (US2)**: No dependencies. All T009-T013 are independent of each other. T014 was not applicable.
- **Phase 5 (US3)**: No dependencies. T016-T017 are the most impactful tasks.
- **Phase 6 (US4)**: Depends on T005 from Phase 3 (lazy WebSocket). Primarily validation.
- **Phase 7 (Polish)**: Depends on all previous phases.

### User Story Dependencies

- **US1 (P1)**: Independent — only modifies WebSocket config + analytics providers
- **US2 (P2)**: Independent — only modifies dashboard components + fetch policies
- **US3 (P3)**: Independent — only modifies provider tree + CurrentUserProvider skip condition
- **US4 (P4)**: Depends on US1 T005 (lazy WebSocket) — primarily validation of that change

### Within-Phase Parallel Opportunities

- **Phase 3**: T006 and T007 are parallel (different files)
- **Phase 4**: T010, T011, T012, T013, T014 are all parallel (different files, independent changes)
- **Phase 7**: T025 and T026 are parallel (different validation activities)

---

## Parallel Example: User Story 2

```text
# Launch all independent query optimization tasks together:
Task T010: "Eliminate InnovationHubBannerWide in src/domain/innovationHub/useSpaceBreadcrumbsTopLevelItem.ts"
Task T011: "Conditional skip PendingInvitations in src/main/topLevelPages/myDashboard/InvitationsBlock/InvitationsBlock.tsx"
Task T012: "Cache-first InnovationHub in src/domain/innovationHub/useInnovationHub/useInnovationHub.ts"
Task T013: "Cache-first PendingInvitationsCount in src/domain/community/pendingMembership/usePendingInvitationsCount.ts"

# Also parallel:
Task T009: "Replace CampaignBlockCredentials query in CampaignBlock.tsx" (parallel with T010-T014)
Task T009: "Replace CampaignBlockCredentials query in CampaignBlock.tsx" (parallel with T010-T013)

# Then sequential (depends on above):
Task T015: "Smoke test home page"
```

---

## Implementation Strategy (updated post-implementation)

### MVP First (User Story 1 Only)

1. ~~Complete Phase 1: Apollo BatchHttpLink setup (T001-T003)~~ DROPPED
2. Complete Phase 2: Retry tuning (T004)
3. Complete Phase 3: Auth page optimization (T005-T008)
4. **STOP and VALIDATE**: Auth pages load faster, no WebSocket/geo overhead
5. Deploy/demo — immediate value for all users hitting login/signup

### Incremental Delivery (as executed)

1. Phase 2 → Retry tuning (foundation)
2. Phase 3 (US1) → Auth pages optimized (lazy WS, skip geo/APM) → **MVP!**
3. Phase 4 (US2) → Home page queries reduced (eliminate redundant queries, cache-first)
4. Phase 5 (US3) → Startup waterfall eliminated (provider reorder, skip condition fix)
5. Phase 6 (US4) → WebSocket fully lazy (validated)
6. Phase 7 → Full validation + cleanup → Final release

### Risk Ordering

The phases are ordered by risk (lowest first):

- **Phase 2** (retry tuning): Single line change, zero risk
- **Phase 3** (lazy WS + auth page skip): Low risk, isolated changes
- **Phase 4** (query elimination): Medium risk, need to verify data availability from context/cache
- **Phase 5** (provider tree restructuring): Highest risk, affects app startup for all pages

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- HAR baseline (15 queries, 4769ms waterfall) is the measurement target
- All changes are client-only — no server-side modifications needed
