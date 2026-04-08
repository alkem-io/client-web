# Feature Specification: React Compiler Lint Rules, Prevention & Final Validation

**Feature Branch**: `041-react-compiler-lint-rules`
**Created**: 2026-03-31
**Status**: Draft
**Input**: GitHub issue alkem-io/alkemio#1807 — Add ESLint lint rules to prevent manual memoization reintroduction, run final validation suite, update documentation, and verify tooling configuration.

**Parent Feature**: `023-react-compiler-adoption` (Phases 5-6, tasks T048-T058)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prevention of Memoization Reintroduction via Lint Rules (Priority: P1)

As a team lead, I need lint rules that automatically flag any new usage of useMemo, useCallback, or React.memo so that the migration gains from the React Compiler adoption are permanently locked in without relying on code review vigilance.

**Why this priority**: Without automated enforcement, developers will reintroduce manual memoization out of habit. This is the core deliverable that makes the migration permanent — everything else is validation and documentation.

**Independent Test**: Can be fully tested by adding useMemo/useCallback/React.memo to any `.ts`/`.tsx` file and confirming the linter raises a warning with a clear message. Documented exceptions with eslint-disable and a reason comment must be accepted.

**Acceptance Scenarios**:

1. **Given** the ESLint configuration with no-restricted-syntax rules, **When** a developer writes `useMemo(...)` in any component, **Then** ESLint reports a warning with a message explaining the React Compiler handles memoization automatically.
2. **Given** the ESLint configuration with no-restricted-syntax rules, **When** a developer writes `useCallback(...)` in any component, **Then** ESLint reports a warning with the same explanatory message.
3. **Given** the ESLint configuration with no-restricted-syntax rules, **When** a developer wraps a component in `memo(...)` or `React.memo(...)`, **Then** ESLint reports a warning.
4. **Given** a documented exception (MarkdownInput ecosystem, class error boundaries), **When** the file uses an eslint-disable comment with a reason, **Then** the linter suppression is accepted and the code passes lint.
5. **Given** the warn-level rules are validated across the full codebase, **When** all Phase 4 domain migrations are confirmed complete, **Then** the rules transition from warn to error level.

---

### User Story 2 - Documentation of No-Memoization Policy (Priority: P2)

As a new developer joining the project, I need clear documentation explaining that manual memoization is prohibited and the React Compiler handles optimization automatically, so that I follow the correct patterns from day one.

**Why this priority**: Documentation ensures the policy is discoverable and understood. Without it, developers may not know why lint rules exist or how to handle legitimate exceptions.

**Independent Test**: Can be tested by reading CLAUDE.md and confirming the no-memoization policy is clearly stated with guidance on exceptions.

**Acceptance Scenarios**:

1. **Given** the CLAUDE.md file, **When** a developer reads the Code Conventions section, **Then** they find clear guidance that useMemo/useCallback/React.memo are prohibited and the compiler handles optimization.
2. **Given** a developer encounters a lint warning for useMemo, **When** they check CLAUDE.md, **Then** they find instructions on how to document exceptions with eslint-disable and a reason comment.
3. **Given** the Biome configuration, **When** a developer reviews biome.json, **Then** the `useExhaustiveDependencies: 'off'` setting is documented as intentional (compiler handles dependency tracking).

---

### User Story 3 - Final Performance Validation (Priority: P3)

As a product owner, I need a final comprehensive performance report confirming the full migration has not degraded any client-facing metrics, so that the migration can be confidently shipped and monitored in production.

**Why this priority**: This is the final validation gate before the migration is considered complete. It produces the definitive before/after evidence.

**Independent Test**: Can be tested by running the benchmark suite, bundle analysis, and memory leak detection, and comparing results against the pre-migration baseline.

**Acceptance Scenarios**:

1. **Given** the full memoization migration is complete, **When** `pnpm benchmark` is run and compared against the pre-migration baseline, **Then** all Lighthouse metrics (FCP, LCP, TTI, TBT, CLS) are equal to or better than baseline.
2. **Given** a production build, **When** `pnpm analyze` is run, **Then** the total bundle size is stable or decreased compared to the pre-migration baseline (14.19 MB JS).
3. **Given** the migrated codebase, **When** `pnpm benchmark:memory` is run, **Then** no new memory leaks are detected by the 3-cycle leak detection.
4. **Given** each migration phase has shipped to production, **When** Sentry transaction traces and Elastic APM RUM data are reviewed for 1 week, **Then** no real-user performance regressions are observed.

