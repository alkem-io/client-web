# Feature Specification: Optimize Bundle Size & Loading Performance

**Feature Branch**: `016-optimize-bundle-size`
**Created**: 2026-03-02
**Status**: Draft
**Input**: User description: "Bundle size optimization and loading performance: reduce JS payload size, optimize vendor chunk splitting, improve initial page load times through better code splitting, tree-shaking, prefetching, and lazy loading of heavy components (Excalidraw, Tiptap, etc.)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Faster Initial Page Load (Priority: P1)

A user navigates to any page on the platform. The browser downloads and parses only the JavaScript needed for that specific page. Heavy editor libraries (Tiptap rich text editor, ~2.5MB) are not loaded until the user actually interacts with a content editor. This reduces time-to-interactive and makes the app feel snappy, especially on slower connections or lower-powered devices.

**Why this priority**: The Tiptap editor is statically imported via 32 import statements across core UI components, meaning its ~2.5MB bundle loads on every single page — even pages with no editor. This is the single largest avoidable payload on initial load.

**Independent Test**: Load the home page (`/home`) in DevTools Network tab with cache disabled. Verify that no Tiptap-related chunks appear in the initial waterfall. Navigate to a page with a markdown editor — verify Tiptap chunks load on demand. Compare total initial JS transfer size before and after.

**Acceptance Scenarios**:

1. **Given** a user loads the home page, **When** the page finishes loading, **Then** no Tiptap editor code is included in the initial bundle.
2. **Given** a user navigates to a page containing a rich text editor, **When** the editor field becomes visible, **Then** the Tiptap editor code loads dynamically and the editor becomes interactive.
3. **Given** a user on a slow 3G connection loads any page without an editor, **When** the page loads, **Then** the time-to-interactive is measurably lower than before this optimization.

---

### User Story 2 - Efficient Vendor Chunk Caching (Priority: P2)

A returning user navigates to the platform after a new deployment. Because vendor libraries (MUI, Apollo, Tiptap, Excalidraw) are separated into distinct, stable chunks, the browser cache serves the unchanged vendor code and only downloads the application code that changed. This reduces repeat-visit load times significantly.

**Why this priority**: Without explicit vendor chunking, Vite merges vendor and app code into shared chunks. Any app code change invalidates the entire chunk, forcing re-download of unchanged vendor code. Separating vendors improves cache hit rates for returning users.

**Independent Test**: Run `pnpm build` and inspect the output in `build/assets/`. Verify that vendor libraries are in separate, named chunks (e.g., `vendor-mui-[hash].js`, `vendor-apollo-[hash].js`). Make a small application code change, rebuild, and verify vendor chunk hashes remain unchanged.

**Acceptance Scenarios**:

1. **Given** the application is built for production, **When** inspecting the output, **Then** MUI, Apollo, and Tiptap code reside in separate vendor chunks.
2. **Given** a developer changes application code (not dependencies), **When** the app is rebuilt, **Then** vendor chunk hashes remain identical to the previous build.
3. **Given** a returning user visits after a deployment with only app code changes, **When** the page loads, **Then** vendor chunks are served from browser cache.

---

### User Story 3 - Tree-Shaken Utility Libraries (Priority: P3)

The application imports only the specific utility functions it uses from libraries like Lodash, rather than bundling the entire library. This reduces the baseline JS payload that every user must download.

**Why this priority**: The app has ~100 Lodash imports using the non-tree-shakeable `import { x } from 'lodash'` pattern, which bundles the entire ~70KB (gzipped) library even though only a fraction of functions are used. Switching to per-function imports enables tree-shaking.

**Independent Test**: Run `pnpm analyze` and open `build/stats.html`. Search for `lodash` in the visualization. Verify that only individual function modules appear (e.g., `lodash/debounce`) rather than the monolithic `lodash` bundle. Compare total Lodash contribution before and after.

**Acceptance Scenarios**:

1. **Given** the application is built for production, **When** analyzing the bundle, **Then** no monolithic `lodash` module appears in the bundle visualization.
2. **Given** a file imports `debounce` from Lodash, **When** the bundle is built, **Then** only the `debounce` module and its dependencies are included, not the full Lodash library.

---

### User Story 4 - Prefetching Likely-Needed Routes (Priority: P4)

After the current page finishes loading, the browser prefetches JavaScript chunks for routes the user is likely to navigate to next. For example, after the home page loads, the space explorer and user profile chunks are prefetched in the background. This makes subsequent navigation feel instant.

