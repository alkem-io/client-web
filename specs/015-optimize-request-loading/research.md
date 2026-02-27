# Research: Optimize Request Loading Performance

**Date**: 2026-02-26 | **Updated**: 2026-02-27 (HAR analysis) | **Branch**: `015-optimize-request-loading`

## HAR Analysis Summary

Real measurements from `localhost.har` (authenticated home page load):

- **Total queries**: 15 GraphQL + 1 Kratos whoami + 1 WebSocket = 17 network requests
- **Total waterfall**: 4769ms from first API call to last response
- **Confirmed waterfalls**: Config→Auth (204ms gap), CurrentUserFull→PlatformLevelAuth (550ms)
- **Rendering gaps**: 1487ms between auth chain and dashboard queries (JS execution, not network)
- **Redundant queries confirmed**: CampaignBlockCredentials, InnovationHubBannerWide
- **New queries discovered** (not in original analysis): UserConversationsUnreadCount, InnovationHubBannerWide, PendingInvitationsCount, PendingInvitations, ExploreAllSpaces
- **Queries NOT present** (conditional paths): RecentSpaces, HomeSpaceLookup, DashboardWithMemberships (user has no space memberships)

---

## R-001: Apollo Query Batching Strategy

**Decision**: Use Apollo `BatchHttpLink` to combine multiple independent GraphQL queries into a single HTTP request, replacing the current single `HttpLink` (via `createUploadLink`).

**Rationale**: The project currently has no batching configured. All queries fire as individual HTTP requests. Apollo's `BatchHttpLink` can transparently batch queries dispatched within the same event loop tick into a single POST, reducing network round-trips without requiring server schema changes. The server must support array-based batched queries (standard in most GraphQL servers including Apollo Server).

**Alternatives considered**:

- **Manual query merging**: Combining GraphQL documents client-side. Rejected — requires extensive refactoring of generated hooks, fragments, and cache policies. Violates constitution principle III (GraphQL Contract Fidelity) by bypassing generated hooks.
- **DataLoader pattern**: Server-side batching. Rejected — spec explicitly requires client-only changes (no server modifications per clarification session).
- **`@defer` / `@stream` directives**: GraphQL incremental delivery. Rejected — requires server support and Apollo Client experimental features; higher risk for current scope.

**Key implementation details**:

- `@apollo/client` 3.x includes `BatchHttpLink` in the main package
- `apollo-upload-client` (used for file uploads) is not compatible with `BatchHttpLink` directly; a split link is needed to route upload mutations to the upload link and everything else to the batch link
- Batch window default is 10ms (configurable via `batchInterval`)
- Max batch size should be capped (e.g., 10 operations) to avoid oversized payloads

---

## R-002: Config + Auth Parallelization

**Decision**: Move `AuthenticationProvider` (Kratos whoami check) to render alongside `ConfigProvider` rather than nested inside it, so both can execute concurrently.

**Rationale**: Currently `ConfigProvider` blocks all child rendering (shows spinner at `ConfigProvider.tsx:55-57`). `AuthenticationProvider` is nested inside it (`root.tsx:129`), so the Kratos session check cannot begin until config loads. These two have no data dependency — auth check talks to Kratos (identity provider), config check talks to the GraphQL public endpoint.

**Alternatives considered**:

- **Prefetch config in `index.html`**: Inject config via `<script>` tag. Rejected — would require build pipeline changes and complicate runtime env injection pattern (`buildConfiguration.js` → `window._env_`).
- **Service worker pre-cache**: Cache config response. Rejected — adds complexity and service worker is already used for versioning; mixing concerns increases risk.
- **Remove config blocking entirely**: Let app render with partial config. Rejected — many providers depend on config values (Sentry DSN, APM endpoint, feature flags). Rendering without config causes cascading errors.

**Key implementation details**:

- `AuthenticationProvider` uses `useWhoami()` hook which calls `kratosClient.toSession()` — pure HTTP, no dependency on config
- After both complete, the rest of the provider tree can render
- Need a lightweight coordinator component that waits for both `config` and `auth` to be ready before rendering children
- `UserGeoProvider` and `ApmProvider` genuinely depend on config and must remain nested under ConfigProvider

---

## R-003: User + Authorization Query Batching

**Decision**: Remove the `skip: !user` condition from `usePlatformLevelAuthorizationQuery` and instead use `skip: !isAuthenticated` (same as `useCurrentUserFullQuery`), allowing both queries to fire simultaneously and be batched into a single HTTP request by `BatchHttpLink`.

**Rationale**: The current waterfall exists because `PlatformLevelAuthorization` has `skip: !user || !isAuthenticated` — it waits for the user object from `CurrentUserFull`. However, `PlatformLevelAuthorization` queries `platform.roleSet.myRoles` and `platform.authorization.myPrivileges`, which are server-resolved based on the authenticated session (cookies), not on any user ID passed as a variable. Therefore, the `!user` skip condition is unnecessary — `!isAuthenticated` alone is sufficient.

