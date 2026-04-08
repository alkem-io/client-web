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

- [x] T001 Audit current useMemo/useCallback/React.memo usage across src/ — 48 remaining usages: 10 in MarkdownInput ecosystem (documented exception), ~38 in pending domain migrations (T040-T042 from 023-react-compiler-adoption)
- [x] T002 Verify ESLint flat config structure in eslint.config.mjs — confirmed: uses @typescript-eslint/parser, eslint-plugin-react-compiler at error level, targets **/*.ts and **/*.tsx

**Checkpoint**: Codebase state understood. Ready to add lint rules.

---

## Phase 3: User Story 1 — Prevention of Memoization Reintroduction via Lint Rules (Priority: P1)

**Goal**: Add ESLint `no-restricted-syntax` rules that automatically flag any new usage of `useMemo`, `useCallback`, or `React.memo`/`memo()` with descriptive warning messages.

**Independent Test**: Add `useMemo(...)` to any `.tsx` file → ESLint reports a warning. Add `eslint-disable-next-line no-restricted-syntax -- reason` → warning suppressed. Run `pnpm eslint src/` → 0 errors, only warnings on documented exceptions.

### Implementation

- [x] T003 [US1] Add `no-restricted-syntax` rule at warn level to eslint.config.mjs with 4 AST selectors: `CallExpression[callee.name="useMemo"]`, `CallExpression[callee.name="useCallback"]`, `CallExpression[callee.name="memo"]`, `CallExpression[callee.object.name="React"][callee.property.name="memo"]` — each with descriptive message
- [x] T004 [US1] Validate rules against full codebase: run `pnpm eslint src/` — confirmed 0 errors, 48 warnings (all from documented exceptions + pending T040-T042 migrations)
- [x] T005 [US1] Validate documented exceptions: confirm MarkdownInput ecosystem files (10 files in src/core/ui/forms/) produce warnings (not errors) and can be suppressed with eslint-disable
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

- [x] T011 [US3] Run full test suite: `pnpm vitest run` — 592 tests passed, 3 skipped, 57 test files
- [x] T012 [US3] Run ESLint validation: `pnpm eslint src/` — 0 errors, 48 warnings
- [ ] T013 [P] [US3] Run production build: `pnpm build` — verify build succeeds with no new errors, record bundle size vs 14.19 MB JS baseline
- [ ] T014 [P] [US3] Run bundle analysis: `pnpm analyze` — generate interactive visualization at build/stats.html, document size delta in specs/041-react-compiler-lint-rules/
- [ ] T015 [US3] Run Lighthouse benchmarks: `pnpm benchmark --build-name "post-migration-final"` then `pnpm benchmark:compare pre-migration-baseline post-migration-final` — DEFERRED: requires running Alkemio backend at localhost:3000. Must be un-deferred and completed before merging to develop if backend becomes available. Uses Human Benchmarking Checklist from specs/023-react-compiler-adoption/spec.md as threshold definition.
- [ ] T016 [US3] Run memory leak detection: `pnpm benchmark:memory` — DEFERRED: requires running Alkemio backend at localhost:3000
- [ ] T017 [US3] Post-deployment monitoring: after changes ship to production, review Sentry transaction traces and Elastic APM RUM data for 1 week using the Human Benchmarking Checklist from specs/023-react-compiler-adoption/spec.md as regression thresholds — document findings in specs/041-react-compiler-lint-rules/

**Checkpoint**: Build succeeds. Bundle size validated. Lighthouse and memory benchmarks deferred until backend available.

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
- T006-T007 are blocked on external work (T040-T042 from 023-react-compiler-adoption) — they should be completed in a follow-up once the remaining domain migrations land
- T015-T017 are deferred — they require a running backend or production deployment
- The 48 ESLint warnings break down as: ~10 MarkdownInput ecosystem (permanent exceptions) + ~38 pending domain migrations
- Commit after each logical group of tasks
- PR description MUST note that Lighthouse/memory validation (T015-T016) is deferred pending backend availability and must complete before production release per Constitution Principle V (Experience Quality & Safeguards)