---

### Edge Cases

- What happens when a developer adds useMemo inside a file that already has an eslint-disable for react-compiler? The no-restricted-syntax rule operates independently — the developer still receives a warning for useMemo even if react-compiler is suppressed.
- What happens when a new third-party library requires a memoized callback for reference equality? The developer documents the exception with an eslint-disable comment explaining the library requirement, and it is reviewed in PR review.
- What happens when the benchmark suite cannot run because the backend is unavailable? Bundle analysis (`pnpm analyze`) and test suite (`pnpm vitest run`) can still validate build correctness and bundle size without a running backend. Lighthouse benchmarks are deferred until backend is available.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: ESLint configuration MUST include `no-restricted-syntax` rules that flag useMemo, useCallback, and React.memo usage with descriptive warning messages.
- **FR-002**: Lint rules MUST initially be set to warn level, transitioning to error level once all domain migrations are validated complete (i.e., `pnpm eslint src/` reports zero no-restricted-syntax warnings outside documented exception files).
- **FR-003**: Documented exceptions MUST use eslint-disable with a reason comment explaining why manual memoization is necessary.
- **FR-004**: CLAUDE.md MUST be updated with a no-memoization policy section stating that useMemo/useCallback/React.memo are prohibited and the React Compiler handles optimization.
- **FR-005**: Biome's `useExhaustiveDependencies: 'off'` setting MUST be documented as intentional in CLAUDE.md (compiler handles dependency tracking).
- **FR-006**: A final benchmark comparison MUST be generated comparing post-migration metrics against the pre-migration baseline.
- **FR-007**: A final bundle analysis MUST be run and the size delta documented.
- **FR-008**: Memory leak detection MUST be run post-migration to confirm no regressions.
- **FR-009**: Post-deployment monitoring via Sentry and Elastic APM MUST be established for 1 week after each phase ships to production, using the Human Benchmarking Checklist from `specs/023-react-compiler-adoption/spec.md` as the regression threshold definition.
- **FR-010**: The quickstart guide at `specs/023-react-compiler-adoption/quickstart.md` MUST be validated end-to-end for accuracy.

## Assumptions

- The React Compiler memoization removal (Phases 1-4 from 023-react-compiler-adoption) is substantially complete, with only documented exceptions remaining.
- The pre-migration performance baseline has been captured and is available for comparison.
- The benchmark tooling (`pnpm benchmark`, `pnpm benchmark:compare`, `pnpm benchmark:memory`, `pnpm analyze`) is functional.
- Post-deployment monitoring (T058) is an ongoing observational task that will be tracked after deployment, not blocked on code changes.

## Scope Boundaries

**In scope**:
- Adding no-restricted-syntax ESLint rules for useMemo, useCallback, React.memo
- Updating CLAUDE.md with no-memoization policy
- Documenting Biome configuration choices
- Running final benchmark suite, bundle analysis, and memory leak detection
- Validating quickstart documentation accuracy
- Establishing post-deployment monitoring plan

**Out of scope**:
- Removing remaining memoization from code (covered by 023-react-compiler-adoption Phase 4)
- Changing React Compiler configuration
- Changing Biome rules beyond documentation
- Modifying the benchmark tooling itself

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any new useMemo/useCallback/React.memo usage in the codebase triggers a lint warning, preventing silent reintroduction.
- **SC-002**: CLAUDE.md contains a clear no-memoization policy discoverable by new developers within the Code Conventions section.
- **SC-003**: Final benchmark report shows all client-facing metrics (FCP, LCP, TTI, TBT, CLS) equal to or better than pre-migration baseline.
- **SC-004**: Bundle size does not increase beyond +0.5% of the pre-migration baseline (14.19 MB JS, threshold: 14.26 MB).
- **SC-005**: Memory leak detection confirms no new leaks introduced by the migration.
- **SC-006**: Lint rules correctly allow documented exceptions with eslint-disable and a reason comment.
