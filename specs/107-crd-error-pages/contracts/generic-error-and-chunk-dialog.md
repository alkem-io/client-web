# Contract: CRD generic error page, chunk-load dialog, and redirect dispatcher (P2/P3/FR-018)

Covers the surfaces added when the delivery was widened from P1-only to the full sweep
(P1 + redirect-dialog follow-on + P2 + P3). Legacy (design version `1`) users keep the
MUI surfaces unchanged on every branch.

## `CrdErrorPage` (presentational)

**Location**: `src/crd/components/error/CrdErrorPage.tsx`
**Layer**: CRD presentational (props-only). No MUI, no business logic, no GraphQL types, no router imports.

```ts
export type CrdErrorPageProps = {
  title: string;
  description: ReactNode;       // composed copy (message + server hint) supplied by the caller
  reloadLabel: string;
  onReload: () => void;
  contactSlot?: ReactNode;      // optional support-contact affordance (e.g. a mailto link)
  code?: string;               // optional numeric/code line
  details?: string;            // optional stack trace, rendered in a <pre>; dev only
  className?: string;
};
```

- Mirrors `CrdForbiddenPage` layout (centered card, `lucide-react` `TriangleAlert` `aria-hidden`, single `<h1>`, real `<button>` reload).
- `code`, `contactSlot`, `details` each render only when provided.
- No network/logging/navigation inside the component.

## `CrdErrorDialog` (presentational)

**Location**: `src/crd/components/error/CrdErrorDialog.tsx`
**Layer**: CRD presentational. CRD `Dialog` primitive + Tailwind, no MUI.

```ts
export type CrdErrorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: ReactNode;
  reloadLabel: string;
  onReload: () => void;
};
```

## Integration wiring (in `src/main/crdPages/error/`, no MUI)

- **`CrdGenericErrorContent`** — shared no-chrome body for both P2 surfaces. Uses
  `useTranslation('crd-error')` for page copy + the default `t` for
  `generateSupportMailtoUrl`; composes `genericError.description` (with `{{message}}`),
  `genericError.serverHint` (`{{graphQLEndpoint}}`), `genericError.contactSupport`
  (`<contact>` link), optional `genericError.code` (`{{code}}`), dev-only stack; reload via
  `window.location.reload()`.
- **`CrdGenericErrorBranch`** (in `CrdAwareErrorComponent`) — wraps `CrdGenericErrorContent`
  in `CrdLayoutWrapper`, sets `usePageTitle(t('genericError.title'))`, logs once to Sentry on
  mount (`sentryError(error, { category: UI, label: 'CrdErrorPage' })`, parity with MUI
  `ErrorPage`). Branch condition: `crdEnabled && isCrd && error && !isNotFound && !isNotAuthorized`.
- **`CrdTopLevelErrorPage`** — bare P2b page; wraps `CrdGenericErrorContent` in
  `<div className="crd-root …">` (no `CrdLayoutWrapper`/router). Selected by
  `SentryErrorBoundaryProvider`’s `TopLevelErrorFallback` when `useCrdEnabled()` is true,
  else MUI `ErrorPage`.
- **`CrdGlobalErrorDialog`** — P3 integration; reads `useGlobalError()`, maps `LazyLoadError`
  → `chunkLoad.messages.lazyLoad` else `chunkLoad.messages.unknown`, renders `CrdErrorDialog`;
  reload = `setError(null); window.location.reload()`. Gated CRD-vs-MUI by `GlobalErrorDialogGate`
  in `root.tsx`.

## Redirect dispatcher (FR-018)

**`AncestorRedirectDispatcher`** (`src/main/crdPages/error/AncestorRedirectDispatcher.tsx`)
- Only mounts when the boundary has a `closestAncestor` (exclusively `NotFoundError` /
  `NotAuthorizedError`); both render a CRD page under `crdEnabled && isCrdRoute`.
- Gate: `const useCrd = crdEnabled && isCrdRoute(pathname);` → CRD dialog, else MUI dialog.
- The previous `isNotAuthorized === true` gate (and the prop) are removed; `ErrorBoundary` no
  longer passes `isNotAuthorized`.
- The CRD redirect dialog renders the ancestor space card only for `UrlType.Space` ancestors
  (via `ancestorSlot`); for VC / innovation-pack / other non-Space ancestors it shows just the
  message + countdown — exact parity with the MUI dialog.

## Route classification (FR-019)

**`isCrdRoute`** (`src/main/crdPages/error/isCrdRoute.ts`)
- Returns `true` for the CRD shell: `home`, `spaces`, `restricted`, `/public/whiteboard/*`,
  dynamic Space routes, **and** the reserved-but-migrated segments `vc`, `user`, `organization`,
  `innovation-packs`, `innovation-library`, `docs`, `admin`, `hub`, `forum` (positive allowlist
  `crdMigratedTopLevelSegments`).
- Returns `false` for still-MUI reserved segments (`contributors`, `innovation-hubs`,
  redirect/legacy-only) so their error chrome stays MUI.
- The allowlist MUST track the `crdEnabled ? <Crd…> : <Mui…>` dispatch in `TopLevelRoutes.tsx`.
- Consumed only by `CrdAwareErrorComponent` (error page) and `AncestorRedirectDispatcher`
  (redirect dialog), so the blast radius is the error/redirect flow only.

## i18n (`crd-error` namespace, six locales, full parity)

```
genericError.title | description {{message}} | serverHint {{graphQLEndpoint}} | contactSupport <contact> | code {{code}} | actions.reload
chunkLoad.title | messages.lazyLoad | messages.unknown | actions.reload
```

The English `crd-error` namespace is **eagerly** loaded in `src/core/i18n/config.ts` (added to
the cache, the `ns` array, and `resources.en`) so the top-level boundary can render CRD copy
even on a boot-time crash. Parity enforced by `error.parity.test.ts` (bidirectional).
