# Feature Specification: Optimize Request Loading Performance

**Feature Branch**: `015-optimize-request-loading`
**Created**: 2026-02-26
**Status**: Implemented
**Input**: Reduce requests, duplications, bad timing, and payload size to improve page load performance for home, login, signup, and signin pages.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Faster Auth Page Load (Priority: P1)

As an unauthenticated user navigating to the login, signup, or signin page, I want the page to render quickly without unnecessary delays from background processes that are irrelevant to my current task (logging in or registering).

**Why this priority**: Auth pages are the gateway to the entire platform. Every user must pass through them, and slow auth pages directly increase bounce rates and user frustration. These pages currently pay for overhead they don't need (eager WebSocket connections, geo-location calls, blocking config queries).

**Independent Test**: Can be tested by measuring Time to Interactive (TTI) on auth pages before and after changes. Delivers immediate value to every new and returning user.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they navigate to the login page, **Then** the page becomes interactive without waiting for non-essential background services (WebSocket, geo-location, analytics).
2. **Given** an unauthenticated user on the login page, **When** the page loads, **Then** no WebSocket connection is established until the user is authenticated and navigates to a page that requires real-time features.

---

### User Story 2 - Faster Home Page Load for Authenticated Users (Priority: P2)

As an authenticated user arriving at my dashboard (home page), I want the page to load quickly without redundant server requests or unnecessary sequential query chains that delay content display.

**Why this priority**: The home page is the most frequently visited page for authenticated users. It currently fires 8+ queries with multiple waterfall chains and redundant data fetching, which creates a compounding delay before meaningful content appears.

**Independent Test**: Can be tested by measuring the number of network requests and total load time for the home page before and after changes. Delivers value to all active platform users.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they load the home page, **Then** platform roles and user credentials are fetched once (not duplicated across multiple queries).
2. **Given** an authenticated user, **When** they load the home page, **Then** queries that can run in parallel do so rather than waiting for each other in a waterfall pattern.
3. **Given** an authenticated user, **When** they load the home page, **Then** the total number of network requests is reduced compared to the current baseline.

---

### User Story 3 - Eliminate Authentication Waterfall (Priority: P3)

As any user (authenticated or not), I want the initial app startup sequence to be as fast as possible by avoiding unnecessary sequential dependencies between the configuration check, authentication check, and user data loading.

**Why this priority**: The three-stage waterfall (config -> auth check -> user data -> authorization) adds cumulative latency on every single page load across the entire application. Reducing this cascade benefits all users on all pages.

**Independent Test**: Can be tested by measuring the time between app start and first meaningful render. Delivers value across every page in the application.

**Acceptance Scenarios**:

1. **Given** any user, **When** the application starts, **Then** the configuration query and authentication status check execute concurrently rather than sequentially.
2. **Given** an unauthenticated user, **When** they navigate to the signup page, **Then** the configuration loading and authentication status check happen concurrently rather than sequentially.
3. **Given** an authenticated user, **When** the application starts, **Then** user profile data and platform-level authorization data are fetched in parallel rather than sequentially.
4. **Given** any user on a slow network, **When** a request fails, **Then** the retry mechanism uses a shorter initial delay before the first retry attempt.

---

### User Story 4 - Deferred Non-Essential Connections (Priority: P4)

As any user, I want the application to only establish real-time connections (WebSocket) when I actually need them, not on every page load regardless of whether real-time features are visible.

**Why this priority**: The eager WebSocket connection adds TCP+TLS handshake overhead on every page load, including pages that never use subscriptions. Deferring this connection saves bandwidth and reduces time to interactive.

**Independent Test**: Can be tested by observing network connections on page load and verifying no WebSocket connection is made until a subscription is actually needed.

**Acceptance Scenarios**:

1. **Given** any user on any page, **When** the page loads, **Then** a WebSocket connection is only established when a component that requires real-time updates is rendered.
2. **Given** a user on the login page, **When** the page loads, **Then** no WebSocket connection is attempted.
3. **Given** an authenticated user on the home page, **When** the notification system activates, **Then** the WebSocket connection is established on-demand.

---

### Edge Cases

