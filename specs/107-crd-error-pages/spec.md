# Feature Specification: Port the Error Pages to CRD

**Feature Branch**: `story/9852-crd-error-pages`
**Created**: 2026-06-11
**Status**: Draft
**Input**: User description: "Port the Error pages to the CRD design system (story alkem-io/client-web#9852)"

## Context

The client-web app is mid-migration from the legacy MUI design system (`src/core/ui`,
`src/domain`, `src/main` legacy) to the CRD design system (`src/crd/` +
`src/main/crdPages/`). Routing dispatches MUI vs CRD trees off `useCrdEnabled()`
(default = CRD, i.e. design version `2`). Error surfaces were migrated piecemeal, so
some have CRD ports, some are toggled, and some still always render MUI chrome — even
for users on the CRD shell. The goal is that a CRD user never falls back into MUI
chrome when an error occurs.

How error handling is wired today (shared infrastructure, no behavioural change needed):

- `src/root.tsx` stacks two boundaries:
  - `SentryErrorBoundaryProvider` sits **above** `BrowserRouter`; fallback is MUI `ErrorPage`. It has no router context (no `useLocation`).
  - `Error40XBoundary` (`src/core/40XErrorHandler/ErrorBoundary.tsx`) sits **inside** the router, wraps `TopLevelRoutes`, catches `NotFoundError` / `NotAuthorizedError`; its `errorComponent` is `CrdAwareErrorComponent`.
- `CrdAwareErrorComponent` (`src/main/crdPages/error/CrdAwareErrorComponent.tsx`) is the single dispatcher. Today it renders CRD only when `crdEnabled && isCrdRoute(pathname) && isNotAuthorized === true` → `CrdForbiddenPage`. Everything else → MUI `Error40X`.
- The router uses a plain `path="*"` catch-all (no react-router `errorElement` / data router) that hardwires `TopLevelLayout` + MUI `Error404`.
- Apollo links (`useErrorHandlerLink`, `useApolloErrorHandler`, `useErrorLoggerLink`, `redirectLink`) are headless / notification-only — design-system agnostic, no migration needed.

## Scope of this delivery

This specification captures the **full feature** (P1–P4). The PR that accompanies this
spec delivers **P1, P2 and P3** — the complete set of error surfaces a CRD user can hit,
so a CRD user never falls back into MUI chrome in any error flow:

- **P1** — CRD 404 / Not Found page, its dispatcher branch, and the catch-all wiring.
- **P1 follow-on (FR-018)** — the ancestor **redirect dialog** is now CRD whenever the
  page beneath it is CRD. P1 made the 404 page CRD but the redirect dialog
  (`AncestorRedirectDispatcher`) was still gated to the 403 case only, so opening a
  private subspace (which resolves to `NotFoundError({ closestAncestor })`) showed a CRD
  404 page with the **MUI** countdown dialog on top. The dialog gate is widened to
  `crdEnabled && isCrdRoute(pathname)`.
- **P2** — CRD generic / 500 / unknown error page, for **both** the in-router boundary
  and the **top-level Sentry boundary** (the latter renders above the router/Apollo, so a
  bare CRD page wrapped in `.crd-root`, deciding CRD-vs-MUI from `useCrdEnabled()`). The
  `crd-error` English namespace is now eagerly loaded so a boot-time crash still renders
  CRD copy.
- **P3** — CRD lazy chunk-load dialog, gated CRD-vs-MUI in `root.tsx`.

Only **P4** (cleanup of dead MUI auth pages) remains as follow-up work, documented here so
the source-of-truth stays complete. Legacy (design version `1`) users keep the exact MUI
experience on every surface — the MUI files stay and are only bypassed for CRD users. See
the **Assumptions** and **Clarifications** sections for the scoping rationale.

## Clarifications

### Session 2026-06-11 (iteration 1)

