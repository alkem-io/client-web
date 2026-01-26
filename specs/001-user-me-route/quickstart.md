# Quickstart: User "Me" Route Shortcut

**Feature**: 001-user-me-route
**Date**: 2026-01-26

## Overview

This feature adds a `/user/me` route that displays the authenticated user's profile. It's a frontend-only change with no backend modifications required.

## Prerequisites

- Node.js 20.19.0+ (via Volta)
- pnpm 10.17.1+
- Running backend at localhost:3000 (for testing)

## Quick Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# The app will be available at http://localhost:3001
```

## Implementation Files

### New Files to Create

1. **`src/domain/community/user/routing/MeUserContext.tsx`**
   - React context for "me" route user ID
   - Exports: `MeUserContext`, `MeUserProvider`, `useMeUserContext`

2. **`src/domain/community/user/routing/UserMeRoute.tsx`**
   - Wrapper component for `/user/me/*` routes
   - Gets current user ID from `useCurrentUserContext()`
   - Provides ID via `MeUserProvider`

### Files to Modify

1. **`src/domain/community/user/routing/UserRoute.tsx`**
   - Add `/me/*` route before `:userNameId/*`
   - Import and use `UserMeRoute`

2. **`src/domain/community/user/userProfilePage/UserProfilePage.tsx`**
   - Import `useMeUserContext`
   - Check context before `useUrlResolver()` for user ID

## Testing the Feature

### Manual Testing

1. **Test authenticated access**:
   - Log in to the application
   - Navigate to `http://localhost:3001/user/me`
   - Verify your profile is displayed
   - Verify URL remains `/user/me` (no redirect)

2. **Test unauthenticated access**:
   - Log out
   - Navigate to `http://localhost:3001/user/me`
   - Verify redirect to login page
   - After login, verify redirect back to `/user/me`

3. **Test sub-routes**:
   - Navigate to `http://localhost:3001/user/me/settings`
   - Verify settings page loads for current user

4. **Test URL comparison**:
   - Note your nameId from your profile
   - Compare `/user/me` with `/user/{your-nameId}`
   - Content should be identical

### Automated Tests

```bash
# Run all tests
pnpm vitest run

# Run specific test file (when created)
pnpm vitest run src/domain/community/user/routing/UserMeRoute.test.ts --reporter=basic
```

## Architecture Notes

### Route Matching Order

React Router matches routes in definition order. The `/me` route must be defined before `:userNameId`:

```tsx
<Routes>
  <Route path="me/*" element={<UserMeRoute />}>
    {/* nested routes */}
  </Route>
  <Route path={`:${nameOfUrl.userNameId}/*`}>
    {/* existing routes */}
  </Route>
</Routes>
```

### Context Layering

```
TopLevelRoutes
  └─ UrlResolverProvider (for standard routes)
      └─ NoIdentityRedirect (auth guard)
          └─ UserRoute
              ├─ /me/* → UserMeRoute → MeUserProvider
              │                          └─ UserPageLayout → UserProfilePage
              │
              └─ /:nameId/* → UserPageLayout → UserProfilePage
```

### User ID Resolution

`UserProfilePage` resolves user ID with fallback:

```typescript
const meContext = useMeUserContext();      // Set only in /me route
const { userId: resolved } = useUrlResolver();  // Set for /:nameId route
const userId = meContext?.userId ?? resolved;   // Prefer me context
```

## Common Issues

### Issue: /user/me shows 404

**Cause**: Route order - `:userNameId` matching "me" as a nameId
**Solution**: Ensure "me/*" route is defined before `:userNameId/*` in UserRoute.tsx

### Issue: Loading spinner never resolves

**Cause**: `useCurrentUserContext()` not ready
**Solution**: Ensure `NoIdentityRedirect` is wrapping the route (handles auth loading)

### Issue: Wrong user profile displayed

**Cause**: `useMeUserContext()` not returning value
**Solution**: Verify `UserMeRoute` wraps the route and provides `MeUserProvider`

## Development Tips

1. **React DevTools**: Inspect `MeUserContext` and `CurrentUserContext` values
2. **Network tab**: Verify no extra GraphQL queries for "me" route (reuses cached current user)
3. **URL bar**: Confirm URL stays as `/user/me` throughout navigation

## Related Documentation

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Notes](./research.md)
- [Data Model](./data-model.md)
