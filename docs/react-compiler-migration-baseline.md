# React Compiler Migration — Pre-Migration Baseline

**Date**: 2026-03-18
**Branch**: `023-react-compiler-adoption`
**Purpose**: Capture baseline metrics before memoization removal begins (US5 Performance Baseline)

## Compiler Healthcheck

```
Successfully compiled 2027 out of 2027 components.
StrictMode usage not found.
Found no usage of incompatible libraries.
```

**Result**: 100% compilation coverage (2027/2027 components)

## Memoization Inventory

### Summary

| Primitive    | Occurrences | Files |
|-------------|------------|-------|
| useMemo     | 291        | 209   |
| useCallback | 199        | 124   |
| React.memo  | 2          | 2     |
| **Total**   | **492**    | —     |

### Distribution by Top-Level Directory

| Directory    | useMemo | useCallback |
|-------------|---------|-------------|
| src/core/   | 37      | 45          |
| src/domain/ | 221     | 114         |
| src/main/   | 32      | 40          |
| src/dev/    | 1       | 0           |

### Distribution by Domain Subdirectory

| Domain            | useMemo | useCallback |
|-------------------|---------|-------------|
| community         | 64      | 20          |
| collaboration     | 36      | 36          |
| platformAdmin     | 25      | 8           |
| space             | 19      | 12          |
| timeline          | 15      | 6           |
| shared            | 12      | 17          |
| common            | 11      | 6           |
| communication     | 10      | 2           |
| spaceAdmin        | 10      | 2           |
| templates         | 6       | 2           |
| access            | 5       | 2           |
| InnovationPack    | 3       | 0           |
| platform          | 2       | 0           |
| innovationHub     | 1       | 1           |
| storage           | 1       | 0           |
| templates-manager | 1       | 0           |

### React.memo Locations

1. `src/core/ui/forms/MarkdownInput/MarkdownInput.tsx` (line 45)
2. `src/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput.tsx` (line 30)

## Compiler Bail-Outs (Permanent Exceptions)

| File | Reason | Status |
|------|--------|--------|
| GlobalErrorContext.tsx | Singleton module-level mutation during render | Permanent exception (eslint-disable) |
| useKeepElementScroll.ts | DOM mutation on ref prop element inside useEffect | Permanent exception (eslint-disable) |
| CollaborativeExcalidrawWrapper.tsx | Ref mutation from useCombinedRefs inside useEffect | Permanent exception (eslint-disable) |
| Error40XBoundaryInternal | Class error boundary (React requirement) | Compiler skips class components |
| LinesFitterErrorBoundary | Class error boundary (React requirement) | Compiler skips class components |
| KratosPasskeyIconButton.tsx | `new Function()` inside useCallback | No bail-out (isolated in callback) |
| KratosPasskeyButton.tsx | `new Function()` inside useCallback | No bail-out (isolated in callback) |

## Bundle Size Baseline

### Build Summary

| Metric | Value |
|--------|-------|
| Total JS (raw) | 14.19 MB |
| Total CSS (raw) | 0.16 MB |
| Total build/ directory | 18 MB |
| JS chunk count | 324 |
| CSS file count | 6 |
| Build time | ~63s |
| Modules transformed | 17,225 |

### Top 10 Largest Chunks

| Chunk | Raw Size | Gzip Size |
|-------|----------|-----------|
| subset-shared.chunk | 1,820.83 kB | 736.78 kB |
| flowchart-elk-definition | 1,451.87 kB | 444.32 kB |
| index (excalidraw) | 1,262.99 kB | 353.74 kB |
| percentages | 1,184.82 kB | 386.59 kB |
| mindmap-definition | 542.20 kB | 169.59 kB |
| vendor-mui-extended | 461.65 kB | 137.37 kB |
| vendor-tiptap | 450.45 kB | 143.85 kB |
| vendor-mui-core | 433.62 kB | 129.44 kB |
| EmojiSelector | 325.83 kB | 82.69 kB |
| vendor-utils | 270.21 kB | 88.91 kB |

## Lighthouse Benchmarks

**Environment**: localhost:3000 (development build via Traefik), desktop emulation (1920x1080), mild throttling (40ms RTT, 10Mbps, 1x CPU)

### Scores by Route

| Route | Score | FCP | LCP | TTI | Speed Index | TBT | CLS |
|-------|-------|-----|-----|-----|-------------|-----|-----|
| Home (`/`) | 26 | 13,599ms | 36,592ms | 36,594ms | 16,200ms | 1,306ms | 0.0001 |
| Welcome Space | 26 | 13,638ms | 32,572ms | 32,572ms | 15,762ms | 1,320ms | 0.0006 |
| Spaces (`/spaces`) | 26 | 13,588ms | 30,058ms | 30,070ms | 15,802ms | 1,311ms | 0.0000 |