- **Q (Functional Scope / UX): Does P1 port the search-bar affordance from the MUI `Error404`?**
  **A: No.** The MUI `Error404` embeds `SearchBar` (a business-logic-bound component that issues navigation/queries). The props-only `src/crd/` layer forbids business logic, and reusing the MUI `SearchBar` would reintroduce MUI chrome onto the CRD shell. P1 ships "Go to home" plus a conditional "Go back" (parity with `CrdForbiddenPage`). The CRD 404 component exposes an optional `search` slot/prop so a future story can wire a CRD search from the integration layer without changing the presentational contract.
  **Rationale:** Keeps the CRD layer pure and the P1 slice small; preserves the option to add search later as a prop.

- **Q (Observability): For the `path="*"` catch-all, where is the Sentry 404 logged, and how is double-logging avoided?**
  **A:** A single shared CRD integration wrapper (`CrdNotFoundBranch`) calls `log404NotFound()` exactly once on mount via an effect, and is the only CRD code path that logs. The catch-all and the boundary both render through this same wrapper, so there is exactly one log per not-found surface regardless of which mechanism fired. The MUI path keeps logging through `Error404`'s own effect (unchanged).
  **Rationale:** Guarantees observability parity (FR-008, SC-003) and prevents double-logging by centralizing the side effect.

- **Q (Architecture): Should the catch-all toggle and the boundary `isNotFound` branch share a component, or be wired independently?**
  **A:** Share one component. The boundary's dispatcher (`CrdAwareErrorComponent`) gains an `isNotFound` branch that renders the shared `CrdNotFoundBranch`; the `path="*"` catch-all dispatches the same `CrdNotFoundBranch` when `crdEnabled` (mirroring the existing `/restricted` toggle), MUI otherwise. Both converge on identical CRD presentation.
  **Rationale:** One presentation, one logging path, no drift between the two entry points (Edge case: catch-all vs boundary overlap).

- **Q (i18n / UX): Which translation key sets the browser tab title for the CRD 404?**
  **A:** `notFound.title` in the `crd-error` namespace (via `useTranslation('crd-error')` + `usePageTitle`), not the legacy `pages.titles.notFound`. The new `notFound.*` block is added to all six locale files with full parity.
  **Rationale:** CRD-first i18n; keeps the CRD page self-contained in its own namespace.

- **Q (Edge case): How is a 404 / private access on a reserved top-level path handled when CRD is enabled?**
  **A:** It depends on whether that segment's *page* is CRD. `isCrdRoute` returns `true` for reserved segments whose pages have been migrated to CRD (`vc`, `user`, `organization`, `innovation-packs`, `innovation-library`, `docs`, `admin`, `hub`, `forum`) → CRD error/redirect chrome; it returns `false` for segments still rendered in MUI (`contributors`, `innovation-hubs`, redirect/legacy-only) → MUI fallback. The error chrome always matches the page beneath. *(Originally `isCrdRoute` returned `false` for all reserved segments; that was correct only while those pages were still MUI. As they migrated, the blunt heuristic became stale and was replaced by an explicit CRD-migrated allowlist — FR-019.)*
  **Rationale:** Keeps the error/redirect chrome consistent with the page the user is actually on; prevents a CRD page from dropping into MUI error chrome (and vice-versa).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - CRD user sees a CRD 404 page for unknown URLs (Priority: P1)

A user on the CRD design system (design version `2`) navigates to a URL that does not
resolve to any route (a mistyped link, a stale bookmark, a deleted space). Instead of
dropping into legacy MUI chrome (MUI header/footer + MUI `Error404`), they see a 404
page rendered in the CRD shell, consistent with the rest of their experience, with a
clear way to get back to a working page.

**Why this priority**: This is the highest-visibility, most-frequently-hit error gap.
The `path="*"` catch-all and the missing `isNotFound` branch in the dispatcher mean
*every* bad URL — the single most common error surface — breaks the CRD visual
contract. It is self-contained, fully testable in isolation, and ships immediate value
without touching the harder router-less Sentry boundary.

