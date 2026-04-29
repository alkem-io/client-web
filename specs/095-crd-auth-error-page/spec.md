# Feature Specification: CRD — Unauthorized / Forbidden Error Page

**Feature Branch**: `095-crd-auth-error-page`
**Created**: 2026-04-28
**Status**: Draft
**Input**: User description: "Missing Error state/pages in CRD — no authorization for a certain page. The CRD design system currently lacks proper error state pages for unauthorized access. When a user navigates to a page they don't have permission to view (e.g., a private space, a restricted admin page, or a subspace they're not a member of), the CRD layer needs a dedicated unauthorized/forbidden error page. This should match the CRD visual style (shadcn/ui + Tailwind), explain the situation clearly to the user, and offer recovery actions (e.g., go back, go home, sign in if not authenticated, request access if applicable)."

## Clarifications

### Session 2026-04-28

- Q: Should anonymous users on a CRD route see the CRD forbidden page with an explicit "Sign in" CTA, or continue to be silently redirected to the sign-in page as MUI does today? → A: **Preserve MUI behavior — silently redirect anonymous users to the sign-in page (no CRD page seen).** All auth-based behavior is mirrored 1:1 from MUI, including the `returnUrl` preservation that takes the user back to the originally-requested URL after successful sign-in. The CRD forbidden page is therefore only ever shown to **authenticated** users who land on a forbidden CRD route. After sign-in, if the now-authenticated user *still* lacks access, they see the CRD forbidden page (authenticated action set) — not a special "you signed in but still can't see this" state.
- Q: Should the CRD forbidden page expose a "Request access" / "Apply to join" action when the forbidden resource is a private Space the user could request membership to? → A: **No — out of scope for this feature.** The MUI parity goal wins: the MUI `Error403` does not expose a "Request access" action, so the CRD page does not either. The existing community-page apply flow remains the only way to request access. A future feature can revisit this once the broader CRD migration stabilizes.
- Q: How should the integration layer determine whether the current pathname is a CRD-enabled route (for the routing decision in FR-015 / FR-017)? → A: **Small static predicate maintained next to `useCrdEnabled` in `src/main/crdPages/`** — a `pathname → boolean` helper (e.g., `isCrdRoute(pathname)`) whose patterns mirror the per-route conditional in `TopLevelRoutes.tsx`. New CRD routes add a pattern to the predicate when they migrate. No new shared registry, no DOM detection, no toggle-only fallback. The predicate is the single source of truth for the routing decision and is independently unit-testable.
- Q: Should the integration layer emit Sentry / observability logs on the boundary throw-path, on `/restricted`, or both? → A: **Strict MUI parity — log only on `/restricted` (with `origin`); the boundary throw-path emits no new explicit log.** The existing Sentry auto-capture of `NotAuthorizedError` continues to do its job for the throw-path; no new breadcrumbs are added. This matches what the MUI implementation does today (the existing `logInfo('Attempted access to: ${origin}')` in `src/core/routing/Restricted.tsx` is the only explicit log) and keeps observability dashboards untouched.
- Q: What is the i18n namespace name for the CRD forbidden page? → A: **`crd-error`** — a generic CRD error-state namespace at `src/crd/i18n/error/error.<lang>.json`. The namespace is shared by future CRD error pages (404, generic 4xx/5xx) so they can drop their keys into the same file without a rename. **Smallest possible scope today**: this feature MUST add only the keys it needs for the forbidden page (headline, body, action labels, document title). It MUST NOT preemptively add keys for unimplemented CRD error pages — future features add their keys when they ship.
- Q: When an anonymous user navigates directly to `/restricted` (with the CRD toggle on), what happens? → A: **Match MUI: render the CRD forbidden page regardless of auth state.** MUI today does not check auth on `/restricted` — it renders `Error403` for anyone who navigates there. CRD parity follows the same rule. The CRD page itself is auth-agnostic (the only actions are "Go to Home" and "Go back", neither of which requires auth). The "CRD page is only ever shown to authenticated users" framing applies only to the **boundary throw-path** (where anonymous users are silently redirected upstream by `useRestrictedRedirect` / `UrlResolverProvider`), NOT to the `/restricted` route handler.

### Session 2026-04-29 — implementation-driven additions

- Q: When live-testing the implementation we discovered that visiting a private CRD page (e.g. `/<space>/settings/account`) while logged out renders the **full settings UI shell with empty fields** instead of triggering the boundary, because the CRD pages don't translate the backend's `FORBIDDEN_POLICY` GraphQL error into a `NotAuthorizedError` throw. How should this be fixed? → A: **Wire `useRestrictedRedirect` at the page-component level for every gated CRD page.** The receiving end (CRD forbidden page + boundary integration) is correct but useless if no CRD page actually throws. The first concrete fix lands in this PR: a new `useSpaceSettingsAccessGuard(spaceId, scopeLoading)` hook in `src/main/crdPages/topLevelPages/spaceSettings/` runs `useSpacePrivilegesQuery` and `useRestrictedRedirect` with `requiredPrivilege: AuthorizationPrivilege.Update`, gating the entire `CrdSpaceSettingsPage` and all its tabs. Other gated CRD pages will follow the same pattern in subsequent PRs (out of scope for this branch).
- Q: When the CRD forbidden page renders, the `closestAncestor` redirect dialog (the "We are redirecting you..." countdown) still rendered as the legacy MUI dialog on top of the CRD chrome. Should the dialog also be CRD-styled? → A: **Yes, when (and only when) the underlying error page is also CRD.** A new presentational `CrdRedirectDialog` lives in `src/crd/components/error/`; an integration wrapper `CrdRedirectToAncestorDialog` in `src/main/crdPages/error/` owns the countdown + space-card slot; an `AncestorRedirectDispatcher` (also in `src/main/crdPages/error/`) decides between CRD and MUI based on `crdEnabled && isCrdRoute(pathname) && isNotAuthorized === true` — the third condition is critical so a `NotFoundError` on a CRD route (which still uses the MUI 404 page since CRD 404 is out of scope) gets the **MUI** dialog on top, not the CRD dialog. Visual consistency is preserved page+dialog. The boundary file (`src/core/40XErrorHandler/ErrorBoundary.tsx`) gets a one-line import swap from `RedirectToAncestorDialog` to `AncestorRedirectDispatcher` and now passes `isNotAuthorized` from boundary state into the dispatcher.

