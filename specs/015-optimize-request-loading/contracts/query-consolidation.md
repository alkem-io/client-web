# Contract: Query Consolidation

**Date**: 2026-02-26 | **Updated**: 2026-03-03 (post-implementation)

## HAR Baseline (Real Measurements)

Source: `localhost.har` — authenticated home page load, dev server.

**Page timing**: onContentLoad 7157ms, onLoad 7514ms
**API waterfall**: 4769ms from first API call to last response (15 GraphQL queries + 1 Kratos + 1 WebSocket)

### Actual Request Timeline (relative to first API call)

```
T+0ms      Configuration (public)          151ms   ████
T+350ms    WebSocket /graphql              1014ms   ░░░░░░░░░░░░░░░░░░░░░░░░░░
T+355ms    Kratos whoami                    243ms   ██████
T+603ms    CurrentUserFull                  746ms        ███████████████████
T+1355ms   PlatformLevelAuthorization       550ms                          ██████████████
T+1356ms   InAppNotificationsUnreadCount    269ms                          ███████
           ─── 1487ms gap (React rendering / component mounting) ───
T+3392ms   UserConversationsUnreadCount      56ms   ██
T+3636ms   InnovationHubBannerWide           64ms   ██
T+3641ms   InnovationHub                     57ms   ██
T+3709ms   PendingInvitationsCount          275ms   ███████
T+4090ms   LatestContributionsSpacesFlat     77ms        ██
           ─── 395ms gap ───
T+4562ms   MyResources                       95ms             ██
T+4566ms   CampaignBlockCredentials         203ms             █████
T+4572ms   PendingInvitations              155ms             ████
T+4579ms   ExploreAllSpaces                107ms             ███
T+4582ms   latestReleaseDiscussion         114ms             ███
```

### Key Observations from HAR

1. **Config → Whoami gap: 204ms** — ConfigProvider blocks React tree; AuthenticationProvider can't mount until config renders. Parallelizing saves this gap.
2. **CurrentUserFull → PlatformLevelAuth waterfall: confirmed 550ms** — PlatformLevelAuth starts 6ms after CurrentUserFull ends (T+1349 → T+1355).
3. **1487ms rendering gap** between Chain 2 (auth queries) and Chain 3 (dashboard queries) — this is JS execution / component mounting, not network. Batching won't help here, but reducing waterfall in Chain 2 means components mount sooner.
4. **6 chains of requests** — queries trickle in across 4.7 seconds instead of firing together.
5. **Queries NOT in original plan**: `UserConversationsUnreadCount`, `InnovationHubBannerWide`, `PendingInvitationsCount`, `PendingInvitations`, `ExploreAllSpaces` — 5 additional queries discovered.
6. **Queries NOT in HAR**: `RecentSpaces`, `HomeSpaceLookup`, `DashboardWithMemberships` — user likely has no space memberships (different dashboard path renders).

---

## Queries Eliminated

### CampaignBlockCredentials (fully eliminated)

**File**: `src/main/topLevelPages/myDashboard/Campaigns/CampaignBlock.tsx`
**HAR timing**: T+4566ms, 203ms, 506 bytes

**Current**: Fires `useCampaignBlockCredentialsQuery({ fetchPolicy: 'cache-and-network' })` on every home page load.

**Proposed**: Remove query. Read from `useCurrentUserContext()`:

- `platformRoles` (replaces `platform.roleSet.myRoles`)
- `accountEntitlements` (replaces `me.user.account.license.availableEntitlements`)

**Impact**: -1 network request, -203ms server time.

### InnovationHubBannerWide (eliminated — redundant with InnovationHub)

**File**: `src/domain/innovationHub/InnovationHubBannerWide.graphql`
**HAR timing**: T+3636ms, 64ms, 69 bytes

**Current**: Always fires on breadcrumb mount to fetch Innovation Hub banner for the root breadcrumb item.

**Proposed**: Read banner data from the `InnovationHub` query result (which already fires and includes profile data) or from Apollo cache. The `useInnovationHub` hook already fetches hub profile data that can include the banner visual.

**Impact**: -1 network request.

---

## Queries Restructured

### CurrentUserFull + PlatformLevelAuthorization (waterfall eliminated)

**File**: `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx`
**HAR timing**: CurrentUserFull T+603ms (746ms), PlatformLevelAuth T+1355ms (550ms) — **752ms waterfall gap**

**Current**:

1. Fire `useCurrentUserFullQuery({ skip: !isAuthenticated })` → wait for user
2. Fire `usePlatformLevelAuthorizationQuery({ skip: !user || !isAuthenticated })`

**Implemented**:

1. Fire `useCurrentUserFullQuery({ skip: !isAuthenticated })`
2. Fire `usePlatformLevelAuthorizationQuery({ skip: !isAuthenticated })` ← simplified skip
3. Both fire in the same tick → handled concurrently via HTTP/2 multiplexing

