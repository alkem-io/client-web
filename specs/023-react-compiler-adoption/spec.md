# Feature Specification: React Compiler Adoption — Remove Manual Memoization

**Feature Branch**: `023-react-compiler-adoption`
**Created**: 2026-03-17
**Status**: Draft
**Input**: RFC proposing removal of all manual memoization primitives (useMemo, useCallback, React.memo) in favor of the already-integrated React Compiler (React Forget) for automatic optimization.

**Guiding Principle**: This migration exists to serve end users, not developers. Every change must be validated against real-world performance metrics that directly affect client experience — page load speed, interaction responsiveness, memory consumption, and bundle size. Developer ergonomics are a secondary benefit. If a removal degrades any client-facing metric, it must be reverted and investigated before continuing.

## Clarifications

### Session 2026-03-17

- Q: What constitutes a performance regression that should block migration progress? → A: Strict — any measurable Lighthouse score decrease blocks progress and triggers investigation before continuing.
- Q: Phase 3 domain removal execution strategy — opportunistic vs batch? → A: Batch per domain — Claude Code transforms one domain subdirectory at a time in dedicated commits, not opportunistic.
- Q: What triggers the lint rule transition from warn to error? → A: Completion-based — switch to error once all Phase 3 domains are migrated and validated.
- Performance benchmarking elevated to mandatory section with Human Benchmarking Checklist (page load, interaction responsiveness, memory, bundle size, compiler coverage), measurement tools catalog, and 5-step measurement protocol. Added FR-015/016/017 and SC-009/010/011. Reframed US5 around client value.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compiler Bail-Out Resolution (Priority: P1)

As a developer, I need all compiler bail-outs resolved so that the React Compiler can optimize the entire codebase uniformly before manual memoization is removed.

**Why this priority**: Removing manual memoization from components the compiler cannot optimize would cause performance regressions. The 6 known bail-outs and any render-time mutations must be fixed first to ensure a safe foundation for all subsequent removal work.

**Independent Test**: Can be fully tested by running the compiler ESLint rule across the entire codebase and confirming zero unhandled bail-outs. Delivers confidence that every component is compiler-optimizable.

**Acceptance Scenarios**:

1. **Given** the 6 files with eslint-disable react-compiler comments, **When** each file is investigated and refactored where possible, **Then** the number of bail-outs is reduced to only permanently justified exceptions (class error boundaries), each documented with a reason.
2. **Given** the 124 `.push()` call sites across 67 files, **When** an audit identifies any that mutate values during render, **Then** those are refactored to immutable patterns (spread, map, filter) and the compiler processes them without warnings.
3. **Given** the 2 class error boundary components, **When** they are reviewed, **Then** they are documented as permanent exceptions since React requires class components for error boundaries.
4. **Given** the 2 `new Function()` call sites in Kratos passkey components, **When** they are verified, **Then** they are confirmed as isolated leaf components that do not affect compiler optimization of surrounding code.

---

### User Story 2 - Core/Shared Layer Memoization Removal (Priority: P2)

As a developer, I need manual memoization removed from core UI components and shared utilities so that the foundational layer of the codebase is clean and sets the standard for domain components.

**Why this priority**: Core and shared code is imported across the entire application. Cleaning this layer first establishes the pattern, reduces risk (fewer domain-specific side effects), and provides a validated reference for subsequent domain-level removal.

**Independent Test**: Can be fully tested by removing useMemo/useCallback from all files under `src/core/` and `src/domain/shared/`, running the full test suite, and comparing render performance profiles against baseline.

**Acceptance Scenarios**:

1. **Given** shared hooks and utility functions containing useMemo/useCallback, **When** the wrappers are removed and replaced with plain expressions/functions, **Then** all existing tests pass and compiler diagnostics show no new bail-outs.
2. **Given** core UI components (buttons, inputs, dialogs) with manual memoization, **When** useMemo/useCallback wrappers are removed, **Then** the components render correctly and performance profiling shows no degradation.
3. **Given** layout components and providers with manual memoization, **When** the wrappers are removed, **Then** the application layout and navigation work correctly with no visual or functional regressions.

