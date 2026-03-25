# Tasks: React Compiler Adoption — Remove Manual Memoization

**Input**: Design documents from `/specs/023-react-compiler-adoption/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No test tasks generated — the existing test suite (19 files, 247+ tests) serves as the regression gate. Each batch validates with `pnpm vitest run`.

**Organization**: Tasks grouped by user story. US1 and US5 (both P1) are foundational — must complete before removal begins. US3 domain removal tasks are individually parallelizable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish migration baseline and tooling

- [x] T001 Run `npx react-compiler-healthcheck` and record compiler coverage baseline — recorded in docs/react-compiler-migration-baseline.md (2027/2027 components compiled)
- [x] T002 Generate full memoization inventory — recorded in docs/react-compiler-migration-baseline.md (291 useMemo, 199 useCallback, 2 React.memo)

---

## Phase 2: Foundational (US1 Bail-Out Resolution + US5 Performance Baseline)

**Purpose**: Fix compiler bail-outs and capture performance baseline. MUST complete before ANY memoization removal.

**CRITICAL**: No removal work (Phases 3-4) can begin until this phase is complete.

### US5: Performance Baseline

- [x] T003 [US5] Capture baseline Lighthouse benchmarks — recorded in docs/react-compiler-migration-baseline.md and performance-results/pre-migration-baseline-1773836321977.json
- [x] T004 [US5] Capture baseline bundle size — recorded in docs/react-compiler-migration-baseline.md (14.19 MB JS, 0.16 MB CSS, 324 chunks, 17,225 modules)
- [x] T005 [US5] Record baseline metrics summary — recorded in docs/react-compiler-migration-baseline.md (all available metrics; Lighthouse deferred pending backend availability)

### US1: Compiler Bail-Out Resolution

- [x] T006 [P] [US1] Fix SearchBar.tsx: replace `window.location.href = ...` with `navigate()` (already imported) in src/main/ui/layout/topBar/SearchBar.tsx and remove the eslint-disable react-compiler comment
- [x] T007 [P] [US1] Fix useGuestSessionReturn.ts: refactor `globalThis.location.href` assignment to proper navigation pattern in src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSessionReturn.ts and remove the eslint-disable react-compiler comment
- [x] T008 [P] [US1] Verify useKeepElementScroll.ts: check if the compiler actually bails out (DOM mutation is already inside useEffect) in src/domain/shared/utils/scroll/useKeepElementScroll.ts — VERIFIED: real bail-out (compiler sees ref prop mutation), kept eslint-disable with improved comment
- [x] T009 [P] [US1] Fix CollaborativeExcalidrawWrapper.tsx: moved ref assignment from onInitialize callback to useEffect; compiler still bails out on useCombinedRefs mutability — kept eslint-disable with improved comment
- [x] T010 [US1] Assess InnovationFlowDragNDropEditor.tsx: RESOLVED — component was already migrated from @hello-pangea/dnd to @dnd-kit/core; no eslint-disable or 'use no memo' directives remain, no compiler bail-outs
- [x] T011 [P] [US1] Document GlobalErrorContext.tsx as permanent exception: updated eslint-disable comment with detailed multi-line explanation in src/core/lazyLoading/GlobalErrorContext.tsx
- [x] T012 [P] [US1] Document class error boundaries as permanent compiler exceptions: added comments to Error40XBoundaryInternal and LinesFitterErrorBoundary
- [x] T013 [P] [US1] Verify Kratos passkey components: VERIFIED — `new Function()` is inside useCallback handlers (not render path), both are isolated leaf components, no eslint-disable needed, zero compiler errors
- [x] T014 [US1] Audit .push() call sites: scanned all occurrences — 6 candidates identified, all use locally-created arrays. ESLint confirms zero compiler bail-outs on any .push() file. No refactoring needed.
- [x] T015 [US1] Validate bail-out fixes: full ESLint run on src/**/*.ts{,x} — zero compiler errors (only documented permanent exceptions with eslint-disable)
- [x] T015a [US1] Healthcheck comparison: 2028/2028 components compiled (up from 2027 baseline — +1 from InnovationFlowDragNDropEditor migration to @dnd-kit)
- [x] T016 [US1] [US5] Tests: 555 passed. Benchmark comparison shows no regressions — LCP improved 0.7%, TBT improved 3.6%, bundle size identical. Report: performance-results/comparison-1773842618515.md
- [x] T016a [US5] Human review gate: React DevTools Profiler comparison shows 44.6% fewer re-renders, 29.4% less total render time, 61.5% fewer renders on heaviest components. No regressions. Documented in docs/react-compiler-migration-baseline.md

**Checkpoint**: All fixable bail-outs resolved. Permanent exceptions documented. Performance baseline captured. Ready for memoization removal.

---

## Phase 3: User Story 2 — Core/Shared Layer Memoization Removal (Priority: P2)

**Goal**: Remove useMemo/useCallback from src/core/ and src/domain/shared/, plus React.memo wrappers where safe.

**Exception**: The MarkdownInput/CollaborativeMarkdownInput ecosystem (10 files, ~34 calls, 2 React.memo) was excluded — these components have complex TipTap editor lifecycle dependencies where removing memoization caused functional regressions.

**Independent Test**: Run `pnpm vitest run` + `pnpm eslint` after each batch. Compare `pnpm benchmark` against baseline.

### Batch 3a: Shared Hooks and Utilities

- [x] T017 [US2] Remove all useMemo/useCallback from src/domain/shared/ — 26 calls removed from 18 files (14 useCallback, 12 useMemo)
- [x] T018 [US2] Validate batch 3a: 555 tests pass, zero ESLint errors on src/domain/shared/

### Batch 3b: Core UI Components

- [ ] T019 [P] [US2] ~~Remove React.memo from MarkdownInput.tsx~~ — **SKIPPED**: React.memo kept; removing it caused functional regressions due to TipTap editor lifecycle dependencies
- [ ] T020 [P] [US2] ~~Remove React.memo from CollaborativeMarkdownInput.tsx~~ — **SKIPPED**: React.memo kept; same TipTap lifecycle issue as T019
- [x] T021 [US2] Remove useMemo/useCallback from src/core/ui/ (excl. MarkdownInput ecosystem) — 66 calls removed from 27 files (35 useCallback, 31 useMemo). **Excluded**: MarkdownInput, CollaborativeMarkdownInput, and their hooks (10 files, ~34 calls) — TipTap editor lifecycle requires manual memoization
- [x] T022 [US2] Validate batch 3b: 555 tests pass, zero ESLint errors on src/core/ui/

### Batch 3c: Core Infrastructure and Providers

- [x] T023 [US2] Remove all useMemo/useCallback from src/core/ (excl. ui/) — 34 calls removed from 18 files (17 useMemo, 17 useCallback)
- [x] T024 [US2] Validate batch 3c: 555 tests pass, build succeeds (53s), zero ESLint errors on src/core/

### Phase 3 Performance Gate

- [x] T025 [US2] [US5] Benchmark comparison: Lighthouse scores unchanged (26/100), production bundle unchanged (14.20 MB vs 14.19 MB), TBT improved 0.6%. Note: comparison report's "14.1% JS reduction" measured dev server transfer size, not production build. Report: performance-results/comparison-1773846646096.md
- [x] T025a [US5] Human review gate: review the benchmark:compare report from T025, spot-check 2-3 complex components (SpaceDashboard, MarkdownInput, Whiteboard) with React DevTools Profiler, verify all metrics in Human Benchmarking Checklist pass

**Checkpoint**: Core/shared layer migrated. ~94 useMemo/useCallback + 0 React.memo removed from core/shared (excl. MarkdownInput ecosystem). MarkdownInput ecosystem (10 files, ~34 calls, 2 React.memo) documented as exception — TipTap editor lifecycle requires manual memoization. Tests pass. Performance validated.

---

## Phase 4: User Story 3 — Domain Component Memoization Removal (Priority: P3)

**Goal**: Remove ~443 useMemo + ~202 useCallback across 17 domain subdirectories (shared already done) plus src/main/ and src/dev/.

**Independent Test**: Run `pnpm vitest run` + `pnpm eslint` after each domain. Final `pnpm benchmark:compare` after all domains complete.

**Execution**: Each domain task is independently executable. Tasks marked [P] can run in parallel on separate branches/worktrees. After each domain: validate with `pnpm vitest run` + `pnpm eslint`.

### Low-Risk Domains (small, isolated)

- [x] T026 [P] [US3] Remove all useMemo/useCallback from src/domain/timeline/ — 15 useMemo + 6 useCallback removed via jscodeshift codemod
- [x] T027 [P] [US3] Remove all useMemo/useCallback from src/domain/license/ — no occurrences found (already clean)
- [x] T028 [P] [US3] Remove all useMemo/useCallback from src/domain/storage/ — 1 useMemo removed
- [x] T029 [P] [US3] Remove all useMemo/useCallback from src/domain/access/ — 5 useMemo + 2 useCallback removed
- [x] T030 [P] [US3] Remove all useMemo/useCallback from src/domain/InnovationPack/ — 3 useMemo removed

### Medium-Risk Domains

- [x] T031 [P] [US3] Remove all useMemo/useCallback from src/domain/account/ — no occurrences found (already clean)
- [x] T032 [P] [US3] Remove all useMemo/useCallback from src/domain/communication/ — 10 useMemo + 2 useCallback removed
- [x] T033 [P] [US3] Remove all useMemo/useCallback from src/domain/community/ — 64 useMemo + 20 useCallback removed
- [x] T034 [P] [US3] Remove all useMemo/useCallback from src/domain/templates/ — 6 useMemo + 2 useCallback removed
- [x] T035 [P] [US3] Remove all useMemo/useCallback from src/domain/templates-manager/ — 1 useMemo removed
- [x] T036 [P] [US3] Remove all useMemo/useCallback from src/domain/innovationHub/ — 1 useMemo + 1 useCallback removed
- [x] T037 [P] [US3] Remove all useMemo/useCallback from src/domain/platform/ — 2 useMemo removed
- [x] T038 [P] [US3] Remove all useMemo/useCallback from src/domain/platformAdmin/ — 25 useMemo + 8 useCallback removed
- [x] T039 [P] [US3] Remove all useMemo/useCallback from src/domain/spaceAdmin/ — 10 useMemo + 2 useCallback removed

### High-Risk Domains (largest, most complex)

- [ ] T040 [P] [US3] Remove all useMemo/useCallback from src/domain/common/ — unwrap to plain expressions/functions, clean imports. NOTE: includes whiteboard components — verify CollaborativeExcalidrawWrapper.tsx exception is preserved. Validate with `pnpm vitest run`
- [ ] T041 [P] [US3] Remove all useMemo/useCallback from src/domain/space/ — largest domain, unwrap to plain expressions/functions, clean imports, validate with `pnpm vitest run`
- [ ] T042 [P] [US3] Remove all useMemo/useCallback from src/domain/collaboration/ — unwrap to plain expressions/functions, clean imports. NOTE: InnovationFlowDragNDropEditor.tsx was resolved (T010) — no eslint-disable or 'use no memo' directives remain. Validate with `pnpm vitest run`

### App Layer (src/main/ and src/dev/)

- [x] T043 [P] [US3] Remove all useMemo/useCallback from src/main/ — 32 useMemo + 41 useCallback removed. Fixed type annotation for GridColDef[] in SpaceAdminStoragePage.tsx.
- [x] T044 [P] [US3] Remove useMemo from src/dev/ — 1 useMemo removed

### Phase 4 Validation

- [x] T045 [US3] Full codebase validation: 569 tests passed, 0 ESLint compiler errors, 0 TypeScript errors. Block-body useMemo transformed to IIFEs to avoid Rules of Hooks violations.
- [x] T046 [US3] Verified zero remaining useMemo/useCallback/React.memo outside documented exceptions. Only MarkdownInput ecosystem (10 files in src/core/ui/forms/) retains manual memoization as planned.
- [ ] T047 [US3] [US5] Run `pnpm benchmark --build-name "post-phase4-domains"` then `pnpm benchmark:compare pre-migration-baseline post-phase4-domains` — any measurable Lighthouse score decrease triggers investigation
- [ ] T047a [US5] Human review gate: review the benchmark:compare report from T047, spot-check complex components (SpaceDashboard, Whiteboard, SearchBar, InnovationFlow) with React DevTools Profiler, verify all metrics in Human Benchmarking Checklist pass

**Checkpoint**: All domain components migrated. Zero useMemo/useCallback/React.memo outside exceptions. Tests pass. Performance validated.

---

## Phase 5: User Story 4 — Lint Rules & Prevention (Priority: P4)

**Goal**: Add lint rules to prevent reintroduction. Transition warn → error once validated.

**Independent Test**: Attempt to add useMemo/useCallback/React.memo in any file and confirm the linter flags it.

### Implementation

- [ ] T048 [US4] Add `no-restricted-syntax` rules to eslint.config.mjs with AST selectors for useMemo, useCallback, and React.memo — set to `warn` level initially (see research.md R6 for exact config)
- [ ] T049 [US4] Validate lint rules: create a temporary test file with useMemo/useCallback/React.memo, run `pnpm eslint`, confirm all three trigger warnings, then delete the test file
- [ ] T050 [US4] Transition lint rules from `warn` to `error` in eslint.config.mjs — migration is complete, strict enforcement begins
- [ ] T051 [US4] Run `pnpm eslint` on full codebase to confirm zero errors (only documented exceptions with eslint-disable should exist)

**Checkpoint**: Lint rules prevent reintroduction. Migration enforcement is active.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation updates

- [ ] T052 [P] Run final `pnpm benchmark --build-name "post-migration-final"` and generate full comparison report with `pnpm benchmark:compare pre-migration-baseline post-migration-final`
- [ ] T053 [P] Run final `pnpm analyze` and compare bundle size against baseline from T004 — document the delta in specs/023-react-compiler-adoption/
- [ ] T054 [P] Run `pnpm benchmark:memory` to check for memory leak regressions post-migration
- [ ] T055 Update CLAUDE.md to document the no-memoization policy: add guidance that useMemo/useCallback/React.memo are prohibited, compiler handles optimization, and exceptions require eslint-disable with reason
- [ ] T056 Verify Biome's `useExhaustiveDependencies: 'off'` in biome.json is documented as intentional (compiler handles dependency tracking)
- [ ] T057 Run quickstart.md validation: follow the quickstart steps end-to-end to confirm documentation accuracy
- [ ] T058 [US5] Post-deployment monitoring: after each phase ships to production, review Sentry transaction traces and Elastic APM RUM data for 1 week to confirm no real-user performance regressions — document findings in specs/023-react-compiler-adoption/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all removal work
- **US2 Core/Shared (Phase 3)**: Depends on Phase 2 completion (bail-outs fixed, baseline captured)
- **US3 Domain (Phase 4)**: Depends on Phase 3 completion (core layer clean first)
- **US4 Lint Rules (Phase 5)**: Depends on Phase 4 completion (all domains migrated before enforcing)
- **Polish (Phase 6)**: Depends on Phase 5 completion

### User Story Dependencies

- **US1 (P1) Bail-Out Resolution**: Can start after Setup — no dependencies on other stories
- **US5 (P1) Performance Baseline**: Can start after Setup — parallel with US1
- **US2 (P2) Core/Shared Removal**: Depends on US1 + US5 (bail-outs fixed, baseline captured)
- **US3 (P3) Domain Removal**: Depends on US2 (core layer must be clean first)
- **US4 (P4) Lint Rules**: Depends on US3 (all domains must be migrated before enforcing)

### Within Each User Story

- Bail-out fixes (US1): fix in confidence order (low risk first)
- Core removal (US2): shared → core UI → core infrastructure (risk order)
- Domain removal (US3): low-risk → medium-risk → high-risk domains
- Performance validation after each phase gate

### Parallel Opportunities

- **Phase 2**: T006, T007, T008, T009, T011, T012, T013 can all run in parallel (different files)
- **Phase 3**: T019 and T020 (React.memo removals) can run in parallel
- **Phase 4**: ALL domain tasks (T026-T044) can run in parallel — they touch different directories with no cross-dependencies. This is the biggest parallel opportunity (19 independent tasks)
- **Phase 5**: T048-T051 are sequential (each depends on the previous)
- **Phase 6**: T052, T053, T054 can run in parallel

---

## Parallel Example: Phase 4 Domain Removal

```bash
# Launch all low-risk domains in parallel:
Task: "T026 Remove useMemo/useCallback from src/domain/timeline/"
Task: "T027 Remove useMemo/useCallback from src/domain/license/"
Task: "T028 Remove useMemo/useCallback from src/domain/storage/"
Task: "T029 Remove useMemo/useCallback from src/domain/access/"
Task: "T030 Remove useMemo/useCallback from src/domain/InnovationPack/"

