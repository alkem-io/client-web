# API Contracts: User "Me" Route Shortcut

**Feature**: 001-user-me-route
**Date**: 2026-01-26

## No New Contracts Required

This feature is a **frontend-only routing enhancement**. It does not introduce any new API contracts because:

1. **No new GraphQL operations**: The feature reuses existing queries:
   - `useCurrentUserFullQuery` - Already used by `CurrentUserProvider` to get current user data
   - `useUserProvider` / `useUserAccountQuery` - Existing profile data queries

2. **No backend URL resolver changes**: The `/user/me` path is handled entirely on the frontend by:
   - Matching the literal "me" path before the dynamic `:userNameId` parameter
   - Using `useCurrentUserContext()` to get the user ID instead of backend URL resolution

3. **Existing authentication flow**: The `NoIdentityRedirect` wrapper already handles authentication for all `/user/*` routes

## Reused Contracts

### CurrentUserFullQuery
**Location**: `src/core/apollo/generated/apollo-hooks.ts`

Gets the authenticated user's profile data including their UUID.

### UserAccountQuery
**Location**: `src/core/apollo/generated/apollo-hooks.ts`

Fetches user profile details by user ID.

### UrlResolverQuery
**Location**: `src/core/apollo/generated/apollo-hooks.ts`

Used for standard `/user/{nameId}` routes but bypassed for `/user/me`.
