# Quickstart: Optimize Bundle Size & Loading Performance

**Feature**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Prerequisites

- Node >= 22.0.0, pnpm >= 10.17.1
- All dependencies installed (`pnpm install`)
- Backend not required for bundle optimization work (build-only)

## Baseline Measurement

Before any changes, capture the current state:

```bash
# Production build + bundle analysis
pnpm analyze

# Open build/stats.html in browser — screenshot the treemap
# Note: entry chunk size, total JS, lodash presence, Tiptap in initial bundle

# Alternative: just build and check sizes
pnpm build 2>&1 | grep -E "(chunk|warning|kB|MB)"
```

Record these baseline numbers:

- Entry chunk size (uncompressed + gzipped)
- Total JS file count and size
- Lodash contribution (from stats.html)
- Whether Tiptap appears in initial load chunks

## Development Workflow

```bash
# After making changes, rebuild and analyze
pnpm build
pnpm analyze

# Run tests
pnpm vitest run

# Run linter
pnpm lint

# Dev server to test lazy loading behavior
pnpm start
```

## Verification Steps

### US1: Tiptap Lazy Loading

1. `pnpm start` — open `http://localhost:3001/home`
2. Open DevTools → Network tab → filter JS
3. Verify: no `tiptap` or `prosemirror` chunks in initial waterfall
4. Navigate to a page with a markdown editor (e.g., create a post)
5. Verify: Tiptap chunks load dynamically when editor renders
6. Verify: loading placeholder shown briefly before editor appears

### US2: Vendor Chunk Splitting

1. `pnpm build` — inspect `build/assets/`
2. Verify: separate vendor chunks exist (vendor-mui*, vendor-apollo*, etc.)
3. Make a trivial app code change (e.g., add a comment)
4. `pnpm build` again
5. Verify: vendor chunk hashes unchanged, only app chunks have new hashes

### US3: Lodash Tree-Shaking

1. `pnpm analyze` — open `build/stats.html`
2. Search for "lodash" in the treemap
3. Verify: only individual `lodash-es` function modules appear, no monolithic bundle
4. Compare total lodash size to baseline

### US4: Route Prefetching

1. `pnpm start` — open `http://localhost:3001/home`
2. Open DevTools → Network tab
3. Wait for page to fully load (all spinners gone)
4. Verify: prefetch requests appear for common route chunks during idle
5. Navigate to a prefetched route — verify no additional chunk download

## Testing Checklist

- [ ] `pnpm vitest run` — all tests pass (516+)
- [ ] `pnpm lint` — no new warnings or errors
- [ ] `pnpm build` — builds successfully, no new warnings
- [ ] Home page loads without Tiptap in initial bundle
- [ ] Editor pages still work (MarkdownInput, CollaborativeMarkdownInput)
- [ ] Vendor chunks are separate and stable across rebuilds
- [ ] Lodash appears as individual ESM modules in bundle analysis
- [ ] All existing functionality works: navigation, forms, editors, whiteboards
- [ ] No console errors related to lazy loading or chunk loading failures

## Key Files

| File                                                      | Purpose                                        |
| --------------------------------------------------------- | ---------------------------------------------- |
| `vite.config.mjs`                                         | manualChunks configuration                     |
| `vite.sentry.config.mjs`                                  | Must mirror manualChunks from main config      |
| `src/core/ui/forms/MarkdownInput/`                        | Primary Tiptap entry point                     |
| `src/core/ui/forms/CollaborativeMarkdownInput/`           | Collaborative editor entry point               |
| `src/core/ui/forms/MarkdownInput/FormikMarkdownField.tsx` | Main consumer wrapper used by 37+ domain forms |
| `package.json`                                            | lodash → lodash-es dependency swap             |