**Independent Test**: Seed CRD (`localStorage.setItem('alkemio-design-version','2'); location.reload()`),
navigate to a bogus URL such as `/this-does-not-exist`, and confirm the CRD 404 page
renders inside CRD chrome with no MUI header/footer. Switch to legacy (`'1'`) and
confirm MUI `Error404` still renders. Covered by unit tests on the dispatcher and the
presentational page.

**Acceptance Scenarios**:

1. **Given** the CRD design system is enabled and the current path is a CRD route, **When** a not-found condition occurs (the in-router `Error40XBoundary` reports `isNotFound`), **Then** the CRD 404 page renders inside the CRD layout (CRD header/footer), not the MUI `Error40X`.
2. **Given** the CRD design system is enabled, **When** the user navigates to a URL that matches no route (the `path="*"` catch-all), **Then** the CRD 404 page renders inside the CRD layout, not `TopLevelLayout` + MUI `Error404`.
3. **Given** the legacy (MUI) design system is enabled, **When** any not-found condition or unmatched URL occurs, **Then** the MUI `Error404` renders inside `TopLevelLayout`, exactly as today (no regression).
4. **Given** the CRD 404 page is shown and the user has prior in-app navigation history, **When** the page renders, **Then** a "Go back" affordance is offered in addition to "Go to home"; **When** there is no in-app history, **Then** only "Go to home" is offered.
5. **Given** a not-found condition occurs on a non-CRD route (e.g. `/admin`) while CRD is enabled, **When** the dispatcher resolves the branch, **Then** the MUI fallback is rendered (CRD chrome is only used for CRD routes), exactly as the existing 403 behaviour.
6. **Given** any not-found surface is shown (CRD or MUI), **When** it renders, **Then** Sentry receives a 404 record equivalent to today's `log404NotFound()`, preserving observability parity.
7. **Given** the CRD 404 page is shown, **When** it renders, **Then** the browser tab title is set to the localized "Page not found" title via `usePageTitle`.
8. **Given** CRD is enabled and the user opens a private subspace they cannot access (resolving to `NotFoundError` with a `closestAncestor`), **When** the CRD 404 page renders, **Then** the ancestor redirect (countdown) dialog on top is the **CRD** dialog, not the MUI one — the page and the dialog are both CRD (FR-018).

---

### User Story 2 - CRD user sees a CRD generic error page (500 / unknown) (Priority: P2)

A user on the CRD design system encounters an unexpected runtime error — either a
render error caught by the in-router boundary, or an error caught by the top-level
Sentry boundary. Instead of the MUI `ErrorPage`, they see a CRD-styled generic error
page with a reload action (and, in development, the stack trace), keeping them in the
CRD shell.

**Why this priority**: Second-most-impactful gap, but harder and riskier than P1: the
Sentry boundary lives **above** the router, so it cannot read `pathname` /
`useLocation` and must decide CRD-vs-MUI from `useCrdEnabled()` (localStorage-only,
router-independent). Deferred to keep the P1 slice small and low-risk.

**Independent Test**: Temporarily throw inside a CRD page and confirm the CRD generic
error page renders in the CRD shell; seed design version `2` and confirm the top-level
Sentry fallback is also CRD; confirm legacy users still get MUI `ErrorPage`.

**Acceptance Scenarios**:

1. **Given** CRD is enabled and a generic (non-404, non-403) error is caught by the in-router boundary on a CRD route, **When** the dispatcher resolves, **Then** a CRD generic error page renders with a reload action.
2. **Given** CRD is enabled and an error is caught by the top-level Sentry boundary (above the router), **When** the fallback renders, **Then** it picks CRD vs MUI from `useCrdEnabled()` (localStorage), with no dependency on router context.
3. **Given** the app is running in development mode, **When** the CRD generic error page renders, **Then** the error stack is shown behind a dev-only prop; in production it is hidden.
4. **Given** legacy design is enabled, **When** any generic error is caught (either boundary), **Then** the MUI `ErrorPage` renders, exactly as today.

---

### User Story 3 - CRD user sees a CRD lazy chunk-load dialog (Priority: P3)

