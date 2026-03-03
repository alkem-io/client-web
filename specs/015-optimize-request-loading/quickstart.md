# Quickstart: Optimize Request Loading Performance

**Branch**: `015-optimize-request-loading` | **Updated**: 2026-03-03 (post-implementation)

## Prerequisites

- Node >=22.0.0, pnpm >=10.17.1
- Backend running at `localhost:3000` (Traefik) / `localhost:4000/graphql` (for codegen)
- Dev server at `localhost:3001`

## Setup

```bash
git checkout 015-optimize-request-loading
pnpm install
```

## Key Files Modified

| File                                                                           | Change                                                                 |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `src/core/apollo/graphqlLinks/httpLink.ts`                                     | Set `lazy: true` on WebSocket, update error handler                    |
| `src/core/apollo/graphqlLinks/retryLink.ts`                                    | Reduce `initial` delay to 300ms                                        |
| `src/core/auth/authentication/constants/authentication.constants.ts`           | Add `AUTH_PAGE_PREFIXES` constant                                      |
| `src/root.tsx`                                                                 | Move `AuthenticationProvider` above `BrowserRouter`                    |
| `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx` | Simplify PlatformLevelAuth skip condition (`!isAuthenticated` only)    |
| `src/main/topLevelPages/myDashboard/Campaigns/CampaignBlock.tsx`               | Replace query with `useCurrentUserContext()` data                      |
| `src/domain/innovationHub/useSpaceBreadcrumbsTopLevelItem.ts`                  | Read banner from `useInnovationHub` instead of InnovationHubBannerWide |
| `src/main/topLevelPages/myDashboard/InvitationsBlock/InvitationsBlock.tsx`     | Skip PendingInvitations when count=0                                   |
| `src/domain/community/pendingMembership/usePendingInvitationsCount.ts`         | Switch to cache-first fetch policy                                     |
| `src/domain/innovationHub/useInnovationHub/useInnovationHub.ts`                | Switch to cache-first fetch policy                                     |
| `src/core/analytics/geo/UserGeoProvider.tsx`                                   | Add auth page skip condition                                           |
| `src/core/analytics/apm/context/ApmProvider.tsx`                               | Add auth page skip condition                                           |

> **Not modified** (dropped from original plan): `useGraphQLClient.ts` (BatchHttpLink dropped), `ConfigProvider.tsx` / `AuthenticationProvider.tsx` (no extraction needed), `RecentSpacesList.tsx` (HomeSpaceLookup not in measured path).

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
- [ ] Home page: CampaignBlock renders without its own query
- [ ] Home page: No InnovationHubBannerWide query (banner read from useInnovationHub hook)
- [ ] Home page: PendingInvitations query skipped when count is 0
- [ ] Home page: InnovationHub and PendingInvitationsCount use cache-first (no refetch on navigation)
- [ ] Home page: CurrentUserFull + PlatformLevelAuth fire in parallel (no 550ms gap)
- [ ] Notifications: Appear after brief delay when WebSocket connects on-demand
- [ ] Failed request: Retries after ~300ms (not 1000ms)
- [ ] File uploads: Still work correctly
- [ ] All existing tests pass: `pnpm vitest run`
- [ ] HAR comparison: Total GraphQL queries reduced from 15 to ~12-13