**Alternatives considered**:

- **Merge into single GraphQL document**: Combine `CurrentUserFull` and `PlatformLevelAuthorization` into one `.graphql` file. Rejected — violates separation of concerns, makes cache invalidation harder, and requires codegen changes.
- **Keep waterfall, just batch other queries**: Leave this waterfall as-is and only batch home page queries. Rejected — this waterfall affects every authenticated page load, not just the home page; fixing it has the broadest impact.

**Key implementation details**:

- Change `CurrentUserProvider.tsx:37-38` from `skip: !user || !isAuthenticated` to `skip: !isAuthenticated`
- Both queries will fire in the same tick when `isAuthenticated` becomes `true`
- `BatchHttpLink` will combine them into a single HTTP request
- Authorization data arrives slightly earlier; `user` object may arrive slightly later — the composite `loading` state already handles this correctly

---

## R-004: WebSocket Lazy Connection

**Decision**: Set `lazy: true` on the `graphql-ws` client configuration in `httpLink.ts`.

**Rationale**: Currently `lazy: false` (at `httpLink.ts:27`) causes the WebSocket connection to be established immediately on Apollo Client creation, even for pages that never use subscriptions (login, signup, signin, many read-only pages). Setting `lazy: true` defers the TCP+TLS handshake until the first subscription is actually activated.

**Alternatives considered**:

- **Disable WebSocket entirely for unauthenticated users**: Create two Apollo Client instances. Rejected — adds significant complexity, cache management issues, and provider restructuring.
- **Use HTTP polling instead of WebSocket**: Replace subscriptions with `pollInterval` on queries. Rejected — higher server load, worse latency for real-time features, and unnecessary regression in UX for authenticated users.

**Key implementation details**:

- Change `lazy: false` to `lazy: true` at `httpLink.ts:27`
- Remove `onNonLazyError` handler (only relevant when `lazy: false`) and replace with `on.error` handler for the lazy connection
- The `graphql-ws` library natively supports lazy connections with automatic connect-on-first-subscribe behavior
- Existing retry configuration (`retryAttempts: 5`) continues to work with lazy mode
- Per spec clarification: sub-second delay in notification delivery is acceptable

---

## R-005: Retry Link Tuning

**Decision**: Reduce `initial` retry delay from 1000ms to 300ms. Keep `max: 5000ms`, `jitter: true`, and `max attempts: 5`.

**Rationale**: A 1-second initial delay is excessive for transient network errors. Most transient failures (connection resets, brief server hiccups) resolve within milliseconds. A 300ms initial delay provides faster recovery while still avoiding thundering herd effects (jitter is preserved).

**Alternatives considered**:

- **100ms initial delay**: Even faster recovery. Rejected — too aggressive for production; could cause rapid-fire retries during brief outages.
- **Remove retry link entirely**: Rely on Apollo's built-in error handling. Rejected — no automatic retry means every transient error immediately surfaces to the user as a failure.
- **Reduce max attempts to 3**: Fewer retries. Rejected — keeping 5 attempts is safer for intermittent connectivity issues; the jitter prevents server overload.

**Key implementation details**:

- Change `initial: 1000` to `initial: 300` at `retryLink.ts:12`
- Total worst-case retry time changes from ~17s to ~15.3s (300ms → 600ms → 1200ms → 2400ms → 5000ms with jitter)
- The `retryIf` condition remains unchanged (no retry on 400/401/403/500/redirects)

---

## R-006: CampaignBlock Redundancy Elimination

**Decision**: Replace `useCampaignBlockCredentialsQuery` in `CampaignBlock.tsx` with data from `useCurrentUserContext()`, which already provides `platformRoles` and `accountEntitlements`.

**Rationale**: The `CampaignBlockCredentials` query fetches `platform.roleSet.myRoles` and `me.user.account.license.availableEntitlements` — both of which are already fetched by `CurrentUserFull` + `PlatformLevelAuthorization` and exposed via `CurrentUserProvider` context. This eliminates one entire GraphQL query on every home page load.

**Alternatives considered**:

- **Keep query but use `cache-only` fetch policy**: Read from Apollo cache. Rejected — still creates a separate cache read operation and the data is already in React context, making this unnecessary indirection.
- **Merge CampaignBlock query into another query**: Combine with another home page query. Rejected — unnecessary complexity when the data is already available from context.

**Key implementation details**:

- Remove `useCampaignBlockCredentialsQuery` import and call from `CampaignBlock.tsx`
- Import `useCurrentUserContext` and read `platformRoles` and `accountEntitlements` from it
- Delete `CampaignBlock.graphql` (or keep for reference; generated hook becomes unused)
- The `fetchPolicy: 'cache-and-network'` on this query was causing an unnecessary network request every time — eliminating the query solves this

---

## R-007: RecentSpaces + HomeSpaceLookup Waterfall

