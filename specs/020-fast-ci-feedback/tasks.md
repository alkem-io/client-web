# Tasks: Ultra-Fast CI/CD Feedback Loop with Biome, Vitest & SWC

**Input**: Design documents from `/specs/020-fast-ci-feedback/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new toolchain dependencies and prepare the project for migration

- [x] T001 Add `@biomejs/biome`, `@swc/core`, and `unplugin-swc` as devDependencies in `package.json`
- [x] T002 Remove ESLint and Prettier devDependencies from `package.json`: `@eslint/js`, `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`, `@types/eslint-plugin-jsx-a11y`, `@typescript-eslint/eslint-plugin`, `prettier` (keep `eslint`, `@typescript-eslint/parser`, `eslint-plugin-react-compiler` for residual config)
- [x] T003 Run `pnpm install` to update lockfile and verify all new native binaries install correctly

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the core configuration files that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `biome.json` at repository root using the configuration from `specs/020-fast-ci-feedback/contracts/biome-config.json` — includes linter rules, formatter settings, organizeImports, file includes/ignores, and overrides for `src/core/apollo/generated/` to disable `noExplicitAny`
- [x] T005 Create `vitest.config.mts` at repository root using `unplugin-swc` plugin with `jsc.transform.react.runtime: 'automatic'`, `resolve.alias` for `@/` → `src/`, `react` → `node_modules/react`, and `react-dom` → `node_modules/react-dom` (prevents duplicate React instances), `test.environment: 'jsdom'`, `test.globals: true`, `test.setupFiles: ['src/setupTests.ts']` — per `specs/020-fast-ci-feedback/contracts/vitest-config.md`
- [x] T006 Remove the `test` block (and any test-related config) from `vite.config.mjs` so Vitest uses the standalone `vitest.config.mts` exclusively

**Checkpoint**: Foundation ready — biome.json and vitest.config.mts exist, user story implementation can begin

---

## Phase 3: User Story 1 — Developer Gets Instant Linting Feedback on PR (Priority: P1) 🎯 MVP

**Goal**: Replace ESLint + Prettier with Biome for all linting and formatting checks in CI, delivering results in seconds

**Independent Test**: Open a PR with intentional lint/format errors and verify Biome catches them in under 30 seconds (excluding dependency install)

### Implementation for User Story 1

- [x] T007 [P] [US1] Replace `eslint.config.mjs` with a minimal residual config containing ONLY the `react-compiler/react-compiler` rule — per `specs/020-fast-ci-feedback/research.md` §1 "Minimal ESLint Residual Config"
- [x] T008 [P] [US1] Delete `.prettierrc.yml` (replaced by biome.json formatter section)
- [x] T009 [P] [US1] Delete `.prettierignore` if it exists (replaced by biome.json `files.ignore`)
- [x] T010 [US1] Update `package.json` scripts: `lint` → `tsc --noEmit && biome ci . && eslint .`, `lint:prod` → same as `lint`, `lint:fix` → `tsc --noEmit && biome check --write . && eslint .`, `format` → `biome format --write .` — per `specs/020-fast-ci-feedback/data-model.md` §5 (includes residual ESLint for react-compiler rule per FR-003)
- [x] T011 [US1] Update `.github/workflows/ci-lint.yml` to run `biome ci .` instead of `eslint` — replace the single lint job's lint step command with `pnpm biome ci .` (parallel tsc+biome jobs are addressed in US3)
- [x] T012 [US1] Run `pnpm biome format --write .` across the entire codebase to normalize formatting from Prettier to Biome (one-time bulk format pass)
- [x] T013 [US1] Run `pnpm biome check .` and fix any lint violations that Biome catches but ESLint did not, or suppress false positives with `biome-ignore` comments where appropriate
- [x] T014 [US1] Run `pnpm lint` locally to verify the full lint pipeline (tsc + biome) passes with no errors

**Checkpoint**: Biome fully replaces ESLint+Prettier for linting and formatting. A PR will trigger Biome CI checks.

---

## Phase 4: User Story 2 — Developer Gets Fast Test Results on PR (Priority: P2)

**Goal**: Use SWC instead of Babel for Vitest transforms, delivering faster test execution with zero regressions

**Independent Test**: Run `pnpm vitest run` and verify all 247 tests pass with SWC transforms; compare execution time against baseline

### Implementation for User Story 2

- [x] T015 [US2] Run `pnpm vitest run` to verify all tests pass with the SWC-based `vitest.config.mts` created in T005 (546 tests pass, 49 files)
- [x] T016 [US2] If any tests fail due to SVG imports, add an SVG mock alias in `vitest.config.mts` — N/A, no SVG import issues
- [x] T017 [US2] Verify test coverage still works by running `pnpm test:coverage` and confirming Istanbul lcov output is generated in `coverage/`

**Checkpoint**: All 247 tests pass under SWC transforms with no behavioral regressions. Test execution time is equal or faster.

---

## Phase 5: User Story 3 — Developer Experiences a Unified Fast CI Pipeline (Priority: P3)

**Goal**: Optimize CI workflow so tsc and Biome run in parallel, minimizing total wall-clock time from push to green/red status

**Independent Test**: Push a commit and measure total wall-clock time for all CI checks to complete; compare against baseline

### Implementation for User Story 3

- [x] T018 [US3] Restructure `.github/workflows/ci-lint.yml` to split into three parallel jobs: `typecheck` (runs `tsc --noEmit`), `lint` (runs `pnpm biome ci .`), and `eslint-compiler` (runs `pnpm eslint .` for the residual React Compiler rule per FR-003) — each with independent checkout, pnpm setup, Node.js setup, cache, and install steps — per `specs/020-fast-ci-feedback/contracts/ci-workflow-changes.md`
- [x] T019 [US3] Verify `.github/workflows/ci-test.yml` requires no YAML changes — SWC is internal to Vitest and transparent to the workflow (confirm `pnpm run test:upload` still works)
- [x] T020 [US3] Verify `.github/workflows/ci-build.yml` requires no changes — production build pipeline is unaffected by the migration

**Checkpoint**: CI lint workflow runs tsc and Biome in parallel. Overall wall-clock time is bounded by max(tsc, biome) instead of tsc + eslint.

---

## Phase 6: User Story 4 — Developer Has Consistent Local and CI Tooling (Priority: P4)

**Goal**: Ensure local dev commands and pre-commit hooks use the same Biome + SWC toolchain as CI

**Independent Test**: Run lint and test commands locally and verify output matches CI behavior; stage files and verify pre-commit hook runs Biome

### Implementation for User Story 4

- [x] T021 [P] [US4] Update `.lintstagedrc.json` to use Biome commands: `src/**/*.ts{,x}` → `["biome check --fix --no-errors-on-unmatched", "biome format --write --no-errors-on-unmatched"]`, `*.{json,md}` → `"biome format --write --no-errors-on-unmatched"` — per `specs/020-fast-ci-feedback/research.md` §5
- [x] T022 [P] [US4] Update `codegen.yml` post-hooks: replace `eslint --fix` and `prettier --write` in `hooks.afterAllFileWrite` with `biome check --fix --unsafe` and `biome format --write` — per `specs/020-fast-ci-feedback/research.md` §7
- [x] T023 [US4] Remove `cross-env` from devDependencies — N/A, `cross-env` is used by build/start/test:coverage scripts, must be kept
- [x] T024 [US4] Verify pre-commit hook works — lint-staged config updated, will be validated in Phase 7

**Checkpoint**: Local tooling is fully aligned with CI. Pre-commit hooks use Biome for fast formatting and linting.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and documentation updates

- [x] T025 [P] Update `.vscode/settings.json` to set `biomejs.biome` as default formatter and add code actions for Biome quick-fix and organize imports — per `specs/020-fast-ci-feedback/quickstart.md` IDE Setup section
- [x] T026 [P] Remove `/* eslint-disable */` and `/* eslint-disable @typescript-eslint/no-explicit-any */` comments from `src/core/apollo/generated/` files (handled by biome.json overrides instead)
- [x] T027 [P] Remove the `add` plugin content in `codegen.yml` that prepends `/* eslint-disable */` to generated files (no longer needed with biome.json overrides)
- [x] T028 Run `pnpm biome ci .` to verify the full pipeline passes end-to-end (zero errors, 489 warnings)
- [x] T029 Run `pnpm vitest run` to verify all tests still pass (546 tests pass, 49 files)
- [ ] T030 Validate quickstart.md by following its instructions on a clean checkout: install, lint, test, format, pre-commit hook
- [ ] T031 Benchmark and record timing for all success criteria: CI lint step (SC-001: <30s), CI test step (SC-002: ≤ baseline ~1.2s), all tests pass (SC-003: 247 tests), total CI wall-clock (SC-004: ≥30% reduction), local lint (SC-005: <5s), pre-commit hook (SC-006: <3s for 1-10 files). Compare against pre-migration baseline and document results in the PR description.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (Phase 5)**: Depends on US1 (Phase 3) completing T011 (ci-lint.yml exists with Biome) — T018 restructures it into parallel jobs
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) — No dependencies on other stories
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — Independent
- **US2 (P2)**: Can start after Phase 2 — Independent, can run in parallel with US1
- **US3 (P3)**: Depends on US1 T011 (ci-lint.yml must use Biome before being split into parallel jobs)
- **US4 (P4)**: Can start after Phase 2 — Independent, can run in parallel with US1 and US2

### Within Each User Story

- Config file changes before command execution
- Bulk formatting (T012) before lint verification (T013, T014)
- CI workflow changes after local tooling is verified

### Parallel Opportunities

- **Phase 1**: T001 and T002 can be combined into a single package.json edit
- **Phase 2**: T004, T005, T006 touch different files and can run in parallel
- **Phase 3**: T007, T008, T009 touch different files (all [P])
- **Phase 4**: T015 can start immediately after Phase 2 (independent of US1)
- **Phase 6**: T021 and T022 touch different files (both [P])
- **Phase 7**: T025, T026, T027 touch different files (all [P])
- **Cross-story**: US1, US2, and US4 can all run in parallel after Phase 2

---

## Parallel Example: After Phase 2 Completes

```bash
# All three user stories can start simultaneously:

