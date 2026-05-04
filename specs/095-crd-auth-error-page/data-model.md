# Phase 1 Data Model: CRD — Unauthorized / Forbidden Error Page

**Feature**: 095-crd-auth-error-page
**Date**: 2026-04-28

This feature persists nothing and adds no GraphQL operations. The "data model" here is the in-memory, render-time data flow between the integration layer and the CRD presentational component. It is captured for clarity and to inform task decomposition; nothing in this document is a runtime entity, table, or cache key.

---

## Entities

### 1. `CrdForbiddenPageProps` (presentational contract)

The minimal prop interface for the CRD `CrdForbiddenPage` component.

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes | The page headline (rendered as `<h1>`). Sourced from `crd-error:forbidden.title` by the integration layer. |
| `description` | `string` | yes | Plain-language explanation of the restricted state. Sourced from `crd-error:forbidden.description`. |
| `goHomeLabel` | `string` | yes | Label for the primary action button. Sourced from `crd-error:forbidden.actions.goHome`. |
| `goBackLabel` | `string` | yes | Label for the secondary action button (only shown when `showGoBack` is true). Sourced from `crd-error:forbidden.actions.goBack`. |
| `onGoHome` | `() => void` | yes | Click handler for the primary action. The CRD component invokes it; it does not construct a URL. |
| `onGoBack` | `() => void` | no | Click handler for the secondary action. May be `undefined` when there is no in-app history; if present, the button is rendered. |
| `showGoBack` | `boolean` | no | Explicit visibility flag for the secondary action. When `true`, the button is rendered (and `onGoBack` MUST be defined). When `false` or omitted, the button is hidden. |

**Validation rules**:
- The component MUST NOT read `i18n` itself — all visible text comes from props.
- The component MUST NOT call `useNavigate`, `useLocation`, or any router hook.
- The component MUST NOT read auth state, Apollo cache, domain context, or any business-logic module.
- The go-back button is rendered only when `showGoBack === true` AND `onGoBack` is defined; if either is missing the button is hidden (matches `src/crd/components/error/CrdForbiddenPage.tsx`, which gates rendering on `showGoBack === true && onGoBack !== undefined`). The integration layer pairs them, so the asymmetric case is not expected in practice.

**Why a flat string-prop shape (not a "view model object")**:
- Per Constitution principle V (DIP) and the CRD architectural rules, presentational components depend only on prop abstractions. A flat shape keeps the dependency surface minimal and the component easy to render in Storybook / Vitest in isolation.
- The MUI `Error403` is similarly flat (it just calls `t()` and renders) — keeping the CRD shape simple is a stylistic match.

---

### 2. `ForbiddenRenderContext` (integration-layer in-memory state)

The render-time bundle the integration layer assembles when the CRD forbidden page needs to render. Lives only inside `CrdAwareErrorComponent` and `CrdRestrictedRoute` while React renders; never persisted, never escapes the function call.

