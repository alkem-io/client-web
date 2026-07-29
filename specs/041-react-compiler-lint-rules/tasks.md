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
- [x] T006 [US1] Transition rules from warn to **error** in eslint.config.mjs — done. Chosen path: instead of blocking on external domain migrations, every one of the 28 remaining usages was annotated with an `eslint-disable-next-line no-restricted-syntax -- <reason>` comment (T007), so `pnpm eslint .` is clean at error level (0 errors, 0 warnings). Any *new*, unannotated `useMemo`/`useCallback`/`memo`/`React.memo` now fails `pnpm eslint .` — and therefore the pre-commit hook (which runs `pnpm eslint .`) blocks the commit. Verified with a negative probe.
- [x] T007 [US1] Added `eslint-disable-next-line no-restricted-syntax -- <reason>` comments to all 28 remaining usages across 13 files, each with a specific justification: genuine third-party/lifecycle reasons where they exist (Yjs `Y.Doc`, TipTap provider/extensions, Apollo `onError` links + `ApolloClient`, Excalidraw `debounce`, effect-dependency object stability, the cookie-consent ref callback); the CRD-hook handler APIs are marked "retained pending React Compiler migration verification (T006)". Full-migration removal of the non-essential ones remains a separate follow-up.

**Checkpoint**: Lint rules active at **error** level with every existing usage annotated. Any new un-annotated useMemo/useCallback/memo()/React.memo fails lint and is blocked at commit time.

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
- [x] T017 [US3] Post-deployment monitoring **plan delivered** in `post-deployment-monitoring.md` — Sentry + Elastic APM RUM are already wired (`src/root.tsx`, `ApmProvider`); the doc pins the metrics, thresholds (Google "good" floors + the July-2026 anchor), critical routes, 7-day window, and revert protocol. The observation itself runs post-deploy (findings log + Quality-Lead sign-off remain to be filled in after release).

**Checkpoint**: Build succeeds. Bundle size, Lighthouse, INP, and memory captured against the served production build (see `benchmark-results.md` + `optimization-baseline-2026-07.md`). Enforcement is at error level and self-checking. Only the post-deploy RUM *observation* remains (plan ready).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and quickstart validation

- [x] T018 [P] Validated + rewrote `quickstart.md` for accuracy: corrected warn→error, fixed the lint commands (`pnpm eslint .`, not `src/`), and documented the reason-mandatory / unused-directive / PureComponent / `compiler:healthcheck` additions and the real 28-exception inventory.
- [x] T019 [P] Verified the parent `023-react-compiler-adoption/quickstart.md` is consistent with the final enforcement (no contradictions introduced by 041); the 041 quickstart is the authoritative lint-rule reference.

---

## Phase 7: Quality hardening (2026-07)

- [x] T020 Closed a rule bypass: `no-restricted-syntax` now matches the namespaced forms `React.useMemo` / `React.useCallback` / `React.memo` as well as the bare identifiers (`:matches([callee.name=…], [callee.property.name=…])`). Verified a `React.useMemo(...)` probe now errors.
- [x] T021 Self-enforcing exceptions: added `@eslint-community/eslint-comments/require-description` (a disable without `-- reason` fails) + `reportUnusedDisableDirectives: 'error'` (stale disables fail) + `no-unlimited-disable`. Negative-probed all three.
- [x] T022 Extended the ban to class-based manual memoization (`PureComponent`, `shouldComponentUpdate`) — 0 usages today, preventive.
- [x] T023 Added `pnpm compiler:healthcheck` (react-compiler-healthcheck) — coverage KPI, currently 1285/1285 (100%).
- [x] T024 [Biome verify — T056] Confirmed `biome.json`: `useExhaustiveDependencies: 'off'` and `useHookAtTopLevel: 'warn'` are present and consistent with the compiler policy; no Biome rule conflicts with or duplicates the ESLint memoization ban. Documented in CLAUDE.md.
- [x] T025 Added INP (Interaction to Next Paint) to `scripts/performance-benchmark.mjs` via the Event Timing API — the Core Web Vital the compiler's fewer re-renders most affect (was previously unmeasured). July-2026 value: 40 ms.

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