When a dynamic import (lazy-loaded chunk) fails — typically after a deploy invalidates
old chunk hashes — the app shows a global dialog prompting a reload. A CRD user should
see this in a CRD dialog primitive rather than the MUI dialog.

**Why this priority**: Lower frequency and already functional on both shells via the
shared `GlobalErrorContext`; only the presentational dialog needs swapping. Lowest UI
risk but lowest user-visible payoff, so it ships last.

**Independent Test**: Simulate a failed dynamic import and confirm a CRD dialog renders
when seeded to design version `2`, MUI dialog when `1`.

**Acceptance Scenarios**:

1. **Given** CRD is enabled, **When** a lazy chunk-load failure triggers the global error dialog, **Then** a CRD dialog primitive renders (reusing `GlobalErrorContext` / `getGlobalErrorSetter` unchanged).
2. **Given** legacy design is enabled, **When** a lazy chunk-load failure occurs, **Then** the existing MUI `GlobalErrorDialog` renders, exactly as today.

---

### User Story 4 - Maintainer removes dead MUI error/auth surfaces (Priority: P4)

Once the CRD ports above are in place and the legacy surfaces are verified unreferenced,
a maintainer removes the now-dead MUI error/auth pages to reduce surface area and
prevent accidental regressions back into MUI chrome.

**Why this priority**: Pure cleanup, no new UI, blocked on P1–P3 landing and on
verification that the targets are unreferenced. Highest safety risk if done prematurely,
zero user-facing value, so it is last and gated on confirmation.

**Independent Test**: Static reference search confirms each target (`LoginPage`,
`VerificationPage`, `RecoveryPage`, `EmailVerificationRequiredPage`, `ErrorRoute`) is
unreferenced; build + tests pass after removal.

**Acceptance Scenarios**:

1. **Given** the CRD `*CrdRoute` equivalents are wired and the legacy MUI auth pages are confirmed unreferenced, **When** they are deleted, **Then** the build, lint, and test suite all pass with no broken imports.
2. **Given** `ErrorDisplay` and `LinesFitterErrorBoundary` are coupled to not-yet-migrated host components, **When** P4 cleanup runs, **Then** they are explicitly left in place (out of scope, migrate with their hosts).

---

### Edge Cases

