# Contract: Provider Tree Restructuring

**Date**: 2026-02-26

## Current Provider Nesting (root.tsx)

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

## Proposed Provider Nesting

```
StyledEngineProvider
  └─ RootThemeProvider
    └─ GlobalStyles
      └─ CookiesProvider
        └─ ParallelStartupProvider   ★ NEW — runs config + auth concurrently
          └─ SentryTransactionScope
            └─ SentryErrorBoundary
              └─ GlobalStateProvider
                └─ GlobalErrorProvider
                  └─ BrowserRouter
                    └─ UserGeoProvider        (skips on auth pages)
                      └─ ApmProvider          (skips on auth pages)
                        └─ AlkemioApolloProvider
                          └─ UserProvider     ★ FIXED — fires both queries on !isAuthenticated
                            └─ ...children
```

## ParallelStartupProvider

New component that wraps both `ConfigProvider` and `AuthenticationProvider`, running them concurrently:

```typescript
// Conceptual contract — not final implementation
type ParallelStartupContext = {
  config: Configuration | undefined;
  serverMetadata: ServerMetadata | undefined;
  isAuthenticated: boolean;
  loading: boolean; // true until BOTH config and auth are resolved
  session: Session | undefined;
  verified: boolean;
};
```

**Behavior**:

- Starts config fetch and Kratos session check simultaneously
- Shows loading spinner until both complete
- Provides combined context to children
- Preserves existing `useConfig()` and `useAuthenticationContext()` hooks by providing their contexts

## UserProvider Skip Condition Change

```typescript
// Current (waterfall)
usePlatformLevelAuthorizationQuery({ skip: !user || !isAuthenticated });

// Proposed (parallel, batchable)
usePlatformLevelAuthorizationQuery({ skip: !isAuthenticated });
```

## Auth Page Skip Conditions

```typescript
// UserGeoProvider: skip when on auth pages
const isAuthPage = ['/login', '/registration', '/sign_up'].some(p => pathname.startsWith(p));
// Skip if: isAuthPage || !production || !geoEndpoint || !enabled

// ApmProvider: skip when on auth pages
// Same route check, defer full APM init until non-auth page
```