## Background and Motivation

The CRD design system migration is replacing the legacy MUI pages page-by-page behind a localStorage feature toggle. Today, the MUI app handles unauthorized navigation through a single, shared error path: any `NotAuthorizedError` thrown from a data hook (or from the URL resolver, an admin guard, or a permission check) is caught by `Error40XBoundary` at the root and rendered as `Error403` inside `TopLevelLayout`, with a "Return to Dashboard" button. The same page is also reachable directly at `/restricted` (used by `NonAdminRedirect` and equivalent guards).

The CRD layer currently has no equivalent. When a user with the CRD toggle on hits a forbidden state on a CRD route, the existing MUI `Error403` is rendered inside the MUI `TopLevelLayout`, which:

1. Visually breaks the CRD experience — the CRD-styled chrome (`CrdLayoutWrapper`) is replaced mid-flow by an MUI page with MUI typography, MUI buttons, and MUI layout primitives. This is a jarring style discontinuity that the CRD migration is explicitly meant to eliminate.
2. Forces MUI code to be loaded for any CRD route that might forbid access, defeating one of the migration's CSS-isolation goals (`.crd-root`-scoped Tailwind, no MUI on CRD-only routes).
3. Offers a single recovery action ("Return to Dashboard") that doesn't take advantage of the CRD design language for visual emphasis or fit with the surrounding CRD chrome.

This feature delivers the CRD-styled forbidden / unauthorized page so that:

- Forbidden states on CRD routes render in the CRD visual language (shadcn/ui primitives, Tailwind tokens, `lucide-react` icons), inside the CRD layout chrome.
- Recovery actions ("Go to Home" and optional "Go back") are presented clearly and consistently. The action set is auth-state-agnostic — it works for both authenticated and anonymous users.
- The shared `Error40XBoundary` mechanism continues to work — CRD does not introduce a parallel error system; instead, the `errorComponent` rendered by the boundary becomes CRD-aware, choosing the CRD page when the originating route is a CRD route.
- The `/restricted` top-level route also renders the CRD page when CRD is enabled, so existing redirect targets (e.g., `NonAdminRedirect` redirecting to `/restricted?origin=...`) land users on the CRD experience without code changes at the call site. This route does not check auth (matching MUI's existing behavior), so an anonymous user who navigates there directly also sees the CRD page.
- All auth-based behavior is mirrored 1:1 from MUI: on the **boundary throw-path**, anonymous users continue to be silently redirected to the sign-in page with the `returnUrl` parameter preserved (the existing `AUTH_REQUIRED_PATH` + `buildReturnUrlParam(pathname)` pattern), so a successful sign-in returns the user to the page they originally wanted. On the `/restricted` route handler, no new auth-aware redirect is introduced.

The MUI page is the canonical reference for copy, IA, and recovery semantics — the CRD page is a visual and structural re-implementation, not a redesign of the unauthorized experience.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Authenticated user hits a forbidden CRD page (Priority: P1)

A signed-in user navigates to a CRD page they don't have permission to view (for example: a private Space they're not a member of, a Subspace whose contents are restricted to its members, an admin route they don't have privileges for, or a settings dialog page on a Space they don't admin). The page they were trying to load is replaced by a CRD forbidden page that:

- Renders inside the CRD layout (same header / footer chrome the user has been seeing on every other CRD page in the session).
- Explains in plain language that they don't have access to that resource.
- Offers a primary recovery action that returns them to a known-good place (their CRD home / dashboard).
- Offers a secondary recovery action to go back (browser-history equivalent) when there is somewhere to go back to.
- Does NOT offer a "Sign in" affordance — the action set is auth-state-agnostic; for the throw-path covered by this story, anonymous users have already been silently redirected to sign-in upstream and never reach this page.

**Why this priority**: This is the primary forbidden flow this feature exists for. Without this story, every CRD page that can forbid access falls back to an MUI page, which (a) breaks the visual flow and (b) forces MUI to load on routes that should be MUI-free per the migration's CSS isolation goals.

**Independent Test**: With the CRD toggle on, sign in as a user with no access to a known-private Space, navigate directly to that Space's URL, and verify (a) the CRD layout chrome remains visible, (b) the body shows a CRD forbidden page with a clear message, (c) a primary "Go to Home" (or equivalent) button is shown and works, (d) a secondary "Go back" action is shown when applicable, (e) no MUI components are mounted in the page body, (f) the browser tab title reflects the restricted state.

