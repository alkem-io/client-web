# Research: User "Me" Route Shortcut

**Feature**: 001-user-me-route
**Date**: 2026-01-26
**Status**: Complete

## Research Tasks

### 1. How does the existing routing architecture handle user routes?

**Decision**: Use React Router's route matching order to handle `/me` before `:userNameId`

**Rationale**:

- React Router v6 matches routes in definition order within a `<Routes>` component
- The `/me` literal path will match before the dynamic `:userNameId` parameter
- This requires placing the `/me` route definition before the `:userNameId` route in `UserRoute.tsx`

**Key Findings**:

- `TopLevelRoutes.tsx:156-165` wraps all `/user/*` routes with:
  - `UrlResolverProvider` - resolves URLs to entity IDs via GraphQL
  - `NoIdentityRedirect` - redirects unauthenticated users to login
  - `Suspense` + `Loading` fallback
- `UserRoute.tsx` uses nested routes: `:userNameId/*` → `UserPageLayout` → `UserProfilePage`
- The UrlResolver queries the backend with the full URL to resolve entity IDs

**Alternatives Considered**:

1. **Modify UrlResolverProvider to handle "me"** - Rejected: Would require backend changes and adds complexity
2. **Client-side redirect from /me to /user/{nameId}** - Rejected: Violates FR-005 (URL must stay as /user/me)

---

### 2. How does UserProfilePage get the user ID to display?

**Decision**: Create a `MeUserContext` to provide user ID for "me" routes, with fallback to `useUrlResolver()`

**Rationale**:

- `UserProfilePage` calls `useUrlResolver()` which returns `{ userId, loading }` from the UrlResolver context
- The UrlResolver gets `userId` by querying the backend with the current URL
- For `/user/me`, the backend's UrlResolver won't recognize "me" as a valid nameId
- Solution: Wrap "me" routes in a context that provides the current user's ID directly

**Key Findings**:

- `UserProfilePage.tsx:12` calls `const { userId, loading: urlResolverLoading } = useUrlResolver()`
- `useUrlResolver()` returns `userId` from `UrlResolverContext` (line 47 of UrlResolverProvider.tsx)
- The context value is computed from `urlResolverData.userId` returned by `useUrlResolverQuery`

**Pattern for "me" route**:

```typescript
// In UserProfilePage, check for MeUserContext first
const meUserId = useMeUserContext(); // Returns undefined if not in "me" route
const { userId: resolvedUserId, loading: urlResolverLoading } = useUrlResolver();
const userId = meUserId ?? resolvedUserId;
```

---

### 3. How is the current user's data accessed?

**Decision**: Use existing `useCurrentUserContext()` hook

**Rationale**:

- `useCurrentUserContext()` is already available and provides the authenticated user's model
- The hook returns `CurrentUserModel` which includes `userModel: UserModel | undefined`
- `UserModel.id` contains the user's UUID needed for profile queries

**Key Findings**:

- `CurrentUserProvider.tsx` fetches current user via `useCurrentUserFullQuery({ skip: !isAuthenticated })`
- The provider exposes `userModel` which is `meData?.me?.user`
- `CurrentUserModel.userModel.id` is the user's UUID (string)

**Code path**:

```
useCurrentUserContext()
  → CurrentUserContext
    → CurrentUserProvider
      → useCurrentUserFullQuery
        → meData.me.user.id
```

---

### 4. How should loading states be handled?

**Decision**: Follow existing patterns - show Loading component while current user data loads

**Rationale**:

- The existing `NoIdentityRedirect` already handles authentication loading
- `CurrentUserProvider` handles profile loading internally
- For "me" route, we need to wait for `userModel` to be available before rendering

**Key Findings**:

- `NoIdentityRedirect.tsx:12-14` shows Loading while `isLoadingAuthentication`
- `UserProfilePage.tsx:27` shows Loading while `urlResolverLoading || loading || loadingUser || !userId`
- `CurrentUserModel` has `loading` and `loadingMe` flags

**Loading sequence for /user/me**:

1. `NoIdentityRedirect` handles auth loading → shows "Loading user configuration"
2. `UserMeRoute` waits for `loadingMe` → shows "Loading User Profile ..."
3. `UserProfilePage` handles profile data loading → shows "Loading User Profile ..."

---

### 5. How should sub-routes (/user/me/settings/\*) be supported?

**Decision**: Mirror the existing route structure in UserRoute - nested routes under "me/\*"

**Rationale**:

- FR-007 requires `/user/me/*` to mirror all existing `/user/{nameId}/*` routes
- The existing structure uses React Router's nested routes with `Outlet`
- The "me" route can use identical nested structure, just wrapped in `MeUserContext`

**Key Findings**:

- `UserRoute.tsx` structure:
  ```tsx
  <Route path={`:${nameOfUrl.userNameId}/*`}>
    <Route path="" element={<UserPageLayout />}>
      <Route index element={<UserProfilePage />} />
      <Route path={'settings/*'} element={<UserAdminRoute />} />
    </Route>
  </Route>
  ```
- `UserPageLayout` uses `<Outlet />` to render nested routes
- Sub-routes like `settings/*` work via nested Route matching

**Implementation**:

```tsx
<Route path="me/*" element={<UserMeRoute />}>
  <Route path="" element={<UserPageLayout />}>
    <Route index element={<UserProfilePage />} />
    <Route path={'settings/*'} element={<UserAdminRoute />} />
  </Route>
</Route>
```

---

### 6. Security: How is authentication enforced?

**Decision**: Rely on existing `NoIdentityRedirect` wrapper (already applied to all /user/\* routes)

**Rationale**:

- `TopLevelRoutes.tsx:159` wraps the entire `UserRoute` component with `NoIdentityRedirect`
- This means `/user/me` is already protected - unauthenticated users are redirected
- No additional authentication handling needed in `UserMeRoute`

**Key Findings**:

- `NoIdentityRedirect` checks `isAuthenticated` from `useAuthenticationContext()`
- If not authenticated, redirects to `AUTH_REQUIRED_PATH` with return URL parameter
- After login, user is redirected back to `/user/me` (satisfies FR-004)

**Verification**:

- FR-003 (require authentication): ✅ Handled by NoIdentityRedirect
- FR-004 (redirect unauthenticated, return after login): ✅ Handled by NoIdentityRedirect + return URL param

---

## Summary

All research questions resolved. The implementation approach is:

1. **Create `MeUserContext`** - Simple context to provide current user ID for "me" routes
2. **Create `UserMeRoute`** - Wrapper that:
   - Gets current user ID from `useCurrentUserContext()`
   - Provides ID via `MeUserContext`
   - Renders `<Outlet />` for nested routes
3. **Modify `UserRoute`** - Add "me/_" route before `:userNameId/_`
4. **Modify `UserProfilePage`** - Check `MeUserContext` before `useUrlResolver()`

No backend changes required. No new GraphQL operations needed.
