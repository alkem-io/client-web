# Implementation Plan: CRD — Unauthorized / Forbidden Error Page

**Branch**: `095-crd-auth-error-page` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/095-crd-auth-error-page/spec.md`

## Summary

Deliver the missing CRD-styled forbidden / unauthorized page. When an authenticated user hits a CRD route that throws `NotAuthorizedError` (or anyone navigates directly to `/restricted` while CRD is on), the existing `Error40XBoundary` machinery renders a CRD-styled page (shadcn/ui + Tailwind) inside the CRD layout chrome, instead of the legacy MUI `Error403` inside `TopLevelLayout`. The boundary contract is unchanged, the upstream silent-redirect for anonymous users is unchanged, and the MUI fallback path is fully preserved when the CRD toggle is off.

**Technical approach**:
1. Add a presentational `CrdForbiddenPage` component in `src/crd/components/error/` — pure shadcn/ui + Tailwind, props-driven, auth-agnostic, no business-logic imports.
2. Add an integration layer under `src/main/crdPages/error/`:
   - `isCrdRoute(pathname)` — small static predicate (single source of truth for "is the current pathname a CRD-enabled route?", per Clarification Q3).
   - `CrdAwareErrorComponent` — a function component used inside the boundary's `errorComponent` callback; reads `useCrdEnabled()` + `errorState.pathname`, decides between the CRD page and the MUI fallback, sets the document title, and provides `onGoHome` / `onGoBack` / `showGoBack` props.
   - `CrdRestrictedRoute` — replacement for the `/restricted` route handler; renders the CRD page inside CRD chrome when the toggle is on, delegates to the existing `Restricted` component otherwise. Emits the same `logInfo('Attempted access to: ${origin}')` Sentry breadcrumb that the MUI handler does (parity per Clarification Q4).
3. Make `CrdLayoutWrapper` accept an optional `children` prop (falling back to `<Outlet />` when omitted). This lets the integration layer mount the layout chrome standalone for the boundary error path, where the route tree has been unwound. Non-breaking refactor — all current call sites continue to work.
4. Register a new `crd-error` i18n namespace in `src/core/i18n/config.ts` and add 6 language files at `src/crd/i18n/error/error.<lang>.json` containing only the keys this feature needs (per Clarification Q5: smallest scope today).
5. Update `src/root.tsx` to point the `Error40XBoundary` `errorComponent` at the new `CrdAwareErrorComponent`. Update `src/main/routing/TopLevelRoutes.tsx` to toggle the `/restricted` route between `Restricted` (MUI) and `CrdRestrictedRoute` (CRD).

No GraphQL changes. No new domain hooks. No new browser APIs beyond `window.history.length` (used by the existing app already).

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 (with React Compiler)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind v4), `lucide-react`, `react-i18next` (existing), `react-router-dom` (existing — used only in the integration layer, never in `src/crd/`), `class-variance-authority` (existing). No new dependencies.
**Storage**: N/A (presentation + routing decision; no persistence; no schema changes)
**Testing**: Vitest + jsdom for unit tests of `isCrdRoute` and `CrdAwareErrorComponent`'s decision logic; manual QA via `pnpm start` for end-to-end behavior across both toggle states. No new e2e harness.
**Target Platform**: Modern browsers (>90% global support per project rule); WCAG 2.1 AA accessibility
**Project Type**: Single-project React 19 SPA (existing structure)
**Performance Goals**: The forbidden render is a single synchronous render (no network, no async); render time bounded only by React's normal commit cycle. No measurable performance regression vs. the MUI `Error403`.
**Constraints**:
- CRD design system rules (`src/crd/CLAUDE.md`): no MUI / Apollo / domain / routing / formik / auth imports inside `src/crd/`.
- Integration layer (`src/main/crdPages/error/`) MAY import from `@/core/auth/*`, `@/core/routing/*`, and `react-router-dom`.
- All new translation strings provided in en/nl/es/bg/de/fr (no Crowdin — manual per CRD i18n rules).
- React Compiler enabled — no manual `useMemo` / `useCallback` / `React.memo`.
- `Error40XBoundary` contract unchanged: it continues to handle `NotAuthorizedError` / `NotFoundError` exactly as today, including the `redirectUrl` branch and the `getDerivedStateFromProps` pathname-reset.
- MUI `Error403` / `Error40X` / `Restricted` paths must work identically when the CRD toggle is off (zero regression).
**Scale/Scope**: 1 new presentational component, 3 new integration files (predicate, error component, restricted route), 1 small refactor (`CrdLayoutWrapper.tsx` adds `children` prop), 6 new i18n files, 1 namespace registration line, 2 small consumer-side edits (`src/root.tsx`, `src/main/routing/TopLevelRoutes.tsx`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Domain-Driven Frontend Boundaries** | ✅ PASS | The presentational `CrdForbiddenPage` lives in `src/crd/components/error/` (design system surface, no domain imports). All wiring — predicate, error component, restricted route, document title, Sentry log — lives in `src/main/crdPages/error/` (the "glue" layer between domain and CRD, per `CLAUDE.md`). No business logic added to `src/crd/`. The integration layer reads no GraphQL and creates no new state shape. The existing domain-grade abstractions used (`Error40XBoundary`, `useCrdEnabled`, `Restricted`, `logInfo`) remain unchanged. |
| **II. React 19 Concurrent UX Discipline** | ✅ PASS | `CrdForbiddenPage` is a pure render with `props` only (no internal state, no effects). `CrdAwareErrorComponent` is a function component with no effects. `CrdRestrictedRoute` uses one `useEffect` (matching today's `Restricted.tsx`) to fire the Sentry log. No legacy lifecycle methods. No `useMemo` / `useCallback` / `React.memo` — React Compiler covers it. The existing `Error40XBoundary` is a class component (a permanent React Compiler exception per its inline comment, since React requires class components for error boundaries) — unchanged. |
| **III. GraphQL Contract Fidelity** | ✅ PASS | Zero GraphQL operations touched. No schema change, no codegen needed, no fragments added. The integration layer reads no `useQuery` calls. (FR-032 explicitly forbids new GraphQL.) |
| **IV. State & Side-Effect Isolation** | ✅ PASS | The CRD component holds no state. The integration layer holds no state — it reads `useCrdEnabled()` (a localStorage-backed pure read), `useLocation()` (router state), `useNavigate()` (action handlers), and the existing auth context only via the upstream `useRestrictedRedirect` (which we don't modify). Document title is set via the existing `usePageTitle` hook. The Sentry log is a side-effect inside a single `useEffect` mirroring `src/core/routing/Restricted.tsx`. No direct DOM manipulation. No new browser APIs. |
| **V. Experience Quality & Safeguards (a11y, perf, tests)** | ✅ PASS | **Accessibility (WCAG 2.1 AA)**: `<h1>` headline, button accessible names match visible labels, primary action receives focus on render, secondary action reachable via Tab, focus indicators inherited from CRD primary/secondary button styling (already AA-compliant in shadcn defaults), icon `aria-hidden="true"` (text headline carries the meaning). **Performance**: synchronous static render, no network, no measurable regression. **Tests**: Vitest unit tests for (a) `isCrdRoute` covering each currently-CRD-enabled pattern + a non-CRD pattern + edge cases (trailing slash, query string, hash); (b) `CrdAwareErrorComponent` — given (toggle on, isCrdRoute=true) renders the CRD shell, given (toggle off OR isCrdRoute=false) renders the MUI shell; (c) `CrdRestrictedRoute` — given toggle on renders CRD, given toggle off renders existing `Restricted`, and the Sentry breadcrumb fires with the `origin` query parameter. **Observability**: parity with MUI — no new Sentry signals, only the existing `logInfo('Attempted access to: ${origin}')` is reused on the CRD `/restricted` handler. |

**Architecture Standards check**:
- (1) File placement: `src/crd/components/error/` for the presentational page, `src/main/crdPages/error/` for integration, `src/crd/i18n/error/` for translations → ✅
- (2) CRD design system: the new component is shadcn/ui + Tailwind only, no `@mui/*` / `@emotion/*` imports → ✅
- (3) i18n: new keys land only in `src/crd/i18n/error/*.json` (six languages, manually maintained) — NOT in `src/core/i18n/en/translation.en.json`. The English copy reuses the existing MUI strings verbatim ("Access Restricted" headline, "Access Restricted | Alkemio" tab title) per FR-025 → ✅
- (4) Vite config untouched → ✅
- (5) No barrel exports added → ✅
- (6) SOLID:
  - **SRP**: `CrdForbiddenPage` (presentation) ↔ `CrdAwareErrorComponent` (routing decision) ↔ `CrdRestrictedRoute` (route handler + Sentry log) ↔ `isCrdRoute` (predicate) — each has one reason to change.
  - **OCP**: the existing `errorComponent` callback contract is open for extension (any function returning React node); we add a new component, not modify the boundary.
  - **LSP**: `CrdAwareErrorComponent` honors the `errorComponent: (state) => ReactNode` contract — same signature as today's inline arrow function.
  - **ISP**: `CrdForbiddenPage` props are minimal (`title`, `description`, `onGoHome`, optional `onGoBack`, optional `showGoBack`) — no kitchen-sink interface.
  - **DIP**: the presentational page depends only on a prop abstraction (handlers); it does NOT import `useNavigate`, `react-router-dom`, or any auth module. The integration layer is the implementation behind that abstraction.
  - **DRY**: `isCrdRoute` is a single function; both consumers (`CrdAwareErrorComponent` and tests) read it. No duplicate route-pattern lists. → ✅

**Engineering Workflow check**:
- Planning documents domain contexts (Auth/Routing — both `core` cross-cutting), React 19 features (none new — pure render + one effect), GraphQL operations touched (none) → ✅
- No new schema; `pnpm run codegen` not required → ✅
- Domain-first: no domain façade change needed; the existing `Error40XBoundary` and `useRestrictedRedirect` already provide the right abstractions → ✅
- Root Cause Analysis (Engineering Workflow #5): the root cause of "MUI page renders inside CRD chrome" is that `errorComponent` always renders MUI. The fix replaces the callback with a CRD-aware version — at the right seam — rather than patching individual CRD pages or adding per-page error handling → ✅

**Result**: All gates PASS. No violations to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/095-crd-auth-error-page/
├── plan.md                      # This file (/speckit.plan output)
├── research.md                  # Phase 0 output
├── data-model.md                # Phase 1 output
├── quickstart.md                # Phase 1 output
├── contracts/                   # Phase 1 output
│   └── forbidden-page-props.md  # TypeScript prop contracts at the integration ↔ CRD boundary
├── checklists/
│   └── requirements.md          # Already exists (from /speckit.specify + /speckit.clarify)
└── tasks.md                     # /speckit.tasks output (NOT created by /speckit.plan)
```

### Source Code (repository root)

Files touched by this feature, mapped to the project's existing layout:

```text
# Presentational layer — design system (no business logic)
src/crd/components/error/
├── CrdForbiddenPage.tsx              # NEW — pure shadcn/ui + Tailwind page; props: title, description,
│                                     #   onGoHome, onGoBack?, showGoBack?
└── CrdRedirectDialog.tsx             # NEW — pure shadcn/ui Dialog + Lock icon; props: open, onOpenChange,
                                      #   title, message, countdownLabel, cancelCountdownLabel, goNowLabel,
                                      #   cancelled, onCancelCountdown, onGoNow, ancestorSlot? (ReactNode)

# i18n — manually maintained per CRD rules (NOT Crowdin)
src/crd/i18n/error/
├── error.en.json                     # NEW — keys: title, description, actions.goHome, actions.goBack
├── error.nl.json                     # NEW — same keys, Dutch
├── error.es.json                     # NEW — same keys, Spanish
├── error.bg.json                     # NEW — same keys, Bulgarian
├── error.de.json                     # NEW — same keys, German
└── error.fr.json                     # NEW — same keys, French

# i18n namespace registration
src/core/i18n/config.ts               # MODIFIED — add `crd-error` entry (6 lazy imports)

# Integration layer — ALL business logic lives here
src/main/crdPages/error/
├── isCrdRoute.ts                              # NEW — `(pathname: string) => boolean`; single source of truth
├── isCrdRoute.test.ts                         # NEW — Vitest unit test
├── hasInAppHistory.ts                         # NEW — wrapper around `window.history.length > 1` per Constitution IV
├── hasInAppHistory.test.ts                    # NEW — Vitest unit test
├── CrdAwareErrorComponent.tsx                 # NEW — boundary errorComponent: decides CRD vs MUI rendering
├── CrdAwareErrorComponent.test.tsx            # NEW — Vitest unit test
├── CrdRestrictedRoute.tsx                     # NEW — CRD-aware /restricted route handler (logs origin to Sentry,
│                                              #   renders CRD page in CRD chrome OR delegates to existing Restricted)
├── CrdRestrictedRoute.test.tsx                # NEW — Vitest unit test
├── CrdRedirectToAncestorDialog.tsx            # NEW — CRD redirect dialog integration (timer, useSpaceCardQuery,
│                                              #   navigate, ancestor space-card slot)
├── CrdRedirectToAncestorDialog.test.tsx       # NEW — Vitest unit test (timer + cancel + navigation paths)
├── AncestorRedirectDispatcher.tsx             # NEW — chooses CRD vs MUI redirect dialog based on toggle +
│                                              #   isCrdRoute(pathname) + isNotAuthorized
└── AncestorRedirectDispatcher.test.tsx        # NEW — Vitest unit test (5 truth-table cases)

# Page-level privilege guard for CRD Space Settings
src/main/crdPages/topLevelPages/spaceSettings/
├── useSpaceSettingsAccessGuard.ts             # NEW — runs useSpacePrivilegesQuery + useRestrictedRedirect
│                                              #   with requiredPrivilege: AuthorizationPrivilege.Update
├── useSpaceSettingsAccessGuard.test.tsx       # NEW — Vitest unit test (skip semantics + privilege reader)
└── CrdSpaceSettingsPage.tsx                   # MODIFIED — call useSpaceSettingsAccessGuard at the top

# Layout shell — small additive refactor
src/main/ui/layout/CrdLayoutWrapper.tsx   # MODIFIED — accept optional `children` prop; default to <Outlet />
                                          #   (non-breaking; existing route-tree consumers unchanged)

# Root composition — wire the new errorComponent
src/root.tsx                          # MODIFIED — replace inline arrow with <CrdAwareErrorComponent {...errorState} />

# Routing — toggle /restricted between MUI and CRD handlers
src/main/routing/TopLevelRoutes.tsx   # MODIFIED — at the /restricted route, render either <Restricted />
                                      #   (toggle off) or <CrdRestrictedRoute /> (toggle on)

# Boundary — one-line dispatcher swap for the redirect-to-ancestor dialog
src/core/40XErrorHandler/ErrorBoundary.tsx  # MODIFIED — swap MUI RedirectToAncestorDialog import for
                                            #   AncestorRedirectDispatcher; pass this.state.isNotAuthorized
                                            #   to the dispatcher. Class-component logic unchanged.

# i18next type augmentation
@types/i18next.d.ts                   # MODIFIED — register `crd-error` namespace in CustomTypeOptions

# UNCHANGED — verified above
src/core/40XErrorHandler/40XErrors.ts        # NotAuthorizedError, NotFoundError; unchanged
src/core/pages/Errors/Error403.tsx           # MUI fallback; preserved for toggle-off path
src/core/pages/Errors/Error40X.tsx           # MUI dispatcher; preserved for toggle-off path
src/core/routing/Restricted.tsx              # MUI /restricted handler; preserved for toggle-off path
src/core/routing/useRestrictedRedirect.tsx   # Throw-path; unchanged (mirrors MUI 1:1 per FR-019)
src/main/routing/urlResolver/UrlResolverProvider.tsx  # Throw-path; unchanged
src/main/admin/NonAdminRedirect.tsx          # Redirects to /restricted; unchanged (now lands on CRD when toggle on)
```

**Structure Decision**: Standard project layout — `src/crd/components/<feature>/` for the presentational page, `src/main/crdPages/<feature>/` for integration, `src/crd/i18n/<feature>/` for translations, `src/core/i18n/config.ts` for namespace registration. This matches existing patterns from migrations 039/041/042/043/093. One small additive refactor to `CrdLayoutWrapper` (a `children` prop) enables the layout to be mounted standalone outside the route tree, which the boundary error path requires.

### i18n keys (across all six language files)

```jsonc
// src/crd/i18n/error/error.en.json (mirror in nl/es/bg/de/fr)
{
  "forbidden": {
    "title": "Access Restricted",            // Reuses existing MUI value (pages.unauthorized.header).
                                              // Used both as <h1> text AND as the usePageTitle argument.
                                              // usePageTitle automatically appends " | Alkemio".
    "description": "The page you're trying to access is not available for you.",
                                              // Reuses existing MUI value (pages.unauthorized.subheader).
    "actions": {
      "goHome": "Go to Home",
      "goBack": "Go back"
    }
  }
}
```

The page is a single CRD-styled card centered in the page content area, matching the visual treatment of other CRD empty / error states. A `lucide-react` `ShieldAlert` (or similar) icon at the top conveys the restricted nature, marked `aria-hidden="true"` per FR-028.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. No complexity to track.