**Impact**: Saves ~550ms waterfall. Both queries execute in parallel.

### PendingInvitations (conditional on PendingInvitationsCount)

**File**: `src/main/topLevelPages/myDashboard/InvitationsBlock/InvitationsBlock.tsx`
**HAR timing**: PendingInvitationsCount T+3709ms (275ms), PendingInvitations T+4572ms (155ms)

**Current**: Both queries always fire. PendingInvitations fetches full invitation list even when count is 0.

**Proposed**: Skip `PendingInvitations` query when `PendingInvitationsCount` returns 0. The `InvitationsBlock` already returns `null` for empty lists.

**Impact**: -1 network request when user has no pending invitations (common case).

---

## Queries Optimized (fetch policy changes)

### InnovationHub (cache-first)

**File**: `src/domain/innovationHub/useInnovationHub/InnovationHub.graphql`
**HAR timing**: T+3641ms, 57ms

Innovation Hub data rarely changes during a session. Switch to `cache-first` to avoid unnecessary network requests on navigation.

### PendingInvitationsCount (cache-first)

**File**: `src/domain/community/pendingMembership/PendingInvitationsCount.graphql`
**HAR timing**: T+3709ms, 275ms (slow TTFB: 273ms)

Count only changes after user action (accept/reject invitation). Switch to `cache-first`; existing refetch-on-action pattern already updates the cache.

---

## Home Page Query Summary (Authenticated User, No Memberships Path)

### Before: 15 queries across 6 chains, 4769ms total waterfall

| Chain | Offset   | Query                         | Duration | Depends on       | Issue              |
| ----- | -------- | ----------------------------- | -------- | ---------------- | ------------------ |
| 1     | T+0ms    | Configuration                 | 151ms    | none             | blocks React tree  |
| 2     | T+350ms  | WebSocket /graphql            | 1014ms   | none             | eager, unnecessary |
| 2     | T+355ms  | Kratos whoami                 | 243ms    | ConfigProvider   | blocked by config  |
| 2     | T+603ms  | CurrentUserFull               | 746ms    | whoami           | correct            |
| 2     | T+1355ms | PlatformLevelAuthorization    | 550ms    | CurrentUserFull  | **WATERFALL**      |
| 2     | T+1356ms | InAppNotificationsUnreadCount | 269ms    | user loaded      | correct            |
| 3     | T+3392ms | UserConversationsUnreadCount  | 56ms     | 2s delay         | correct (deferred) |
| 4     | T+3636ms | InnovationHubBannerWide       | 64ms     | breadcrumb mount | **REDUNDANT**      |
| 4     | T+3641ms | InnovationHub                 | 57ms     | component mount  | ok (cache-first?)  |
| 4     | T+3709ms | PendingInvitationsCount       | 275ms    | auth + user      | ok (cache-first?)  |
| 5     | T+4090ms | LatestContributionsSpacesFlat | 77ms     | auth             | ok                 |
| 6     | T+4562ms | MyResources                   | 95ms     | accountId        | waterfall          |
| 6     | T+4566ms | CampaignBlockCredentials      | 203ms    | none             | **REDUNDANT**      |
| 6     | T+4572ms | PendingInvitations            | 155ms    | none             | **SKIP if 0**      |
| 6     | T+4579ms | ExploreAllSpaces              | 107ms    | none             | ok                 |
| 6     | T+4582ms | latestReleaseDiscussion       | 114ms    | auth             | ok                 |

### After: reduced queries, no waterfalls, parallel execution

| Chain     | Offset    | Queries                                                                                                | Notes                                           |
| --------- | --------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 1         | T+0ms     | Configuration                                                                                          | Blocks React tree                               |
| 1         | T+~150ms  | Kratos whoami                                                                                          | Starts after config (AuthProvider above Router) |
| 2         | T+~400ms  | CurrentUserFull + PlatformLevelAuthorization + InAppNotificationsUnreadCount                           | All fire in parallel (HTTP/2 multiplexing)      |
| 3         | T+~1800ms | InnovationHub + PendingInvitationsCount + LatestContributionsSpacesFlat + UserConversationsUnreadCount | Dashboard component mounts                      |
| 4         | T+~2200ms | MyResources + ExploreAllSpaces + latestReleaseDiscussion + PendingInvitations (conditional)            | Later dashboard sections                        |
| **Total** |           | **12-13 queries** (down from 15)                                                                       | Individual HTTP requests (HTTP/2 multiplexed)   |

**Eliminated**: CampaignBlockCredentials (-1), InnovationHubBannerWide (-1), PendingInvitations when count=0 (-1 conditional)
**Waterfall saved**: ~550ms (PlatformLevelAuth) + provider tree reorder (AuthProvider moved above BrowserRouter) = ~750ms+
**Note**: Apollo BatchHttpLink was explored but dropped — HTTP/2 multiplexing already handles concurrent requests efficiently. The 10ms batch window added latency and held fast queries back until the slowest completed.