---

### User Story 3 - Domain Component Memoization Removal (Priority: P3)

As a developer, I need manual memoization removed from all domain-specific components across the 18 domain subdirectories so that the entire codebase relies uniformly on compiler-driven optimization.

**Why this priority**: This is the bulk of the migration work covering ~646 domain .tsx files. It delivers the full value of codebase simplification but depends on the core layer being clean first. Execution is batch-based — Claude Code transforms one domain subdirectory at a time in dedicated commits, with validation after each domain.

**Independent Test**: Can be tested domain-by-domain by removing memoization from one domain subdirectory at a time, running the test suite and compiler diagnostics after each domain.

**Acceptance Scenarios**:

1. **Given** a domain subdirectory (e.g., `space/`, `collaboration/`) containing components with useMemo/useCallback, **When** all wrappers are removed and replaced with plain expressions/functions, **Then** the test suite passes and compiler diagnostics report no new bail-outs for that domain.
2. **Given** a component using React.memo(), **When** the wrapper is removed, **Then** the component exports as a regular component and renders identically.
3. **Given** any orphaned eslint-disable comments for exhaustive-deps, **When** the associated memoization is removed, **Then** the eslint-disable comments are also deleted.

---

### User Story 4 - Prevention of Memoization Reintroduction (Priority: P4)

As a team lead, I need lint rules and guidelines that prevent developers from reintroducing manual memoization so that the codebase stays clean after migration.

**Why this priority**: Without enforcement, developers accustomed to manual memoization will gradually reintroduce it. Lint rules make the policy automatic and self-enforcing. This is the final phase that locks in the migration gains.

**Independent Test**: Can be tested by attempting to add useMemo/useCallback/React.memo to any file and confirming the linter raises a warning (transitioning to error).

**Acceptance Scenarios**:

1. **Given** lint rules configured to disallow useMemo, **When** a developer writes `useMemo(...)` in any component, **Then** the linter reports a warning (eventually error) with a message explaining the compiler handles this automatically.
2. **Given** lint rules configured to disallow useCallback, **When** a developer writes `useCallback(...)` in any component, **Then** the linter reports a warning (eventually error).
3. **Given** lint rules configured to disallow React.memo, **When** a developer wraps a component in `React.memo()`, **Then** the linter reports a warning (eventually error).
4. **Given** a documented exception (e.g., truly expensive computation the compiler cannot prove pure), **When** a developer adds an eslint-disable with a reason, **Then** the exception is accepted in code review with documentation.

---

### User Story 5 - Performance Validation Throughout Migration (Priority: P1)

As a product owner, I need proof that this migration does not degrade the experience our clients depend on — page load speed, interaction responsiveness, memory usage, and download size — validated with real measurements before, during, and after each phase.

**Why this priority**: This is the most important story. The entire migration is justified only if client-facing performance remains equal or better. Without rigorous measurement, removals could silently degrade the experience for the users who pay for this product. Every other user story is gated on this one.

**Independent Test**: Can be tested by capturing a comprehensive performance profile (Lighthouse, bundle size, memory, render timing) for critical pages before any changes, then comparing after each batch of removals. Any degradation blocks progress.

**Acceptance Scenarios**:

1. **Given** critical application pages (login, dashboard, space views, whiteboard), **When** baseline performance profiles are captured using `pnpm benchmark` (minimum 3 runs per page), **Then** they are stored as reference points including: Lighthouse scores, FCP, LCP, TTI, TBT, CLS, bundle size, and memory snapshots.
2. **Given** a batch of memoization removals has been applied, **When** the same benchmark suite is run and compared against baseline using `pnpm benchmark:compare`, **Then** every client-facing metric is equal to or better than baseline.
3. **Given** a batch of removals causes any measurable degradation in any client-facing metric, **When** the regression is detected, **Then** the specific removal is reverted and the component is investigated using React DevTools Profiler and Chrome Performance Tracks before re-attempting.
4. **Given** the full migration is complete, **When** a final comprehensive benchmark is run, **Then** a before/after report is produced documenting the impact on every metric in the Human Benchmarking Checklist.

