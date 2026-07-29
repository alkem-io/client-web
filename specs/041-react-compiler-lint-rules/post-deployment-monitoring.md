# Post-Deployment Monitoring Plan — React Compiler Adoption

**Purpose**: satisfy FR-009 / T058 (023 FR-017, SC-007) — confirm the memoization migration
and its enforcement caused **no real-user performance regression** once shipped. The plan is
defined here now; the observation window runs after the change reaches production.

**Window**: the **first 7 days** after the change reaches production (ACC first, then PROD).
**Comparison anchor**: the July-2026 production baseline in
[`optimization-baseline-2026-07.md`](./optimization-baseline-2026-07.md), plus the Google
Web Vitals "good" thresholds as absolute floors.

## Instrumentation (already wired — no code needed)

Both RUM sources are live in this app:

- **Elastic APM RUM** — `src/core/analytics/apm/context/ApmProvider.tsx`,
  `useApmInit.ts`, initialized in `src/root.tsx`. Provides real-user Core Web Vitals and
  page-load / route transactions.
- **Sentry** — `src/core/logging/sentry/bootstrap.ts`, `scope.ts`,
  `SentryErrorBoundaryProvider.tsx`, initialized in `src/root.tsx`. Provides performance
  transaction traces and error rates.

## What to review

Watch the **critical routes** (per 023): login, dashboard / home, space views, whiteboard.

| Metric | Source | "Good" floor | Regression trigger |
|---|---|---|---|
| **LCP** (p75) | APM RUM Core Web Vitals | < 2.5 s | any measurable rise vs anchor |
| **FCP** (p75) | APM RUM | < 1.8 s | any measurable rise vs anchor |
| **INP** (p75) | APM RUM / field | < 200 ms | any measurable rise vs anchor |
| **CLS** (p75) | APM RUM | < 0.1 | any measurable rise vs anchor |
| **Route transaction duration** (p75 / p95) | Sentry Performance | — | new slow transactions or p95 rise on critical routes |
| **JS error rate** | Sentry Issues | baseline | new render/hook errors after deploy |
| **Client memory / crash rate** | Sentry (browser OOM/crash) | baseline | sustained rise |

The regression bar is **strict** (023 clarification): *any measurable degradation in a
client-facing metric* on a critical page triggers investigation before it is accepted.

## Build-time gates (verify once per release, not RUM)

| Metric | Command | Expectation |
|---|---|---|
| Bundle size (JS raw) | `pnpm build` + measure `build/**/*.js` | ≤ anchor (15.26 MB) barring intentional feature growth |
| React Compiler coverage | `pnpm compiler:healthcheck` | ~100% (1285/1285 at anchor); a drop = new non-compilable code |

## Procedure

1. **Deploy to ACC**, let real traffic accrue ~24–48 h, compare APM/Sentry against the anchor.
2. **Deploy to PROD**, start the 7-day window.
3. **Days 1, 3, 7**: review the table above in APM RUM + Sentry for the critical routes.
4. On a confirmed regression: reproduce with **React DevTools Profiler** + Chrome Performance
   Tracks, identify the component the compiler failed to optimize (cross-check
   `pnpm compiler:healthcheck`), and revert the specific change per 023's revert protocol.
5. **Record findings** below and tick the release checklist item.

## Findings log

_(to be completed during the post-deploy window)_

| Date | Env | Metric snapshot vs anchor | Regression? | Action |
|---|---|---|---|---|
| | | | | |

**Sign-off**: Quality Lead confirms no real-user regression after the 7-day window → this
gate (SC-007 / FR-017) is satisfied.
