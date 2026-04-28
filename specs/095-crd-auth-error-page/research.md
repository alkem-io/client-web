# Phase 0 Research: CRD — Unauthorized / Forbidden Error Page

**Feature**: 095-crd-auth-error-page
**Date**: 2026-04-28

## Outline of unknowns from Technical Context

The spec carries no `[NEEDS CLARIFICATION]` markers (resolved across `/speckit.specify` and `/speckit.clarify`), but five implementation-level questions still needed concrete answers before tasks could be generated:

1. Where does the boundary's `errorComponent` callback render in the React tree, and which providers / hooks are still available there?
2. How do we mount `CrdLayoutWrapper` *outside* the existing `<Route element={...}>` chain, given that today it relies on `<Outlet />` for content?
3. What is the exact static set of CRD-enabled route patterns the predicate `isCrdRoute` must recognize as of branch `095-crd-auth-error-page`?
4. What is the existing Sentry / observability signal on the MUI `/restricted` handler that we need to mirror?
5. How does `useNavigate` (the existing wrapper at `src/core/routing/useNavigate.ts`) interact with the router's history — i.e., is `navigate(-1)` the right primitive for the "Go back" action?

Each is resolved below.

---

## Decision 1 — `errorComponent` runs inside all providers, above `<TopLevelRoutes>`

**Decision**: The `errorComponent` callback is invoked from `Error40XBoundary`'s `render()` (a class component) and lives at `src/root.tsx:164–175`, inside `AlkemioApolloProvider`, `UserProvider`, `PendingMembershipsDialogProvider`, `InAppNotificationsProvider`, `PushNotificationProvider`, `UserMessagingProvider`, and `BrowserRouter` — but **above** `<TopLevelRoutes />` (which the boundary unmounts when the error fires).

**Rationale**:
- All Apollo / auth / messaging / router context is available inside the callback, so any hook the existing `CrdLayoutWrapper` calls (`useConfig`, `usePendingInvitationsCount`, `useCurrentUserContext`, `useTranslation`, etc.) continues to work.
- Crucially, `react-router-dom`'s `BrowserRouter` is mounted at the parent level (`src/root.tsx:184`), so `useNavigate`, `useLocation`, and the `Navigate` component all work inside the error fallback. The `useEffect` in `CrdRestrictedRoute` can call `useQueryParams()` exactly as `Restricted.tsx:10` does today.
- However, the `<Routes>` / `<Route>` matching tree is gone (it was inside `<TopLevelRoutes>` which the boundary replaced). That means `<Outlet />` will not render anything from this position — it has no parent route to delegate to. Decision 2 covers that.

**Alternatives considered**:
- **Add a parallel CRD-only error boundary inside the CRD layout subtree** — rejected: contradicts FR-013 ("MUST NOT introduce a parallel CRD-specific error boundary"). The existing single boundary is the only catch point.
- **Lift the existing boundary above the providers** — rejected: would force the boundary to render without Apollo context, breaking the MUI `Error403`'s reuse of theme primitives, and is unrelated to this feature's scope.

---

## Decision 2 — `CrdLayoutWrapper` accepts an optional `children` prop

**Decision**: Refactor `src/main/ui/layout/CrdLayoutWrapper.tsx` so the inner content body uses `{children ?? <Outlet />}` instead of `<Outlet />`. The wrapper signature becomes `function CrdLayoutWrapper({ children }: { children?: ReactNode })`. All current call sites — which mount `<CrdLayoutWrapper />` as a route element and rely on `<Outlet />` to render the matched child route — work identically because `children` is undefined.

**Rationale**:
- The refactor is purely additive: a single optional prop with a defaulted fallback. No behavioral change for any existing route.
- It enables the integration layer to render `<CrdLayoutWrapper><CrdForbiddenPage … /></CrdLayoutWrapper>` from inside the boundary's `errorComponent` — where `<Outlet />` would render nothing because the route tree has been unmounted.
- Same wrapper is reusable for the `/restricted` route handler (`CrdRestrictedRoute`), so both the throw-path and the direct-visit path render through identical chrome.
- Per Constitution principle II (purity) and IV (state isolation), `CrdLayoutWrapper` already does no side effects beyond reading user / config context — adding a `children` prop does not change that.

