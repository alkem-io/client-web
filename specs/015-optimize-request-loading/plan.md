# Implementation Plan: Optimize Request Loading Performance

**Branch**: `015-optimize-request-loading` | **Date**: 2026-02-26 | **Updated**: 2026-02-27 (HAR analysis) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-optimize-request-loading/spec.md`

## Summary

Reduce page load times for home, login, signup, and signin pages by eliminating request waterfalls, removing redundant queries, enabling Apollo query batching, deferring WebSocket connections, and parallelizing the app startup sequence. All changes are client-only — no server-side modifications required.

### HAR Baseline (Real Measurements)

From `localhost.har` — authenticated home page load:

- **Page onLoad**: 7514ms
- **API waterfall**: 4769ms (15 GraphQL queries + 1 Kratos + 1 WebSocket = 17 requests)
- **Confirmed waterfalls**: Config→Auth gap (204ms), CurrentUserFull→PlatformLevelAuth (550ms)
- **Redundant queries confirmed**: CampaignBlockCredentials (203ms), InnovationHubBannerWide (64ms)
- **Rendering gaps**: 1487ms between auth chain and dashboard queries (JS execution, not optimizable via network changes)

**Projected savings**:

- Waterfall elimination: ~754ms (Config→Auth 204ms + CurrentUserFull→PlatformLevelAuth 550ms)
- Query elimination: 2-3 fewer queries (CampaignBlockCredentials, InnovationHubBannerWide, conditional PendingInvitations)
- Batching: 15 HTTP requests → ~5 HTTP requests (67% reduction)
- WebSocket defer: ~1014ms connection overhead removed from auth pages

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: `@apollo/client` ^3.10.8, `graphql-ws` ^5.6.2, `apollo-upload-client` ^18.0.1, `react-router-dom`, `@ory/client` (Kratos)
**Storage**: Apollo InMemoryCache (normalized), Kratos sessions (HTTP-only cookies)
**Testing**: Vitest with jsdom environment
**Target Platform**: Web (SPA served by Vite, browsers)
**Project Type**: Web (single SPA, no separate backend changes)
**Performance Goals**: 30% TTI improvement on auth pages (SC-001), 25%+ reduction in home page requests (SC-002), 200ms+ reduction in startup waterfall (SC-004)
**Constraints**: Client-only changes; no GraphQL schema modifications; no server-side changes; must preserve all existing functionality (FR-009)
**Scale/Scope**: 13 files modified, 1 new component (ParallelStartupProvider), 2 queries eliminated, 1 query conditionally skipped, 1 waterfall eliminated (HomeSpaceLookup), 2 waterfalls removed, 1 link added to Apollo chain, 2 fetch policies optimized

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                               | Status | Notes                                                                                                                                                                                                           |
| --------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Domain-Driven Frontend Boundaries    | PASS   | Changes respect domain boundaries: Apollo config in `src/core/apollo`, providers in `src/domain/platform` and `src/core/auth`, dashboard components in `src/main`                                               |
| II. React 19 Concurrent UX Discipline   | PASS   | No new blocking renders; parallelization improves concurrency. Loading states preserved.                                                                                                                        |
| III. GraphQL Contract Fidelity          | PASS   | All queries use generated hooks from `apollo-hooks.ts`. No raw `useQuery`. `BatchHttpLink` is transparent to generated hooks. CampaignBlock replacement uses context data that originates from generated hooks. |
| IV. State & Side-Effect Isolation       | PASS   | Side effects (WebSocket, geo, APM) are deferred via existing provider patterns. New `ParallelStartupProvider` follows context/provider pattern in `src/core`.                                                   |
| V. Experience Quality & Safeguards      | PASS   | Performance improvement is the goal. No accessibility changes. All tests must pass (SC-006).                                                                                                                    |
| Architecture Std 1 (directory taxonomy) | PASS   | New component goes in `src/core` (shared infrastructure). No new domain directories.                                                                                                                            |
| Architecture Std 5 (no barrel exports)  | PASS   | All imports use explicit file paths.                                                                                                                                                                            |
| Architecture Std 6 (SOLID)              | PASS   | SRP: each change has single responsibility. DIP: CampaignBlock switches from query to context abstraction. DRY: eliminates duplicate platform roles/entitlements fetching.                                      |
| Engineering Workflow 5 (Root Cause)     | PASS   | Each optimization addresses a specific identified root cause (blocking provider, waterfall skip condition, eager WebSocket, redundant query, aggressive retry). No duct tape.                                   |

**Post-Phase 1 Re-check**: All principles continue to hold. The `ParallelStartupProvider` pattern is consistent with existing provider patterns in the codebase. `BatchHttpLink` integration preserves the existing link chain architecture.

## Project Structure

### Documentation (this feature)

```text
specs/015-optimize-request-loading/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions (R-001 through R-011)
├── data-model.md        # Phase 1: affected entities
├── quickstart.md        # Phase 1: setup and verification guide
├── contracts/
│   ├── apollo-link-chain.md    # Apollo link chain restructuring
│   ├── provider-tree.md        # Provider tree restructuring
│   └── query-consolidation.md  # Query elimination and batching (HAR-validated)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/
│   │   ├── graphqlLinks/
│   │   │   ├── httpLink.ts          # MODIFY: add BatchHttpLink, lazy WebSocket
│   │   │   └── retryLink.ts         # MODIFY: reduce initial delay (1000→300ms)
│   │   └── hooks/
│   │       └── useGraphQLClient.ts  # MODIFY: update link chain split
│   ├── startup/
│   │   └── ParallelStartupProvider.tsx  # NEW: parallel config+auth coordinator
│   ├── auth/
│   │   └── authentication/
│   │       └── context/
│   │           └── AuthenticationProvider.tsx  # MODIFY: extract for parallel startup
│   └── analytics/
│       ├── geo/
│       │   └── UserGeoProvider.tsx   # MODIFY: add auth page skip
│       └── apm/
│           └── context/
│               └── ApmProvider.tsx   # MODIFY: add auth page skip
├── domain/
│   ├── platform/
│   │   └── config/
│   │       └── ConfigProvider.tsx    # MODIFY: extract for parallel startup
│   ├── community/
│   │   ├── userCurrent/
│   │   │   └── CurrentUserProvider/
│   │   │       └── CurrentUserProvider.tsx  # MODIFY: simplify PlatformLevelAuth skip
│   │   └── pendingMembership/
│   │       └── usePendingInvitationsCount.ts  # MODIFY: cache-first fetch policy
│   └── innovationHub/
│       ├── useInnovationHub/
│       │   └── useInnovationHub.ts   # MODIFY: cache-first fetch policy
│       └── useSpaceBreadcrumbsTopLevelItem.ts  # MODIFY: read from cache instead of InnovationHubBannerWide
└── main/
    ├── topLevelPages/
    │   └── myDashboard/
    │       ├── Campaigns/
    │       │   └── CampaignBlock.tsx  # MODIFY: replace query with context
    │       ├── recentSpaces/
    │       │   └── RecentSpacesList.tsx  # MODIFY: read homeSpaceId from context
    │       └── InvitationsBlock/
    │           └── InvitationsBlock.tsx  # MODIFY: skip query when count=0
    └── root.tsx                      # MODIFY: restructure provider tree