**Decision**: Eliminate the `HomeSpaceLookup` waterfall by reading `homeSpaceId` from `useCurrentUserContext()` (available from `CurrentUserFull` via `UserDetails` fragment) and either pre-fetching the home space data or restructuring the component to avoid the cascade.

**Rationale**: Currently `RecentSpacesList.tsx:27` fires `useRecentSpacesQuery` which returns `homeSpaceId`, then `useHomeSpaceLookupQuery` fires at line 30-33 with that ID. However, `homeSpaceId` is already available from `CurrentUserFull` → `UserDetails` fragment → `settings.homeSpace.spaceID`. By reading it from context instead of from the RecentSpaces query result, the HomeSpaceLookup query can fire immediately (or be batched with RecentSpaces) rather than waiting.

**Alternatives considered**:

- **Inline home space data in RecentSpaces query**: Add home space details to the RecentSpaces GraphQL document. Rejected — requires understanding if the server can resolve `lookup.space` inline with `me.mySpaces`, and we're avoiding server changes.
- **Remove HomeSpaceLookup entirely**: Show home space from the `mySpaces` list. Rejected — home space might not be in the recent spaces list, so a separate lookup is genuinely needed.

**Key implementation details**:

- Read `homeSpaceId` from `useCurrentUserContext()` (or `useRecentSpacesQuery` result — whichever is available first via Apollo cache)
- Fire `useHomeSpaceLookupQuery` with `skip: !homeSpaceId` where `homeSpaceId` comes from context instead of from the RecentSpaces query
- With batching enabled, both RecentSpaces and HomeSpaceLookup can fire in the same batch if `homeSpaceId` is already known from context

---

## R-008: Auth Page Overhead Reduction

**Decision**: Conditionally skip `UserGeoProvider` and `ApmProvider` initialization on authentication pages by checking the current route.

**Rationale**: Auth pages (login, signup, signin) don't need geo-location data or APM user context. These calls add latency without providing value for unauthenticated users on auth pages. The providers can be initialized after authentication succeeds.

**Alternatives considered**:

- **Lazy-load entire provider tree for auth pages**: Use different root components for auth vs app. Rejected — too much restructuring; auth pages still need ConfigProvider and basic theming.
- **Move geo + APM to inside authenticated routes only**: Nest them deeper in the tree. Rejected — APM should track all users (including errors on non-auth pages for unauthenticated users viewing public content). Better to skip only on auth-specific routes.

**Key implementation details**:

- Add route check in `UserGeoProvider` and `ApmProvider` to skip initialization when on `/login`, `/registration`, or `/sign_up` paths
- Use `useLocation()` from React Router to detect auth pages
- These providers already have skip conditions (`skipOnLocal`, `!geoEndpoint`) — adding a route-based skip is consistent with the existing pattern

---

## R-009: InnovationHubBannerWide Elimination (from HAR analysis)

**Decision**: Eliminate the `InnovationHubBannerWide` query. Read banner data from the `InnovationHub` query result or Apollo cache instead.

**Rationale**: HAR shows `InnovationHubBannerWide` fires at T+3636ms on every page (breadcrumb mount). It fetches `platform.innovationHub.profile.bannerWide` — a subset of data that the `InnovationHub` query (T+3641ms, same timing) also fetches. These two queries fire nearly simultaneously, fetching overlapping Innovation Hub profile data.

**Key implementation details**:

- `InnovationHubBannerWide` is called from `useSpaceBreadcrumbsTopLevelItem.ts` (breadcrumbs)
- The `InnovationHub` query fetches hub profile which can include the banner visual
- Read the banner from Apollo's normalized cache after `InnovationHub` populates it, or merge into `InnovationHub` query

---

## R-010: PendingInvitations Conditional Skip (from HAR analysis)

**Decision**: Skip the `PendingInvitations` full-list query when `PendingInvitationsCount` returns 0.

**Rationale**: HAR shows both `PendingInvitationsCount` (T+3709ms, 275ms) and `PendingInvitations` (T+4572ms, 155ms) fire on every dashboard load. When no invitations exist (common case), the full list query is wasted — `InvitationsBlock` already returns `null` for empty lists.

**Key implementation details**:

- Add `skip` condition to `usePendingInvitationsQuery` based on count result
- This creates a minor waterfall (count → list) but saves the entire list request in the common no-invitations case
- When invitations exist, the count resolves quickly (lightweight query) and the list fires promptly

---

## R-011: Fetch Policy Optimization (from HAR analysis)

**Decision**: Change `PendingInvitationsCount` and `InnovationHub` to `cache-first` fetch policy.

**Rationale**: HAR shows these queries fire on every page load/navigation. Their data rarely changes during a session:

- `PendingInvitationsCount`: Only changes after user accepts/rejects (already has explicit refetch on action)
- `InnovationHub`: Platform-level data that changes rarely

Current default fetch policy causes unnecessary network requests on every navigation.

**Key implementation details**:

- Add `fetchPolicy: 'cache-first'` to both hooks
- Existing refetch patterns (on user action for invitations, on navigation for hub) ensure cache stays fresh when it matters