**Alternatives considered**:
- **Mount a tiny inline `<Routes>` inside the errorComponent that maps `*` to `<CrdForbiddenPage>` and use `<Outlet />` natively** — rejected: introduces an inner router for one component, harder to follow, and doesn't help the `/restricted` handler (which still needs a way to inject content).
- **Extract a new `CrdLayoutShell` component beside `CrdLayoutWrapper`** — rejected: would duplicate the hook-heavy data-fetching block (config, breadcrumbs, user, pending invitations, etc.), violating DRY. The single-prop refactor is the minimal change.
- **Render `<CrdLayout>` (the inner primitive at `@/crd/layouts/CrdLayout`) directly and re-pass all the props it needs** — rejected: the integration layer would need to call every hook that `CrdLayoutWrapper` already calls. Massive duplication, exactly what `CrdLayoutWrapper` exists to abstract.

---

## Decision 3 — `isCrdRoute` covers the routes currently toggled CRD in `TopLevelRoutes.tsx`

**Decision**: As of branch `095-crd-auth-error-page` cut from `develop @ bf609285a`, the predicate recognizes the following pathname patterns as CRD-enabled when the toggle is on:

| Pattern (matched against `pathname`) | Source CRD route in `TopLevelRoutes.tsx` |
|---|---|
| `/home` (exact + trailing slash) | `CrdDashboardPage` |
| `/spaces` (exact + trailing slash) | `CrdSpaceExplorerPage` |
| `/public/whiteboard/<id>` (prefix) | `CrdPublicWhiteboardPage` |
| `/<spaceNameId>` and any nested segments under it (Space tree) | `CrdSpaceRoutes` |

Plus `/restricted` itself is treated as CRD-enabled (so that direct visits to `/restricted` go through the same predicate-based decision in `CrdAwareErrorComponent` — which becomes a no-op there, since the route handler renders the CRD page directly).

**Rationale**:
- The predicate's patterns map 1:1 to the per-route `crdEnabled ?` conditionals in `TopLevelRoutes.tsx`. New CRD migrations (e.g., a future `/admin` page) add a pattern at the same time they add a route. Single source of truth lives in `src/main/crdPages/error/isCrdRoute.ts`.
- Space routes are the trickiest because Alkemio routes Spaces at `/<spaceNameId>` (root-level), not under `/space/<id>`. A naive prefix check could match too liberally (e.g., `/admin` would match if we used `/<anything>`). The implementation uses the existing `reservedTopLevelRoutePaths` list from `src/main/routing/TopLevelRoutePath.ts` — if the first path segment is **not** a reserved top-level path, it's treated as a Space tree. This is the same heuristic the rest of the app already uses to know "this URL is a Space", so the predicate inherits its correctness for free.
- Pattern matching uses simple string operations (`pathname === '/home'`, `pathname.startsWith('/public/whiteboard/')`, segment-zero check against `reservedTopLevelRoutePaths`). No `path-to-regexp`, no router internals — keeping the predicate trivially unit-testable per Clarification Q3.

**Alternatives considered**:
- **Inline the match logic in `CrdAwareErrorComponent`** — rejected: violates SRP and makes the routing decision untestable in isolation.
- **Use `react-router`'s `matchPath` with the CRD route descriptors** — rejected: would require either re-declaring the descriptor list (DRY violation) or importing `TopLevelRoutes.tsx`'s internal definitions (tight coupling). The simple string predicate is sufficient and faster to test.
- **A central CRD-routes registry consumed by both `TopLevelRoutes.tsx` and the predicate** — rejected explicitly in Clarification Q3 (Option B); we keep the predicate as a parallel source-of-truth that migrating PRs update alongside the route tree.

---

## Decision 4 — Sentry signal on `/restricted` is `logInfo('Attempted access to: ${origin}')`