---

### Edge Cases

- What happens when a useMemo contains impure logic or side effects? The side effect must be refactored to useEffect before the useMemo wrapper is removed.
- What happens when a useCallback is used for reference equality by a third-party library (e.g., passing to a library that compares callback identity)? The compiler's automatic memoization preserves reference stability, so this should work — but each case must be verified with the specific library.
- What happens when removing React.memo from a component that is rendered in a high-frequency list? The compiler optimizes at a finer granularity than React.memo, so performance should be equal or better — validate with profiling.
- What happens when the compiler encounters a pattern it cannot optimize that was previously covered by manual memoization? The eslint-plugin-react-compiler (configured at error level) will flag it. The pattern must be refactored before removing the manual memoization.
- What happens to bundle size after removing all memoization wrappers? Expect a modest reduction (~15-30 KB gzipped) from eliminated dependency array metadata and import overhead. Verify with bundle analysis.

## Performance Benchmarking Strategy *(mandatory)*

This migration's value is measured by its impact on client experience, not developer convenience. Performance must be measured rigorously using multiple complementary tools, and a human must review the results at each phase gate.

### Human Benchmarking Checklist

A human reviewer MUST check the following metrics before and after each migration phase. Any degradation in a client-facing metric blocks progress.

**Page Load Performance** (directly affects how fast clients see content):
- **First Contentful Paint (FCP)**: Time until the first visible content appears. Clients on slow connections feel this most.
- **Largest Contentful Paint (LCP)**: Time until the main content is visible. The single most important perceived-speed metric.
- **Time to Interactive (TTI)**: Time until the page responds to user input. If this regresses, clients experience "frozen" pages.
- **Speed Index**: How quickly visible content populates the viewport. Lower is better.
- **Total Blocking Time (TBT)**: Total time the main thread was blocked. Directly causes jank and unresponsiveness.
- **Cumulative Layout Shift (CLS)**: Visual stability — do elements jump around? Removing memoization should not affect this, but verify.

**Interaction Responsiveness** (affects how the app feels during use):
- **Interaction to Next Paint (INP)**: Measures responsiveness to user actions. If removing memoization causes unnecessary re-renders that the compiler doesn't catch, INP will degrade.
- **Long task count**: Number of tasks > 50ms blocking the main thread. Should not increase.
- **Re-render counts on critical components**: Use React DevTools Profiler to verify components don't re-render more often after removal.

**Memory** (affects long-session users and low-end devices):
- **JS heap size per route**: Baseline, after load, after interaction, idle. Should not increase.
- **Memory growth over navigation cycles**: 3-cycle leak detection. Removing memoization caches could change memory behavior.
- **DOM node count**: Should remain stable — memoization removal doesn't change DOM structure.

**Bundle Size** (affects download time, especially on mobile):
- **Total JS asset size** (gzipped and uncompressed): Should decrease modestly (removed dependency array metadata and hook imports).
- **Largest chunk size**: Should not increase.
- **Unused JS/CSS bytes**: Code coverage analysis — should not increase.

**Compiler Coverage** (ensures the compiler is doing its job):
- **Compiler bail-out count**: Number of components the compiler cannot optimize. Must not increase from baseline.
- **`react-compiler-healthcheck` output**: Percentage of components successfully compiled. Must equal or exceed baseline.

### Measurement Tools

**Automated (run before and after each phase)**:

| Tool | Command | What It Captures |
| ---- | ------- | ---------------- |
| Performance benchmark suite | `pnpm benchmark --build-name "<label>"` | Lighthouse scores (FCP, LCP, TTI, TBT, CLS, Speed Index), runtime long tasks, memory per route, memory leak detection |
| Benchmark comparison | `pnpm benchmark:compare <before> <after>` | Markdown diff report with green/red indicators for every metric |
| Memory analysis | `pnpm benchmark:memory` | Per-route memory snapshots, DOM metrics, 3-cycle leak detection |
| LCP analysis | `pnpm benchmark:lcp` | Resource waterfall, blocking resources, code coverage (unused JS/CSS bytes) |
| Bundle analysis | `pnpm analyze` | Interactive visualization of module sizes, dependencies, vendor chunks at build/stats.html |
| Compiler healthcheck | `npx react-compiler-healthcheck` | Components compiled vs. bailed out, specific bail-out reasons |