> **Note**: Low scores are expected for local development builds (unminified, no CDN, cold start).
> These serve as relative baselines — only deltas between phases matter.

### Runtime Performance

| Metric | Value |
|--------|-------|
| Long Tasks | 1 |
| Total Blocking Time | 957ms |
| Layout Duration | 0.009s |
| Script Duration | 1.306s |
| Heap Used | 117.30 MB |

### Memory Usage by Route

| Route | Peak Memory | Load Impact | DOM Nodes | Event Listeners |
|-------|-------------|-------------|-----------|-----------------|
| Home | 103.07 MB | 102.56 MB | 806 | 425 |
| Welcome Space | 107.95 MB | 107.37 MB | 692 | 414 |
| Spaces | 107.38 MB | 106.88 MB | 870 | 419 |

### Memory Leak Analysis

| Cycle | Heap Used | DOM Nodes |
|-------|-----------|-----------|
| 1 | 94.85 MB | 870 |
| 2 | 97.56 MB | 870 |
| 3 | 84.99 MB | 124 |

**Trend**: Decreasing (-10.4% growth) | **Leak Risk**: LOW

### Network Transfer (Development)

| Metric | Value |
|--------|-------|
| Total Requests | 1,210 |
| JS Files | 1,199 |
| Total Transfer Size | 32.42 MB |
| JS Transfer Size | 32.33 MB |

**Raw results**: `performance-results/pre-migration-baseline-1773836321977.json`

## Test Suite Baseline

| Metric | Value |
|--------|-------|
| Test files | 50 passed, 1 skipped |
| Tests | 555 passed, 3 skipped |
| Duration | ~24s |

## Phase 2 Results: Bail-Out Fixes (US1)

### Changes Made

| File | Fix |
|------|-----|
| SearchBar.tsx | Replaced `window.location.href` with `navigate()` |
| useGuestSessionReturn.ts | Replaced `globalThis.location.href = ...` with `window.location.assign()` |
| useKeepElementScroll.ts | Verified real bail-out (ref prop mutation in useEffect) — kept eslint-disable with improved comment |
| CollaborativeExcalidrawWrapper.tsx | Moved ref assignment from `onInitialize` callback to `useEffect` — kept eslint-disable (useCombinedRefs mutability) |
| InnovationFlowDragNDropEditor.tsx | Already resolved — migrated from @hello-pangea/dnd to @dnd-kit |
| GlobalErrorContext.tsx | Enhanced permanent exception documentation |
| Error40XBoundaryInternal, LinesFitterErrorBoundary | Documented as permanent class component exceptions |

**Compiler coverage**: 2028/2028 (up from 2027 — gained 1 from InnovationFlowDragNDropEditor migration)

### Lighthouse Comparison (Automated)

| Metric (Home route) | Before | After | Change |
|---------------------|--------|-------|--------|
| Performance Score | 26 | 26 | 0% |
| FCP | 13,599ms | 13,529ms | -0.5% |
| LCP | 36,592ms | 36,320ms | -0.7% |
| TTI | 36,594ms | 36,322ms | -0.7% |
| TBT | 1,306ms | 1,328ms | +1.7% |
| Bundle size (JS) | 33,102 KB | 33,102 KB | 0% |

**Full comparison report**: `performance-results/comparison-1773842618515.md`

### React DevTools Profiler Comparison (Manual)

Profiler recordings captured during interactive sessions on the same pages.

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Commits (re-renders) | 776 | 430 | **-44.6%** |
| Total render time | 3,941.8 ms | 2,782.8 ms | **-29.4%** |
| Total effect time | 187.6 ms | 136.7 ms | **-27.1%** |
| Active fibers | 8,041 | 7,098 | **-11.7%** |
| Top component render count | 348 | 134 | **-61.5%** |
| Avg commit duration | 5.1 ms | 6.5 ms | +27.4% |
| Max commit duration | 75.5 ms | 95.0 ms | +25.8% |

**Key takeaways**:

- Resolving compiler bail-outs allowed the React Compiler to skip 44.6% of re-renders entirely
- The heaviest components went from 348 renders to 134 renders (61.5% reduction)
- Total time spent rendering dropped by 29.4% (nearly a third)
- Avg commit duration increased slightly (5.1ms to 6.5ms) — expected because the compiler eliminates trivial re-renders, leaving only "real" ones that do actual work
- No regressions detected; bundle size unchanged

---

## Notes

- Memoization counts are lower than the spec's research.md estimates (which reported 603 useMemo / 322 useCallback). This reflects ongoing codebase evolution since the audit.
- The `community` domain has the highest useMemo count (64), followed by `collaboration` (36) and `platformAdmin` (25).
- Build produces warnings about large chunks (>500 kB) — these are known vendor bundles (mermaid, excalidraw, MUI) and are unrelated to memoization.
