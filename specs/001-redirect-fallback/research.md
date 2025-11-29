# Research Findings – Redirect Fallback Experience

## Decision 1: GraphQL `resolveResource` payload contract

- **Decision**: Define a dedicated GraphQL query that takes `resourcePath`, returns `authState`, `exists`, `target` (id, type, slug, displayName, canonicalUrl), `parentChain` (ordered up to 5 ancestors with accessibility flags), and `fallbackReason`. Responses include a stable `requestId` for telemetry correlation.
- **Rationale**: Capturing auth state and ordered parents in a single round-trip lets the client run the entire fallback algorithm without additional calls, keeping redirect latency within the 3 s goal and preventing extra work on login return. The requestId ensures analytics events can be matched to resolver outcomes even after login redirects.
- **Alternatives considered**: (a) Multiple GraphQL calls (resolve → fetch parent per hop) would add 200–300 ms per hop and complicate concurrency. (b) Rely on REST endpoints already used by server (#9001) would duplicate schema typing and bypass Apollo tooling. A single GraphQL contract keeps codegen + caching simple.

## Decision 2: `returnTo` persistence and expiry

- **Decision**: Store the intended destination in a domain-level `redirectIntent` context backed by `sessionStorage` with a 30-minute TTL. Embed the encoded target path in the login URL’s `returnTo` query param (`/login?returnTo=/spaces/foo/callouts/bar`). On logout, explicit clearing removes stale entries.
- **Rationale**: `sessionStorage` naturally scopes to the browser tab, preventing cross-tab leakage of restricted links, and TTL guards against old redirects firing in future sessions. Using the existing login parameter keeps the backend flow unchanged while enabling exact path restoration post-auth.
- **Alternatives considered**: (a) Cookies risk cross-tenant data bleed and extra server parsing. (b) React context only (no persistence) would lose intent if the login screen reloads or the browser refreshes. (c) LocalStorage keeps data across windows longer than necessary, increasing privacy risk.

## Decision 3: Analytics schema for fallback visibility

- **Decision**: Emit two structured events via `src/core/analytics`: `navigation.resolve.completed` (fields: `requestId`, `authState`, `reason`, `depth`, `latencyMs`) and `navigation.resolve.fallback` (adds `destinationType`, `manualOverride` boolean). Resource identifiers are SHA-256 hashed before logging; human-readable labels stay client-only.
- **Rationale**: Separating completion vs fallback makes dashboards easier to build and lets support correlate SLA breaches by auth state. Hashing IDs keeps telemetry compliant with privacy expectations while still supporting deduplication.
- **Alternatives considered**: (a) One combined event with free-form text would limit observability. (b) Logging raw slugs risks exposing private space names to analytics sinks maintained outside customer tenant boundaries.

## Decision 4: React Router integration pattern

- **Decision**: Use a router loader to kick off `resolveResource` before rendering route elements, then expose the resolved data through the navigation domain hook. For pages that cannot use loaders (legacy stacks), add a top-level `RouteGuard` component that calls the hook inside `useEffect` with `useTransition` to avoid blocking synchronous render.
- **Rationale**: Router loaders already integrate with Suspense and error boundaries, letting us keep data fetching declarative. The fallback guard path covers legacy routes without forcing a wholesale router refactor.
- **Alternatives considered**: (a) Imperative redirects in `useLayoutEffect` risk violating React 19 purity and cause hydration warnings. (b) Wrapping every route in a higher-order component would duplicate logic and hinder Suspense adoption.

## Decision 5: Apollo caching and invalidation

- **Decision**: Register `ResolveResourceResult` as a normalized type keyed by `requestId`, cache parent chains for the session, and invalidate entries whenever a user logs out or when the resolver returns `not_found`. For deleted resources, the fallback notice uses cached parents so we avoid re-fetching.
- **Rationale**: Normalizing on `requestId` avoids collisions between different URLs that may map to the same entity, while logout-based eviction ensures no stale permissions leak between users on shared devices.
- **Alternatives considered**: (a) Bypassing the cache via `fetchPolicy: 'network-only'` would negate Apollo benefits and cost performance. (b) Keying by entity ID would break when the resource is deleted (ID absent) or when different paths map to the same ID but with different parent chains.
