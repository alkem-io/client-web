# Implementation Plan: Ultra-Fast CI/CD Feedback Loop with Biome, Vitest & SWC

**Branch**: `020-fast-ci-feedback` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-fast-ci-feedback/spec.md`

## Summary

Replace ESLint + Prettier with Biome for linting/formatting and add SWC as the TypeScript/JSX transform layer for Vitest to achieve sub-30-second CI lint checks and faster test execution. This is a tooling-only migration with no application code changes beyond configuration files, CI workflows, and pre-commit hooks. The production build pipeline (Vite + React Compiler) remains unaffected.

## Technical Context

**Language/Version**: TypeScript ~5.8.3, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: Vite ^7.3.0, Vitest ^4.0.16, Biome (to add), @vitejs/plugin-react ^5.1.2, babel-plugin-react-compiler ^1.0.0
**Storage**: N/A (tooling change only)
**Testing**: Vitest ^4.0.16 with jsdom, @testing-library/react ^16.2.0, Istanbul coverage
**Target Platform**: macOS ARM64 (Apple Silicon M4 self-hosted CI runners), developer workstations (macOS/Linux)
**Project Type**: Web application (SPA)
**Performance Goals**: CI lint step < 30s, local lint < 5s, pre-commit hooks < 3s, test execution ≤ current baseline (~1.2s), total CI wall-clock reduction ≥ 30%
**Constraints**: All 247 tests must pass with zero regressions, zero critical lint rules lost, production Vite + React Compiler build unaffected
**Scale/Scope**: ~18k modules, 19 test files / 247 tests, 3 CI workflow files to modify

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Relevant? | Status | Notes |
|-----------|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | No | PASS | Tooling-only change, no domain code modified |
| II. React 19 Concurrent UX Discipline | No | PASS | No component changes; React Compiler remains in production builds only |
| III. GraphQL Contract Fidelity | Minor | PASS with action | `codegen.yml` post-hooks currently run `eslint --fix` and `prettier --write` on generated files — must be updated to use Biome equivalents |
| IV. State & Side-Effect Isolation | No | PASS | No runtime code changes |
| V. Experience Quality & Safeguards | Yes | PASS | Test suite must pass unchanged (SC-003); accessibility lint rules must be preserved (SC-007) |
| Arch #1: Feature directory taxonomy | No | PASS | No new directories in src/ |
| Arch #4: Build artifact determinism | Yes | PASS with action | Vitest config split must be documented; production Vite build is unchanged |
| Arch #5: Import transparency | Yes | PASS | Biome can enforce explicit imports (no barrel exports) |
| Governance: CI enforcement | Yes | PASS | This feature directly improves CI enforcement of linting/testing/type-checking |

**Gate Result**: PASS — No violations. Two minor actions required (codegen post-hooks, Vitest config documentation).

## Project Structure

### Documentation (this feature)

```text
specs/020-fast-ci-feedback/
├── plan.md              # This file
├── research.md          # Phase 0: ESLint-to-Biome rule mapping, SWC compatibility
├── data-model.md        # Phase 1: Configuration entity model
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: Configuration schemas
│   ├── biome-config.json
│   ├── vitest-config.md
│   └── ci-workflow-changes.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# Files to CREATE
biome.json                          # Biome linting + formatting configuration

# Files to MODIFY
vite.config.mjs                     # Extract Vitest config, keep React Compiler for prod
vitest.config.mts                   # New dedicated Vitest config with SWC transforms
package.json                        # Update scripts, add biome + @swc/core, remove eslint + prettier
.lintstagedrc.json                  # Switch to biome format + biome check
codegen.yml                         # Update post-hooks from eslint/prettier to biome
.github/workflows/ci-lint.yml       # Run biome check + tsc --noEmit in parallel
.github/workflows/ci-test.yml       # No command changes (SWC is internal to Vitest)
.github/workflows/ci-build.yml      # No changes expected

# Files to DELETE (FR-011: atomic switchover)
eslint.config.mjs                   # Replaced by biome.json
.prettierrc.yml                     # Replaced by biome.json formatter section
.prettierignore                     # Replaced by biome.json ignore patterns

# Files UNCHANGED
vite.sentry.config.mjs              # Production build, React Compiler stays
tsconfig.json                       # Path aliases consumed by SWC via vitest config
src/setupTests.ts                   # Test setup unchanged
```

**Structure Decision**: This is a tooling migration within the existing single-project structure. No new source directories are created. The main structural change is splitting the Vitest configuration out of `vite.config.mjs` into a dedicated `vitest.config.mts` to cleanly separate SWC test transforms from the production Vite+Babel build pipeline.

## Complexity Tracking

> No constitution violations requiring justification. The migration is a direct tooling swap with well-defined scope.

## Post-Phase 1 Constitution Re-Check

All design artifacts (research.md, data-model.md, contracts/, quickstart.md) have been reviewed against the constitution:

| Principle | Post-Design Status | Notes |
|-----------|-------------------|-------|
| III. GraphQL Contract Fidelity | PASS | Codegen post-hooks updated to use `biome check --fix --unsafe` + `biome format --write` (documented in research.md §7) |
| V. Experience Quality & Safeguards | PASS | All jsx-a11y rules mapped to Biome equivalents (research.md §1); `react-compiler/react-compiler` ESLint rule retained via minimal residual ESLint config (FR-003) |
| Arch #4: Build artifact determinism | PASS | Vitest config split documented in research.md §8; production Vite build unchanged |
| Arch #5: Import transparency | PASS | Biome `organizeImports` configured; no barrel exports |
| Governance: CI enforcement | PASS | ci-lint.yml runs tsc + biome in parallel (contracts/ci-workflow-changes.md) |

**Post-Design Gate Result**: PASS — All concerns resolved in design phase.