- What happens when the configuration query fails? The app should still attempt the auth check and display an appropriate error rather than hanging indefinitely.
- What happens when the WebSocket connection fails on-demand? The app should gracefully fall back to polling or display a non-blocking warning rather than blocking the feature that requested it.
- What happens when parallelized queries return partial data (e.g., user data succeeds but authorization data fails)? The app should handle partial results gracefully.
- What happens when the retry mechanism reaches its maximum attempts? The user should see a meaningful error message rather than a silent failure.
- What happens during the transition period where some queries are merged but cached data from the old query shape still exists? Cache should be properly invalidated or migrated.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The application MUST execute the configuration query and authentication status check concurrently during app startup rather than sequentially.
- **FR-002**: The application MUST fire user profile data and platform-level authorization queries in parallel for authenticated users by simplifying the skip condition, rather than executing them as two sequential requests. _(Originally planned to use Apollo BatchHttpLink for single-request batching, but this was dropped — HTTP/2 multiplexing already handles concurrent requests efficiently, and the 10ms batch window added latency.)_
- **FR-003**: The application MUST defer WebSocket connection establishment until a component that requires real-time data (subscriptions) is actually rendered.
- **FR-004**: The application MUST NOT establish WebSocket connections on authentication pages (login, signup, signin). (Specific validation criterion of FR-003.)
- **FR-005**: The application MUST NOT make geo-location or analytics initialization calls on authentication pages.
- **FR-006**: The application MUST reduce the initial retry delay for failed requests from 1000ms to 300ms to provide faster recovery from transient failures.
- **FR-007**: The application MUST NOT fetch the same data (platform roles, user credentials) in multiple separate queries on the home page when it can be consolidated.
- **FR-008**: ~~The application MUST eliminate the cascading dependency between the home space details query and the recent spaces query by reading `homeSpaceId` from the already-loaded user context.~~ _(Not applicable — HAR analysis showed RecentSpaces and HomeSpaceLookup queries were not present in the measured user path, as the test user had no space memberships. This optimization was not needed for the measured scenario.)_
- **FR-009**: The application MUST maintain all existing functionality and user-visible behavior after these optimizations (no regressions).
- **FR-010**: The application MUST continue to properly skip user-specific queries on unauthenticated pages.
- **FR-011**: The application MUST NOT fire the InnovationHubBannerWide query separately when the same data is available from the InnovationHub query or Apollo cache.
- **FR-012**: The application MUST skip the full PendingInvitations list query when PendingInvitationsCount returns zero.
- **FR-013**: The application MUST use cache-first fetch policy for data that rarely changes during a session (Innovation Hub data, pending invitation counts) to avoid unnecessary network requests on navigation.

### Key Entities

- **Configuration**: Platform settings, feature flags, authentication provider details, and service metadata. Required before rendering the app shell.
- **User Session**: Authentication state from the identity provider (Kratos). Determines whether user-specific queries should execute.
- **User Profile + Authorization**: Combined user identity, account details, and platform-level permissions. Currently split across two sequential queries.
- **Dashboard Data**: Recent spaces, resources, contributions, and campaign information displayed on the home page. Currently fetched via multiple redundant and cascading queries.

## Clarifications

### Session 2026-02-26

- Q: If the server schema cannot be modified, what should the approach be for merging queries? → A: Client-only — simplify skip conditions so queries fire in parallel, eliminate redundant queries, and use cache-first policies. _(Apollo BatchHttpLink was explored but dropped — it added a 10ms forced delay per query and held fast queries back until the slowest completed. HTTP/2 multiplexing already handles concurrent requests efficiently.)_
- Q: Is a brief delay in notification delivery acceptable when deferring WebSocket connection? → A: Yes — a sub-second delay in notification delivery is acceptable for the performance gain of deferred WebSocket connections.

## Assumptions

- No server-side GraphQL schema changes are required. Waterfall elimination is achieved client-side by simplifying skip conditions (so queries fire in parallel), eliminating redundant queries, and using cache-first fetch policies.
- The notification subscription is the primary consumer of the WebSocket connection; deferring it will not break other real-time features.
- The geo-location endpoint and analytics initialization on auth pages provide negligible value and can safely be deferred until after authentication.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Authentication pages (login, signup, signin) reach interactive state at least 30% faster than the current baseline, measured by Time to Interactive (TTI).
- **SC-002**: The number of GraphQL queries fired during home page load for authenticated users is reduced compared to the current baseline (HAR baseline: 15 GraphQL queries). _(Originally targeted 25% reduction including HTTP request batching. Batching was dropped, but query elimination still removes 2-3 queries.)_
- **SC-003**: No duplicate data is fetched across multiple queries on the same page (platform roles, user credentials appear in exactly one query per page load).
- **SC-004**: The application startup waterfall (from first request to first meaningful content) is reduced by at least 200ms on average by parallelizing the config and auth checks.
- **SC-005**: No WebSocket connections are established on pages that do not use real-time subscriptions.
- **SC-006**: All existing tests continue to pass with no regressions in functionality.
- **SC-007**: Failed request retry begins within 300ms (reduced from 1000ms), improving perceived recovery time for transient errors.
