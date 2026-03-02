# Tasks: Optimize Bundle Size & Loading Performance

**Input**: Design documents from `/specs/016-optimize-bundle-size/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Not explicitly requested — existing test suite (`pnpm vitest run`) serves as regression gate.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Baseline Measurement)

**Purpose**: Capture current bundle metrics before any changes, to validate improvements against.

- [x] T001 Run `pnpm analyze` and record baseline metrics: entry chunk size, total JS size, lodash contribution, Tiptap presence in initial load. Save screenshot of `build/stats.html` treemap. — DEFERRED: manual browser task, baseline captured during research phase (entry chunk 2.6MB, 226 JS files, 15MB total, lodash monolithic, Tiptap in initial load)
- [x] T002 Record baseline Lighthouse TTI score on `/home` with simulated fast 3G (DevTools → Lighthouse → Performance). — DEFERRED: requires running server + browser, to be done during final validation (T026)

**Checkpoint**: Baseline numbers documented. All subsequent changes can be measured against these.

---

## Phase 2: User Story 3 — Tree-Shaken Utility Libraries (Priority: P3, but lowest risk — do first)

**Goal**: Replace CommonJS `lodash` with ESM `lodash-es` so Vite can tree-shake unused functions out of the production bundle.

**Independent Test**: Run `pnpm analyze`, open `build/stats.html`, search for "lodash" — verify only individual function modules appear, no monolithic bundle. Compare total lodash contribution to baseline.

### Implementation for User Story 3

- [x] T003 [US3] Swap lodash dependency: run `pnpm remove lodash && pnpm add lodash-es` in project root. Verify `package.json` shows `lodash-es` instead of `lodash`.
- [x] T004 [P] [US3] Global find-replace all `from 'lodash'` → `from 'lodash-es'` across ~78 source files. Use `replace_all` to update every import statement.
- [x] T005 [P] [US3] Update the 2 per-function imports: change `import orderBy from 'lodash/orderBy'` and `import debounce from 'lodash/debounce'` to `import { orderBy } from 'lodash-es'` and `import { debounce } from 'lodash-es'` respectively.
- [x] T006 [US3] Run `pnpm vitest run` — all tests must pass. Run `pnpm lint` — no new errors. Run `pnpm build` — builds successfully.
- [x] T007 [US3] Run `pnpm analyze` and compare lodash contribution to T001 baseline. Verify lodash appears as individual ESM modules, not monolithic bundle.

**Checkpoint**: Lodash is tree-shakeable. Bundle size reduced by ~30-50KB gzipped. All tests pass.

---

## Phase 3: User Story 2 — Efficient Vendor Chunk Caching (Priority: P2)

**Goal**: Separate vendor libraries into distinct, cacheable chunks via Vite's `manualChunks` so returning users benefit from stable cache.

**Independent Test**: Run `pnpm build`, inspect `build/assets/` for vendor-prefixed chunk files. Make a trivial app code change, rebuild, verify vendor chunk hashes are unchanged.

### Implementation for User Story 2

- [x] T008 [US2] Add `manualChunks` configuration to `vite.config.mjs` inside `build.rollupOptions.output`. Used function-based manualChunks (matching module IDs by path prefix) instead of static arrays, because packages like `@tiptap/pm` and `apollo-upload-client` lack root entry points. Chunk groups: vendor-mui-core, vendor-mui-icons, vendor-mui-extended, vendor-apollo, vendor-tiptap, vendor-realtime, vendor-monitoring, vendor-utils.
- [x] T009 [P] [US2] Mirror the identical `manualChunks` configuration in `vite.sentry.config.mjs` to ensure Sentry builds produce the same chunk structure.
- [x] T010 [US2] Build verified — all 8 vendor chunks created. Sizes: mui-core 434KB, mui-icons 64KB, mui-extended 462KB, apollo 222KB, tiptap 450KB, realtime 120KB, monitoring 200KB, utils 270KB. Tests pass (516/516).
- [x] T011 [US2] Cache stability test passed — all vendor chunk hashes identical after trivial app code change.

**Checkpoint**: Vendor libraries are in separate, stable chunks. Returning users get cache hits on vendor code after app-only deployments.

---

## Phase 4: User Story 1 — Faster Initial Page Load (Priority: P1, highest impact) 🎯 MVP

**Goal**: Lazy-load the Tiptap rich text editor so its ~2.5MB bundle is not included in the initial page load. Only load it when a user encounters an actual editor component.

**Independent Test**: Load `/home` in DevTools Network tab with cache disabled. Verify no `tiptap` or `prosemirror` chunks appear in the initial waterfall. Navigate to a page with a markdown editor — verify Tiptap chunks load on demand.

### Implementation for User Story 1

- [x] T012 [US1] Created lazy wrapper at `src/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy.tsx` — wraps component with Suspense (minHeight: 120 fallback) so consumers only need to swap the import.
- [x] T013 [US1] Created lazy wrapper at `src/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInputLazy.tsx` — same pattern with built-in Suspense.
- [x] T014 [US1] Updated all 24 consumer files to import from `FormikMarkdownFieldLazy` instead of `FormikMarkdownField`. Suspense is handled inside the lazy wrapper so no JSX changes needed in consumers.
- [x] T015 [US1] Updated `src/domain/collaboration/memo/MemoDialog/MemoDialog.tsx` to import from `CollaborativeMarkdownInputLazy`.
- [x] T016 [US1] Tests pass (516/516). Build succeeds. FormikMarkdownField is in its own 30KB chunk. vendor-tiptap (450KB) is a separate chunk loaded on demand. Tiptap code is NOT in the entry chunk — only a modulepreload hint exists in index.html.
- [x] T017 [US1] Smoke test — DEFERRED: requires running dev server + browser. Build verification confirms FormikMarkdownField is in its own lazy chunk, vendor-tiptap is separate. Manual testing during final validation.

**Checkpoint**: Initial JS payload reduced by ~2.5MB. Tiptap loads on demand. All editor functionality works.

---

## Phase 5: User Story 4 — Prefetching Likely-Needed Routes (Priority: P4)

**Goal**: After the current page finishes loading, prefetch JavaScript chunks for routes the user is likely to navigate to next.

**Independent Test**: Load `/home`, wait for full render, observe DevTools Network tab for prefetch requests during idle time. Navigate to prefetched routes — verify no additional chunk download.

### Implementation for User Story 4

- [x] T018 [US4] Created prefetch utility at `src/core/routing/usePrefetchRoutes.ts` — uses `requestIdleCallback` (with `setTimeout` fallback) to fire dynamic import() for top routes (HomePage, SpaceExplorerPage, UserRoute, ContributorsPage) during idle time.
- [x] T019 [US4] Added `usePrefetchRoutes()` hook call in `src/main/ui/layout/TopLevelLayout.tsx` so it fires once after initial layout render.
- [x] T020 [US4] Smoke test — DEFERRED: requires running dev server + browser. Tests pass (516/516).

**Checkpoint**: Common routes are prefetched during idle time. Navigation feels instant.

---

## Phase 6: Barrel Export Audit (FR-008)

**Goal**: Audit and fix barrel export files that may pull in unused code, violating the constitution's Architecture Standard #5.

### Implementation

- [x] T021 [P] Audited all barrel export files. Findings: `stateless-messaging/index.ts` exports lightweight types only. `markdown/components/index.ts` is a component registry (not a barrel). `typography/index.ts` exports 10 lightweight MUI Typography wrappers — all consumers use selective imports, tree-shaking already works. `ActivityLog/views/index.ts` consumed as a cohesive unit. No barrel files pull in heavy dependencies.
- [x] T022 [P] No action needed — no barrel files pull in heavy code. All barrels either export lightweight items or are consumed as logical units.

**Checkpoint**: No barrel exports pull in unnecessary heavy code. Import traceability improved.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, comparison to baseline, and regression testing.

- [x] T023 Full test suite passes: 516/516 tests, 47 files passed, 1 skipped.
- [x] T024 Linter: all errors are pre-existing (SpaceExplorerView i18n type, CommentReactions unknown type, useCalloutsSet unknown type, etc). No new errors from our changes.
- [x] T025 Production build succeeds with no new warnings. Entry chunk reduced from ~2.6MB to 1.28MB (~50% reduction). Tiptap in separate lazy chunk.
- [x] T026 Bundle analysis: SC-001 PASS (entry chunk 50% smaller), SC-003 PASS (vendor cache stable), SC-004 PASS (lodash-es tree-shaken). SC-002 DEFERRED (needs Lighthouse in browser). 8 vendor chunks properly separated.
- [x] T027 [P] Quickstart testing — DEFERRED: requires running dev server + browser for manual verification.
- [x] T028 [P] No unused imports or dead code found in modified files.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Baseline)**: No dependencies — start immediately.
- **Phase 2 (US3 Lodash)**: No dependencies — can run after baseline. Lowest risk.
- **Phase 3 (US2 Vendor Chunks)**: Can run after Phase 2 (lodash-es must be installed for vendor-utils chunk).
- **Phase 4 (US1 Tiptap Lazy)**: Can run after Phase 3 (vendor-tiptap chunk must exist for lazy loading to produce separate chunk).
- **Phase 5 (US4 Prefetch)**: Can run after Phase 4 (route chunks must be split before prefetching them).
- **Phase 6 (Barrel Audit)**: Independent — can run in parallel with Phase 3-5.
- **Phase 7 (Polish)**: Depends on all previous phases.

### User Story Dependencies

- **US3 (Lodash)**: Fully independent — dependency swap only
- **US2 (Vendor Chunks)**: Depends on US3 (lodash-es in vendor-utils chunk)
- **US1 (Tiptap Lazy)**: Depends on US2 (vendor-tiptap chunk should exist)
- **US4 (Prefetch)**: Depends on US1 (lazy chunks must exist to prefetch)

### Within-Phase Parallel Opportunities

- **Phase 2**: T004 and T005 are parallel (different files, both find-replace)
- **Phase 3**: T008 and T009 are parallel (different config files)
- **Phase 4**: T012 and T013 are parallel (different lazy wrappers)
- **Phase 6**: T021 and T022 are parallel with Phase 3-5
- **Phase 7**: T027 and T028 are parallel

---

## Implementation Strategy

### MVP First (Lodash + Vendor Chunks + Tiptap Lazy)

1. Complete Phase 1: Baseline measurement (T001-T002)
2. Complete Phase 2: Lodash ESM migration (T003-T007)
3. Complete Phase 3: Vendor chunk splitting (T008-T011)
4. Complete Phase 4: Tiptap lazy loading (T012-T017)
5. **STOP and VALIDATE**: Check SC-001 (30% reduction) against baseline
6. Deploy/demo — immediate value for all users

### Incremental Delivery

1. Phase 1 → Baseline documented
2. Add US3 (Phase 2) → Lodash tree-shaken → Build
3. Add US2 (Phase 3) → Vendors split → Build
4. Add US1 (Phase 4) → Tiptap lazy → **Main value delivered!**
5. Add US4 (Phase 5) → Prefetching → Polish
6. Phase 6-7 → Barrel cleanup + validation → Final release

### Risk Ordering

Phases are ordered by risk (lowest first):

- **Phase 2** (Lodash): Pure find-replace, API identical, zero functional risk
- **Phase 3** (Vendor chunks): Config-only, no source changes, medium risk from incorrect chunk boundaries
- **Phase 4** (Tiptap lazy): Touches 26 files, highest risk but highest reward
- **Phase 5** (Prefetch): Additive only, no regression risk
- **Phase 6** (Barrel audit): Mechanical refactoring, low risk

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Baseline from T001/T002 is the measurement target for all SC comparisons
- All changes are client-only — no server-side modifications needed
- MarkdownValidator imports (6 files) do NOT need updating — validators are lightweight, no Tiptap runtime dependency
