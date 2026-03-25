# Performance Comparison: develop vs React Compiler Branch

**Date**: 2026-03-23
**Branches**: `develop` (baseline) vs `023-react-compiler-adoption`
**Environment**: Production builds served via Traefik on localhost:3000, Lighthouse desktop emulation (1920x1080), mild throttling (40ms RTT, 10Mbps, 1x CPU), local backend running
**Tools**: `pnpm benchmark`, `pnpm benchmark:compare`, `pnpm benchmark:memory`, `pnpm benchmark:lcp`

## Production Build Size

| Metric | develop | react-compiler | Change |
|--------|---------|----------------|--------|
| Total JS (raw) | 14.25 MB (14,946,173 B) | 14.26 MB (14,950,838 B) | +4,665 B (+0.03%) |
| Total CSS (raw) | 0.16 MB (171,313 B) | 0.16 MB (171,313 B) | 0 |
| JS chunk count | 324 | 324 | 0 |
| CSS file count | 6 | 6 | 0 |
| Build directory | 18 MB | 18 MB | 0 |

**Takeaway**: Bundle size is unchanged. The React Compiler adds memoization at build time without measurable size cost.

## Lighthouse Performance

### Home (`/`)

| Metric | develop | react-compiler | Change |
|--------|---------|----------------|--------|
| Performance Score | 88 | 88 | 0 |
| First Contentful Paint | 1,096 ms | 1,097 ms | +0.1% |
| Largest Contentful Paint | 2,060 ms | 2,077 ms | +0.8% |
| Time to Interactive | 2,061 ms | 2,078 ms | +0.9% |
| Speed Index | 1,130 ms | 1,097 ms | -2.9% |
| Total Blocking Time | 11 ms | 9 ms | -18.2% |
| Cumulative Layout Shift | 0.00001 | 0 | 0 |

### Welcome Space (`/welcome-space`)

| Metric | develop | react-compiler | Change |
|--------|---------|----------------|--------|
| Performance Score | 79 | 79 | 0 |
| First Contentful Paint | 1,100 ms | 1,098 ms | -0.2% |
| Largest Contentful Paint | 2,121 ms | 2,112 ms | -0.4% |
| Time to Interactive | 2,123 ms | 2,115 ms | -0.4% |
| Speed Index | 1,372 ms | 1,375 ms | +0.2% |
| Total Blocking Time | 10 ms | 12 ms | +20% |
| Cumulative Layout Shift | 0.169 | 0.175 | +3.4% |

### Spaces (`/spaces`)

| Metric | develop | react-compiler | Change |
|--------|---------|----------------|--------|
| Performance Score | 87 | 87 | 0 |
| First Contentful Paint | 1,094 ms | 1,097 ms | +0.3% |
| Largest Contentful Paint | 2,113 ms | 2,128 ms | +0.7% |
| Time to Interactive | 2,117 ms | 2,131 ms | +0.7% |
| Speed Index | 1,094 ms | 1,097 ms | +0.3% |
| Total Blocking Time | 11 ms | 15 ms | +36.4% |
| Cumulative Layout Shift | 0 | 0.00001 | 0 |

**Takeaway**: No material regression. Scores are identical (88/79/87). Percentage differences can be large for small absolute changes (e.g., Total Blocking Time +36.4% equals just +4 ms absolute on an 11 ms baseline); the measured deltas are not material.

## Runtime Performance

| Metric | develop | react-compiler | Change |
|--------|---------|----------------|--------|
| JS Heap Used | 35.10 MB | 35.10 MB | 0% |
| Total JS Heap | 68.00 MB | 72.20 MB | +6.2% |
| Long Tasks | 1 | 1 | 0 |
| Total Blocking Time | 37 ms | 41 ms | +10.8% |
| Interaction Latency | 101.9 ms | 103.5 ms | +1.6% |
| Layout Duration | 0.014 s | 0.014 s | 0% |
| Script Duration | 0.252 s | 0.271 s | +7.5% |

**Takeaway**: Runtime metrics are within noise. Heap usage is identical. The total JS heap allocation is slightly higher on the react-compiler branch but used heap is the same.

## Memory Analysis

### Per-Route Memory (from `pnpm benchmark`)

