# Data Model: Optimize Request Loading Performance

**Date**: 2026-02-26 | **Branch**: `015-optimize-request-loading`

This feature is a performance optimization — no new data entities are introduced. This document describes the existing entities affected by query restructuring and batching changes.

## Affected Entities

### Configuration (read-only, no changes)

- **Source**: `platform.configuration` via public GraphQL endpoint
- **Fields used**: `authentication.providers`, `locations.*`, `featureFlags`, `sentry.*`, `apm.*`, `geo.*`
- **Current behavior**: Fetched first, blocks all rendering
- **Change**: Will be fetched concurrently with auth check instead of sequentially before it

### User Session (read-only, no changes)

- **Source**: Kratos identity provider via `kratosClient.toSession()`
- **Fields used**: `session.identity`, `isAuthenticated`, `verified`
- **Current behavior**: Fetched after ConfigProvider completes
- **Change**: Will be fetched concurrently with ConfigProvider

### User Profile (CurrentUserFull)

- **Source**: `me.user` via `CurrentUserFull.graphql`
- **Key fields**: `id`, `firstName`, `lastName`, `email`, `profile.*`, `settings.homeSpace.spaceID`, `account.id`, `account.authorization.myPrivileges`, `account.license.availableEntitlements`
- **Current behavior**: Fetched after auth check completes; triggers PlatformLevelAuthorization as waterfall
- **Change**: Will fire simultaneously with PlatformLevelAuthorization (both skip on `!isAuthenticated`); batched into single HTTP request

### Platform Authorization (PlatformLevelAuthorization)

- **Source**: `platform.roleSet.myRoles`, `platform.authorization.myPrivileges`
- **Current behavior**: Waits for user object from CurrentUserFull (`skip: !user || !isAuthenticated`)
- **Change**: Skip condition simplified to `skip: !isAuthenticated`; fires in same batch as CurrentUserFull

### CampaignBlock Credentials (to be eliminated)

- **Source**: `platform.roleSet.myRoles`, `me.user.account.license.availableEntitlements`
- **Current behavior**: Separate query with `cache-and-network` fetch policy
- **Change**: Entire query eliminated; data read from `CurrentUserContext` which already provides `platformRoles` and `accountEntitlements`

### Dashboard Data (query restructuring)

- **RecentSpaces**: `me.user.settings.homeSpace.spaceID`, `me.mySpaces[*].space.*`
- **HomeSpaceLookup**: `lookup.space.*` — currently cascades after RecentSpaces
- **Change**: HomeSpaceLookup reads `homeSpaceId` from `CurrentUserContext` instead of waiting for RecentSpaces; both queries can be batched

## Cache Impact

- **Apollo normalized cache**: No schema changes; cache keys remain the same (`__typename:id` normalization)
- **Batched queries**: Apollo handles batched responses transparently — each query in the batch updates the normalized cache independently
- **Eliminated query (CampaignBlockCredentials)**: Data was already in cache from CurrentUserFull + PlatformLevelAuthorization; no cache gap
- **No cache migration needed**: No query shape changes that would invalidate existing cached data
