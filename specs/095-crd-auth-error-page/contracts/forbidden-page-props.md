# Contract: CRD Forbidden Page — Integration ↔ Presentational Boundary

**Feature**: 095-crd-auth-error-page
**Date**: 2026-04-28
**Scope**: TypeScript-level contracts between `src/main/crdPages/error/` (integration) and `src/crd/components/error/` (presentational). No GraphQL contracts (this feature adds no GraphQL operations).

This file is the source of truth for the prop / module shapes the implementation MUST adhere to. Any divergence from these shapes during implementation requires a spec or plan update.

---

## 1. `CrdForbiddenPage` (presentational)

**Module**: `src/crd/components/error/CrdForbiddenPage.tsx`
**Exported symbol**: `CrdForbiddenPage` (named export, NOT a default export — per project convention forbidding barrel exports / hidden default re-exports)

```ts
export type CrdForbiddenPageProps = {
  /** Page headline (rendered as <h1>). */
  title: string;
  /** Plain-language explanation of the restricted state. */
  description: string;
  /** Label for the primary action button. */
  goHomeLabel: string;
  /** Label for the secondary action button. */
  goBackLabel: string;
  /** Click handler for the primary action. */
  onGoHome: () => void;
  /**
   * Click handler for the secondary action.
   * If undefined or `showGoBack` is false, the secondary button is not rendered.
   */
  onGoBack?: () => void;
  /**
   * Explicit visibility flag for the secondary action.
   * Defaults to false. When true, `onGoBack` MUST be provided.
   */
  showGoBack?: boolean;
};

export function CrdForbiddenPage(props: CrdForbiddenPageProps): JSX.Element;
```

**Constraints (enforced by the implementation, verified by review)**:
- The module MUST NOT import from `@mui/*`, `@emotion/*`, `@apollo/client`, `@/core/apollo/*`, `@/domain/*`, `@/core/auth/*`, `react-router-dom`, or `formik`. (CRD architectural rules + FR-001.)
- The module MUST NOT call any hook other than `useTranslation` is **forbidden** here too — the component receives all strings as props (FR-002 / FR-009). (The translation lookup happens in the integration layer.)
- The module MAY import `cn` from `@/crd/lib/utils`, primitives from `@/crd/primitives/*`, and icons from `lucide-react`.
- The component MUST render an `<h1>` for the title and a real `<button>` (or shadcn `Button` primitive) for each action. Buttons MUST have `type="button"`.
- The primary action button SHOULD receive focus on mount (e.g., via `autoFocus` on the shadcn `Button`) to satisfy FR-026.

**Visual contract** (informal — for design review, not enforced by types):
- Centered single-card layout matching other CRD empty / error states.
- A `lucide-react` icon (recommended: `ShieldAlert`) at the top of the card, marked `aria-hidden="true"`.
- Stack: icon → headline → description → primary button → optional secondary button.
- Tailwind tokens only; no inline `style={...}` and no hard-coded colors.

---

## 2. `CrdAwareErrorComponent` (integration — replaces the inline `errorComponent` arrow)

**Module**: `src/main/crdPages/error/CrdAwareErrorComponent.tsx`
**Exported symbol**: `CrdAwareErrorComponent`

```ts
import type { ReactNode } from 'react';

/**
 * State shape mirrors the existing `Error40XBoundary` State (see
 * `src/core/40XErrorHandler/ErrorBoundary.tsx`). Only the fields actually
 * needed by the renderer are listed here.
 */
export type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  isNotFound?: boolean;
  isNotAuthorized?: boolean;
  pathname?: string;
};

export type CrdAwareErrorComponentProps = ErrorBoundaryState;

export function CrdAwareErrorComponent(props: CrdAwareErrorComponentProps): ReactNode;
```

