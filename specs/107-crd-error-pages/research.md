# Phase 0 Research: Port the Error Pages to CRD (P1 — CRD 404)

**Feature**: 107-crd-error-pages | **Story**: alkem-io/client-web#9852

This document records the decisions, rationale, and alternatives for the unknowns in the
Technical Context. All unknowns were resolved from the existing codebase (no external
research needed — no new dependencies, no new patterns).

## R1 — Presentational pattern for the CRD 404 page

- **Decision**: Mirror `src/crd/components/error/CrdForbiddenPage.tsx` exactly: a props-only function component, Tailwind via `cn()` from `@/crd/lib/utils`, a `lucide-react` icon, `@/crd/primitives/button` for actions, `<h1>` title + muted description, `autoFocus` on the primary action, decorative icon `aria-hidden`. Same outer layout classes (`flex min-h-[60vh] ... rounded-lg border bg-card p-8 text-center shadow-sm`).
- **Rationale**: Visual and structural consistency with the already-shipped 403 page; satisfies the CRD-only constitution (no MUI, no business logic, no GraphQL types, no router); zero new dependencies.
- **Icon**: `FileQuestion` (or `SearchX`) from `lucide-react` — semantically a "not found / missing page" glyph, distinct from the 403 `ShieldAlert`. Decision: `FileQuestion`.
- **Alternatives rejected**: Porting MUI `Error404` 1:1 (uses `@mui/material` `styled`, `PageContent*`, `ImageFadeIn`, the `/404.svg` asset, and `SearchBar`) — rejected because it imports MUI and business logic, both forbidden in `src/crd/`.

## R2 — Search affordance

- **Decision**: Do NOT wire search in P1. Expose an optional `search?: ReactNode` slot on `CrdNotFoundPage` rendered only when provided; leave it unset in P1.
- **Rationale**: The MUI `Error404` search bar is `SearchBar` (navigation + query logic) which cannot live in the props-only CRD layer. A `ReactNode` slot keeps the presentational contract future-proof without pulling logic into `src/crd/`.
- **Alternatives rejected**: Reusing MUI `SearchBar` (reintroduces MUI chrome); implementing search inside the CRD component (violates "no business logic / no router" rule).

## R3 — Dispatcher extension (`CrdAwareErrorComponent`)

- **Decision**: Add a branch `if (crdEnabled && isCrd && props.isNotFound === true) return <CrdNotFoundBranch ... />;` placed alongside the existing `isNotAuthorized` branch, before the MUI fallback. Keep the existing 403 branch and MUI fallback unchanged.
- **Rationale**: Minimal, regression-safe extension of the single existing dispatch point; reuses `useCrdEnabled()` + `isCrdRoute(pathname)` already computed at the top.
- **Alternatives rejected**: A separate dispatcher component (duplicates the toggle logic and risks drift).

## R4 — Catch-all wiring (`TopLevelRoutes.tsx`)

- **Decision**: The `path="*"` element (currently `<TopLevelLayout><Error404 /></TopLevelLayout>` inside `WithApmTransaction`) becomes `{crdEnabled ? <CrdNotFoundBranch /> : <TopLevelLayout><Error404 /></TopLevelLayout>}`, mirroring the existing `/restricted` toggle (`crdEnabled ? <CrdRestrictedRoute /> : <Restricted />`). `crdEnabled` is already read at the top of `TopLevelRoutes` (line ~74).
- **Rationale**: Consistent with the established toggle idiom in the same file; the catch-all is the most common 404 path (unmatched URL) and must show CRD chrome for CRD users.
- **Note on `isCrdRoute` at the catch-all**: The catch-all fires for an unmatched URL; for CRD users we render CRD chrome directly (the user is on the CRD shell by toggle). The boundary path additionally guards on `isCrdRoute(pathname)` so a thrown NotFound on a reserved MUI route stays MUI. The shared `CrdNotFoundBranch` renders identical presentation in both cases.
- **Alternatives rejected**: A react-router `errorElement`/data-router migration (out of scope, large blast radius); leaving the catch-all MUI-only (the core gap this story closes).

