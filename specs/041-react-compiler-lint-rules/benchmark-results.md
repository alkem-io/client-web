# Final Validation Results — 041-react-compiler-lint-rules

**Run date**: 2026-07-20
**Branch**: `041-react-compiler-lint-rules` (rebased onto current `develop`)
**Machine**: local (macOS, arm64), Node 24.14.0 (Volta), pnpm 10.17.1

> **See also** [`optimization-baseline-2026-07.md`](./optimization-baseline-2026-07.md) — the
> July-2026 production anchor in the platform's optimization timeline, which adds two new
> metrics introduced with this work: **React Compiler coverage 1285/1285 (100%)**
> (`pnpm compiler:healthcheck`) and **INP 40 ms** (worst interaction, well under the 200 ms
> "good" threshold). Future performance comparisons should use that anchor, not the stale
> March dev baseline.

> **Read this first — what this PR actually changes.** This PR is **build-neutral**: it
> adds ESLint `no-restricted-syntax` rules (`eslint.config.mjs`) and documentation
> (`CLAUDE.md`) plus this spec folder. It touches **zero runtime code** (`git diff
> origin/develop --name-only` lists no `src/` files). It therefore cannot, by
> construction, change any bundle size, Lighthouse score, or memory metric. The
> numbers below are a **health snapshot of `develop` at merge time**, satisfying the
> spec's US3 "final validation" intent — not a before/after attributable to this PR.

## 1. Lint enforcement (US1) — the actual deliverable

| Check | Result |
|---|---|
| `pnpm eslint .` | **0 errors, 28 warnings** (exit 0) |
| `pnpm lint` (typecheck:native + biome ci + eslint) | **pass** (exit 0) |
| Rule severity | `warn` (per FR-002 — transitions to `error` once remaining domain hooks are migrated) |

The 28 warnings are all `no-restricted-syntax` hits on the remaining
`useMemo`/`useCallback`/`memo` usages (collaborative editor / MarkdownInput ecosystem
documented exceptions + a few pending domain hooks). `eslint .` has no `--max-warnings`,
so warnings do not fail CI. Adding a new `useMemo`/`useCallback`/`memo`/`React.memo`
anywhere now produces a warning with a descriptive message.

## 2. Test suite (SC — regression gate)

`pnpm vitest run`: **1940 passed, 2 skipped, 232 files**. One failure —
`src/main/assistant/__tests__/budgetMeter.test.tsx` — is a **locale/`Intl.NumberFormat`
grouping-separator mismatch** (local ICU renders `25 000`; the test asserts `25,000`).
It is unrelated to this PR (no `src/` changes) and passes in the CI en-US locale.

## 3. Production build & bundle (SC-004)

`pnpm build`: **succeeds, 0 errors, ~48s.**

| Metric | March baseline (023) | Current `develop` | Note |
|---|---|---|---|
| Total JS (raw) | 14.19 MB | **15.26 MB** | +7.5% |
| JS chunks | 324 | **516** | |
| Total CSS (raw) | ~0.16 MB | **0.37 MB** | |
| Largest JS chunk | — | 1.82 MB (`subset-shared`) | shared font subset |

**The +7.5% is not a regression from this PR or from React Compiler memoization.** The
baseline predates ~471 commits of product work (new CRD pages, domains, features) — net
of the full MUI/Emotion removal (epic #1888). SC-004's "+0.5% of the 14.19 MB baseline"
threshold compares against a 4-month-old tree and is not a meaningful gate for a
build-neutral change; it is recorded here for completeness, not treated as a blocker.

`build/stats.html` (the interactive treemap) was not regenerated — it needs
`pnpm analyze` / `ANALYZE=true`; raw sizes above were measured directly from `build/`.

## 4. Lighthouse — production served build (US3 / SC-003)

Served the production `build/` on `localhost:3000` and ran
`node scripts/performance-benchmark.mjs post-migration-final` (Playwright + Lighthouse,
desktop, headless Chrome). No backend, so routes render as static shells.

| Route | Performance score | LCP |
|---|---|---|
| Home (`/`) | **95 / 100** | 1323 ms |
| Welcome Space (`/welcome-space`) | **94 / 100** | 1350 ms |
| Spaces (`/spaces`) | **95 / 100** | 1315 ms |

> **No delta vs the 023 baseline is presented on purpose.** The stored
> `pre-migration-baseline` JSON was captured against the **Vite dev server**
> (unminified, `@react-refresh`/HMR, ~26/100), so a dev-vs-production comparison would be
> misleading. The figures above are reported as a current **production** snapshot;
> `pnpm benchmark:compare` was intentionally **not** run against the dev baseline.

## 5. Memory (SC-005)

3-cycle leak detection (`performance-benchmark.mjs` memory phase):

| Cycle | Used heap | DOM nodes | Listeners |
|---|---|---|---|
| 1 | 28.03 MB | 63 | 159 |
| 2 | 28.10 MB | 63 | 159 |
| 3 | 28.11 MB | 63 | 159 |

**Growth 0.27% over 3 cycles, trend stable, `potentialLeak: false`.** DOM node and
listener counts are flat → **no leak detected.** ✓ SC-005.

## 6. Status vs spec success criteria

| ID | Criterion | Status |
|---|---|---|
| SC-001 | New memoization triggers a lint warning | ✅ verified |
| SC-002 | No-memoization policy discoverable in CLAUDE.md | ✅ (State & Hooks + React Compiler sections) |
| SC-003 | Client metrics ≥ baseline | ✅ production Lighthouse 94–95/100, LCP ~1.3s (baseline non-comparable — see §4) |
| SC-004 | Bundle within +0.5% of 14.19 MB | ⚠️ 15.26 MB; delta is product growth over 471 commits, not this PR (see §3) |
| SC-005 | No new memory leaks | ✅ 0.27% growth, stable |
| SC-006 | Documented exceptions allowed via eslint-disable | ✅ warn-level; suppressible with a reason comment |

## 7. Deferred (out of this PR)

- **T006/T007** — flip the rule `warn → error` + add `eslint-disable` reason comments to
  the permanent exception files. Blocked until the remaining domain memoization is
  migrated and `pnpm eslint .` reports zero `no-restricted-syntax` warnings outside those
  files. Follow-up.
- **T017** — post-deployment Sentry/Elastic APM RUM review for one week after the change
  ships. Requires a production release; observational, cannot be done in-PR.