**Manual (spot-check complex components at each phase gate)**:

| Tool | How to Use | What to Look For |
| ---- | ---------- | ---------------- |
| React DevTools Profiler | Open Profiler tab > enable "Record why each component rendered" > interact > stop | Re-render counts and durations should stay same or decrease after removal. Flame graph should show no new hot paths. |
| Chrome Performance Tracks | Open Performance tab > record > look for "React" tracks | React-specific render timing alongside browser paint/layout. Verify no new long-running renders appear after removal. |
| React `<Profiler>` API | Wrap critical components (SpaceDashboard, Whiteboard, SearchBar) with `<Profiler id="X" onRender={callback}>` | Automated render count/duration data. Use in Playwright E2E tests for repeatable measurement. |

### Measurement Protocol

1. **Before migration starts**: Run full benchmark suite 3 times, take median values. Store as `pre-migration-baseline`.
2. **After each phase (bail-outs, core, each domain)**: Run full benchmark suite 3 times, compare against baseline.
3. **At each phase gate**: A human reviews the benchmark comparison report and spot-checks 2-3 complex components with React DevTools Profiler.
4. **After full migration**: Run complete suite including memory leak detection, LCP analysis, and bundle analysis. Produce final before/after report.
5. **Post-deployment**: Monitor Sentry transaction traces and Elastic APM RUM data for real-user regressions over the first week.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All 6 known compiler bail-out files MUST be investigated, and each MUST either be refactored to be compiler-compatible or documented as a permanent exception with justification.
- **FR-002**: All `.push()` call sites that execute during render (not in callbacks, effects, or utility functions) MUST be refactored to use immutable patterns (spread, map, filter).
- **FR-003**: The 2 class error boundary components MUST be documented as permanent compiler exceptions since React mandates class components for error boundaries.
- **FR-004**: All useMemo call sites (~603 across ~237 files) MUST be unwrapped to plain expressions, with the factory function's return value assigned directly.
- **FR-005**: All useCallback call sites (~322 across ~124 files) MUST be unwrapped to plain function declarations or expressions.
- **FR-006**: All React.memo wrappers (~2 instances) MUST be removed, exporting the component directly.
- **FR-007**: All orphaned eslint-disable comments related to react-hooks/exhaustive-deps MUST be deleted when the associated memoization is removed.
- **FR-008**: Any useMemo containing impure logic or side effects MUST be refactored to useEffect before the useMemo wrapper is removed.
- **FR-009**: Lint rules MUST be added to disallow useMemo, useCallback, and React.memo, initially as warnings. Rules MUST transition to error level once all Phase 3 domain migrations are complete and validated.
- **FR-010**: Each documented exception to the no-memoization rule MUST include an eslint-disable comment with a reason explaining why the compiler is insufficient.
- **FR-011**: Baseline Lighthouse scores and React Profiler snapshots MUST be captured for critical pages before migration begins.
- **FR-012**: Performance MUST be validated against baseline after each migration batch using minimum 3 Lighthouse runs. Any measurable score decrease MUST block further migration and trigger root-cause investigation before continuing.
- **FR-013**: The full test suite MUST pass after each migration batch.
- **FR-014**: Bundle size MUST be measured before and after migration to confirm the expected reduction.
- **FR-015**: `react-compiler-healthcheck` MUST be run before migration begins and after Phase 1 (bail-out fixes) to confirm compiler coverage has increased or remained stable.
- **FR-016**: A human MUST review the benchmark comparison report and spot-check complex components with React DevTools Profiler at each phase gate, verifying every metric in the Human Benchmarking Checklist.
- **FR-017**: Post-deployment monitoring via Sentry transaction traces and Elastic APM RUM MUST be reviewed for the first week after each phase ships to production, confirming no real-user regressions.