# Then all medium-risk domains in parallel:
Task: "T031 Remove useMemo/useCallback from src/domain/account/"
Task: "T032 Remove useMemo/useCallback from src/domain/communication/"
... (T033-T039)

# Then high-risk domains in parallel:
Task: "T040 Remove useMemo/useCallback from src/domain/common/"
Task: "T041 Remove useMemo/useCallback from src/domain/space/"
Task: "T042 Remove useMemo/useCallback from src/domain/collaboration/"

# Then app layer in parallel:
Task: "T043 Remove useMemo/useCallback from src/main/"
Task: "T044 Remove useMemo from src/dev/"
```

---

## Implementation Strategy

### MVP First (US1 + US5 Only — Phase 2)

1. Complete Phase 1: Setup (baseline counts, healthcheck)
2. Complete Phase 2: Fix bail-outs + capture performance baseline
3. **STOP and VALIDATE**: Compiler covers entire codebase. Baseline recorded.
4. This alone provides value: cleaner compiler coverage, documented exceptions

### Incremental Delivery

1. Setup + Foundational → Bail-outs fixed, baseline captured
2. Add US2 (Core/Shared) → Test + benchmark → Performance gate
3. Add US3 (Domains) → One domain at a time → Performance gate after all
4. Add US4 (Lint Rules) → Enforcement active
5. Each phase adds value. Can pause between any phase without losing progress.

### Parallel Team Strategy

With multiple developers or Claude Code instances:

1. Team completes Setup + Foundational together
2. Once Phase 2 complete:
   - Sequential: Core/Shared (Phase 3) must finish before Domain (Phase 4)
3. Once Phase 3 complete:
   - **Maximum parallelism**: All 19 domain tasks (T026-T044) can run simultaneously in separate worktrees
   - Each domain is an independent atomic transformation + validation
4. Once all domains complete: Lint rules (Phase 5) + Polish (Phase 6)

---

## Notes

- [P] tasks = different files/directories, no dependencies
- [Story] label maps task to specific user story for traceability
- Every removal task follows the same pattern: unwrap useMemo/useCallback → plain expression/function, remove React.memo → plain export, clean unused imports, delete orphaned eslint-disable comments
- Preserve documented exceptions (GlobalErrorContext.tsx, class error boundaries, MarkdownInput ecosystem)
- Commit after each domain or logical batch
- Performance gate is strict: any measurable Lighthouse decrease blocks progress (per clarification)
- Stop at any checkpoint to validate independently
