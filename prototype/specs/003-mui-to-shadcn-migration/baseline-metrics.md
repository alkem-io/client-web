# Pre-Migration Performance Baseline

**Date**: 2026-03-23
**Commit**: Pre-migration snapshot
**Build Command**: `pnpm build` (production)

## Bundle Size

| Metric | Value |
|--------|-------|
| Total build output | 18 MB |
| Total JS bundle | 14.98 MB |
| Total CSS | 0.18 MB |
| Build time | 51.60s |

## MUI-Specific Chunks

| Chunk | Size |
|-------|------|
| vendor-mui-core | 423 KB |
| vendor-mui-extended | 451 KB |
| vendor-mui-icons | 64 KB |
| **MUI Total** | **938 KB** |

## Top 10 Largest JS Chunks

| Chunk | Size (KB) |
|-------|-----------|
| subset-shared.chunk | 1,780 |
| flowchart-elk-definition | 1,420 |
| index (main) | 1,244 |
| percentages | 1,160 |
| mindmap-definition | 532 |
| vendor-mui-extended | 452 |
| vendor-tiptap | 440 |
| vendor-mui-core | 424 |
| EmojiSelector | 320 |
| vendor-utils | 264 |

## Dashboard LCP

*Note: LCP measurement requires a running server with API backend — deferred to post-migration comparison.*

## Success Criteria Reference

- **SC-004**: Post-migration bundle size ≤ 14.98 MB (JS)
- **SC-006**: Post-migration Dashboard LCP within 10% of pre-migration baseline

---

## Post-Migration Metrics

**Date**: 2026-03-25
**Branch**: `003-mui-to-shadcn-migration`
**Build Command**: `npx vite build` (production)

### Bundle Size

| Metric | Pre-Migration | Post-Migration | Delta |
|--------|--------------|----------------|-------|
| Total build output | 18 MB | 17 MB | -1 MB |
| Total JS bundle | 14.98 MB | 14.78 MB | -0.20 MB (-1.3%) |
| Total CSS | 0.18 MB | 0.31 MB | +0.13 MB (Tailwind replaces Emotion runtime) |
| Build time | 51.60s | 41.20s | -10.40s (-20.2%) |

### Removed Chunks

| Chunk | Pre-Migration Size | Post-Migration |
|-------|-------------------|----------------|
| vendor-mui-core | 423 KB | **Removed** |
| vendor-mui-extended | 451 KB | **Removed** |
| vendor-mui-icons | 64 KB | **Removed** |
| **MUI Total** | **938 KB** | **0 KB** |

### Removed Packages

- `@mui/material`, `@mui/system`, `@mui/x-data-grid`, `@mui/x-date-pickers`
- `@emotion/react`, `@emotion/styled`
- `formik`, `yup`

### Top 10 Largest JS Chunks (Post-Migration)

| Chunk | Size (KB) |
|-------|-----------|
| subset-shared.chunk | 1,821 |
| index (main) | 1,471 |
| flowchart-elk-definition | 1,452 |
| percentages | 1,123 |
| mindmap-definition | 542 |
| vendor-tiptap | 455 |
| EmojiSelector | 269 |
| katex | 265 |
| index (app) | 262 |
| translation.bg | 239 |

### SC-004 Status: ✅ PASSED

Post-migration JS bundle (14.78 MB) ≤ pre-migration baseline (14.98 MB).

### Dashboard LCP

*Deferred — requires running server with API backend.*