**Behavior**:
1. Reads `useCrdEnabled()` and `isCrdRoute(props.pathname ?? '')`.
2. If `!crdEnabled || !isCrdRouteResult`: returns the existing MUI fallback — `<TopLevelLayout><Error40X {...props} /></TopLevelLayout>` — unchanged from today's inline arrow.
3. Otherwise, only when `props.isNotAuthorized === true`: returns the CRD shell:
   ```tsx
   <CrdLayoutWrapper>
     <CrdForbiddenPage
       title={t('forbidden.title')}
       description={t('forbidden.description')}
       goHomeLabel={t('forbidden.actions.goHome')}
       goBackLabel={t('forbidden.actions.goBack')}
       onGoHome={() => navigate(`/${TopLevelRoutePath.Home}`)}
       onGoBack={showGoBack ? () => navigate(-1) : undefined}
       showGoBack={showGoBack}
     />
   </CrdLayoutWrapper>
   ```
4. For `props.isNotFound === true` or any other state branch on a CRD route: returns the MUI fallback (CRD-styled 404 is explicitly out of scope per the spec).
5. Sets the document tab title via `usePageTitle(t('forbidden.title'))` BEFORE returning. `usePageTitle` automatically appends " | Alkemio", so the rendered tab title is "Access Restricted | Alkemio" — matching the MUI `Error403` path behavior. The `useTranslation('crd-error')` namespace is loaded by the same component that calls `t()`.

**Constraints**:
- MUST be a function component so hooks (`useCrdEnabled`, `useTranslation`, `useNavigate`, `usePageTitle`) work.
- MUST NOT introduce new state — render is a pure derivation from props + the toggle.
- MUST NOT read `useLocation()`. The pathname is `props.pathname` (captured by the boundary at error time); using `useLocation()` would yield the new pathname after a redirect / reset, contaminating the routing decision.

---

## 3. `CrdRestrictedRoute` (integration — `/restricted` route element)

**Module**: `src/main/crdPages/error/CrdRestrictedRoute.tsx`
**Exported symbol**: `CrdRestrictedRoute`

```ts
import type { ReactNode } from 'react';

export function CrdRestrictedRoute(): ReactNode;
```

**Behavior**:
1. Calls `useTransactionScope({ type: 'authentication' })` — same APM transaction scope as MUI `Restricted.tsx`.
2. Reads `useQueryParams().get('origin')`.
3. Calls `useEffect(() => { logInfo('Attempted access to: ${origin}'); }, [origin])` — exactly mirroring `src/core/routing/Restricted.tsx:13-15`.
4. Computes `showGoBack = typeof window !== 'undefined' && window.history.length > 1`.
5. Sets the document title via `usePageTitle(t('forbidden.title'))` — same key, same behavior as `CrdAwareErrorComponent`.
6. Returns:
   ```tsx
   <CrdLayoutWrapper>
     <CrdForbiddenPage
       title={t('forbidden.title')}
       description={t('forbidden.description')}
       goHomeLabel={t('forbidden.actions.goHome')}
       goBackLabel={t('forbidden.actions.goBack')}
       onGoHome={() => navigate(`/${TopLevelRoutePath.Home}`)}
       onGoBack={showGoBack ? () => navigate(-1) : undefined}
       showGoBack={showGoBack}
     />
   </CrdLayoutWrapper>
   ```

**Constraints**:
- MUST NOT branch on auth state — the `/restricted` route is auth-agnostic per Clarification Q4 / FR-021. Anonymous and authenticated visitors render the same content.
- MUST emit the Sentry breadcrumb regardless of CRD toggle state (the toggle decision happens at `TopLevelRoutes.tsx`; once `CrdRestrictedRoute` is mounted, we are unconditionally on the CRD path and the log fires for parity).
- MUST NOT include any redirect logic — no `<Navigate>`, no `navigate(...)` in `useEffect`. Direct visits render the page.

---

## 4. `isCrdRoute` (predicate)

**Module**: `src/main/crdPages/error/isCrdRoute.ts`
**Exported symbol**: `isCrdRoute`

```ts
/**
 * Returns true iff the given pathname corresponds to a CRD-enabled route in
 * `TopLevelRoutes.tsx`. The patterns mirror the per-route conditional in the
 * route tree; new CRD migrations add a pattern here as part of their diff.
 *
 * This predicate is the single source of truth for the CRD vs MUI routing
 * decision in `CrdAwareErrorComponent`. It MUST be unit-testable in isolation
 * and MUST NOT depend on DOM, network, or React.
 */
export function isCrdRoute(pathname: string): boolean;
```

