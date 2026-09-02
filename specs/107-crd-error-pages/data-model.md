# Phase 1 Data Model: Port the Error Pages to CRD (P1)

**Feature**: 107-crd-error-pages | **Story**: alkem-io/client-web#9852

This feature is a presentational UI migration with **no persisted data, no GraphQL, and
no domain entities**. The "model" here is the component prop contracts and the dispatch
state that selects which surface to render. All types are plain TypeScript (no generated
GraphQL types), per Constitution III and the CRD-only rule.

## Component / interface contracts

### `CrdNotFoundPageProps` (presentational, `src/crd/components/error/`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | `string` | yes | Localized page heading (`notFound.title`). |
| `description` | `string` | yes | Localized body text (`notFound.description`). |
| `goHomeLabel` | `string` | yes | Label for the primary "Go to home" action. |
| `goBackLabel` | `string` | yes | Label for the optional "Go back" action. |
| `onGoHome` | `() => void` | yes | Handler injected by the integration layer. |
| `onGoBack` | `() => void` | no | Handler injected only when in-app history exists. |
| `showGoBack` | `boolean` | no | Controls rendering of the "Go back" button. |
| `search` | `ReactNode` | no | Optional slot for a future CRD search affordance (unset in P1, FR-014a). |
| `className` | `string` | no | Style override, per `CrdForbiddenPage`. |

Invariant: the "Go back" button renders only when `showGoBack === true && onGoBack !== undefined` (mirrors `CrdForbiddenPage`).

### `CrdAwareErrorComponentProps` (dispatcher, `src/main/crdPages/error/`) — existing, unchanged shape

| Field | Type | Notes |
|-------|------|-------|
| `hasError` | `boolean?` | unchanged |
| `error` | `Error?` | unchanged |
| `isNotFound` | `boolean?` | **now consumed** — drives the new CRD 404 branch |
| `isNotAuthorized` | `boolean?` | unchanged (drives 403) |
| `pathname` | `string?` | unchanged (feeds `isCrdRoute`) |

## Dispatch decision table (P1)

The dispatcher and the catch-all both reduce a small state to a rendered surface. Let
`crd = useCrdEnabled()` and `isCrd = isCrdRoute(pathname)`.

| Source | Condition | Rendered surface |
|--------|-----------|------------------|
| Boundary dispatcher | `crd && isCrd && isNotAuthorized` | `CrdForbiddenBranch` (existing) |
| Boundary dispatcher | `crd && isCrd && isNotFound` | **`CrdNotFoundBranch` (NEW)** |
| Boundary dispatcher | otherwise | `TopLevelLayout` + MUI `Error40X` (existing) |
| `path="*"` catch-all | `crd` | **`CrdNotFoundBranch` (NEW)** |
| `path="*"` catch-all | `!crd` | `TopLevelLayout` + MUI `Error404` (existing) |

## i18n key model — `crd-error` namespace, `notFound` block (all six locales)

```
notFound.title              # page heading + tab title
notFound.description        # body copy
notFound.actions.goHome     # primary button label
notFound.actions.goBack     # secondary button label
```

Parity invariant: the full key set above MUST exist identically in
`error.{en,nl,es,bg,de,fr}.json`, enforced by `error.parity.test.ts`.

## Side-effect model

| Effect | Location | When | Parity |
|--------|----------|------|--------|
| `log404NotFound()` | `CrdNotFoundBranch` (effect on mount) | once per CRD 404 render | matches MUI `Error404`'s effect |
| `usePageTitle(t('notFound.title'))` | `CrdNotFoundBranch` | on render | matches MUI `Error404` tab-title behaviour |

No state is persisted. The only read of persistent state is `localStorage('alkemio-design-version')` via `useCrdEnabled()` (read-only).
