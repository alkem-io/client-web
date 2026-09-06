# Platform Optimization Baseline — July 2026 (post-CRD + post-linter)

**Captured**: 2026-07-21 · **re-measured 2026-07-29** after the T026 migration (all figures below are the re-run)
**Machine**: local (macOS, arm64), Node 24.14.0 (Volta), pnpm 10.17.1, production `pnpm build` served on `localhost:3000`
**Supersedes**: the March-2026 pre-migration baseline as the reference anchor for future comparisons (see §4 methodology).
**Units**: byte sizes are binary (1 MiB = 1,048,576 B, 1 KiB = 1,024 B) — `scripts/performance-benchmark.mjs`
(`formatBytes`) divides by 1024, and the 023 documents cited in §1 report the same binary values under the
label `MB`. Offset 2 quotes Vite's build reporter, which prints decimal `kB`; those figures are left as printed.

This document establishes a **new offset in the platform's optimization timeline** — the
state after two structural changes landed: the CRD migration with the full MUI/Emotion
removal (epic #1888), and the React-Compiler no-manual-memoization enforcement
(`041-react-compiler-lint-rules`). Earlier baselines were captured against different code
*and* different methodology; this one is the first **production** capture taken after both
of those, and is the number future work should measure against.

## 1. The optimization timeline (offsets)

| # | Date | Offset | Total JS (raw) | Chunks | Notes | Source |
|---|------|--------|----------------|--------|-------|--------|
| 0 | Mar 2026 | Pre-React-Compiler baseline | 14.19 MiB | 324 | dev-server capture | `023-react-compiler-adoption/react-compiler-migration-baseline.md` |
| 1 | Mar 2026 | Post-React-Compiler | 14.20–14.26 MiB | 324 | scores flat, TBT −0.6% | `023-react-compiler-adoption/performance-comparison.md` |
| 2 | ~Jun 2026 | Post-MUI/Emotion removal (#1888) | −0.90 MB raw / −0.27 MB gzip removed | — | `vendor-mui-*` chunks deleted (901.84 kB raw / 268.21 kB gzip) | `111-remove-mui-library/mui-footprint-baseline.md` |
| **3** | **Jul 2026** | **Post-CRD + post-linter (THIS anchor)** | **15.26 MiB** | **516** | production capture; + new compiler-coverage & INP metrics | this doc |

**Reading the trend honestly:** offset 3 is +7.5% JS vs offset 0 *despite* the MUI
removal (offset 2) that cut ~0.9 MB. The net growth is ~4 months of product features
(new CRD pages, domains, callouts, notifications, whiteboard/collab work) outweighing the
MUI savings — **not** a regression introduced by React Compiler or the linter change. The
041 work (enforcement + the T026 removal of 17 manual memoizations) is **bundle-neutral**:
the compiler substitutes the memoization it removes, so JS moved only +1.4 KiB (+0.009%). This
anchor exists precisely so the *next* comparison isolates future changes instead of
re-measuring four months of drift.

## 2. July-2026 production snapshot

### Bundle (raw, measured from `build/`)

| Metric | Value |
|---|---|
| Total JS | **15.26 MiB** (15,998,752 B) across **516** chunks |
| Total CSS | 0.37 MiB (387,244 B), 5 files |
| Largest JS chunk | 1.82 MiB (`subset-shared` — shared font subset) |

### Core Web Vitals — Lighthouse (production build, desktop, headless Chrome)
Routes render as static shells (no GraphQL backend); see §4 caveats.

| Route | Performance | LCP |
|---|---|---|
| Home (`/`) | **95 / 100** | 1327 ms |
| Welcome Space | **94 / 100** | 1355 ms |
| Spaces | **94 / 100** | 1353 ms |

### Runtime / interaction (NEW this offset)

| Metric | Value | Good threshold |
|---|---|---|
| **INP** — lab sample: worst of 3 scripted interactions, Event Timing API | **32 ms** (all 3 interactions ≈ 32 ms) | < 200 ms |
| Total Blocking Time | 37 ms | < 200 ms |
| Long tasks (> 50 ms) | 1 | — |

INP is introduced here because it is the Core Web Vital most directly affected by the React
Compiler's benefit — fewer re-renders per interaction → lower input-to-next-paint latency.
The prior suite measured only TBT/LCP. **This is a lab sample, not a field metric**: one
headless page load, three Playwright-scripted interactions, latencies read from the Event
Timing API (`PerformanceObserver({ type: 'event' })`), worst one reported. Three interactions
cannot stand in for the p75 / p98 that field data aggregates across real users, devices and
sessions; the field number is what [`post-deployment-monitoring.md`](./post-deployment-monitoring.md)
watches in APM RUM. Use this figure only as a lab-to-lab comparison against future runs of the
same script.

### Memory (3-cycle leak detection)

| Metric | Value |
|---|---|
| Peak heap per route | ~26.4–26.7 MiB |
| Growth over 3 cycles | −0.04% (stable) |
| Leak risk | **LOW** — no leak |

### React Compiler coverage (NEW this offset)

| Metric | Value |
|---|---|
| Components successfully compiled | **1286 / 1286 (100%)** (`src/`, excl. generated) |
| Incompatible library usage | none |
| Manual-memoization exceptions remaining | **11** across 8 files (all `eslint-disable`-annotated with a reason) |

`pnpm compiler:healthcheck` produces the coverage number; it is the KPI that says the
no-manual-memoization policy is actually yielding compiler-generated memoization. The
exception count was driven from 28 → **11** by removing the 17 non-essential CRD-hook
memoizations (the compiler handles them; coverage stayed 100%). The remaining 11 are
irreducible third-party/lifecycle cases (Yjs/TipTap, Apollo links/client, Excalidraw
debounce + effect-dep stability, a ref callback) that the compiler cannot substitute for.

## 3. How to reproduce

```bash
pnpm build                                   # production build → build/
npx serve -s build -l 3000                   # serve on :3000 (benchmark's baseUrl)
node scripts/performance-benchmark.mjs july-2026-post-crd   # Lighthouse + INP + memory + bundle
pnpm compiler:healthcheck                    # React Compiler coverage %
# bundle size: sum build/**/*.js sizes
```

## 4. Methodology — why this supersedes the March baseline

The March `pre-migration-baseline` JSON was captured against the **Vite dev server**
(unminified, `@react-refresh`/HMR, ~26/100 Lighthouse, ~33.9 MiB dev module graph). That is
not comparable to a production build, so a dev-vs-prod delta would be misleading and no such
delta is presented. **From this offset forward, compare production against production**, using
the numbers in §2 as the reference. When routes can be exercised against a running backend,
re-capture with real data and note it as offset 4.