**Behavior** (specification — implementation may use any equivalent algorithm):
- Return `true` if `pathname` (with any trailing slash, query string, or hash stripped) matches any of:
  - `/home`
  - `/spaces`
  - `/restricted`
  - Starts with `/public/whiteboard/`
  - Has a non-empty first path segment that is **not** in `reservedTopLevelRoutePaths` (the Space tree case — `/<spaceNameId>` and any nested segments).
- Return `false` otherwise. In particular: `/admin/*`, `/user/*`, `/organization/*`, `/innovation-library`, `/innovation-packs`, `/innovation-hubs`, `/forum/*`, `/profile/*`, `/contributors`, `/docs`, `/contact`, `/help`, `/`, `/landing`, `/identity`, and the empty string all return `false`.

**Test obligations** (covered by `isCrdRoute.test.ts`):
- Empty string → `false`.
- `/` → `false`.
- `/home` and `/home/` → `true`.
- `/spaces` and `/spaces?foo=bar` → `true`.
- `/restricted` → `true`.
- `/public/whiteboard/abc123` → `true`.
- `/admin/something` → `false` (admin is a reserved top-level path).
- `/welcome-space` → `true` (treated as Space tree).
- `/welcome-space/challenges/foo` → `true` (Space tree, nested).
- `/innovation-library` → `false` (reserved).

---

## 5. `CrdLayoutWrapper` — `children` prop refactor

**Module**: `src/main/ui/layout/CrdLayoutWrapper.tsx`
**Exported symbol**: `CrdLayoutWrapper` (existing, signature change is additive)

```ts
import type { ReactNode } from 'react';

export type CrdLayoutWrapperProps = {
  /**
   * Content to render inside the layout. When omitted (the existing
   * route-element use case), the layout renders <Outlet /> for the
   * matched child route. When provided (the boundary error path and
   * the /restricted route handler), the layout renders the children
   * directly.
   */
  children?: ReactNode;
};

export function CrdLayoutWrapper(props: CrdLayoutWrapperProps): JSX.Element;
```

**Implementation note**: in the inner content body, replace `<Outlet />` with `{children ?? <Outlet />}`. All current call sites pass no `children` prop and continue to use `<Outlet />`. No other change.

---

## 6. i18n namespace registration

**Module**: `src/core/i18n/config.ts`
**Change**: add a new entry to the namespaces map.

```ts
'crd-error': {
  en: () => import('@/crd/i18n/error/error.en.json'),
  es: () => import('@/crd/i18n/error/error.es.json'),
  nl: () => import('@/crd/i18n/error/error.nl.json'),
  bg: () => import('@/crd/i18n/error/error.bg.json'),
  de: () => import('@/crd/i18n/error/error.de.json'),
  fr: () => import('@/crd/i18n/error/error.fr.json'),
},
```

The namespace is loaded on demand by any component that calls `useTranslation('crd-error')`. The integration layer (`CrdAwareErrorComponent` and `CrdRestrictedRoute`) is the only consumer.

---

## 7. i18n JSON shape (per language)

**Modules**: `src/crd/i18n/error/error.{en,nl,es,bg,de,fr}.json`

```jsonc
{
  "forbidden": {
    "title": "<localized>",
    "description": "<localized>",
    "actions": {
      "goHome": "<localized>",
      "goBack": "<localized>"
    }
  }
}
```

English values are listed in the plan's i18n key block. Other languages are translated manually (AI-assisted) per the project's CRD i18n process. No additional keys are added in this feature (FR-024: smallest scope today). Note: there is no separate `documentTitle` key — `usePageTitle(t('crd-error:forbidden.title'))` produces the correct tab title because `usePageTitle` appends " | Alkemio" automatically.

---

## Out of contract

- No GraphQL document, fragment, or schema change.
- No new browser API wrappers.
- No changes to `Error40XBoundary`, `Error40X`, `Error403`, `Error404`, `Restricted`, `useRestrictedRedirect`, `NonAdminRedirect`, or any of their imports.
- No new global state, no new context provider.
