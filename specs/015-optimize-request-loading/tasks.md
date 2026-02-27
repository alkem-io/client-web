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

## Phase 1: Setup (Apollo Batching Infrastructure)

**Purpose**: Add BatchHttpLink to the Apollo link chain — prerequisite for all query batching optimizations.

- [ ] T001 Add `@apollo/client/link/batch-http` import and create `BatchHttpLink` instance with `batchInterval: 10` and `batchMax: 10` in `src/core/apollo/graphqlLinks/httpLink.ts` — see `contracts/apollo-link-chain.md` for config
- [ ] T002 Modify the terminal link split in `src/core/apollo/graphqlLinks/httpLink.ts` (or `src/core/apollo/hooks/useGraphQLClient.ts` depending on where the split is composed) to route: subscriptions → wsLink, uploads → uploadLink, default → batchHttpLink — see `contracts/apollo-link-chain.md` three-way split
- [ ] T003 Verify batching works: run `pnpm start`, open DevTools Network tab, confirm multiple GraphQL queries are combined into single POST requests with array body

**Checkpoint**: Apollo batching is operational. All existing queries continue to work. Uploads and subscriptions still route correctly.

---

## Phase 2: Foundational (Retry Tuning)

**Purpose**: Quick, low-risk change that improves error recovery across all pages.

- [ ] T004 Reduce retry link initial delay from `1000` to `300` in `src/core/apollo/graphqlLinks/retryLink.ts` (line ~12, change `initial: 1000` to `initial: 300`, keep `max: 5000` and `jitter: true`)

**Checkpoint**: Retry behavior improved. No functional change for happy path.

---

## Phase 3: User Story 1 — Faster Auth Page Load (Priority: P1) 🎯 MVP

**Goal**: Auth pages (login, signup, signin) load without WebSocket overhead, geo-location calls, or analytics initialization.

**Independent Test**: Load `/login` in DevTools — verify no WebSocket connection in WS tab, no geo-location request, config and auth check run concurrently in Network timeline.

### Implementation for User Story 1

- [ ] T005 [US1] Set `lazy: true` on the `graphql-ws` client in `src/core/apollo/graphqlLinks/httpLink.ts` (change `lazy: false` to `lazy: true`, replace `onNonLazyError` with `on: { error: ... }` handler) — see `contracts/apollo-link-chain.md` WebSocket section
- [ ] T006 [P] [US1] Add auth page skip condition in `src/core/analytics/geo/UserGeoProvider.tsx` — use `useLocation()` to detect paths starting with `/login`, `/registration`, `/sign_up` and skip geo-location fetch when on those paths
- [ ] T007 [P] [US1] Add auth page skip condition in `src/core/analytics/apm/context/ApmProvider.tsx` — same route check pattern as T006, skip APM initialization on auth pages
- [ ] T008 [US1] Smoke test: navigate to `/login`, `/registration`, `/sign_up` — verify no WebSocket connection, no geo request, page loads and auth flow works correctly. Then navigate to home page — verify WebSocket connects on-demand when notifications component renders.

**Checkpoint**: Auth pages are fully functional with reduced overhead. WebSocket only connects when subscriptions are needed.

---

## Phase 4: User Story 2 — Faster Home Page Load (Priority: P2)

**Goal**: Eliminate redundant queries and optimize fetch policies on the home page dashboard.

**Independent Test**: Load `/home` as authenticated user in DevTools — verify CampaignBlockCredentials query is absent, InnovationHubBannerWide query is absent, PendingInvitations skipped when count=0. Count total GraphQL requests and compare to HAR baseline (15).

### Implementation for User Story 2