**Acceptance Scenarios**:

1. **Given** the CRD toggle is on and an authenticated user navigates to a CRD route that throws `NotAuthorizedError`, **When** the error boundary catches the error, **Then** a CRD forbidden page is rendered inside the CRD layout chrome (header / footer match the rest of the CRD app)
2. **Given** the forbidden page is shown to an authenticated user, **When** they look at the recovery actions, **Then** they see a primary action that takes them to the CRD home / dashboard and a secondary action that takes them back one step in browser history (when history is available)
3. **Given** the forbidden page is shown to an authenticated user, **When** they read the body copy, **Then** the message clearly states that the page is restricted and that the lack of access is the cause (not, for example, a generic "something went wrong")
4. **Given** the forbidden page is shown to an authenticated user, **When** they look at the chrome, **Then** the CRD layout (header, footer) remains in place and no MUI page layout is mounted
5. **Given** the forbidden page is shown, **When** the browser tab is inspected, **Then** the document title reflects the restricted state (e.g., "Access Restricted | Alkemio") matching the MUI parity behavior
6. **Given** the user clicks the primary recovery action, **When** the navigation completes, **Then** they land on the CRD home / dashboard with the CRD layout intact (no full reload back to MUI)
7. **Given** there is no in-app history (the user landed on the forbidden page from a deep link, a new tab, or a hard reload), **When** the page renders, **Then** the secondary "Go back" action is hidden so the user is not offered a no-op action

---

### User Story 2 — Direct visit to `/restricted` renders the CRD page when CRD is enabled (Priority: P2)

A user is redirected to `/restricted?origin=...` by an existing guard (today: `NonAdminRedirect` for admin pages, and any future call site that uses the same path). When the CRD toggle is on, that route renders the CRD forbidden page inside CRD layout chrome — not the MUI `Error403` inside `TopLevelLayout`.

**Why this priority**: Existing call sites (admin guards, future feature guards) already redirect to `/restricted` and we don't want to refactor every call site to be CRD-aware. By making the route itself toggle-aware, every existing redirect target "just works" under CRD, and the page lookup point stays a single seam in the routing layer. This story is independent of Story 1 because it covers the redirect-based forbidden flow, not the throw-based one.

**Independent Test**: With the CRD toggle on, manually navigate to `/restricted` (or to `/restricted?origin=/somewhere`) while signed in, and verify the CRD forbidden page is shown inside the CRD layout chrome, with the same recovery actions as Story 1. With the CRD toggle off, the same URL renders the existing MUI `Error403` inside `TopLevelLayout` — unchanged from today.

**Acceptance Scenarios**:

1. **Given** the CRD toggle is on and the user is signed in, **When** the user visits `/restricted`, **Then** the CRD forbidden page is rendered inside the CRD layout chrome with the authenticated action set
2. **Given** the CRD toggle is on and the user is signed in, **When** they are redirected to `/restricted?origin=<path>` by an admin or feature guard, **Then** the CRD page is shown and the `origin` query parameter is preserved for telemetry / logging in the same way the MUI page logs it today
3. **Given** the CRD toggle is OFF, **When** the user visits `/restricted`, **Then** the existing MUI `Error403` inside `TopLevelLayout` is rendered unchanged (zero regression)
4. **Given** the user is anonymous, **When** a CRD route throws `NotAuthorizedError` upstream (in `useRestrictedRedirect` / `UrlResolverProvider`), **Then** they are silently redirected to the sign-in page with the `returnUrl` parameter set to the originally-requested URL — exactly as MUI does today; the boundary throw-path never reaches the CRD `errorComponent` for anonymous users
5. **Given** the user is anonymous, **When** they navigate directly to `/restricted` (with or without an `origin` query parameter), **Then** the CRD forbidden page is rendered (matching MUI behavior — `src/core/routing/Restricted.tsx` does not check auth state today). The CRD page is auth-agnostic on this route

---

### Edge Cases

