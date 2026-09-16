# Post-Deployment Monitoring Plan — React Compiler Adoption

**Purpose**: satisfy [FR-009](./spec.md#functional-requirements) / 023's [T058](../023-react-compiler-adoption/tasks.md)
([FR-017](../023-react-compiler-adoption/spec.md#functional-requirements), [SC-007](../023-react-compiler-adoption/spec.md#measurable-outcomes)) — confirm the memoization migration
and its enforcement caused **no real-user performance regression** once shipped. The plan is
defined here now; the observation window runs after the change reaches production.

**Window**: the **first 7 days** after the change reaches production (ACC first, then PROD).
**Comparison anchor**: the July-2026 production baseline in
[`optimization-baseline-2026-07.md`](./optimization-baseline-2026-07.md), plus the Google
Web Vitals "good" thresholds as absolute floors.
**Governance**: this plan is the post-release half of Constitution Principle V — Experience Quality &
Safeguards ([`.specify/memory/constitution.md`](../../.specify/memory/constitution.md)); the gate is recorded in
[`plan.md` › Constitution Check](./plan.md#constitution-check). The agent-facing policy that derives from it:
[`agents.md`](../../agents.md) → [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md).

## Instrumentation (already wired — no code needed)

Both RUM sources are live in this app:

- **Elastic APM RUM** — `src/core/analytics/apm/context/ApmProvider.tsx`,
  `useApmInit.ts`, initialized in `src/root.tsx`. Provides real-user Core Web Vitals and
  page-load / route transactions.
- **Sentry** — `src/core/logging/sentry/bootstrap.ts`, `scope.ts`,
  `SentryErrorBoundaryProvider.tsx`, initialized in `src/root.tsx`. Provides performance
  transaction traces and error rates.

## What to review

Watch the **critical routes** (per [023 US5](../023-react-compiler-adoption/spec.md#user-story-5---performance-validation-throughout-migration-priority-p1)): login, dashboard / home, space views, whiteboard.

| Metric | Source | "Good" floor | Regression trigger |
|---|---|---|---|
| **LCP** (p75) | APM RUM Core Web Vitals | < 2.5 s | any measurable rise vs anchor |
| **FCP** (p75) | APM RUM | < 1.8 s | any measurable rise vs anchor |
| **INP** (p75) | APM RUM / field | < 200 ms | any measurable rise vs anchor |
| **CLS** (p75) | APM RUM | < 0.1 | any measurable rise vs anchor |
| **Route transaction duration** (p75 / p95) | Sentry Performance | — | new slow transactions or p95 rise on critical routes |
| **JS error rate** | Sentry Issues | baseline | new render/hook errors after deploy |
| **Client memory / crash rate** | Sentry (browser OOM/crash) | baseline | sustained rise |

The regression bar is **strict** ([023 clarification](../023-react-compiler-adoption/spec.md#clarifications)): *any measurable degradation in a
client-facing metric* on a critical page triggers investigation before it is accepted.

## Build-time gates (verify once per release, not RUM)

| Metric | Command | Expectation |
|---|---|---|
| Bundle size (JS raw) | `pnpm build` + measure `build/**/*.js` | ≤ anchor (15.26 MiB) barring intentional feature growth |
| React Compiler coverage | `pnpm compiler:healthcheck` | ~100% (1285/1285 at anchor); a drop = new non-compilable code |

## Procedure

1. **Deploy to ACC**, let real traffic accrue ~24–48 h, compare APM/Sentry against the anchor.
2. **Deploy to PROD**, start the 7-day window.
3. **Days 1, 3, 7**: review the table above in APM RUM + Sentry for the critical routes.
4. On a confirmed regression: reproduce with **React DevTools Profiler** + Chrome Performance
   Tracks, identify the component the compiler failed to optimize (cross-check
   `pnpm compiler:healthcheck`), and revert the specific change per 023's revert protocol
   ([US5 acceptance scenario 3](../023-react-compiler-adoption/spec.md#user-story-5---performance-validation-throughout-migration-priority-p1) and [FR-012](../023-react-compiler-adoption/spec.md#functional-requirements)).
5. **Record findings** below and tick the release checklist item.

## Findings log

_(to be completed during the post-deploy window)_

| Date | Env | Metric snapshot vs anchor | Regression? | Action |
|---|---|---|---|---|
| | | | | |

**Sign-off**: Quality Lead confirms no real-user regression after the 7-day window → this
gate (SC-007 / FR-017) is satisfied.
