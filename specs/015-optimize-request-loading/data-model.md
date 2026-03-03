# Data Model: Optimize Request Loading Performance

**Date**: 2026-02-26 | **Updated**: 2026-03-03 (post-implementation) | **Branch**: `015-optimize-request-loading`

This feature is a performance optimization — no new data entities are introduced. This document describes the existing entities affected by query restructuring and performance changes.

## Affected Entities

### Configuration (read-only, no changes)

- **Source**: `platform.configuration` via public GraphQL endpoint
- **Fields used**: `authentication.providers`, `locations.*`, `featureFlags`, `sentry.*`, `apm.*`, `geo.*`
- **Current behavior**: Fetched first, blocks all rendering
- **Change**: AuthenticationProvider moved above BrowserRouter in root.tsx, so auth check no longer waits for router to mount after config loads

### User Session (read-only, no changes)

- **Source**: Kratos identity provider via `kratosClient.toSession()`
- **Fields used**: `session.identity`, `isAuthenticated`, `verified`
- **Current behavior**: Fetched after ConfigProvider completes
- **Change**: AuthenticationProvider moved above BrowserRouter, reducing the mount delay between config completion and auth check start

### User Profile (CurrentUserFull)

- **Source**: `me.user` via `CurrentUserFull.graphql`
- **Key fields**: `id`, `firstName`, `lastName`, `email`, `profile.*`, `settings.homeSpace.spaceID`, `account.id`, `account.authorization.myPrivileges`, `account.license.availableEntitlements`
- **Current behavior**: Fetched after auth check completes; triggers PlatformLevelAuthorization as waterfall
- **Change**: Fires simultaneously with PlatformLevelAuthorization (both skip on `!isAuthenticated`); parallel via HTTP/2 multiplexing

### Platform Authorization (PlatformLevelAuthorization)

- **Source**: `platform.roleSet.myRoles`, `platform.authorization.myPrivileges`
- **Current behavior**: Waits for user object from CurrentUserFull (`skip: !user || !isAuthenticated`)
- **Change**: Skip condition simplified to `skip: !isAuthenticated`; fires in parallel with CurrentUserFull

### CampaignBlock Credentials (to be eliminated)

- **Source**: `platform.roleSet.myRoles`, `me.user.account.license.availableEntitlements`
- **Current behavior**: Separate query with `cache-and-network` fetch policy
- **Change**: Entire query eliminated; data read from `CurrentUserContext` which already provides `platformRoles` and `accountEntitlements`

### ~~Dashboard Data (query restructuring)~~ — NOT APPLICABLE

- **RecentSpaces** / **HomeSpaceLookup**: Not present in measured HAR trace (user had no space memberships). Optimization remains valid for future iteration.

## Cache Impact

- **Apollo normalized cache**: No schema changes; cache keys remain the same (`__typename:id` normalization)
- **Eliminated query (CampaignBlockCredentials)**: Data was already in cache from CurrentUserFull + PlatformLevelAuthorization; no cache gap
- **cache-first policies**: InnovationHub and PendingInvitationsCount now use `cache-first` to avoid repeat network requests on navigation
- **No cache migration needed**: No query shape changes that would invalidate existing cached data