- **Forbidden state caught mid-route-transition**: If the user is mid-navigation between two CRD pages and the destination throws `NotAuthorizedError`, the boundary's existing reset-on-pathname-change behavior (`getDerivedStateFromProps` in `Error40XBoundary`) MUST keep working — i.e., when the user then clicks "Go to Home" or "Go back", the boundary clears its error state and the next route renders normally without a stale forbidden page.
- **Forbidden state on a route that is NOT a CRD route, while CRD toggle is ON**: Some routes are MUI-only even when CRD is enabled (the toggle is page-by-page). If an MUI route throws `NotAuthorizedError` while CRD is on, the MUI `Error403` is shown — NOT the CRD page. This avoids mounting Tailwind / shadcn primitives inside an MUI page tree. The selection between CRD and MUI forbidden page is based on whether the *current pathname* is a CRD-enabled route, not on the toggle alone.
- **Anonymous user reaches a forbidden CRD route via the throw-path**: The boundary's existing `redirectUrl` branch (`if (this.state.redirectUrl) { return <Navigate to={...} />; }`) fires before any `errorComponent` is invoked. Today, `useRestrictedRedirect` and `UrlResolverProvider` already throw `NotAuthorizedError` with `redirectUrl: AUTH_REQUIRED_PATH + buildReturnUrlParam(pathname)` whenever the user is unauthenticated, so the boundary does the silent redirect upstream of the CRD `errorComponent`. This feature MUST NOT change that throwing logic — the upstream code that distinguishes "anonymous → redirect" from "authenticated but no access → render fallback" remains the source of truth on the throw-path.
- **Anonymous user navigates directly to `/restricted`**: The `/restricted` route handler does NOT check auth state (matching MUI's `src/core/routing/Restricted.tsx`, which has never done so). An anonymous user typing `/restricted` (or `/restricted?origin=<path>`) into the URL bar with the CRD toggle on sees the CRD forbidden page rendered with the standard auth-agnostic action set ("Go to Home" + optional "Go back"). This is consistent with MUI parity 1:1.
- **No history to go back to**: If the user landed on the forbidden page directly (no in-app history — e.g., from a deep link, a new tab, or a hard reload), the secondary "Go back" action MUST be hidden or disabled. The primary action ("Go to Home") MUST always be available.
- **Origin URL on `/restricted` is malformed or external**: When `/restricted?origin=<value>` is opened with an invalid, empty, or off-platform `origin` value, the CRD page MUST still render correctly. The `origin` is used only for logging (matching the MUI behavior in `src/core/routing/Restricted.tsx`); it MUST NOT influence the action buttons.
- **Sign-in returns to a page the now-authenticated user *still* can't access**: An anonymous user is silently redirected to sign-in (per the upstream redirect path). After successful sign-in they return via `returnUrl` to the originally-requested URL. If the now-authenticated user *still* lacks access, the data hooks throw `NotAuthorizedError` again — this time without `redirectUrl` (because they're authenticated) — and the CRD forbidden page is shown with the authenticated action set. No special "you signed in but still can't see this" copy is required; this matches today's MUI flow exactly.
- **Document title on forbidden state**: The browser tab title MUST reflect the restricted state (matching MUI's `pages.titles.restricted`) regardless of which underlying route triggered the forbidden state — the user shouldn't see the title of the page they were trying to load while looking at a forbidden page.
- **Forbidden state inside a dialog / overlay on a CRD page**: Some CRD experiences are overlay-style (e.g., the search overlay, a settings dialog) on top of an underlying CRD page. If a forbidden error is thrown while an overlay is open, the boundary unwinds to the page level and the CRD forbidden page replaces the underlying CRD page (the overlay is dismissed). This matches the boundary's existing render-replace semantics and does not require a per-overlay forbidden state.

## Requirements *(mandatory)*

### Functional Requirements

#### Visual & Structural Parity with the CRD Design System

- **FR-001**: The CRD forbidden page MUST be a presentational component living in `src/crd/` and MUST comply with the CRD architectural rules (`src/crd/CLAUDE.md`): zero imports from `@mui/*`, `@emotion/*`, `@apollo/client`, `@/core/apollo/*`, `@/domain/*`, `@/core/auth/*`, `react-router-dom`, or `formik`; styling via Tailwind only; icons from `lucide-react`; primitives from `@/crd/primitives/*`.
- **FR-002**: The CRD forbidden page's prop interface MUST be the entire surface through which the integration layer drives its behavior. Specifically, props MUST include the recovery action handlers (`onGoHome`, `onGoBack`), a boolean flag governing visibility of the secondary action (`showGoBack`), and the user-visible copy strings (`title`, `description`, `goHomeLabel`, `goBackLabel`). The page MUST NOT call `useTranslation` itself — copy is passed in, not looked up. (FR-009 separately covers what the actions can NOT do internally; FR-021 separately covers auth-state agnosticism.)
- **FR-003**: The page MUST render inside the CRD layout chrome (`CrdLayoutWrapper`) — the user MUST see the same CRD header / footer they were seeing before the forbidden state was triggered. The MUI `TopLevelLayout` MUST NOT be mounted on the CRD forbidden page.
- **FR-004**: The page's typography, spacing, and surface treatment MUST follow the same CRD primitives and Tailwind tokens used by other CRD pages (e.g., the CRD dashboard). It MUST NOT use MUI typography (`PageTitle`, `Tagline`, etc.) or MUI layout components (`PageContent`, `PageContentBlock`, `PageContentColumn`).
- **FR-005**: The page MUST render the page heading as an `<h1>` element (per FR-027) containing the string at i18n key `crd-error:forbidden.title` (English value: "Access Restricted"). It MUST also render a body explanation in plain language, sourced from `crd-error:forbidden.description`. Both strings come from the `crd-error` namespace in `src/crd/i18n/error/error.<lang>.json` per FR-024.
- **FR-006**: The page MUST display a `lucide-react` `ShieldAlert` icon at the top of the content card as a visual cue for the restricted state. The icon MUST be rendered via Tailwind sizing tokens only (no inline `style={...}`, no hard-coded pixel values), and MUST carry `aria-hidden="true"` per FR-028 (the textual headline carries the meaning). If a future redesign substitutes the icon, that substitution requires a spec amendment — the icon choice is intentionally pinned here so the design and integration sides agree.

#### Recovery Actions

- **FR-007**: The page MUST present a primary recovery action ("Go to Home") and MAY present a secondary recovery action ("Go back") when in-app history is available. These are the only two actions on the CRD forbidden page.
- **FR-008**: The primary action MUST be a real keyboard-focusable button or link rendered with the CRD primary-button styling. The secondary action, when shown, MUST use the CRD secondary-button styling. Both MUST have visible focus indicators meeting WCAG 2.1 AA.
- **FR-009**: The CRD presentational component MUST NOT internally construct URLs, call routing hooks (`useNavigate`, `useLocation`), read browser history, navigate via `window.location`, or import any business-logic module (Apollo, domain, auth). Recovery actions execute exclusively through the prop handlers passed by the integration layer.
- **FR-010**: The "Go back" secondary action MUST be hidden when there is no in-app history to return to (e.g., the user landed on the forbidden page from a deep link, a new tab, or a hard reload). The integration layer is responsible for determining history availability and passing the corresponding `showGoBack` flag.
- **FR-011**: The CRD forbidden page MUST NOT include a "Sign in" affordance. On the boundary throw-path, anonymous users are silently redirected to the sign-in page upstream by the existing MUI authentication mechanism (the boundary's `redirectUrl` branch fires for `NotAuthorizedError` instances that carry an `AUTH_REQUIRED_PATH` redirect URL) and never reach the CRD page. On the `/restricted` direct-visit path, the CRD page is auth-agnostic — adding a "Sign in" CTA would be inconsistent (it would only make sense for anonymous visitors and the page MUST NOT branch on auth state per FR-021). MUI parity wins: MUI's `Error403` has no "Sign in" CTA either.
- **FR-012**: The CRD forbidden page MUST NOT include a "Request access" / "Apply to join" affordance. This is out of scope per the MUI parity goal (resolved in Clarifications, 2026-04-28).

#### Integration with the Existing Error Boundary and Routing

- **FR-013**: The shared `Error40XBoundary` mechanism in `src/core/40XErrorHandler/` MUST continue to be the single catch point for `NotAuthorizedError`. This feature MUST NOT introduce a parallel CRD-specific error boundary.
- **FR-014**: The `Error40XBoundary`'s existing `redirectUrl` branch (the upstream silent redirect for anonymous users) MUST remain unchanged and MUST continue to fire before any `errorComponent` is invoked. The CRD-aware `errorComponent` is therefore reached only when `NotAuthorizedError` carries no `redirectUrl` — i.e., the authenticated-but-forbidden case.
- **FR-015**: The `errorComponent` callback passed to `Error40XBoundary` at the root MUST decide between the CRD forbidden page and the MUI `Error403` based on whether the *current pathname* is a CRD-enabled route AND the CRD toggle is on. When both conditions hold, the CRD page is rendered inside `CrdLayoutWrapper`; otherwise the existing MUI `Error403` inside `TopLevelLayout` is rendered. The "is the current pathname a CRD-enabled route?" check MUST be implemented as a small static predicate (e.g., `isCrdRoute(pathname): boolean`) living in `src/main/crdPages/` next to `useCrdEnabled`, whose patterns mirror the per-route conditional in `TopLevelRoutes.tsx`. The predicate MUST be independently unit-testable, MUST NOT depend on DOM detection, and MUST NOT be replaced by a toggle-only fallback.
- **FR-016**: The `/restricted` top-level route MUST be updated similarly: when the CRD toggle is on, render the CRD forbidden page inside `CrdLayoutWrapper`; otherwise render the existing `Restricted` component (MUI `Error403` inside `TopLevelLayout`). The route MUST continue to log the `origin` query parameter for analytics / Sentry, matching the existing behavior in `src/core/routing/Restricted.tsx`.
- **FR-017**: The integration layer (the `errorComponent` and the `/restricted` route handler) MUST live in `src/main/crdPages/` (the "glue" layer per the project conventions) — the routing decision is business / app concerns, not presentational.
- **FR-018**: The boundary's existing reset-on-pathname-change behavior (`getDerivedStateFromProps`) MUST work unchanged when the CRD page is the rendered fallback — the boundary clears its error state on navigation, just as it does today with the MUI page.

#### Auth-Based Behavior Parity (Mirror MUI 1:1)

- **FR-019**: The existing upstream redirect-to-sign-in behavior for anonymous users MUST be preserved verbatim, AND this feature MUST NOT introduce any new auth-related logic, branching, or redirect targets. Concretely: `useRestrictedRedirect`, `UrlResolverProvider`, and any other call site that today throws `new NotAuthorizedError({ redirectUrl: AUTH_REQUIRED_PATH + buildReturnUrlParam(pathname) })` MUST continue to do so unchanged; the `returnUrl` query parameter MUST continue to point to the originally-requested URL so a successful sign-in lands the user back on that page; the sign-in flow, sign-up flow, and post-sign-in redirect are mirrored 1:1 from the existing MUI implementation.
- **FR-020**: *(Removed — merged into FR-019.)*
- **FR-021**: The CRD forbidden page MUST be auth-state-agnostic — its render is identical for authenticated and anonymous users, and it MUST NOT branch on or read authentication state. On the **boundary throw-path**, anonymous users are silently redirected upstream by `useRestrictedRedirect` / `UrlResolverProvider` (per FR-014) and never reach the page; on the **`/restricted` direct-visit path**, anyone (including anonymous users) sees the CRD page, matching MUI's existing `src/core/routing/Restricted.tsx` behavior. The action set ("Go to Home" + optional "Go back") works for both auth states without modification.

#### Document Title, Logging, and Telemetry

- **FR-022**: The integration layer MUST set the document tab title to the restricted-state title (matching the existing `pages.titles.restricted` MUI key value) on every CRD forbidden render. The title hook MUST live in the integration layer, not in the CRD presentational component.
- **FR-023**: Observability is mirrored 1:1 from MUI: the CRD `/restricted` route handler MUST emit the same `logInfo('Attempted access to: ${origin}')` Sentry breadcrumb that `src/core/routing/Restricted.tsx` emits today, with the `origin` query parameter passed through verbatim. The boundary throw-path MUST NOT emit any new explicit log — Sentry's existing automatic capture of `NotAuthorizedError` is the sole observability signal for that flow, exactly as today. No new breadcrumbs, events, or telemetry beyond what the MUI path emits today.

#### Internationalization

- **FR-024**: All user-visible strings on the CRD forbidden page (headline, body explanation, all recovery action labels, the document title, accessibility-only labels) MUST come from the **`crd-error`** i18n namespace at `src/crd/i18n/error/error.<lang>.json` (one file per language) per `src/crd/CLAUDE.md`. The namespace is intentionally generic so future CRD error pages (404, generic 4xx/5xx) can drop their keys into the same files without a rename when they ship. Strings MUST be provided in all six supported languages (en, nl, es, bg, de, fr) at merge time. This feature MUST add **only** the keys it needs for the forbidden page — it MUST NOT preemptively add keys for unimplemented CRD error pages. CRD translations are maintained manually (AI-assisted), not via Crowdin.
- **FR-025**: Where a sufficiently equivalent string already exists in the MUI app (e.g., `pages.unauthorized.header` = "Access Restricted", `pages.titles.restricted`), the CRD copy SHOULD reuse that wording verbatim in English for consistency with the MUI parity goal, then be translated for the other five languages.

#### Accessibility (WCAG 2.1 AA)

- **FR-026**: The CRD forbidden page MUST be operable by keyboard alone. The primary action MUST receive focus on render so the user can act with a single Enter / Space keypress. The secondary action (when shown) MUST be reachable via Tab from the primary.
- **FR-027**: The page's headline MUST be a real heading element with appropriate level (`<h1>`) so screen readers announce it as the page heading.
- **FR-028**: The visual icon / illustration MUST either be marked as decorative (`aria-hidden="true"`) or have a text alternative — it MUST NOT be the only conveyor of the restricted state (the textual headline always conveys the state).
- **FR-029**: Action buttons MUST have accessible names that match their visible labels and MUST have visible focus indicators meeting WCAG 2.1 AA contrast requirements.

#### Architectural & Migration Constraints

- **FR-030**: Toggling the CRD feature flag OFF MUST leave the existing MUI forbidden flow completely untouched — `Error40X`, `Error403`, `Error404`, `Restricted`, `Error40XBoundary`, `useRestrictedRedirect`, and `NonAdminRedirect` MUST continue to behave exactly as they do today, with zero regression. The CRD page is purely additive at the integration layer.
- **FR-031**: The MUI `Error403` page and its associated `TopLevelLayout` wiring MUST remain in the codebase until *all* CRD pages are migrated and the feature toggle is removed (per the migration plan in `CLAUDE.md`). This feature MUST NOT delete or refactor the MUI forbidden page.
- **FR-032**: The CRD forbidden page MUST NOT introduce a new GraphQL document, schema change, or API call. The page is purely presentational; the auth state it reflects is already known to the integration layer through the existing auth context.

#### Privilege Gating on Gated CRD Pages

- **FR-033**: Each gated CRD page (admin-only, member-only, etc.) MUST translate backend `FORBIDDEN_POLICY` errors and missing-privilege states into a `NotAuthorizedError` throw at the page-component level via `useRestrictedRedirect`, BEFORE any tab data hooks fire. Without this, the page chrome renders for unauthorized users while underlying queries return `data: null` — the bug uncovered during implementation on `/<space>/settings/account`.
- **FR-034**: The first such gate MUST cover the CRD Space Settings surface. A reusable hook `useSpaceSettingsAccessGuard(spaceId, scopeLoading)` lives in `src/main/crdPages/topLevelPages/spaceSettings/` and runs `useSpacePrivilegesQuery` + `useRestrictedRedirect` with `requiredPrivilege: AuthorizationPrivilege.Update`. `CrdSpaceSettingsPage.tsx` calls it at the top of its component body, immediately after `useSettingsScope()`.
- **FR-035**: Auditing every other gated CRD page and applying equivalent guards is **out of scope** for this feature. Each subsequent CRD page migration is responsible for wiring its own page-level guard with the privilege appropriate to that surface (e.g. `Read` on a member-only view, `Update` on an admin surface).

#### CRD-Styled Redirect Dialog

- **FR-036**: When the boundary's `closestAncestor` countdown dialog renders on top of a CRD page, the dialog itself MUST be CRD-styled (shadcn `Dialog` primitive, Tailwind tokens, `lucide-react` Lock icon). When the underlying page is the MUI fallback (toggle off, non-CRD route, or NotFound on a CRD route), the dialog MUST be the existing MUI `RedirectToAncestorDialog` to preserve visual consistency between page and dialog.
- **FR-037**: The dispatch decision (CRD dialog vs MUI dialog) MUST be: `crdEnabled && isCrdRoute(pathname) && isNotAuthorized === true`. The `isNotAuthorized` term ensures the dialog matches the underlying error page — `NotFoundError` on a CRD route falls through to the MUI 404 with the MUI dialog on top.
- **FR-038**: The CRD redirect dialog MUST be props-driven per the CRD architectural rules: it MUST NOT call `useTranslation`, `useNavigate`, `useSpaceCardQuery`, or any business-logic hook. The integration wrapper `CrdRedirectToAncestorDialog` handles the countdown timer, space-card query, and navigation, and passes the rendered ancestor card via an `ancestorSlot: ReactNode` prop. Translation strings reuse the existing `components.urlResolver.redirectDialog.*` keys (resolved by the integration layer, not the dialog itself) — no new i18n keys are introduced.
- **FR-039**: The boundary file (`src/core/40XErrorHandler/ErrorBoundary.tsx`) MUST be limited to (a) one import swap (`RedirectToAncestorDialog` → `AncestorRedirectDispatcher`) and (b) passing `this.state.isNotAuthorized` to the dispatcher. The class component's catch logic, state shape, and `redirectUrl` branch remain unchanged. The legacy MUI `RedirectToAncestorDialog.tsx` MUST remain in the codebase as the toggle-off / non-CRD-route fallback consumed by the dispatcher.

### Key Entities

- **Forbidden Render Context**: The bundle of state assembled by the integration layer when a forbidden render is triggered: what the originally-requested path was, whether `Go back` history is available, and which CRD i18n strings to use. Lives only as an in-memory render-time object, not persisted.
- **Recovery Action**: A single user-facing button on the forbidden page, defined by a label (i18n key), a click handler (provided by the integration layer), an optional visibility flag (for `Go back`), and a styling tier (primary or secondary).
- **Forbidden Render Decision**: The runtime choice between rendering the CRD forbidden page and rendering the MUI `Error403`. Inputs: current pathname (is it a CRD-enabled route?), CRD toggle value. Output: which `errorComponent` branch to take. Lives in the integration layer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the CRD toggle on, an authenticated user who navigates directly to a private resource they don't have access to lands on a fully CRD forbidden page (CRD layout chrome, CRD typography, CRD action buttons) — verified across at least three representative private CRD routes (Space, Subspace, admin route).
- **SC-002**: An anonymous user opening a deep link to a private CRD page is silently redirected to the sign-in page with the `returnUrl` parameter set to the originally-requested URL — exactly as MUI does today. After a successful sign-in, they land back on the originally-requested URL with no manual navigation, in 100% of cases. The CRD forbidden page is NOT shown during this flow.
- **SC-003**: With the CRD toggle off, every existing forbidden flow (admin guard redirect, `useRestrictedRedirect`, direct `/restricted` visit) renders the existing MUI `Error403` exactly as it does on the production `develop` branch — zero visual or behavioral regression, verified by a manual side-by-side comparison.
- **SC-004**: When a user navigates only across CRD routes and triggers a forbidden state on one of them, the CRD forbidden page renders without mounting MUI page chrome (`TopLevelLayout`, MUI `Error403`, MUI typography primitives used by them) — matching the migration's CSS isolation goal, verified via the React DevTools tree.
- **SC-005**: The CRD forbidden page passes a manual WCAG 2.1 AA pass — keyboard-only operation completes recovery without sighted assistance, the headline is announced as a heading, and action buttons have the required focus / contrast affordances.
- **SC-006**: All translation keys introduced for the CRD forbidden page exist in en, nl, es, bg, de, fr at merge time — there are zero missing-key fallbacks shown for any of the six supported languages, verified by switching the app language and visiting `/restricted` for each language.
- **SC-007**: The browser tab title on every CRD forbidden render reads the restricted-state title (e.g., "Access Restricted | Alkemio") regardless of which underlying CRD route triggered the forbidden state — verified across at least three different forbidden-triggering routes.
- **SC-008**: The Sentry / observability signal emitted on a forbidden state with the CRD page rendered is identical in shape to today's signal from the MUI path (same event name, same `origin` field on `/restricted`) — observability dashboards continue to work without changes.
- **SC-009**: The post-sign-in return-URL flow continues to work end-to-end on CRD routes: an anonymous user clicks a deep link to a private CRD Space, gets redirected to sign-in, completes authentication, and lands on the originally-requested URL — verified across at least 3 representative CRD route shapes (Space, Subspace, admin).

## Scope Boundary

### In Scope

- A new CRD presentational component (forbidden / unauthorized page) living in `src/crd/` per CRD architectural rules.
- Integration of that component into the existing `Error40XBoundary` `errorComponent` callback so that `NotAuthorizedError` thrown anywhere in a CRD-enabled route renders the CRD page inside `CrdLayoutWrapper` (for the authenticated-but-forbidden case only).
- Update to the `/restricted` top-level route in `src/main/routing/TopLevelRoutes.tsx` so that, when the CRD toggle is on, the CRD page is rendered there too (and the existing `Restricted` component is rendered when the toggle is off).
- "Go to Home" primary action and "Go back" secondary action (when history is available), wired through props from the integration layer.
- New CRD i18n keys for the headline, body, action labels, and document title — in en, nl, es, bg, de, fr.
- Keyboard / screen-reader accessibility of the CRD page.
- Preservation of the existing Sentry / `origin` logging on the `/restricted` route.
- **A reusable page-level access guard** (`useSpaceSettingsAccessGuard`) for the CRD Space Settings surface, ensuring the page actually throws `NotAuthorizedError` for unauthorized visitors instead of rendering chrome with empty data (FR-033 / FR-034).
- **A CRD-styled redirect dialog** (`CrdRedirectDialog` + `CrdRedirectToAncestorDialog` + `AncestorRedirectDispatcher`) that replaces the MUI `RedirectToAncestorDialog` whenever the underlying error page is the CRD forbidden page, preserving visual consistency when the boundary surfaces a `closestAncestor` (FR-036 / FR-037 / FR-038).

### Out of Scope

- A CRD-styled equivalent of the MUI `Error404` (NotFound) page. The user request is explicitly about authorization. NotFound parity in CRD is a separate, downstream feature and may reuse some primitives introduced here, but is not delivered by this spec.
- A CRD-styled equivalent of the generic `Error40X` (other 4xx / 5xx) fallback. Out of scope for the same reason.
- Changes to the MUI forbidden flow — `Error403`, `Error40X`, `Restricted`, `useRestrictedRedirect`, `NonAdminRedirect`, and `Error40XBoundary` itself remain unchanged behaviorally. The error boundary's `errorComponent` callback is updated only in the consumer (`src/root.tsx`) to call into the CRD-aware integration layer.
- Any change to the anonymous-user redirect flow on the boundary throw-path. Anonymous users continue to be silently redirected to the sign-in page (with `returnUrl` preserved) by `useRestrictedRedirect` / `UrlResolverProvider`, exactly as MUI does today. The `/restricted` route handler is intentionally auth-agnostic (matching MUI's `Restricted.tsx`), so an anonymous user who navigates directly to `/restricted` does see the CRD page — but no new auth-aware logic is added on that route either.
- A "Sign in" CTA on the CRD page. The page is auth-agnostic and MUI's `Error403` has no "Sign in" CTA either, so adding one would both diverge from MUI parity and force the page to branch on auth state (which FR-021 forbids).
- Auditing every other gated CRD page and applying equivalent privilege guards (FR-035). Each subsequent CRD page migration is responsible for wiring its own page-level guard with the privilege appropriate to that surface. Only Space Settings is gated in this PR.
- Migrating other MUI dialogs that may render on top of CRD pages (e.g. the `GlobalErrorDialog`, message dialogs, etc.). Only the boundary's redirect-to-ancestor dialog is migrated here.
- A "Request access" / "Apply to join" recovery action on the CRD page (resolved in Clarifications, 2026-04-28). Adding this would require integration with each membership-application surface and is a notable scope expansion. Users who want to apply continue to do so via the existing community-page apply flow.
- Changes to the GraphQL schema, the auth backend, or any data model — this is a UI / routing surface change only.
- Preserving the user's previously-typed input or deep state on the page they were trying to access — when the forbidden boundary fires, the previous page's state is unwound by `Error40XBoundary` exactly as it is today. This spec does not change that.
- Surfacing forbidden states inside dialogs / overlays as inline error states — they continue to unwind to the page level via the boundary, matching today's behavior.

## Assumptions

- The shared `Error40XBoundary` and `NotAuthorizedError` machinery in `src/core/40XErrorHandler/` is the correct integration point. CRD does not need its own error-throwing or error-catching mechanism; only the rendered fallback differs.
- The CRD layout (`CrdLayoutWrapper`) is the appropriate chrome for the CRD forbidden page. It is already used by other CRD pages for top-level chrome and accepts arbitrary children.
- The "is the current pathname a CRD-enabled route?" check is implemented as a new small static predicate (`isCrdRoute(pathname): boolean`) living in `src/main/crdPages/` next to `useCrdEnabled` (resolved in Clarifications, 2026-04-28). Its patterns mirror the per-route conditional in `TopLevelRoutes.tsx`. No shared CRD-routes registry is introduced; when a future page migrates to CRD, the migrating PR adds a pattern to the predicate as part of its diff.
- The `Restricted` component's existing Sentry log of the `origin` query parameter (`src/core/routing/Restricted.tsx`) is the canonical observability signal for forbidden landings. The CRD `/restricted` integration emits the same signal, with the same shape, so dashboards keep working.
- Reusing the English copy from `pages.unauthorized.header` ("Access Restricted") and `pages.titles.restricted` for the CRD page is acceptable and preferred — visual change without copy change keeps the user's mental model intact.
- The existing sign-in flow accepts a `returnUrl` parameter (the `AUTH_REQUIRED_PATH` + `buildReturnUrlParam(pathname)` pattern in `useRestrictedRedirect` and `UrlResolverProvider`); this feature does not change that flow at all, and the CRD page does not embed its own sign-in trigger. After a successful sign-in, an authenticated user who *still* lacks access will hit the CRD forbidden page on their next attempt — that's the only path by which a user reaches the CRD forbidden page on a deep-link auth flow.
- "Go back" on the CRD page is implemented via the browser's history API in the integration layer; there is no requirement to remember a richer in-app navigation stack. If the browser reports no usable history (length ≤ 1), the action is hidden.
- This feature is considered complete when (a) both user stories pass their independent tests, and (b) success criteria SC-001 through SC-009 are met.
