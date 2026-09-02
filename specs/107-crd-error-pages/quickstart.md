# Quickstart: Port the Error Pages to CRD (P1 — CRD 404)

**Feature**: 107-crd-error-pages | **Story**: alkem-io/client-web#9852

## Prerequisites

- Node ≥ 24, pnpm ≥ 10.17.1 (`pnpm install` if deps are missing).
- Working in the worktree: `/Users/borislavkolev/WebstormProjects/client-web-story-9852-crd-error-pages` on branch `story/9852-crd-error-pages`.

## What ships in this PR (P1)

- `src/crd/components/error/CrdNotFoundPage.tsx` — props-only CRD 404 page.
- `src/main/crdPages/error/CrdNotFoundBranch.tsx` — integration wrapper (CRD chrome + Sentry log + title + nav).
- `CrdAwareErrorComponent.tsx` — new `isNotFound` branch.
- `src/main/routing/TopLevelRoutes.tsx` — `path="*"` catch-all toggle.
- `src/crd/i18n/error/error.<lang>.json` ×6 — new `notFound.*` block.
- Tests: `CrdNotFoundPage.test.tsx`, `CrdNotFoundBranch.test.tsx`, updated `CrdAwareErrorComponent.test.tsx`, `error.parity.test.ts`.

## Deferred (follow-up stories)

- P2 — CRD generic error page (500 / unknown) + Sentry top-level boundary.
- P3 — CRD lazy chunk-load dialog.
- P4 — remove dead MUI auth/error pages.

## Local verification (exit gates)

```bash
# from the worktree root
pnpm lint           # TypeScript + Biome + ESLint
pnpm vitest run     # full unit suite (must pass)

# run just the new/changed tests during development
pnpm vitest run src/crd/components/error/CrdNotFoundPage.test.tsx --reporter=basic
pnpm vitest run src/main/crdPages/error/CrdNotFoundBranch.test.tsx --reporter=basic
pnpm vitest run src/main/crdPages/error/CrdAwareErrorComponent.test.tsx --reporter=basic
pnpm vitest run src/crd/i18n/error/error.parity.test.ts --reporter=basic
```

## Manual smoke test (per story Verification)

```js
// Seed CRD (design version 2 = CRD), then reload:
localStorage.setItem('alkemio-design-version', '2'); location.reload();
// Navigate to a bogus URL, e.g. /this-does-not-exist
//   → CRD 404 page in CRD chrome (no MUI header/footer).

// Back to MUI (design version 1):
localStorage.setItem('alkemio-design-version', '1'); location.reload();
// Same bogus URL → MUI Error404 (regression check).

// 403 regression: hit a forbidden space URL → CRD CrdForbiddenPage (unchanged).
```

## Success criteria recap

- CRD user: 0 MUI chrome on 404 (SC-001).
- Legacy user: identical MUI 404 (SC-002).
- Sentry 404 parity, no double-log (SC-003).
- Six-locale i18n parity (SC-004).
- Gates green: `pnpm lint` + `pnpm vitest run` (SC-005).