- **Unknown pathname at dispatch time**: If `pathname` is undefined/empty when the dispatcher runs, route detection (`isCrdRoute`) returns `false`, so the MUI fallback is used. The CRD branch must never crash on a missing pathname.
- **Trailing slash / query / hash on the bad URL**: `isCrdRoute` already normalizes trailing slash, query string, and hash; the 404 branch must rely on that same normalization rather than re-implementing it.
- **No in-app history (direct hit / external referrer)**: When `hasInAppHistory()` is false (the user landed directly on the bad URL), the "Go back" affordance must be hidden — `navigate(-1)` would leave the app. Only "Go to home" is offered.
- **404 / private access on a reserved top-level path**: Reserved segments are split by their *page's* design system (FR-019). A reserved segment whose page is now CRD (`vc`, `user`, `organization`, `innovation-packs`, `innovation-library`, `docs`, `admin`, `hub`, `forum`) gets CRD error + redirect chrome; a reserved segment still rendered in MUI (`contributors`, `innovation-hubs`, redirect/legacy-only) stays on the MUI fallback. The error chrome always matches the page beneath — no CRD chrome forced onto an MUI route, and no MUI chrome forced onto a CRD route.
- **Sentry double-logging**: The in-router 404 already logs via the MUI `Error404`'s `useEffect(log404NotFound)`. The CRD branch must log exactly once (parity), and must not double-log when both the catch-all and the boundary could fire.
- **Catch-all vs boundary overlap**: An unmatched URL is handled by the `path="*"` catch-all; a thrown `NotFoundError` is handled by the boundary's `CrdAwareErrorComponent`. Both paths must converge on the same CRD 404 presentation when CRD is enabled, so the user sees one consistent page regardless of which mechanism fired.
- **Anonymous vs authenticated user**: The CRD 404 page is presentational and identity-agnostic; it renders identically for anonymous and authenticated users (the catch-all already runs under `NonIdentity` / `UrlResolverProvider`).
- **i18n key missing in a non-English locale**: Key parity across all six languages (en, nl, es, bg, de, fr) is required; a parity test guards against a missing `notFound.*` key in any locale.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a CRD-styled 404 / Not Found page when the CRD design system is enabled and a not-found condition occurs on a CRD route, instead of the MUI `Error404`.
- **FR-002**: The CRD 404 page MUST render inside the CRD layout (CRD header/footer via `CrdLayoutWrapper`), never inside the legacy `TopLevelLayout`.
- **FR-003**: The `path="*"` catch-all in `TopLevelRoutes.tsx` MUST dispatch the CRD 404 page when CRD is enabled and the MUI `Error404` (inside `TopLevelLayout`) when CRD is disabled, mirroring the existing `/restricted` toggle pattern.
- **FR-004**: The in-router error dispatcher (`CrdAwareErrorComponent`) MUST gain an `isNotFound` branch that renders the CRD 404 page when `crdEnabled && isCrdRoute(pathname) && isNotFound === true`, and otherwise preserve the existing MUI fallback.
- **FR-005**: When CRD is disabled (legacy / design version `1`), all not-found surfaces MUST render the MUI `Error404` inside `TopLevelLayout`, with no behavioural change from today (no regression).
- **FR-006**: The CRD 404 presentational page MUST be a props-only component under `src/crd/components/error/` (Tailwind + `lucide-react` icon), mirroring `CrdForbiddenPage` — no MUI, no business logic, no GraphQL types, no router imports; all actions are received as props.
- **FR-007**: The CRD 404 page MUST offer a "Go to home" action, and a "Go back" action only when `hasInAppHistory()` is true; "Go back" MUST be hidden when there is no in-app navigation history.
- **FR-008**: The system MUST record a Sentry 404 event equivalent to the existing `log404NotFound()` when the CRD 404 surface is shown, preserving observability parity, and MUST NOT double-log.
- **FR-009**: The CRD 404 page MUST set the browser tab title to a localized "Page not found" title via `usePageTitle`.
- **FR-010**: All user-visible strings for the CRD 404 page MUST be added under a `notFound.*` block in `src/crd/i18n/error/error.<lang>.json` for all six supported languages (en, nl, es, bg, de, fr), with full key parity, used via `useTranslation('crd-error')`.
- **FR-011**: The CRD 404 integration wrapper MUST reuse the existing route-detection helper `isCrdRoute` as-is, without re-implementing pathname normalization.
- **FR-012**: The dispatcher MUST NOT crash when `pathname` is undefined; in that case it MUST fall back to MUI.
- **FR-013**: The existing CRD 403 (`CrdForbiddenPage`) behaviour and the existing MUI generic/error behaviour MUST remain unchanged by the P1 change (regression-safe).
- **FR-014**: i18n key parity for the `crd-error` namespace MUST be enforced by an automated parity test covering the new `notFound.*` keys across all six locales.
- **FR-014a**: The CRD 404 presentational component MUST expose an optional `search` slot (rendered only when provided) so a future story can wire a CRD search affordance from the integration layer without altering the presentational contract; P1 does not wire it.
- **FR-014b**: Both not-found entry points (the boundary `isNotFound` branch and the `path="*"` catch-all) MUST render through a single shared CRD integration wrapper that performs the Sentry `log404NotFound()` side effect exactly once, ensuring identical presentation and no double-logging.
- **FR-015** *(P2)*: The system MUST render a CRD generic error page (reload action; dev-only stack behind a prop; optional numeric code) for non-404/non-403 errors when CRD is enabled, both for the in-router boundary and the top-level Sentry boundary, the latter deciding CRD-vs-MUI from `useCrdEnabled()` (localStorage, router-independent). Because the top-level boundary renders above the router/Apollo/auth providers, its CRD fallback MUST be a bare presentational page wrapped in its own `.crd-root` (no `CrdLayoutWrapper`, no router/Apollo hooks) and offer reload only. The `crd-error` English namespace MUST be eagerly loaded so a crash at boot still renders CRD copy.
- **FR-016** *(P3)*: The lazy chunk-load global dialog MUST render via a CRD dialog primitive when CRD is enabled, reusing `GlobalErrorContext` / `getGlobalErrorSetter` unchanged and swapping only the presentational dialog, gated CRD-vs-MUI in `root.tsx`.
- **FR-017** *(P4, deferred)*: Confirmed-unreferenced legacy MUI auth/error pages (`LoginPage`, `VerificationPage`, `RecoveryPage`, `EmailVerificationRequiredPage`, `ErrorRoute`) MUST be removed only after verification; `ErrorDisplay` and `LinesFitterErrorBoundary` MUST be left in place to migrate with their hosts.
- **FR-018** *(P1 follow-on)*: When a CRD error page is shown on a CRD route (404 via `CrdNotFoundPage` or 403 via `CrdForbiddenPage`) and the boundary carries a `closestAncestor`, the ancestor redirect (countdown) dialog MUST render the **CRD** dialog, never the MUI one — a CRD page MUST NOT carry a MUI dialog on top. The dispatcher (`AncestorRedirectDispatcher`) only mounts when a `closestAncestor` is present (exclusively `NotFoundError` / `NotAuthorizedError`), and both render a CRD page under `crdEnabled && isCrdRoute(pathname)`, so the dialog gate MUST be `crdEnabled && isCrdRoute(pathname)` (the prior `isNotAuthorized === true` gate is removed). When CRD is disabled or the route is non-CRD, the MUI dialog renders, unchanged.
- **FR-019** *(P1 follow-on — route-classification parity)*: `isCrdRoute(pathname)` MUST return `true` for every top-level segment whose page renders in the CRD shell when the toggle is on, so a CRD user hitting a **private** resource there sees CRD error + CRD redirect chrome (not MUI). This includes the reserved segments that have since been migrated to CRD: `vc` (Virtual Contributor profiles), `user`, `organization`, `innovation-packs` (template packs), `innovation-library`, `docs`, `admin`, `hub`, and `forum` — in addition to the already-CRD `home`, `spaces`, `restricted`, dynamic Space routes, and `/public/whiteboard/*`. Segments still rendered in MUI when the toggle is on (`contributors`, `innovation-hubs`, and redirect/legacy-only segments) MUST remain `false` so their error chrome continues to match their MUI page. The CRD-migrated allowlist MUST be kept in sync with the `crdEnabled ? <Crd…> : <Mui…>` dispatch in `TopLevelRoutes.tsx`. (Edge: the `/vc/:id/knowledge-base` sub-route is a MUI island, but the 40X error is thrown at URL-resolution time before that MUI page renders and the VC section's dominant chrome is CRD, so CRD error chrome is the consistent choice.)

### Key Entities *(include if feature involves data)*

- **CRD Not Found page (`CrdNotFoundPage`)**: Presentational component representing the 404 state. Attributes: title, description, optional search affordance, "go home" action (required), "go back" action (optional, gated on history). Props-only, no data dependencies.
- **Error dispatcher (`CrdAwareErrorComponent`)**: The single decision point that maps `{ crdEnabled, isCrdRoute(pathname), isNotAuthorized, isNotFound, error }` to either a CRD branch or the MUI fallback.
- **Design-version toggle (`useCrdEnabled`)**: Boot-time read of `localStorage('alkemio-design-version')` (`1` = MUI, `2` = CRD, default CRD). Router-independent; the only signal available to the top-level Sentry boundary.
- **Route classification (`isCrdRoute`)**: Maps a pathname to whether it belongs to the CRD route tree; consumed unchanged.
- **`crd-error` i18n namespace**: Lazy-loaded translation namespace at `src/crd/i18n/error/error.<lang>.json`, holding `forbidden.*`, `authRequired.*`, and (new) `notFound.*` blocks across six locales.
- **Sentry 404 logger (`log404NotFound`)**: Headless observability helper; the CRD branch reuses it for parity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A CRD user (design version `2`) navigating to any unmatched URL sees zero MUI chrome (no MUI header/footer) on the 404 surface — 100% of not-found surfaces render in the CRD shell for CRD users.
- **SC-002**: A legacy user (design version `1`) sees the identical MUI `Error404` experience as before the change — 0 visual or behavioural regressions on the legacy path.
- **SC-003**: Sentry continues to receive a 404 record for every not-found surface shown, with no increase or decrease in 404-log volume attributable to this change (observability parity, no double-logging).
- **SC-004**: 100% i18n key parity for the new `notFound.*` block across all six locales (en, nl, es, bg, de, fr), enforced by an automated parity test.
- **SC-005**: The dispatcher's not-found behaviour is fully covered by unit tests (CRD route + CRD enabled → CRD page; non-CRD route or CRD disabled → MUI; undefined pathname → MUI; go-back gated on history), and the full repo gates (`pnpm lint`, `pnpm vitest run`) pass clean.
- **SC-006**: The PR clearly states which roadmap phases it delivers (P1 + redirect-dialog follow-on + P2 + P3) versus defers (P4 only), keeping the migration roadmap auditable.
- **SC-007**: A CRD user encounters **zero** MUI chrome across **every** error surface — 404, 403, the ancestor redirect dialog, generic/500 (in-router and top-level Sentry boundary), and the lazy chunk-load dialog. Enforced by a grep gate (no `@mui/*` / `@emotion/*` imports in `src/crd/components/error/*` or `src/main/crdPages/error/*`) plus unit coverage on every dispatcher/gate.

## Assumptions

- **A-001**: This delivery covers **P1 + the redirect-dialog follow-on (FR-018) + P2 + P3** — every error surface a CRD user can hit. P1 originally shipped alone, but making the 404 page CRD surfaced a CRD-page-with-MUI-dialog regression (FR-018) and left the generic/chunk-load surfaces still in MUI; the full sweep closes all of them so the "a CRD user never falls back into MUI chrome" goal actually holds. Only **P4** (deleting confirmed-dead MUI auth pages) remains deferred, as it is pure cleanup gated on verification. The top-level Sentry boundary (P2b) is the highest-risk piece — it renders above the router — and is handled with a bare `.crd-root` page that reads only `useCrdEnabled()` (localStorage).
- **A-002**: The default design version is `2` (CRD); anyone without an explicit preference lands on CRD. The P1 change therefore affects the majority of users immediately.
- **A-003**: `CrdForbiddenPage` is the canonical pattern to mirror (Tailwind, `lucide-react`, props-only, `CrdLayoutWrapper` integration, `crd-error` namespace, `usePageTitle`, `hasInAppHistory`, `navigate`). The CRD 404 follows it for visual and structural consistency.
- **A-004**: The optional "search" affordance from the MUI `Error404` (the search bar) is **not** ported in P1: the CRD search bar is a business-logic-bound component that cannot live in the props-only `src/crd/` layer, and the MUI `SearchBar` would reintroduce MUI chrome. P1 ships "Go to home" + conditional "Go back" (parity with `CrdForbiddenPage`); a future search affordance can be added as a prop wired from the integration layer if desired. Recorded as a clarification.
- **A-005**: No new runtime dependencies are introduced; all building blocks (`@/crd/primitives/*`, `lucide-react`, `react-i18next`, `useCrdEnabled`, `isCrdRoute`, `hasInAppHistory`, `log404NotFound`, `usePageTitle`, `useNavigate`, `CrdLayoutWrapper`) already exist.
- **A-006**: The `crd-error` namespace is already registered and lazy-loaded in `src/core/i18n/config.ts`; adding the `notFound.*` block requires no config change, only new keys in the six JSON files.
- **A-007**: The existing test `renders MUI fallback for isNotFound (CRD 404 is out of scope)` in `CrdAwareErrorComponent.test.tsx` is updated (not deleted) to assert the new CRD 404 behaviour, since "CRD 404 out of scope" is exactly what this story closes.
