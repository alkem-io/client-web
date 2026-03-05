# Contract: Provider Tree Restructuring

**Date**: 2026-02-26 | **Updated**: 2026-03-03 (post-implementation)

## Previous Provider Nesting (root.tsx)

```
StyledEngineProvider
  └─ RootThemeProvider
    └─ GlobalStyles
      └─ CookiesProvider
        └─ ConfigProvider          ★ BLOCKS until config loads
          └─ SentryTransactionScope
            └─ SentryErrorBoundary
              └─ GlobalStateProvider
                └─ GlobalErrorProvider
                  └─ BrowserRouter
                    └─ AuthenticationProvider   ★ SEQUENTIAL (after config)
                      └─ UserGeoProvider
                        └─ ApmProvider
                          └─ AlkemioApolloProvider
                            └─ UserProvider    ★ WATERFALL (user → auth)
                              └─ ...children
```

## Implemented Provider Nesting

```
StyledEngineProvider
  └─ RootThemeProvider
    └─ GlobalStyles
      └─ CookiesProvider
        └─ ConfigProvider          ★ BLOCKS until config loads
          └─ SentryTransactionScope
            └─ SentryErrorBoundary
              └─ GlobalStateProvider
                └─ GlobalErrorProvider
                  └─ AuthenticationProvider   ★ MOVED — now above BrowserRouter
                    └─ BrowserRouter
                      └─ UserGeoProvider        (skips on auth pages)
                        └─ ApmProvider          (skips on auth pages)
                          └─ AlkemioApolloProvider
                            └─ UserProvider     ★ FIXED — fires both queries on !isAuthenticated
                              └─ ...children
```

> **Note**: The originally planned `ParallelStartupProvider` component was not needed. Investigation revealed that `AuthenticationProvider` has zero router dependencies (`useWhoami` → `useKratosClient` → `useConfig` are all router-free), so simply moving it above `BrowserRouter` in `root.tsx` achieved the same goal. A previous test failure was caused by a concurrent Kratos 502 backend outage, not the provider tree change.

## UserProvider Skip Condition Change

```typescript
// Before (waterfall)
usePlatformLevelAuthorizationQuery({ skip: !user || !isAuthenticated });

// After (parallel)
usePlatformLevelAuthorizationQuery({ skip: !isAuthenticated });
```

Both `CurrentUserFull` and `PlatformLevelAuthorization` now fire in the same tick when `isAuthenticated` becomes true. HTTP/2 multiplexing handles them as concurrent requests.

## Auth Page Skip Conditions

```typescript
// AUTH_PAGE_PREFIXES = ['/login', '/registration', '/sign_up']

// UserGeoProvider: skip when on auth pages
const { pathname } = useLocation();
const isAuthPage = AUTH_PAGE_PREFIXES.some(prefix => pathname.startsWith(prefix));
// Skip if: isAuthPage || !production || !geoEndpoint || !enabled

// ApmProvider: skip when on auth pages
// Same route check, defer full APM init until non-auth page
```