- [ ] T009 [US2] Replace `useCampaignBlockCredentialsQuery` in `src/main/topLevelPages/myDashboard/Campaigns/CampaignBlock.tsx` with data from `useCurrentUserContext()` — read `platformRoles` (replaces `platform.roleSet.myRoles`) and `accountEntitlements` (replaces `me.user.account.license.availableEntitlements`). Remove the query import and call. Keep the rendering logic and conditional checks intact. See `contracts/query-consolidation.md` CampaignBlockCredentials section.
- [ ] T010 [P] [US2] Eliminate `InnovationHubBannerWide` query from `src/domain/innovationHub/useSpaceBreadcrumbsTopLevelItem.ts` — instead of firing a separate `useInnovationHubBannerWideQuery`, read the banner data from Apollo's normalized cache (populated by the `InnovationHub` query) or from the `useInnovationHub` hook result. Ensure the breadcrumb root item still displays the Innovation Hub banner. See `research.md` R-009.
- [ ] T011 [P] [US2] Add conditional skip to PendingInvitations query in `src/main/topLevelPages/myDashboard/InvitationsBlock/InvitationsBlock.tsx` — pass a `skip` option to `usePendingInvitationsQuery` that skips when the pending invitations count is 0. This requires reading the count from `usePendingInvitationsCount` hook or context and passing it as a skip condition. See `research.md` R-010.
- [ ] T012 [P] [US2] Set `fetchPolicy: 'cache-first'` on `useInnovationHubQuery` in `src/domain/innovationHub/useInnovationHub/useInnovationHub.ts` — Innovation Hub data rarely changes during a session. Existing cache is populated on first load. See `research.md` R-011 for root cause analysis.
- [ ] T013 [P] [US2] Set `fetchPolicy: 'cache-first'` on `usePendingInvitationsCountQuery` in `src/domain/community/pendingMembership/usePendingInvitationsCount.ts` — count only changes after user action (accept/reject), which already explicitly refetches. See `research.md` R-011.
- [ ] T014 [P] [US2] Eliminate HomeSpaceLookup waterfall in `src/main/topLevelPages/myDashboard/recentSpaces/RecentSpacesList.tsx` — read `homeSpaceId` from `useCurrentUserContext()` (available from `CurrentUserFull` → `UserDetails` fragment → `settings.homeSpace.spaceID`) instead of waiting for `useRecentSpacesQuery` result. This allows `useHomeSpaceLookupQuery` to fire immediately (or be batched with RecentSpaces via BatchHttpLink). See `research.md` R-007 and `contracts/query-consolidation.md` HomeSpaceLookup section.
- [ ] T015 [US2] Smoke test: load `/home` as authenticated user — verify CampaignBlock renders correctly using context data, breadcrumbs show Innovation Hub banner without separate query, invitation count badge works, InnovationHub and PendingInvitationsCount don't refetch on in-app navigation, HomeSpaceLookup fires without waiting for RecentSpaces.

**Checkpoint**: Home page fires fewer queries with no redundant data fetching. All dashboard features remain functional.

---

## Phase 5: User Story 3 — Eliminate Authentication Waterfall (Priority: P3)

**Goal**: Parallelize config + auth startup and eliminate the CurrentUserFull → PlatformLevelAuthorization waterfall.

**Independent Test**: Load any page in DevTools Network timeline — verify config and Kratos whoami fire concurrently (overlapping bars), and CurrentUserFull + PlatformLevelAuthorization fire in the same batch (single HTTP request).

### Implementation for User Story 3

- [ ] T016 [US3] Simplify `usePlatformLevelAuthorizationQuery` skip condition in `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx` — change `skip: !user || !isAuthenticated` to `skip: !isAuthenticated`. This allows PlatformLevelAuthorization to fire in the same tick as CurrentUserFull, enabling BatchHttpLink to combine them. Verify the composite loading state (`loading` from both queries) still works correctly. See `contracts/provider-tree.md` UserProvider section and `research.md` R-003.
- [ ] T017 [US3] Create `ParallelStartupProvider` component in `src/core/startup/ParallelStartupProvider.tsx` that runs `ConfigProvider` and `AuthenticationProvider` concurrently — this replaces the current sequential nesting where `AuthenticationProvider` is nested inside `ConfigProvider`. The new component should: (a) start both config fetch and Kratos session check simultaneously, (b) show loading state until BOTH complete, (c) preserve existing `useConfig()` and `useAuthenticationContext()` hook contracts by providing their contexts. See `contracts/provider-tree.md` for proposed provider tree and type contract.
- [ ] T018 [US3] Restructure provider tree in `src/root.tsx` — replace the current sequential `ConfigProvider > ... > AuthenticationProvider` nesting with the new `ParallelStartupProvider`. Move `AuthenticationProvider` out of its current position nested under `ConfigProvider` and into the parallel coordinator. Ensure `SentryTransactionScope`, `SentryErrorBoundary`, and other providers that depend on config still receive it correctly. See `contracts/provider-tree.md` for before/after tree structure.
- [ ] T019 [US3] Smoke test: load `/home` and `/login` — verify in Network timeline that config query and Kratos whoami fire concurrently (overlapping), CurrentUserFull and PlatformLevelAuthorization appear in the same batched request, Sentry and APM still initialize correctly, all existing functionality works.

