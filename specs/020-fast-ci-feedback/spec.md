# Feature Specification: Ultra-Fast CI/CD Feedback Loop with Biome, Vitest & SWC

**Feature Branch**: `020-fast-ci-feedback`
**Created**: 2026-03-10
**Status**: Draft
**Input**: User description: "create an ultra-fast feedback loop for ci-cd with biome-vitest-swc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Gets Instant Linting Feedback on PR (Priority: P1)

A developer pushes a commit or opens a pull request. The CI pipeline runs Biome for linting and formatting checks and returns results within seconds, not minutes. The developer sees pass/fail status before context-switching away from the code.

**Why this priority**: Linting is the most frequently triggered check and currently the slowest bottleneck when combining TypeScript type-checking with ESLint. Replacing ESLint + Prettier with Biome delivers the single largest speed improvement.

**Independent Test**: Can be fully tested by opening a PR with intentional lint errors and verifying Biome catches them and reports results in under 30 seconds (excluding dependency install time).

**Acceptance Scenarios**:

1. **Given** a PR with formatting violations, **When** CI runs, **Then** Biome reports specific file locations and rule violations within the linting step.
2. **Given** a PR with clean code, **When** CI runs, **Then** Biome linting passes and the total lint job completes significantly faster than the current ESLint-based pipeline.
3. **Given** a developer's local environment, **When** they run the lint command locally, **Then** Biome produces the same results as CI (no environment-specific differences).

---

### User Story 2 - Developer Gets Fast Test Results on PR (Priority: P2)

A developer pushes code and the CI pipeline runs the full test suite using Vitest with SWC as the transform layer. Test results return quickly, giving the developer confidence to iterate without long waits.

**Why this priority**: Tests are the second most critical feedback signal. Using SWC instead of Babel/esbuild for TypeScript transformation in Vitest reduces per-file transform overhead across the ~18k module codebase.

**Independent Test**: Can be fully tested by running the test suite with SWC transforms and comparing execution time against the current configuration.

**Acceptance Scenarios**:

1. **Given** a PR that modifies application code, **When** CI runs the test job, **Then** all existing tests pass with the SWC-based Vitest configuration.
2. **Given** the current test suite (19 files / 247 tests), **When** run with SWC transforms, **Then** total test execution time is equal to or faster than the current baseline.
3. **Given** a test that imports TypeScript/TSX modules, **When** SWC transforms the code, **Then** the behavior is identical to the current transform pipeline (no regressions).

---

### User Story 3 - Developer Experiences a Unified Fast CI Pipeline (Priority: P3)

The three CI jobs (lint, test, build) are optimized to run in parallel with shared dependency caching, and each individual job completes faster due to the Biome/SWC toolchain. The overall wall-clock time from push to green/red status is minimized.

**Why this priority**: Individual tool speed matters, but the end-to-end developer experience depends on the slowest parallel job. Optimizing the pipeline holistically ensures developers get the full benefit.

**Independent Test**: Can be tested by measuring total wall-clock time from push to all-checks-complete on a typical PR, compared to the current baseline.

**Acceptance Scenarios**:

1. **Given** a PR is opened, **When** all CI jobs complete, **Then** the total wall-clock time from push to final status is noticeably reduced compared to the current pipeline.
2. **Given** the CI pipeline runs lint, test, and build in parallel, **When** dependency installation is required, **Then** pnpm cache is utilized effectively so install time is minimal.

---

### User Story 4 - Developer Has Consistent Local and CI Tooling (Priority: P4)

Developers can run the same Biome checks and SWC-powered Vitest locally via simple pnpm scripts. Pre-commit hooks use Biome instead of ESLint + Prettier, ensuring local and CI environments produce identical results.

**Why this priority**: Fast CI is only valuable if developers can also get fast local feedback. Consistency between local and CI prevents "works on my machine" issues.

**Independent Test**: Can be tested by running lint and test commands locally and verifying output matches CI behavior.

**Acceptance Scenarios**:

1. **Given** a developer has the project checked out, **When** they run the lint command, **Then** Biome checks execute locally with sub-second startup time.
2. **Given** a developer stages files for commit, **When** the pre-commit hook runs, **Then** Biome formats and lints staged files quickly (replacing the current ESLint + Prettier hook).

---

### Edge Cases