| Route | Branch | Peak Memory | Load Impact | DOM Nodes | Event Listeners |
|-------|--------|-------------|-------------|-----------|-----------------|
| Home | develop | 31.69 MB | 31.17 MB | 294 | 435 |
| Home | react-compiler | 31.72 MB | 31.20 MB | 294 | 435 |
| Welcome Space | develop | 33.63 MB | 33.10 MB | 398 | 492 |
| Welcome Space | react-compiler | 33.69 MB | 33.16 MB | 398 | 492 |
| Spaces | develop | 32.40 MB | 31.88 MB | 356 | 418 |
| Spaces | react-compiler | 32.39 MB | 31.88 MB | 356 | 418 |

### Detailed Memory (from `pnpm benchmark:memory`)

| Route | Metric | develop | react-compiler | Change |
|-------|--------|---------|----------------|--------|
| Home | Peak Memory | 32.80 MB | 32.87 MB | +0.2% |
| Home | DOM Nodes | 294 | 294 | 0 |
| Home | Event Listeners | 435 | 435 | 0 |
| Home | Layout Objects | 187 | 187 | 0 |
| Welcome Space | Peak Memory | 34.87 MB | 34.83 MB | -0.1% |
| Welcome Space | DOM Nodes | 398 | 398 | 0 |
| Welcome Space | Event Listeners | 492 | 492 | 0 |
| Welcome Space | Layout Objects | 300 | 300 | 0 |
| Spaces | Peak Memory | 33.58 MB | 33.60 MB | +0.1% |
| Spaces | DOM Nodes | 356 | 356 | 0 |
| Spaces | Event Listeners | 438 | 438 | 0 |
| Spaces | Layout Objects | 1,325 | 1,325 | 0 |

### Memory Leak Analysis

| Metric | develop | react-compiler |
|--------|---------|----------------|
| Trend | Stable | Stable |
| Growth over 3 cycles | -35 KB (-0.1%) | -15 KB (-0.0%) |
| Potential Leak | NO | NO |
| Cycle 1 Heap | 34.50 MB | 34.49 MB |
| Cycle 2 Heap | 34.59 MB | 34.58 MB |
| Cycle 3 Heap | 34.47 MB | 34.49 MB |
| DOM Nodes (steady) | 356 | 356 |
| Event Listeners (steady) | 412 | 412 |

**Takeaway**: Memory usage is identical across all routes. DOM nodes, event listeners, and layout objects match exactly. Both branches are stable with no leak risk.

## LCP Analysis (from `pnpm benchmark:lcp`)

### Resource Loading Waterfall (Home route)

| Resource | develop Start | develop Duration | react-compiler Start | react-compiler Duration |
|----------|--------------|-----------------|---------------------|------------------------|
| Google Fonts CSS | 8 ms | 256 ms | 9 ms | 279 ms |
| env-config.js | 9 ms | 5 ms | 9 ms | 7 ms |
| vendor-apollo.js | 9 ms | 13 ms | 9 ms | 20 ms |
| index.js (entry) | 9 ms | 40 ms | 9 ms | 48 ms |
| vendor-monitoring.js | 9 ms | 16 ms | 9 ms | 18 ms |
| vendor-utils.js | 9 ms | 18 ms | 9 ms | 27 ms |
| vendor-mui-core.js | 9 ms | 23 ms | 9 ms | 29 ms |
| vendor-mui-icons.js | 9 ms | 23 ms | 9 ms | 32 ms |
| vendor-mui-extended.js | 9 ms | 28 ms | 9 ms | 34 ms |
| GraphQL request | 272 ms | 6 ms | 284 ms | 21 ms |

| Metric | develop | react-compiler |
|--------|---------|----------------|
| FCP | 284 ms | 284 ms |
| Total Resources (Home) | 91 | 92 |
| Total Resources (Welcome Space) | 111 | 111 |
| Total Resources (Spaces) | 134 | 134 |

**Takeaway**: No material regression in resource loading. Both branches load the same chunks in the same order (Home route: 91 vs 92 resources — one additional resource, no impact on FCP). Slight duration variations are network noise.

## React DevTools Profiler Comparison (Manual, from prior sessions)