### Key Entities

- **Memoization Primitive**: A usage of useMemo, useCallback, or React.memo in the source code — the unit of work for removal. Key attributes: file location, type (useMemo/useCallback/React.memo), whether it contains pure logic, associated eslint-disable comments.
- **Compiler Bail-Out**: A component or hook where the React Compiler cannot apply automatic optimization. Key attributes: file location, reason for bail-out, whether it is fixable or a permanent exception.
- **Migration Batch**: A group of related files processed together during removal. Key attributes: scope (core/shared/domain), domain subdirectory, number of primitives removed, validation status.

## Assumptions

- The React Compiler (babel-plugin-react-compiler) is correctly integrated and active in both development and production builds — this is already the case per the current configuration.
- The compiler's automatic memoization provides equal or better optimization granularity compared to manual useMemo/useCallback for all standard React patterns.
- The existing test suite (19 files, 247 tests) provides sufficient coverage to catch functional regressions from memoization removal.
- Domain component removal (Phase 3) is executed as batch transformations per domain subdirectory using Claude Code, with dedicated commits and validation after each domain.
- The 2 class error boundaries cannot be converted to function components because React does not support function component error boundaries.
- Third-party libraries used in this codebase do not depend on callback reference identity in ways that would break when the compiler manages memoization instead of manual useCallback (verified case-by-case during removal).

## Scope Boundaries

**In scope**:
- Removal of all useMemo, useCallback, and React.memo from the codebase
- Resolution or documentation of all compiler bail-outs
- Audit of render-time mutations (.push() calls)
- Lint rules to prevent reintroduction
- Performance validation at each phase
- Bundle size comparison

**Out of scope**:
- Changes to the React Compiler configuration itself
- Upgrading React or the compiler plugin version
- Refactoring component architecture beyond what is needed for compiler compatibility
- Performance optimization work unrelated to memoization removal
- Changes to third-party library dependencies

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero useMemo, useCallback, or React.memo calls remain in the codebase outside of documented exceptions.
- **SC-002**: Compiler eslint-disable comments are reduced from 6 to only permanently justified exceptions (target: 2-3 — class error boundaries + GlobalErrorContext; InnovationFlowDragNDropEditor uses `'use no memo'` directive instead of eslint-disable), each documented with a reason.
- **SC-003**: All existing tests (247+) pass after each migration phase with no new test failures.
- **SC-004**: All client-facing performance metrics (FCP, LCP, TTI, TBT, CLS, Speed Index, memory, bundle size) MUST NOT degrade from pre-migration baseline on critical pages (login, dashboard, space views, whiteboard). Use minimum 3 runs per measurement. Any degradation blocks progress and triggers investigation.
- **SC-005**: Bundle size decreases or remains stable after migration (expected modest reduction from removed dependency array metadata). Measured with both `pnpm build` asset totals and `pnpm analyze` detailed breakdown.
- **SC-006**: React DevTools Profiler spot-checks on complex components (SpaceDashboard, Whiteboard, SearchBar, InnovationFlow) show re-render counts equal to or lower than pre-migration baseline.
- **SC-007**: Post-deployment Sentry transaction traces and Elastic APM RUM data show no real-user performance regressions for the first week after each phase reaches production.
- **SC-008**: Memory usage per route (JS heap size) remains stable or decreases after migration, with no new memory leaks detected by the 3-cycle leak detection benchmark.
- **SC-009**: New developers can understand component optimization strategy in under 5 minutes ("the compiler handles it") compared to the current need to learn manual memoization patterns.
- **SC-010**: Lint rules actively prevent reintroduction — any new useMemo/useCallback/React.memo triggers a linter warning or error.
- **SC-011**: Zero new eslint-disable comments for exhaustive-deps or react-compiler are introduced during or after migration (outside documented exceptions).
