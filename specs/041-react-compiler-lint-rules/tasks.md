# Tasks: React Compiler Lint Rules, Prevention & Final Validation

**Input**: Design documents from `/specs/041-react-compiler-lint-rules/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Tests**: No test tasks generated — the existing test suite (592 tests) and ESLint validation serve as regression gates. Each task validates with `pnpm vitest run` and/or `pnpm eslint src/`.

**Organization**: Tasks grouped by user story. US1 (P1) is the core deliverable. US2 (P2) is documentation. US3 (P3) is validation (partially deferred pending backend availability).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No setup needed — ESLint flat config and Biome are already configured. This feature modifies existing config files only.

*No tasks in this phase.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify the current state of memoization usage and existing linting infrastructure before adding rules.

- [x] T001 Audit current useMemo/useCallback/React.memo usage across src/ — 28 remaining ESLint-visible usages (down from 48 in the original March audit, as MUI removal + domain migrations landed since): collaborative editor / MarkdownInput ecosystem (documented exceptions) + a handful of pending domain hooks. `src/crd/app/**` is ESLint-ignored.
- [x] T002 Verify ESLint flat config structure in eslint.config.mjs — confirmed: uses @typescript-eslint/parser, eslint-plugin-react-compiler at error level, targets **/*.ts and **/*.tsx

**Checkpoint**: Codebase state understood. Ready to add lint rules.

---

## Phase 3: User Story 1 — Prevention of Memoization Reintroduction via Lint Rules (Priority: P1)

**Goal**: Add ESLint `no-restricted-syntax` rules that automatically flag any new usage of `useMemo`, `useCallback`, or `React.memo`/`memo()` with descriptive warning messages.

**Independent Test**: Add `useMemo(...)` to any `.tsx` file → ESLint reports a warning. Add `eslint-disable-next-line no-restricted-syntax -- reason` → warning suppressed. Run `pnpm eslint src/` → 0 errors, only warnings on documented exceptions.

### Implementation

- [x] T003 [US1] Add `no-restricted-syntax` rule at warn level to eslint.config.mjs with 4 AST selectors: `CallExpression[callee.name="useMemo"]`, `CallExpression[callee.name="useCallback"]`, `CallExpression[callee.name="memo"]`, `CallExpression[callee.object.name="React"][callee.property.name="memo"]` — each with descriptive message
- [x] T004 [US1] Validate rules against full codebase: run `pnpm eslint .` — confirmed 0 errors, 28 warnings (all from documented exceptions + pending domain migrations); `pnpm lint` (typecheck + biome ci + eslint) exits 0
- [x] T005 [US1] Validate documented exceptions: confirm collaborative editor / MarkdownInput ecosystem files produce warnings (not errors) and can be suppressed with eslint-disable
- [ ] T006 [US1] Transition rules from warn to error: change the severity of the `no-restricted-syntax` rule from `'warn'` to `'error'` in eslint.config.mjs — BLOCKED: requires T040-T042 (domain/common, domain/space, domain/collaboration) from 023-react-compiler-adoption to be complete first. Validated complete = `pnpm eslint src/` reports zero no-restricted-syntax warnings outside documented exception files.
- [ ] T007 [US1] After T006: add eslint-disable comments with reasons to all documented exception files in src/core/ui/forms/MarkdownInput/ and src/core/ui/forms/CollaborativeMarkdownInput/ — reason: "TipTap editor lifecycle requires stable callback/memo references"

**Checkpoint**: Lint rules active at warn level. Any new useMemo/useCallback/memo() usage triggers a warning. Transition to error blocked on T040-T042.

---

## Phase 4: User Story 2 — Documentation of No-Memoization Policy (Priority: P2)

**Goal**: Update CLAUDE.md and project documentation so that new developers discover the no-memoization policy and understand how to handle exceptions.

**Independent Test**: Read CLAUDE.md "State & Hooks" section → find clear prohibition of useMemo/useCallback/React.memo with exception instructions. Read "React Compiler benefits" section → find updated language. Search for `useExhaustiveDependencies` → find explanation that it is intentionally off.

### Implementation

- [x] T008 [P] [US2] Update "State & Hooks" section in CLAUDE.md: replace useMemo/useCallback guidance with prohibition policy, add eslint-disable exception instructions, document Biome `useExhaustiveDependencies: 'off'` as intentional
- [x] T009 [US2] Update "React Compiler benefits" section in CLAUDE.md: change "reduces need" to "eliminates the need" (prohibited), add compiler dependency tracking note
- [x] T010 [US2] Verify biome.json `useExhaustiveDependencies: 'off'` in correctness rules — confirmed present, documented in CLAUDE.md

**Checkpoint**: Documentation complete. New developers can discover the policy from CLAUDE.md.

---

## Phase 5: User Story 3 — Final Performance Validation (Priority: P3)

**Goal**: Run the final validation suite to confirm the migration has not degraded any client-facing metrics. Produce the definitive before/after evidence.

**Independent Test**: Run `pnpm vitest run` → all tests pass. Run `pnpm build` → succeeds. Run `pnpm analyze` → bundle size stable vs 14.19 MB baseline. Run `pnpm benchmark:compare` (when backend available) → no regressions.

### Implementation

- [x] T011 [US3] Run full test suite: `pnpm vitest run` — 1940 passed, 2 skipped, 232 test files. One pre-existing failure (`src/main/assistant/__tests__/budgetMeter.test.tsx`) is a locale/`Intl.NumberFormat` grouping-separator mismatch (local ICU renders `25 000`, test expects `25,000`); it is unrelated to this PR (0 `src/` changes) and passes in the CI en-US locale.
- [x] T012 [US3] Run ESLint validation: `pnpm eslint .` — 0 errors, 28 warnings
- [x] T013 [P] [US3] Run production build: `pnpm build` — succeeds in ~48s, 0 errors. Production bundle: 15.26 MB JS raw / 516 chunks + 0.37 MB CSS. See `benchmark-results.md`. NB: the +7.5% vs the 14.19 MB March baseline reflects 471 commits of product work since (net of full MUI removal), **not** this build-neutral PR (which adds only a lint rule + docs and touches no runtime code).
- [x] T014 [P] [US3] Bundle size measured directly from `build/` output and recorded in `benchmark-results.md`. (`build/stats.html` visualization requires `pnpm analyze` / `ANALYZE=true` and was not regenerated — not needed to record the size delta.)
- [x] T015 [US3] Run Lighthouse benchmarks: served the production build on `localhost:3000` and ran `node scripts/performance-benchmark.mjs post-migration-final`. Results in `benchmark-results.md`. NB: routes load as static shells (no GraphQL backend), and the March baseline was a dev-server capture, so the numbers are a fresh snapshot rather than a rigorous before/after — see the caveats in the report.
- [x] T016 [US3] Memory profiling captured as part of the `performance-benchmark.mjs` run (per-route peak/heap + leak-trend heuristic); recorded in `benchmark-results.md`.
- [ ] T017 [US3] Post-deployment monitoring: after changes ship to production, review Sentry transaction traces and Elastic APM RUM data for 1 week using the Human Benchmarking Checklist from specs/023-react-compiler-adoption/spec.md as regression thresholds — document findings in specs/041-react-compiler-lint-rules/

**Checkpoint**: Build succeeds. Bundle size, Lighthouse, and memory captured against the served production build (see `benchmark-results.md`). Only post-deployment RUM monitoring (T017) remains, pending a production release.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and quickstart validation

- [ ] T018 [P] Validate quickstart guide: follow specs/041-react-compiler-lint-rules/quickstart.md end-to-end, confirm all commands and examples are accurate
- [ ] T019 [P] Validate parent quickstart: follow specs/023-react-compiler-adoption/quickstart.md end-to-end, confirm documentation accuracy post-migration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately
- **US1 Lint Rules (Phase 3)**: Depends on Phase 2 completion. T006-T007 blocked on external dependency (T040-T042 from 023-react-compiler-adoption)
- **US2 Documentation (Phase 4)**: Can run in parallel with Phase 3 (different files)
- **US3 Validation (Phase 5)**: Can run in parallel with Phase 3 and 4. T015-T017 deferred (require backend/production)
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1) Lint Rules**: Can start after Foundational. Core tasks (T003-T005) are independent. T006-T007 blocked on external migration work.
- **US2 (P2) Documentation**: Independent of US1 — modifies different files (CLAUDE.md vs eslint.config.mjs)
- **US3 (P3) Validation**: Independent of US1 and US2. T013-T014 can run immediately. T015-T017 deferred.

### External Dependencies

- **T040-T042 from 023-react-compiler-adoption**: Remove memoization from domain/common, domain/space, domain/collaboration. Blocks T006 (warn → error transition).
- **Running Alkemio backend**: Blocks T015 (Lighthouse), T016 (memory). Not needed for T013-T014 (build, bundle analysis).
- **Production deployment**: Blocks T017 (post-deployment monitoring).

### Parallel Opportunities

- T008 and T009 (documentation tasks) can run in parallel (different sections of CLAUDE.md)
- T013 and T014 (build and analysis) can run in parallel
- US1 (Phase 3) and US2 (Phase 4) can run in parallel (different files)

---

## Implementation Strategy

### MVP First (US1 Only — Phase 3)

1. Complete Phase 2: Audit codebase state
2. Complete Phase 3: Add lint rules at warn level
3. **STOP and VALIDATE**: `pnpm eslint src/` → 0 errors, warnings only on known files
4. This alone prevents reintroduction — the primary goal of the issue

### Incremental Delivery

1. Foundational → Codebase audit complete
2. Add US1 (Lint Rules) → Warn-level enforcement active → MVP done
3. Add US2 (Documentation) → Policy discoverable by developers
4. Add US3 (Validation) → Build + bundle verified → Benchmarks when backend available
5. T006 (warn → error) → After T040-T042 complete externally

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- T006-T007 are blocked on external work (remaining domain memoization migrations) — they should be completed in a follow-up once those land and `pnpm eslint .` reports zero `no-restricted-syntax` warnings outside documented exception files
- T017 is deferred — it requires a production deployment + one week of observation
- The 28 ESLint warnings are all warn-level (0 errors): collaborative editor / MarkdownInput ecosystem (permanent exceptions) + a handful of pending domain hooks
- Commit after each logical group of tasks
- PR description MUST note that Lighthouse/memory validation (T015-T016) is deferred pending backend availability and must complete before production release per Constitution Principle V (Experience Quality & Safeguards)
