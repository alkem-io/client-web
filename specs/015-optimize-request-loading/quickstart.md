# Quickstart: Optimize Request Loading Performance

**Branch**: `015-optimize-request-loading`

## Prerequisites

- Node >=22.0.0, pnpm >=10.17.1
- Backend running at `localhost:3000` (Traefik) / `localhost:4000/graphql` (for codegen)
- Dev server at `localhost:3001`

## Setup

```bash
git checkout 015-optimize-request-loading
pnpm install
```

## Key Files to Modify

| File                                                                           | Change                                                          |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `src/core/apollo/graphqlLinks/httpLink.ts`                                     | Add `BatchHttpLink`, set `lazy: true` on WebSocket              |
| `src/core/apollo/graphqlLinks/retryLink.ts`                                    | Reduce `initial` delay to 300ms                                 |
| `src/core/apollo/hooks/useGraphQLClient.ts`                                    | Update link chain to use batch link with upload split           |
| `src/root.tsx`                                                                 | Restructure provider tree for parallel config+auth              |
| `src/domain/platform/config/ConfigProvider.tsx`                                | Extract into parallel startup coordinator                       |
| `src/core/auth/authentication/context/AuthenticationProvider.tsx`              | Extract into parallel startup coordinator                       |
| `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx` | Simplify PlatformLevelAuth skip condition                       |
| `src/main/topLevelPages/myDashboard/Campaigns/CampaignBlock.tsx`               | Replace query with context data                                 |
| `src/main/topLevelPages/myDashboard/recentSpaces/RecentSpacesList.tsx`         | Read homeSpaceId from context                                   |
| `src/core/analytics/geo/UserGeoProvider.tsx`                                   | Add auth page skip condition                                    |
| `src/core/analytics/apm/context/ApmProvider.tsx`                               | Add auth page skip condition                                    |
| `src/domain/innovationHub/useSpaceBreadcrumbsTopLevelItem.ts`                  | Read banner from cache instead of InnovationHubBannerWide query |
| `src/main/topLevelPages/myDashboard/InvitationsBlock/InvitationsBlock.tsx`     | Skip PendingInvitations when count=0                            |
| `src/domain/community/pendingMembership/usePendingInvitationsCount.ts`         | Switch to cache-first fetch policy                              |
| `src/domain/innovationHub/useInnovationHub/useInnovationHub.ts`                | Switch to cache-first fetch policy                              |

## Verification

```bash
# Type check + lint
pnpm lint

# Run tests
pnpm vitest run

# Dev server smoke test
pnpm start
# Then verify:
# 1. Login page loads without WebSocket connection (DevTools → Network → WS tab)
# 2. Home page loads with fewer network requests (DevTools → Network → count)
# 3. All existing functionality works (navigate between pages, check notifications)
```

## Testing Checklist

- [ ] Auth pages: No WebSocket connection on load
- [ ] Auth pages: No geo-location request
- [ ] Auth pages: Config + auth check run concurrently (check Network timeline)
- [ ] Home page: CampaignBlock renders without its own query
- [ ] Home page: Batched queries visible in Network tab (single request with array body)
- [ ] Home page: HomeSpaceLookup fires immediately (no waterfall after RecentSpaces)
- [ ] Home page: CurrentUserFull + PlatformLevelAuth batched together
- [ ] Home page: No InnovationHubBannerWide query (banner read from cache)
- [ ] Home page: PendingInvitations query skipped when count is 0
- [ ] Home page: InnovationHub and PendingInvitationsCount use cache-first (no refetch on navigation)
- [ ] Notifications: Appear after brief delay when WebSocket connects on-demand
- [ ] Failed request: Retries after ~300ms (not 1000ms)
- [ ] File uploads: Still work correctly (routed to uploadLink, not batchLink)
- [ ] All existing tests pass: `pnpm vitest run`
- [ ] HAR comparison: Total GraphQL requests reduced from 15 to ~12, HTTP requests reduced from 15 to ~5