**Checkpoint**: App startup waterfall is reduced by ~754ms. Config and auth are parallel. User + authorization queries are batched.

---

## Phase 6: User Story 4 — Deferred Non-Essential Connections (Priority: P4)

**Goal**: WebSocket connects only when a subscription is first activated, not on page load.

**Independent Test**: Already achieved by T005 (lazy WebSocket). This phase validates the broader behavior across all pages.

### Implementation for User Story 4

- [ ] T020 [US4] Validate lazy WebSocket behavior across all page types — navigate to: (a) `/login` — no WS connection, (b) `/home` as authenticated user — WS connects when notification subscription activates, (c) public space page — no WS connection unless real-time feature is present, (d) whiteboard page — WS connects for collaboration. Document any pages where lazy connection causes issues.
- [ ] T021 [US4] If T020 reveals any issues with lazy WebSocket (e.g., subscription errors, delayed connections, reconnection failures), fix them in `src/core/apollo/graphqlLinks/httpLink.ts` by adjusting the `graphql-ws` client configuration (retry attempts, connection timeout, etc.)

**Checkpoint**: WebSocket is fully lazy across all pages. No regressions in real-time features.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and regression testing.

- [ ] T022 Run full test suite: `pnpm vitest run` — all 247 tests must pass with no regressions (SC-006)
- [ ] T023 Run linter: `pnpm lint` — no new warnings or errors introduced
- [ ] T024 Remove unused imports and dead code from modified files — specifically: unused `CampaignBlockCredentials` query/hook imports in `CampaignBlock.tsx`, unused `InnovationHubBannerWide` query/hook imports in `useSpaceBreadcrumbsTopLevelItem.ts`, `onNonLazyError` references in `httpLink.ts`
- [ ] T025 [P] HAR comparison test: record new HAR file on `/home` and compare to baseline — verify: (a) total GraphQL requests reduced from 15 to ~12, (b) HTTP requests reduced from 15 to ~5 via batching, (c) no CampaignBlockCredentials or InnovationHubBannerWide in the trace, (d) CurrentUserFull + PlatformLevelAuthorization appear in same batch
- [ ] T026 [P] Run quickstart.md testing checklist — work through each item in `specs/015-optimize-request-loading/quickstart.md` Testing Checklist section

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. BLOCKS Phase 3-6 (batching required for query consolidation).
- **Phase 2 (Foundational)**: No dependencies — can run in parallel with Phase 1.
- **Phase 3 (US1)**: Depends on Phase 1 (T005 modifies same file as T001-T002). Can start after T001-T002 complete.
- **Phase 4 (US2)**: Depends on Phase 1 (batching must work for query reduction to be measurable). All T009-T014 are independent of each other.
- **Phase 5 (US3)**: Depends on Phase 1 (batching required for T016 to produce single HTTP request). T016-T017 are the most complex tasks.
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
Task T014: "Eliminate HomeSpaceLookup waterfall in RecentSpacesList.tsx"

# Then sequential (depends on above):
Task T015: "Smoke test home page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Apollo BatchHttpLink setup (T001-T003)
2. Complete Phase 2: Retry tuning (T004)
3. Complete Phase 3: Auth page optimization (T005-T008)
4. **STOP and VALIDATE**: Auth pages load faster, no WebSocket/geo overhead
5. Deploy/demo — immediate value for all users hitting login/signup

### Incremental Delivery

1. Phase 1 + 2 → Batching + retry ready (foundation)
2. Add US1 (Phase 3) → Auth pages optimized → **MVP!**
3. Add US2 (Phase 4) → Home page queries reduced → Deploy
4. Add US3 (Phase 5) → Startup waterfall eliminated → Deploy
5. Add US4 (Phase 6) → WebSocket fully lazy → Deploy
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