- What happens when Biome rules differ from the existing ESLint rules? Some code patterns currently allowed may be flagged, or vice versa. A migration pass is needed.
- What happens when a dependency or imported type is incompatible with SWC transforms? The project uses React Compiler (babel-plugin-react-compiler) which may need compatibility validation with SWC for the test pipeline.
- What happens when Biome does not have an equivalent rule for a critical ESLint rule? **Decision**: Unmapped rules are retained via a minimal ESLint config running alongside Biome (see FR-003).
- How does the React Compiler babel plugin interact with SWC in the Vitest context? **Decision**: React Compiler plugin is omitted from Vitest config entirely. SWC handles only TS/JSX transforms for tests. React Compiler remains active only in the production Vite build pipeline.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CI pipeline MUST use Biome for all linting and formatting checks, replacing ESLint and Prettier in CI workflows.
- **FR-002**: The CI pipeline MUST use Vitest with SWC as the TypeScript/JSX transform layer for running tests.
- **FR-003**: All existing lint rules that have Biome equivalents MUST be migrated. Rules without equivalents MUST be retained via a minimal ESLint configuration running only the unmapped rules alongside Biome. The rule migration map MUST document each unmapped rule and its retention rationale.
- **FR-004**: All existing tests (19 files / 247 tests) MUST continue to pass with the new SWC-based Vitest configuration with no behavioral regressions.
- **FR-005**: Local developer commands (`pnpm lint`, `pnpm test`, `pnpm format`) MUST use the same Biome and SWC-based Vitest toolchain as CI.
- **FR-006**: Pre-commit hooks MUST be updated to use Biome for formatting and linting staged files.
- **FR-007**: The Biome configuration MUST enforce the project's existing code style conventions (path aliases, naming conventions, import ordering).
- **FR-008**: TypeScript type-checking (`tsc --noEmit`) MUST remain since Biome does not perform type-aware analysis. Within the lint CI job, type-checking and Biome MUST run in parallel to minimize wall-clock time.
- **FR-009**: The CI workflows MUST continue to run on self-hosted Apple Silicon (M4) runners with pnpm caching.
- **FR-010**: The production build pipeline (Vite + React Compiler) MUST NOT be affected by the SWC migration—SWC is scoped to Vitest transforms only.
- **FR-011**: The migration from ESLint+Prettier to Biome MUST be executed as a single atomic switchover (big bang), removing ESLint and Prettier configuration and dependencies in the same PR that introduces Biome. Old ESLint and Prettier config files MUST be deleted (not retained as backups); git history serves as the rollback mechanism.

### Key Entities

- **Biome Configuration** (`biome.json`): Central configuration defining lint rules, formatting rules, and file patterns. Maps from the existing ESLint + Prettier configuration.
- **Vitest Configuration**: Test runner configuration updated to use SWC for TypeScript/JSX transforms instead of the current transform pipeline.
- **CI Workflow Definitions** (`.github/workflows/ci-*.yml`): Existing GitHub Actions workflows (from 019-optimize-ci-builds) modified in-place to use Biome commands and SWC-powered Vitest.
- **Rule Migration Map**: A documented mapping of ESLint rules to Biome equivalents, identifying gaps and decisions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The CI linting step completes in under 30 seconds (excluding dependency installation), compared to the current ESLint + TypeScript check duration.
- **SC-002**: The CI test step with SWC transforms completes in equal or less time than the current Vitest configuration.
- **SC-003**: All 247 existing tests pass with zero behavioral regressions under the new SWC transform configuration.
- **SC-004**: The total wall-clock time from push to all-CI-checks-complete is reduced by at least 30% compared to the current pipeline.
- **SC-005**: Local lint execution (excluding type-checking) completes in under 5 seconds for the full codebase.
- **SC-006**: Pre-commit hooks complete formatting and linting of staged files in under 3 seconds for a typical changeset (1-10 files).
- **SC-007**: Zero critical lint rules are lost in the migration—all security-related and correctness-related ESLint rules have Biome equivalents or documented alternatives.

## Clarifications

### Session 2026-03-11

- Q: How should the migration from ESLint+Prettier to Biome be executed? → A: Big bang — remove ESLint+Prettier and add Biome in a single atomic PR.
- Q: When an ESLint rule has no Biome equivalent, what should the default disposition be? → A: Keep via minimal ESLint — retain a stripped-down ESLint config running only unmapped rules alongside Biome.
- Q: If SWC cannot handle React Compiler transforms in Vitest, what is the fallback? → A: Skip React Compiler in tests — use SWC for TS/JSX only, omit the React Compiler babel plugin in Vitest config.
- Q: Should CI workflows be new files or modifications to existing ones from 019? → A: Modify existing — update the current `.github/workflows/ci-*.yml` files in-place to use Biome/SWC commands.
- Q: Should old ESLint+Prettier config files be retained as a rollback safety net? → A: Remove entirely — delete old configs; rely on git history/PR revert for rollback.

## Assumptions

- Biome has sufficient rule coverage for the project's ESLint configuration. Any gaps will be documented and addressed per FR-003.
- SWC can handle the project's TypeScript + JSX + path alias configuration without issues in the Vitest context.
- The React Compiler babel plugin is only needed for production builds (Vite), not for test transforms (Vitest/SWC). Tests do not depend on React Compiler optimizations for correctness. The React Compiler plugin MUST be omitted from the Vitest/SWC config.
- The self-hosted Apple Silicon runners have native ARM64 binaries available for Biome and SWC (both ship native ARM64 builds).
- The existing pnpm caching strategy remains effective with the new toolchain dependencies added.