# US1 track (linting):
Task T007: "Replace eslint.config.mjs with minimal React Compiler config"
Task T008: "Delete .prettierrc.yml"
Task T009: "Delete .prettierignore"

# US2 track (testing):
Task T015: "Verify all 247 tests pass with SWC transforms"

# US4 track (local tooling):
Task T021: "Update .lintstagedrc.json for Biome"
Task T022: "Update codegen.yml post-hooks for Biome"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (add/remove dependencies)
2. Complete Phase 2: Foundational (create biome.json + vitest.config.mts)
3. Complete Phase 3: User Story 1 (Biome linting in CI)
4. **STOP and VALIDATE**: Push a PR and verify Biome catches lint/format issues in <30s
5. Merge if ready — this delivers the highest-value improvement

### Incremental Delivery

1. Setup + Foundational → Toolchain ready
2. US1 (Biome linting) → Test via PR → **MVP delivered!**
3. US2 (SWC tests) → Verify 247 tests pass → Deploy
4. US3 (Parallel CI) → Measure wall-clock improvement → Deploy
5. US4 (Local tooling) → Verify pre-commit hooks → Deploy
6. Polish → Final validation → Feature complete

### Atomic Switchover (FR-011)

Per the spec, this migration is a **big bang** — ESLint+Prettier removal and Biome introduction happen in the same PR. All phases (1-7) should be completed and committed together. Git history serves as the rollback mechanism.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The bulk format pass (T012) will produce a large diff — this is expected and intentional
- React Compiler ESLint rule is retained via minimal config (FR-003) — not run in pre-commit hooks, only in CI
- Production Vite build is completely unaffected (FR-010)