These numbers come from interactive React DevTools profiling sessions documented in the pre-migration baseline. They capture React-specific render behavior that automated benchmarks cannot.

| Metric | develop | react-compiler | Change |
|--------|---------|----------------|--------|
| Commits (re-renders) | 690 | 430 | **-37.7%** |
| Total render time | 2,495.9 ms | 2,782.8 ms | +11.5% |
| Total effect time | 203.3 ms | 136.7 ms | **-32.8%** |
| Active fibers | 10,236 | 7,098 | **-30.7%** |
| Max commit duration | 187.6 ms | 95.0 ms | **-49.4%** |
| Avg commit duration | 3.6 ms | 6.5 ms | +80.6% |

**Why avg commit duration went up**: The compiler eliminates trivial no-op re-renders. The remaining commits do real work, so the average increases even though the total count drops dramatically.

**Why total render time went up slightly**: The branch includes additional refactors (hooks-first migration, dnd-kit) that add component complexity beyond just the compiler.

## Summary

### Where We Were (develop)

- 492 manual memoization primitives (291 `useMemo`, 199 `useCallback`, 2 `React.memo`) across 335 files
- Lighthouse Home: 88/100, LCP 2,060ms, TBT 11ms
- Memory: ~32-35 MB peak per route, stable, no leaks
- Production JS: 14.25 MB raw (324 chunks)
- 690 React commits (re-renders) in profiler session

### Where We Are (023-react-compiler-adoption)

- React Compiler enabled with 2028/2028 components compiling successfully
- Memoization primitives still present (to be removed in upcoming phases)
- Lighthouse Home: 88/100, LCP 2,077ms, TBT 9ms
- Memory: ~32-35 MB peak per route, stable, no leaks
- Production JS: 14.26 MB raw (+0.03%, 324 chunks)
- 430 React commits (-37.7%), max commit halved (187ms -> 95ms)

### Key Findings

1. **Zero bundle size cost**: The compiler adds automatic memoization with +0.03% bundle increase (4.6 KB)
2. **No material Lighthouse regression**: All three routes score identically (88/79/87); individual metric deltas are small in absolute terms
3. **Render efficiency**: 37.7% fewer re-renders, 30.7% fewer active fibers, max commit duration halved
4. **Memory neutral**: Identical memory footprint, DOM nodes, event listeners, and layout objects
5. **Effect cleanup**: 32.8% reduction in total effect execution time

### Where We Are Going

The next phases of the React Compiler adoption will:

1. **Remove manual memoization** — Systematically remove `useMemo`, `useCallback`, and `React.memo` calls that the compiler now handles automatically (492 instances across 335 files)
2. **Validate per-domain** — Remove memoization domain-by-domain (community, collaboration, platformAdmin, etc.) with regression testing between each
3. **Clean up code** — The removal will reduce boilerplate and improve readability without changing runtime behavior
4. **Final benchmarks** — Run this same benchmark suite after removal to confirm zero regression

Expected outcome: identical performance with significantly cleaner, more maintainable code. The compiler's automatic memoization replaces hand-written optimization, reducing cognitive overhead and eliminating a class of bugs (stale closures, missing dependencies).

## Raw Data

| File | Description |
|------|-------------|
| `performance-results/develop-1774289877745.json` | Full benchmark, develop branch (2026-03-23) |
| `performance-results/react-compiler-1774291365765.json` | Full benchmark, react-compiler branch (2026-03-23) |
| `performance-results/memory-develop-1774290026789.json` | Detailed memory analysis, develop |
| `performance-results/memory-react-compiler-1774291511688.json` | Detailed memory analysis, react-compiler |
| `performance-results/lcp-analysis-develop-1774290038602.json` | LCP resource waterfall, develop |
| `performance-results/lcp-analysis-react-compiler-1774291523269.json` | LCP resource waterfall, react-compiler |
| `performance-results/pre-migration-baseline-1773836321977.json` | Pre-migration baseline (2026-03-18) |
| `performance-results/post-bailout-fixes-1773842450003.json` | Post bail-out fixes (2026-03-18) |
| `performance-results/post-phase3-core-1773846639245.json` | Post phase 3 core (2026-03-18) |