**Decision**: The CRD `/restricted` route handler emits exactly the same Sentry breadcrumb as the existing MUI `Restricted` component (`src/core/routing/Restricted.tsx:14`):

```ts
useEffect(() => {
  logInfo(`Attempted access to: ${origin}`);
}, [origin]);
```

Where `origin` is `useQueryParams().get('origin')` (potentially `null`) and `logInfo` is imported from `@/core/logging/sentry/log`. The `useTransactionScope({ type: 'authentication' })` call from the MUI handler is also preserved on the CRD handler, so APM transaction grouping is unchanged.

**Rationale**:
- Strict MUI parity per Clarification Q4. The breadcrumb format, the field name (`origin`), and the transaction scope all match — observability dashboards keep working without changes (SC-008).
- The boundary throw-path emits **no** new explicit log. Sentry's automatic capture of `NotAuthorizedError` continues to fire (it does today), and that's the only signal for the throw-path. We do not add any new event there.

**Alternatives considered**:
- **Add a new structured event with extra metadata (CRD vs MUI render, route pattern, etc.)** — rejected: would diverge from MUI's signal shape and require dashboards to be updated. Not in scope.
- **Drop the log entirely on the CRD handler** — rejected: would lose the existing observability signal on `/restricted` landings. Parity demands we keep it.

---

## Decision 5 — "Go back" handler uses the project's `useNavigate(-1)` wrapper, gated by `window.history.length > 1`

**Decision**: The integration layer's `CrdAwareErrorComponent` and `CrdRestrictedRoute` both compute `showGoBack = typeof window !== 'undefined' && window.history.length > 1` at render time, and bind `onGoBack` to a thin closure: `() => navigate(-1)`, where `navigate` comes from `@/core/routing/useNavigate` (the project's existing wrapper around `react-router-dom`'s `useNavigate`). When `showGoBack` is false, the `onGoBack` prop is omitted (or set to `undefined`) and the CRD page hides the secondary button per FR-010.

**Rationale**:
- `useNavigate` is the project's existing abstraction for client-side navigation; using it preserves history semantics, unsaved-changes guards, and any future cross-cutting routing behavior.
- `window.history.length > 1` is the standard, broadly-supported signal that there's a previous entry to navigate to. It's not perfect (e.g., the user could have hard-loaded the page after navigating from somewhere on the same site — `length` would be > 1 but back would leave Alkemio), but it's the same heuristic the rest of the web uses and the user can always use the home action if back fails. Per the spec edge case: hiding when `length ≤ 1` covers the deep-link / new-tab / hard-reload cases that matter.
- The check is wrapped in a `typeof window` guard for SSR safety; even though Alkemio is currently a CSR-only SPA, the guard keeps the integration layer compatible if React Server Components are introduced later (Constitution II).

**Alternatives considered**:
- **Always show "Go back"** — rejected: yields a no-op button when there's no history, contradicting FR-010.
- **Use `navigate(returnUrl)` from the `origin` query parameter on `/restricted`** — rejected: `origin` is for logging only (per the spec edge case "Origin URL on /restricted is malformed or external"); it would be unsafe to navigate to it without validation, and "Go back" semantically means "browser back", not "originating page".
- **Use `window.history.back()` directly** — rejected: bypasses `react-router-dom`'s state management and the project's `useNavigate` wrapper. Constitution IV prefers the abstraction.

---

## Summary of approach

The feature is a thin integration over an unchanged error boundary. The presentational component (`CrdForbiddenPage`) is a pure shadcn/ui card with two buttons. The integration layer (`CrdAwareErrorComponent`, `CrdRestrictedRoute`, `isCrdRoute`) does the routing decision, sets the document title, fires the Sentry log on the `/restricted` path, and binds the navigation handlers. The MUI fallback (`Error403`, `Restricted`, `TopLevelLayout`) is preserved end-to-end and is the rendered output whenever the toggle is off or the pathname is not a CRD route.

No new GraphQL, no new browser APIs, no new dependencies, no new state shape.

Phase 1 — data model + contracts + quickstart — proceeds.