**Why this priority**: While code splitting reduces initial load, it can make subsequent navigations feel slower due to on-demand chunk loading. Prefetching bridges this gap by loading likely-needed chunks during idle time.

**Independent Test**: Load the home page and wait for it to fully render. Open DevTools Network tab and observe idle-time requests. Verify that chunks for common navigation targets (space explorer, user profile) appear as prefetch requests. Navigate to those pages and verify no additional chunk download is needed.

**Acceptance Scenarios**:

1. **Given** a user has fully loaded the home page, **When** the browser is idle, **Then** chunks for the most common navigation targets are prefetched.
2. **Given** a prefetched route's chunk is already cached, **When** the user navigates to that route, **Then** the page transition occurs without any network request for that chunk.

---

### Edge Cases

- What happens when a lazy-loaded chunk fails to download (network error)? The existing `lazyWithGlobalErrorHandler` error boundary should display a retry prompt.
- What happens when a user navigates to an editor page before the Tiptap chunk finishes loading? A loading placeholder should be shown until the editor is ready.
- What happens when vendor chunks become very large individually? Each vendor chunk should stay under 300KB uncompressed (~100KB gzipped) to avoid blocking the main thread during parsing.
- What happens when lodash per-function imports have different behavior than the monolithic import? Behavior must remain identical — this is a build-time change only.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The rich text editor (Tiptap) MUST be loaded dynamically only when a user encounters a page or component that requires it.
- **FR-002**: The application MUST separate vendor libraries into distinct, cacheable chunks during production builds — at minimum: UI framework (MUI), data layer (Apollo), rich text editor (Tiptap), and whiteboard (Excalidraw, already lazy).
- **FR-003**: Utility library imports (Lodash) MUST use tree-shakeable import patterns so only used functions are included in the production bundle.
- **FR-004**: A loading indicator MUST be shown while dynamically-loaded editor components are being fetched.
- **FR-005**: All existing functionality MUST continue to work identically after bundle optimizations — no behavioral regressions.
- **FR-006**: The application SHOULD prefetch JavaScript chunks for likely navigation targets during browser idle time after the current page is fully loaded.
- **FR-007**: Production build output MUST NOT introduce new build warnings or errors.
- **FR-008**: Barrel export files (index.ts re-exports) in frequently imported directories MUST be audited to ensure they do not pull in unused code.

### Key Entities

- **Chunk**: A unit of bundled JavaScript output by the build tool. Chunks can be loaded eagerly (initial) or lazily (on demand).
- **Vendor Chunk**: A chunk containing exclusively third-party library code, designed for long-term browser caching.
- **Route Chunk**: A chunk containing the code for a specific page/route, loaded when the user navigates to that route.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Initial JS payload for the home page (no editor) is reduced by at least 30% compared to the current baseline.
- **SC-002**: Time-to-interactive on the home page improves by at least 20% on a simulated fast 3G connection (measured via Lighthouse or WebPageTest).
- **SC-003**: Vendor chunk cache hit rate on repeat visits (after app-only code changes) is 100% — vendor hashes remain stable when only application code changes.
- **SC-004**: Total Lodash contribution to the production bundle is reduced by at least 50% compared to the current monolithic inclusion.
- **SC-005**: All 516+ existing tests pass with no regressions.
- **SC-006**: Production build completes successfully with no new warnings or errors.
- **SC-007**: No user-facing functionality is broken — all pages, editors, whiteboards, and navigation work identically.

## Assumptions

- Vite's built-in code splitting and Rollup's `manualChunks` configuration are sufficient for vendor chunk separation — no additional bundler plugins are required.
- The `lodash-es` package or per-function `lodash/[fn]` imports are drop-in replacements for the current `lodash` imports with identical behavior.
- The existing `lazyWithGlobalErrorHandler` pattern is the established way to lazy-load components and should be reused for Tiptap.
- Excalidraw is already properly lazy-loaded and does not need additional optimization.
- The 73 existing lazy-loaded components represent a solid baseline for route-level splitting; the main gap is component-level splitting for heavy libraries loaded statically.
- Browser prefetching (`<link rel="prefetch">`) is well-supported across target browsers and does not negatively impact performance on mobile devices.

## Out of Scope

- Server-side rendering (SSR) or static site generation (SSG) — the app is a client-side SPA.
- CDN configuration or HTTP caching headers — these are infrastructure concerns outside the application.
- Reducing the number of dependencies or replacing libraries (e.g., replacing MUI, switching from Apollo) — this spec focuses on how existing code is bundled, not what code exists.
- Image optimization or non-JS asset optimization.
- Service worker caching strategies.