| Field | Type | Required | Source |
|---|---|---|---|
| `pathname` | `string` | yes (boundary path only) | From `errorState.pathname` captured by the boundary at error time. The `/restricted` handler does not consult this field — the route is always CRD when mounted. |
| `isCrdRoute` | `boolean` | yes (boundary path only) | Derived: `isCrdRoute(pathname)`. The `/restricted` handler does not consult this. |
| `crdEnabled` | `boolean` | yes (boundary path only) | Derived: `useCrdEnabled()`. The `/restricted` handler does not consult this at render time — the toggle decision happens at route declaration in `TopLevelRoutes.tsx`. |
| `isNotAuthorized` | `boolean` | yes (boundary path only) | From `errorState.isNotAuthorized`. Other classifications (`isNotFound`, generic errors) MUST fall through to the MUI fallback. |
| `shouldRenderCrd` | `boolean` | yes (boundary path only) | Derived: `crdEnabled && isCrdRoute && isNotAuthorized === true`. The single decision bit on the boundary path. |
| `showGoBack` | `boolean` | yes | Derived from the `hasInAppHistory()` helper in `src/main/crdPages/error/hasInAppHistory.ts` (which wraps `typeof window !== 'undefined' && window.history.length > 1` per Constitution IV's wrapper requirement for browser-API usage). |
| `originParam` | `string \| null` | only on `/restricted` | From `useQueryParams().get('origin')`. Used for the Sentry log only — never for action wiring. |

**Validation rules**:
- The integration layer MUST compute `shouldRenderCrd` exactly as `crdEnabled && isCrdRoute && isNotAuthorized === true`. Any other formula breaks either (a) the spec's edge case "Forbidden state on a route that is NOT a CRD route, while CRD toggle is ON" (the `isCrdRoute` filter) or (b) the explicit out-of-scope statement that CRD-styled 404 is not delivered by this feature (the `isNotAuthorized` filter).
- `originParam` MUST NOT be passed to the CRD presentational component; it is integration-layer-only state for the Sentry breadcrumb.
- The integration layer MUST NOT read auth state to decide whether to render the page (the page is auth-agnostic per FR-021). It reads auth state only via the upstream throw-path code (`useRestrictedRedirect`), which we do not modify.

---

### 3. `ForbiddenRenderDecision` (the routing branch)

A ternary decision: render CRD forbidden, render MUI fallback, or pass through. Captured here as a state-machine-style table because it is the most testable / reviewable part of the integration. The decision uses three inputs from the boundary state and runtime: `crdEnabled` (the CRD toggle), `isCrdRoute(pathname)` (the predicate), and `isNotAuthorized` (the boundary's classification of the thrown error). NotFound and other error classes (`isNotFound === true`, generic errors) are explicitly excluded from the CRD branch — CRD-styled NotFound is out of scope per the spec.

| `crdEnabled` | `isCrdRoute(pathname)` | `isNotAuthorized` | Render |
|:---:|:---:|:---:|---|
| `false` | (any) | (any) | **MUI**: `<TopLevelLayout><Error40X {...errorState} /></TopLevelLayout>` |
| `true` | `false` | (any) | **MUI**: same as above (CRD chrome would be jarring on a non-CRD route, per the spec's edge case) |
| `true` | `true` | `false` or `undefined` | **MUI**: same as above. Covers `isNotFound === true` (CRD 404 is out of scope) and any other state branch. |
| `true` | `true` | `true` | **CRD**: `<CrdLayoutWrapper><CrdForbiddenPage … /></CrdLayoutWrapper>` |

The `/restricted` route handler (`CrdRestrictedRoute`) uses a simpler decision: it is mounted by `TopLevelRoutes.tsx` only when `crdEnabled === true` (the toggle decision happens at route-declaration time), and it always renders the CRD page for any visitor (auth-agnostic per Clarification Q4). It does not consult `isCrdRoute` (the route is always CRD when mounted) and does not consult `isNotAuthorized` (no error has been thrown — the user navigated to `/restricted` directly).

---

### 4. i18n key map (`crd-error` namespace)

The exhaustive set of keys this feature adds. Per Clarification Q5, no other keys are added preemptively.

| Key | English value | Notes |
|---|---|---|
| `forbidden.title` | "Access Restricted" | Reuses existing `pages.unauthorized.header` value verbatim. ALSO used as the document title argument to `usePageTitle`, which already appends " \| Alkemio" automatically — so this single key serves both as the `<h1>` text and as the tab title prefix (no separate `documentTitle` key needed). |
| `forbidden.description` | "The page you're trying to access is not available for you." | Reuses existing `pages.unauthorized.subheader` value verbatim. |
| `forbidden.actions.goHome` | "Go to Home" | New string; concise, follows MUI tone. |
| `forbidden.actions.goBack` | "Go back" | New string. |

**Final key set (4 keys)**:
- `forbidden.title`
- `forbidden.description`
- `forbidden.actions.goHome`
- `forbidden.actions.goBack`

All four MUST exist in en/nl/es/bg/de/fr at merge time. The icon is rendered with `aria-hidden="true"` (FR-028 default) and therefore needs no i18n key.

---

## State transitions

There are no persisted entities and therefore no formal state transitions in the data-model sense. Two render-time control flows worth naming:

1. **Boundary throw-path** (User Story 1):
   - `useRestrictedRedirect` (or `UrlResolverProvider`) throws `NotAuthorizedError` (with no `redirectUrl` because the user is authenticated) →
   - `Error40XBoundary.getDerivedStateFromError` updates state with `isNotAuthorized: true`, `pathname` from `window.location.pathname` →
   - `Error40XBoundary.render` invokes `errorComponent(state)` →
   - `CrdAwareErrorComponent` reads `state.pathname` + `useCrdEnabled()`, decides CRD vs MUI →
   - On CRD: `<CrdLayoutWrapper><CrdForbiddenPage … /></CrdLayoutWrapper>` mounts.

2. **`/restricted` route-handler path** (User Story 2):
   - User navigates to `/restricted?origin=…` →
   - The route's `element` is `<CrdRestrictedRoute />` (when CRD is on) or `<Restricted />` (when off) — chosen at the route declaration in `TopLevelRoutes.tsx` based on `useCrdEnabled()` →
   - `CrdRestrictedRoute` fires `logInfo` once per `origin` change (via `useEffect`) and renders `<CrdLayoutWrapper><CrdForbiddenPage … /></CrdLayoutWrapper>`.

In both flows, "Go to Home" calls `navigate(`/${TopLevelRoutePath.Home}`)`; "Go back" calls `navigate(-1)` and is hidden when `window.history.length <= 1`. The boundary's `getDerivedStateFromProps` resets `state.hasError` on the next pathname change, so navigating away clears the forbidden render automatically.

---

---

## 5. `SpaceSettingsAccessGuardInput` (privilege gate)

The inputs to `useSpaceSettingsAccessGuard(spaceId, scopeLoading)` — the page-level guard wrapping `CrdSpaceSettingsPage`. Per FR-033 / FR-034.

| Field | Type | Source |
|---|---|---|
| `spaceId` | `string` | From `useSettingsScope().id`. Empty while the URL resolver is still loading. |
| `scopeLoading` | `boolean` | From `useSettingsScope().loading`. The guard skips the `useRestrictedRedirect` check while either this is true or `spaceId` is empty. |

**Validation rules**:

- The guard MUST `skip` the privileges query when `spaceId` is empty (no entity to check).
- The guard MUST `skip` the redirect logic when either `scopeLoading === true` or `!spaceId` — these mean the data hasn't settled yet, so any throw would be premature.
- The privilege reader MUST be `data => data.lookup.space?.authorization?.myPrivileges`. If `space` is null (rare — e.g. a non-existent space ID), the reader returns `undefined` and the standard `useRestrictedRedirect` semantics apply.
- The required privilege MUST be `AuthorizationPrivilege.Update` — Space Settings is admin-gated. Other CRD pages with member-only or admin-only views will use their own equivalent guards with their own appropriate privileges (out of scope here per FR-035).

---

## 6. `AncestorRedirectDispatchDecision` (CRD redirect dialog routing branch)

The runtime decision in `AncestorRedirectDispatcher` between rendering the CRD redirect dialog and the legacy MUI one. Per FR-036 / FR-037.

| `crdEnabled` | `isCrdRoute(pathname)` | `isNotAuthorized` | Render |
|:---:|:---:|:---:|---|
| `false` | (any) | (any) | **MUI** `RedirectToAncestorDialog` |
| `true` | `false` | (any) | **MUI** (CRD dialog over MUI page chrome would be inconsistent) |
| `true` | `true` | `false` or `undefined` | **MUI** (page below is MUI `Error40X` — e.g. NotFound — so the dialog must match) |
| `true` | `true` | `true` | **CRD** `CrdRedirectToAncestorDialog` |

The `isNotAuthorized === true` branch is the **same** decision branch that triggers the CRD forbidden page in `CrdAwareErrorComponent`. The two render decisions are kept aligned so the page+dialog visual pair is always consistent.

The `pathname` input comes from `useLocation().pathname` (current router state at boundary-render time, which is the URL that triggered the error). The `isNotAuthorized` input is forwarded from `Error40XBoundary.state.isNotAuthorized` via the boundary's render — see FR-039.

---

## 7. `CrdAuthRequiredPageProps` (presentational contract — US3)

The minimal prop interface for the CRD `CrdAuthRequiredPage` component (the `/required` analogue of §1).

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes | Page headline, rendered as `<h1>`. Sourced from `crd-error:authRequired.title`. |
| `description` | `string` | yes | First paragraph of the body explanation. Sourced from `crd-error:authRequired.description`. |
| `descriptionContinued` | `string` | yes | Second paragraph of the body (sign-in invitation). Sourced from `crd-error:authRequired.descriptionContinued`. |
| `signInLabel` | `string` | yes | Primary action label. Sourced from `crd-error:authRequired.actions.signIn`. |
| `orLabel` | `string` | yes | Separator label between the two actions. Sourced from `crd-error:authRequired.actions.or`. |
| `returnAsGuestLabel` | `string` | yes | Secondary action label. Sourced from `crd-error:authRequired.actions.returnAsGuest`. |
| `signInHref` | `string` | yes | URL the primary action navigates to. Constructed by the integration layer via `buildLoginUrl(returnUrl)`. |
| `returnAsGuestHref` | `string` | yes | URL the secondary action navigates to. Absolute URL: `${domain}/${TopLevelRoutePath.Home}` from `useConfig().locations.domain`. |
| `className` | `string` | no | Optional class merged into the root element via `cn()` for external composition. |

**Validation rules**:

- The component MUST NOT call `useTranslation`, `useNavigate`, `useLocation`, or any data hook. All copy and URLs come from props.
- Both actions MUST be rendered as real `<a href>` anchors composed with `Button asChild={true}` — programmatic navigation is forbidden inside `src/crd/`.
- The component MUST NOT branch on auth state, Apollo cache, or any business-logic module.

**Why two paragraphs (not one or a `<Trans>`)**: the MUI `AuthRequiredPage` renders `subheader` and `subheader2` as two stacked `<Tagline>` elements with a small gutter — the CRD page mirrors this exactly. A single concatenated string would lose the visual rhythm; a `<Trans>` would force the CRD presentational layer to know about i18n component interpolation, violating CRD rule 4 (props are plain TypeScript).

---

## 8. `AuthRequiredRenderContext` (integration-layer in-memory state — US3)

The render-time bundle assembled by `CrdAuthRequiredRoute`. Lives only inside the function while React renders.

| Field | Type | Source |
|---|---|---|
| `returnUrl` | `string \| undefined` | `useQueryParams().get(PARAM_NAME_RETURN_URL) ?? undefined` |
| `signInHref` | `string` | `buildLoginUrl(returnUrl)` from `src/main/routing/urlBuilders.ts` |
| `domain` | `string` | `locations?.domain` from `useConfig()`; empty string when undefined (matches MUI fallback) |
| `returnAsGuestHref` | `string` | `${domain ? 'https://' + domain : ''}/${TopLevelRoutePath.Home}` (mirrors `AuthRequiredPage.tsx` line 24-25 verbatim) |

**Validation rules**:

- The integration layer MUST NOT validate or filter `returnUrl` — it passes through to `buildLoginUrl` as-is, mirroring the MUI behavior. The platform's login flow is the single source of truth for return-URL validation.
- The integration layer MUST emit `useTransactionScope({ type: 'authentication' })` for APM parity; the absence of this call would silently regress observability on the `/required` render.
- The integration layer MUST NOT branch on auth state — the route is reached only via the upstream redirect for anonymous users, and any direct-visit case (authenticated user) renders the same content (matching MUI's existing behavior).

---

## 9. i18n key map (`crd-error` namespace — `authRequired.*` group, US3)

| Key | English value | Notes |
|---|---|---|
| `authRequired.title` | "Access Restricted" | Reuses existing `pages.authentication-required.header` value verbatim. Used both as `<h1>` text and as the `usePageTitle` argument. |
| `authRequired.description` | "The page you're trying to access is only available to registered users." | Reuses existing `pages.authentication-required.subheader` value verbatim. |
| `authRequired.descriptionContinued` | "Please sign in to continue. Don't have an account? Sign up for free." | Resolved-inline form of MUI's `subheader2` (`$t(common.account)` interpolation expanded to the literal "account"). |
| `authRequired.actions.signIn` | "Sign in / Sign up" | New combined label (MUI uses two separate `authentication.sign-in` + `authentication.sign-up` strings joined with " / "). The CRD form is a single string for simplicity. |
| `authRequired.actions.or` | "Or" | Standalone separator label between the two actions. |
| `authRequired.actions.returnAsGuest` | "Return to dashboard as guest" | Reuses existing `buttons.returnToDashboardAsGuest` value verbatim. |

All six MUST exist in en/nl/es/bg/de/fr at merge time. Translations are maintained manually (AI-assisted) per the CRD i18n process — not via Crowdin (FR-024).

---

## Cross-references

- Spec: [spec.md](./spec.md) — FR-001 through FR-044 ground these contracts.
- Research: [research.md](./research.md) — Decisions 1–5 cover the implementation rationale.
- Contract: [contracts/forbidden-page-props.md](./contracts/forbidden-page-props.md) — TypeScript-level contract at the integration ↔ CRD boundary (forbidden + auth-required + redirect dialog + privilege guard).
- Quickstart: [quickstart.md](./quickstart.md) — manual test recipes for all three stories and the toggle-off regression.
