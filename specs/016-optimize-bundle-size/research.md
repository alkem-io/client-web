# Research: Optimize Bundle Size & Loading Performance

**Date**: 2026-03-02
**Feature**: [spec.md](./spec.md)

## R-001: Tiptap Lazy Loading Strategy

**Decision**: Lazy-load MarkdownInput and CollaborativeMarkdownInput using existing `lazyWithGlobalErrorHandler` pattern.

**Rationale**: Only 7 of 16 files with Tiptap imports contain runtime code — the other 9 are type-only imports (erased at build time). The two editor entry-point components (`MarkdownInput`, `CollaborativeMarkdownInput`) are the only points where Tiptap is actually instantiated. Wrapping these with lazy imports moves ~2.5MB of Tiptap + ProseMirror out of the initial bundle.

**Alternatives considered**:

- Dynamic `import()` inside each of the 42 consumer files — too invasive, error-prone
- Moving Tiptap to a web worker — overkill, editor needs DOM access
- Using a lighter editor — out of scope per spec

**Key findings**:

- 16 files import from `@tiptap/*`
- 9 files use type-only imports (no runtime impact)
- 7 files have runtime imports: `useEditorConfig.ts`, `MarkdownInput.tsx`, `useMarkdownEditor.ts`, `useImageUpload.ts`, `CollaborativeMarkdownInput.tsx`, `useCollaboration.ts`, `Iframe.ts`
- 42 consumer files import MarkdownInput/CollaborativeMarkdownInput
- Excalidraw is already lazy-loaded using the same `lazyWithGlobalErrorHandler` pattern — proven approach

**Implementation approach**:

1. Create lazy wrapper for `FormikMarkdownField` (the primary consumer entry point used by ~37 domain forms)
2. Wrap with `<Suspense fallback={<LoadingPlaceholder />}>` at consumer sites
3. Type-only imports need no changes

---

## R-002: Vendor Chunk Splitting (manualChunks)

**Decision**: Add `manualChunks` to Vite's Rollup output config, separating MUI, Apollo, Tiptap, and utility vendors.

**Rationale**: Current build produces a 2.6MB entry chunk mixing vendor and app code. Any app change invalidates the entire chunk. Splitting vendors into stable, cacheable chunks improves returning-user load times via browser cache.

**Alternatives considered**:

- Vite's automatic splitting only — produces unbalanced chunks, mixes vendors with app code
- Single monolithic vendor chunk — poor granularity, one vendor update invalidates all
- Per-package chunks — too many small files, HTTP overhead even with HTTP/2

**Current build baseline**:

- Largest chunk: 2.6MB (entry point + shared)
- 226 JS output files
- ~15MB total uncompressed
- Key large chunks: FormikMarkdownField (488KB), WhiteboardCard (324KB), EmojiSelector (320KB)

**Proposed chunk groups**:

- `vendor-mui` — @mui/material, @mui/system, @emotion/\* (~150-200KB gzipped)
- `vendor-mui-icons` — @mui/icons-material (separate, large icon set)
- `vendor-mui-extended` — @mui/x-data-grid, @mui/x-date-pickers
- `vendor-apollo` — @apollo/client, apollo-upload-client, graphql-ws
- `vendor-tiptap` — @tiptap/\*, @tiptap/pm (only loaded with editor)
- `vendor-realtime` — yjs, y-prosemirror, socket.io-client
- `vendor-monitoring` — @sentry/react, @elastic/apm-rum\*
- `vendor-utils` — lodash-es, formik, yup, date-fns, axios

**Gotchas**:

- Mermaid diagrams are already dynamically imported — do NOT force into manualChunks
- Apollo generated hooks (1MB+) should stay with app code, not in vendor chunk
- Excalidraw is already lazy — don't include in manualChunks (breaks lazy loading)
- Must update both `vite.config.mjs` and `vite.sentry.config.mjs`

---

## R-003: Lodash Tree-Shaking

**Decision**: Migrate from `lodash` (CommonJS) to `lodash-es` (ESM) for automatic tree-shaking.

**Rationale**: CommonJS `lodash` cannot be tree-shaken by Rollup/Vite. `lodash-es` is a drop-in ESM replacement with identical API. Vite's built-in tree-shaking eliminates unused functions automatically.

**Alternatives considered**:

- `babel-plugin-lodash` — transforms imports at compile time, but adds Babel complexity and is less effective than native ESM tree-shaking
- Per-function imports (`import debounce from 'lodash/debounce'`) — works but requires 100 individual changes with no automation benefit
- Replace lodash with native JS — too many functions used (44 unique), risky

**Key findings**:

- 100 import statements across 78 files
- 98 use `import { x } from 'lodash'` (non-tree-shakeable)
- 2 use per-function pattern
- 44 unique functions used (most frequent: `times` (17), `compact` (12), `noop` (6))
- `lodash-es` is NOT currently installed
- `@types/lodash` works with both packages
- tsconfig is already ESM-compatible (`module: "ESNext"`, `esModuleInterop: true`)
- Estimated savings: 30-50KB gzipped

**Migration steps**:

1. `pnpm remove lodash && pnpm add lodash-es`
2. Replace all `from 'lodash'` → `from 'lodash-es'` (global find-replace)
3. Replace `from 'lodash/x'` → `from 'lodash-es'` (2 files)
4. No code logic changes — API identical

---

## R-004: Route Prefetching

**Decision**: Use `<link rel="prefetch">` injected during idle time for top navigation routes.

**Rationale**: After code splitting, navigation to a new route requires downloading its chunk. Prefetching during idle time makes navigation feel instant for common routes.

**Alternatives considered**:

- Intersection Observer-based prefetch (prefetch when link is visible) — more complex, limited benefit over idle-time approach
- Service Worker precaching — out of scope per spec
- `modulepreload` — better for critical path, but prefetch is more appropriate for speculative loading

**Implementation approach**:

- Use `requestIdleCallback` or `setTimeout` after initial render to inject prefetch links
- Target the top 5-6 most-visited routes (home, spaces, explorer, profile)
- Vite generates predictable chunk filenames — can use import.meta.glob or manifest to discover chunk URLs
- Existing `lazyWithGlobalErrorHandler` already handles failed loads gracefully

---

## R-005: Barrel Export Audit

**Decision**: Audit 19 known barrel export files, remove unnecessary re-exports that pull in heavy code.

**Rationale**: Barrel exports (`index.ts` with `export *`) can defeat tree-shaking by forcing bundlers to include all re-exported modules even when only one is imported. The constitution explicitly forbids barrel exports (Architecture Standard #5), but 19 exist.

**Key locations identified**:

- `src/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/index.ts`
- `src/core/ui/markdown/components/index.ts`
- `src/core/ui/typography/index.ts`
- `src/core/apollo/graphqlLinks/index.ts`
- `src/core/analytics/apm/context/index.ts`
- `src/core/analytics/geo/index.ts`
- 13 more across domain directories

**Impact assessment**: Low-to-medium. Most barrel files re-export small sets of components. The highest-risk ones are in `src/core/ui/` where they might pull in heavy editor or form dependencies.