## R5 — Sentry 404 logging parity & double-log avoidance

- **Decision**: `CrdNotFoundBranch` calls `log404NotFound()` from `@/core/logging/sentry/log` once, in a `useEffect` keyed to mount (matching MUI `Error404`'s `useEffect(() => log404NotFound(), [pathname])`). The MUI path keeps its own logging. Only one branch renders at a time (CRD or MUI), so exactly one log fires per surface.
- **Rationale**: Preserves observability parity (FR-008, SC-003) without double-logging; centralizes the side effect in the integration layer (not the presentational component, per Constitution IV).
- **Alternatives rejected**: Logging inside `CrdNotFoundPage` (violates "no side effects in presentational CRD components"); logging in both the dispatcher and the catch-all (risk of double-log).

## R6 — i18n: namespace, keys, parity

- **Decision**: Add a `notFound` block to `src/crd/i18n/error/error.<lang>.json` for all six locales: `notFound.title`, `notFound.description`, `notFound.actions.goHome`, `notFound.actions.goBack`. Consume via `useTranslation('crd-error')`. Add `src/crd/i18n/error/error.parity.test.ts` (mirroring `auth.parity.test.ts`) to enforce six-locale key parity.
- **Rationale**: `crd-error` is already registered and lazy-loaded in `src/core/i18n/config.ts` (no config change needed); parity test prevents a missing key in any locale (FR-014, SC-004). Tab title uses `notFound.title`.
- **Translations**: en authored; nl/es/bg/de/fr translated (AI-assisted, manual — CRD translations are not Crowdin-managed). Keys identical across all six.
- **Alternatives rejected**: Reusing legacy `pages.four-ou-four.*` / `pages.titles.notFound` keys (those live in the frozen `src/core/i18n` MUI namespace; new CRD strings must go in CRD namespaces).

## R7 — "Go back" gating

- **Decision**: Reuse `hasInAppHistory()` from `@/main/crdPages/error/hasInAppHistory`. Show "Go back" only when true; wire `onGoBack={() => navigate(-1)}` (from `@/core/routing/useNavigate`), and `onGoHome={() => navigate('/' + TopLevelRoutePath.Home)}`. Identical to `CrdForbiddenBranch`.
- **Rationale**: Avoids `navigate(-1)` leaving the app when the user landed directly on the bad URL (edge case); reuses the existing, already-tested helper.

## R8 — Testing strategy

- **Decision**:
  1. `CrdNotFoundPage.test.tsx` — renders title/description, "go home" always, "go back" only when `showGoBack && onGoBack`, click handlers fire, optional `search` slot renders when provided.
  2. `CrdNotFoundBranch.test.tsx` — calls `log404NotFound` once on mount, sets title via `usePageTitle('notFound.title')`, navigates correctly, renders inside `CrdLayoutWrapper`.
  3. `CrdAwareErrorComponent.test.tsx` — update the existing `isNotFound (out of scope)` test to assert CRD 404 when `crdEnabled && isCrd && isNotFound`; add cases for non-CRD route → MUI, CRD disabled → MUI, undefined pathname → MUI.
  4. `error.parity.test.ts` — six-locale parity for the `crd-error` namespace.
- **Rationale**: Follows the existing mock-heavy unit-test style already used in `CrdAwareErrorComponent.test.tsx` (mock `react-i18next`, `useNavigate`, `usePageTitle`, `useCrdEnabled`, `hasInAppHistory`, `isCrdRoute`, child components). Catch-all wiring in `TopLevelRoutes.tsx` is validated by lint/build + the dispatcher/branch unit coverage (the file is a large router with no existing dedicated render test; adding one is out of P1 scope and not how the existing 403/restricted toggles are covered).
