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

## 8. `CrdRedirectDialog` (presentational — CRD redirect-to-ancestor dialog)

**Module**: `src/crd/components/error/CrdRedirectDialog.tsx`
**Exported symbol**: `CrdRedirectDialog` (named export)

```ts
import type { ReactNode } from 'react';

export type CrdRedirectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog header title (rendered next to the Lock icon). */
  title: string;
  /** Dialog body — typically a `<Trans>` element from the integration layer. */
  message: ReactNode;
  /** Pre-formatted countdown string (e.g. "Redirecting in 8 seconds…"). */
  countdownLabel?: string;
  /** Inline cancel link label inside the countdown text (e.g. "[Click to cancel]"). */
  cancelCountdownLabel?: string;
  /** Primary "Go Now" button label. */
  goNowLabel: string;
  /** When true, the countdown text is hidden (the user pressed cancel). */
  cancelled: boolean;
  onCancelCountdown: () => void;
  onGoNow: () => void;
  /**
   * Optional rendered ancestor card (rendered between the message and the
   * footer). The integration layer fills this when the ancestor is a Space —
   * the dialog itself does not know what an ancestor is.
   */
  ancestorSlot?: ReactNode;
};

export function CrdRedirectDialog(props: CrdRedirectDialogProps): JSX.Element;
```

**Constraints**:
- Forbidden imports — same list as §1 (`@mui/*`, `@/core/apollo/*`, `@/domain/*`, `@/core/auth/*`, `react-router-dom`, `formik`, etc.).
- MUST NOT call `useTranslation`, `useNavigate`, or any data hook. All copy and handlers come from props.
- Renders the shadcn `Dialog` primitive from `@/crd/primitives/dialog` plus a `Lock` icon from `lucide-react` (`aria-hidden="true"`).
- The cancel link is a real `<button>` (not a `<span>` with a click handler) for keyboard / a11y.

---

## 9. `CrdRedirectToAncestorDialog` (integration — wraps the CRD presentational dialog)

**Module**: `src/main/crdPages/error/CrdRedirectToAncestorDialog.tsx`
**Exported symbol**: `CrdRedirectToAncestorDialog`

```ts
import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';

type CrdRedirectToAncestorDialogProps = {
  closestAncestor: ClosestAncestor;
};

export function CrdRedirectToAncestorDialog(props: CrdRedirectToAncestorDialogProps): JSX.Element;
```

**Behavior**:
1. Manages local state: `closed: boolean`, `secondsLeft: number = 10`, `cancelled: boolean`. Resets all three when `closestAncestor.url` changes (matches the MUI dialog's reopen-on-change behavior).
2. Runs a `setInterval` that decrements `secondsLeft` once per second; at 0, calls `navigate(closestAncestor.url)`. The interval is cleaned up when `closed` or `cancelled` becomes true.
3. Renders the inline space card via `useSpaceCardQuery({ variables: { spaceId: closestAncestor.space.id }, skip: type !== Space })`. Loading shows a `Skeleton`; loaded shows an `<a>` with the space banner / avatar + display name.
4. Reuses i18n keys from the existing main namespace: `components.urlResolver.redirectDialog.title` / `.message` / `.countdown` / `.cancelCountdown` / `.goNow`. No new keys are introduced.
5. Composes the CRD presentational dialog with all wired props.

**Constraints**:
- Lives in `src/main/crdPages/error/` (the integration glue layer). MAY import from `@/core/apollo/*`, `@/core/routing/*`, `@/crd/*`, `react-router-dom`, `react-i18next`.
- The inline space card slot logic is local to this file (`AncestorSpaceCardSlot`) and uses `Avatar` / `Skeleton` from `@/crd/primitives/*` plus the `useSpaceCardQuery` from generated Apollo hooks.

---

## 10. `AncestorRedirectDispatcher` (integration — selects CRD vs MUI dialog)

**Module**: `src/main/crdPages/error/AncestorRedirectDispatcher.tsx`
**Exported symbol**: `AncestorRedirectDispatcher`

```ts
import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';

type AncestorRedirectDispatcherProps = {
  closestAncestor: ClosestAncestor;
  /** From `Error40XBoundary.state.isNotAuthorized` — see FR-039. */
  isNotAuthorized?: boolean;
};

export function AncestorRedirectDispatcher(props: AncestorRedirectDispatcherProps): JSX.Element;
```

**Behavior**: per the truth table in `data-model.md` §6 — renders CRD when all three conditions hold (`crdEnabled && isCrdRoute(pathname) && isNotAuthorized === true`), MUI otherwise. The MUI fallback is the existing `RedirectToAncestorDialog` from `src/core/40XErrorHandler/`.

---

## 11. `useSpaceSettingsAccessGuard` (integration — page-level privilege gate for Space Settings)

**Module**: `src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsAccessGuard.ts`
**Exported symbol**: `useSpaceSettingsAccessGuard`

```ts
export function useSpaceSettingsAccessGuard(spaceId: string, scopeLoading: boolean): void;
```

**Behavior**: per the data-model §5 inputs. Internally:
- Runs `useSpacePrivilegesQuery({ variables: { spaceId }, skip: !spaceId })` — a lightweight query that returns just `space.authorization.myPrivileges`.
- Calls `useRestrictedRedirect({ data, error, skip: scopeLoading || !spaceId }, data => data.lookup.space?.authorization?.myPrivileges, { requiredPrivilege: AuthorizationPrivilege.Update })`.
- The standard `useRestrictedRedirect` flow handles all three branches: anonymous → silent redirect to sign-in with returnUrl; authenticated non-admin → throw `NotAuthorizedError` (no redirect URL) → boundary renders CRD forbidden page; admin → no throw.

**Consumer**: called once at the top of `CrdSpaceSettingsPage.tsx`, immediately after `useSettingsScope()`, **before** any tab data hooks fire.

---

## 12. Boundary one-line swap

**Module**: `src/core/40XErrorHandler/ErrorBoundary.tsx`

The class-component logic is preserved verbatim. Only the dialog import + render are swapped:

```diff
- import { RedirectToAncestorDialog } from './RedirectToAncestorDialog';
+ import { AncestorRedirectDispatcher } from '@/main/crdPages/error/AncestorRedirectDispatcher';

  // … inside render():
- {this.state.closestAncestor && <RedirectToAncestorDialog closestAncestor={this.state.closestAncestor} />}
+ {this.state.closestAncestor && (
+   <AncestorRedirectDispatcher
+     closestAncestor={this.state.closestAncestor}
+     isNotAuthorized={this.state.isNotAuthorized}
+   />
+ )}
```

The boundary's `getDerivedStateFromError`, `getDerivedStateFromProps`, `redirectUrl` branch, and pathname-reset behavior are unchanged.

---

## Out of contract

- No GraphQL schema change. The `useSpacePrivilegesQuery` hook used by `useSpaceSettingsAccessGuard` already exists in `src/core/apollo/generated/apollo-hooks.ts` from prior work — it is not introduced here. The `useSpaceCardQuery` reused by `CrdRedirectToAncestorDialog` is also pre-existing (it was used by the MUI `RedirectToAncestorDialog`).
- No new GraphQL fragment, mutation, or document.
- No new browser API wrappers beyond `hasInAppHistory` (already documented in §4).
- No changes to `Error40XBoundary`'s class logic, `Error40X`, `Error403`, `Error404`, `Restricted`, `useRestrictedRedirect`, `NonAdminRedirect`, or `RedirectToAncestorDialog` (the MUI one). The MUI redirect dialog file remains in the codebase as the toggle-off fallback consumed by `AncestorRedirectDispatcher`.
- No new global state, no new context provider.