```

**Structure Decision**: All changes are modifications to existing files within the established directory structure. One new component (`ParallelStartupProvider`) will be created in `src/core/` or inline in `root.tsx`, following existing provider patterns.

## Change Summary by Impact

### High Impact (waterfall elimination)

| Change                                       | File                                                           | HAR Evidence                    | Savings        |
| -------------------------------------------- | -------------------------------------------------------------- | ------------------------------- | -------------- |
| Parallel Config + Auth                       | `root.tsx`, `ConfigProvider.tsx`, `AuthenticationProvider.tsx` | 204ms gap at T+151→T+355        | ~204ms         |
| Parallel CurrentUserFull + PlatformLevelAuth | `CurrentUserProvider.tsx`                                      | 550ms waterfall at T+603→T+1355 | ~550ms         |
| Apollo BatchHttpLink                         | `httpLink.ts`, `useGraphQLClient.ts`                           | 15 individual HTTP requests     | 15→~5 requests |

### Medium Impact (query elimination/deferral)

| Change                             | File                                 | HAR Evidence                               | Savings                  |
| ---------------------------------- | ------------------------------------ | ------------------------------------------ | ------------------------ |
| Eliminate CampaignBlockCredentials | `CampaignBlock.tsx`                  | T+4566ms, 203ms, redundant data            | -1 request, -203ms       |
| Eliminate InnovationHubBannerWide  | `useSpaceBreadcrumbsTopLevelItem.ts` | T+3636ms, 64ms, overlaps InnovationHub     | -1 request               |
| Conditional PendingInvitations     | `InvitationsBlock.tsx`               | T+4572ms, 155ms, wasted when count=0       | -1 request (common case) |
| Lazy WebSocket                     | `httpLink.ts`                        | T+350ms, 1014ms, unnecessary on auth pages | -1014ms on auth pages    |

### Lower Impact (tuning)

| Change                                  | File                                     | HAR Evidence         | Savings                      |
| --------------------------------------- | ---------------------------------------- | -------------------- | ---------------------------- |
| Retry delay 1000→300ms                  | `retryLink.ts`                           | N/A (error path)     | faster error recovery        |
| cache-first for PendingInvitationsCount | `usePendingInvitationsCount.ts`          | T+3709ms, 275ms TTFB | avoids repeat fetches        |
| cache-first for InnovationHub           | `useInnovationHub.ts`                    | T+3641ms, 57ms       | avoids repeat fetches        |
| Skip geo/APM on auth pages              | `UserGeoProvider.tsx`, `ApmProvider.tsx` | N/A (auth page path) | fewer requests on auth pages |

## Complexity Tracking

No constitution violations to justify. All changes are minimal modifications to existing files following established patterns.
