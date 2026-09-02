# Contract: `CrdNotFoundBranch`, dispatcher extension, and catch-all wiring

## 1. `CrdNotFoundBranch` (integration wrapper)

**Location**: `src/main/crdPages/error/CrdNotFoundBranch.tsx`
**Layer**: integration glue (may use router, i18n, logging, layout). Renders the props-only `CrdNotFoundPage` inside CRD chrome.

```ts
export function CrdNotFoundBranch(): JSX.Element;
```

### Behavioural guarantees

- B1: Wraps `CrdNotFoundPage` in `<CrdLayoutWrapper>` (CRD header/footer).
- B2: On mount, calls `log404NotFound()` from `@/core/logging/sentry/log` exactly once (effect; matches MUI `Error404` parity, FR-008, FR-014b).
- B3: Sets the browser tab title via `usePageTitle(t('notFound.title'))` using `useTranslation('crd-error')` (FR-009).
- B4: Computes `showGoBack = hasInAppHistory()`; passes `onGoBack={() => navigate(-1)}` only when true.
- B5: `onGoHome={() => navigate('/' + TopLevelRoutePath.Home)}` using `@/core/routing/useNavigate`.
- B6: Passes localized labels `notFound.title`, `notFound.description`, `notFound.actions.goHome`, `notFound.actions.goBack`.

### Test contract (`CrdNotFoundBranch.test.tsx`)

1. calls `log404NotFound` exactly once on mount.
2. sets tab title to `notFound.title`.
3. renders inside `crd-layout-wrapper`.
4. "go back" hidden when `hasInAppHistory` false; shown + `navigate(-1)` when true.
5. "go home" navigates to `/home`.

## 2. Dispatcher extension — `CrdAwareErrorComponent`

**Location**: `src/main/crdPages/error/CrdAwareErrorComponent.tsx`

Add an `isNotFound` branch, preserving existing branches:

```ts
if (crdEnabled && isCrd && props.isNotAuthorized === true) return <CrdForbiddenBranch />;
if (crdEnabled && isCrd && props.isNotFound === true) return <CrdNotFoundBranch />;   // NEW
// else MUI fallback (unchanged)
```

### Behavioural guarantees

- D1: `crdEnabled && isCrd && isNotFound` → `CrdNotFoundBranch` (CRD chrome, no MUI layout).
- D2: non-CRD route (e.g. `/admin`) with `isNotFound` → MUI fallback (`Error40X` with `isNotFound`).
- D3: CRD disabled with `isNotFound` → MUI fallback.
- D4: undefined pathname → `isCrd` false → MUI fallback (no crash).
- D5: existing 403 and generic-error behaviour unchanged (regression-safe, FR-013).

### Test contract (update `CrdAwareErrorComponent.test.tsx`)

- Replace `renders MUI fallback for isNotFound (CRD 404 is out of scope)` with `renders CRD 404 when toggle on, route is CRD, and isNotFound=true`.
- Add: non-CRD route + isNotFound → MUI; CRD disabled + isNotFound → MUI; undefined pathname + isNotFound → MUI.
- Keep all existing 403 tests green.

## 3. Catch-all wiring — `TopLevelRoutes.tsx`

**Location**: `src/main/routing/TopLevelRoutes.tsx` (the `path="*"` element, ~line 413–422)

Before:
```tsx
<Route path="*" element={
  <WithApmTransaction path="*">
    <TopLevelLayout><Error404 /></TopLevelLayout>
  </WithApmTransaction>
} />
```

After (mirror the existing `/restricted` toggle):
```tsx
<Route path="*" element={
  <WithApmTransaction path="*">
    {crdEnabled ? <CrdNotFoundBranch /> : <TopLevelLayout><Error404 /></TopLevelLayout>}
  </WithApmTransaction>
} />
```

### Behavioural guarantees

- C1: `crdEnabled` true → CRD 404 (`CrdNotFoundBranch`) for any unmatched URL.
- C2: `crdEnabled` false → MUI `Error404` inside `TopLevelLayout`, exactly as today (FR-005).
- C3: `crdEnabled` is the same value already read at the top of `TopLevelRoutes` (no extra hook call).
- C4: `Error404` import is retained (still used in the MUI branch).

### Verification

- Lint/build confirms no broken imports and the MUI branch still compiles.
- Manual (per story Verification): seed `2` → CRD 404 on `/this-does-not-exist`; seed `1` → MUI `Error404`.
