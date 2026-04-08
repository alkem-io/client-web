# Implementation Plan: React Compiler Lint Rules, Prevention & Final Validation

**Branch**: `041-react-compiler-lint-rules` | **Date**: 2026-03-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/041-react-compiler-lint-rules/spec.md`

## Summary

Add ESLint `no-restricted-syntax` rules to prevent reintroduction of manual memoization (`useMemo`, `useCallback`, `React.memo`), update CLAUDE.md with the no-memoization policy, document Biome config choices, and run final validation (tests, lint, build, bundle analysis). This locks in the React Compiler adoption gains from 023-react-compiler-adoption.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0
**Primary Dependencies**: ESLint (flat config with react-compiler plugin), Biome 2.4.6, Vite, React Compiler (babel-plugin-react-compiler)
**Storage**: N/A (config and documentation changes only)
**Testing**: Vitest (592 tests), ESLint validation, production build
**Target Platform**: Web (SPA served by Vite)
**Project Type**: Web application (React SPA)
**Performance Goals**: No regression from pre-migration baseline (14.19 MB JS, Lighthouse scores stable)
**Constraints**: Warn-level rules initially (T040-T042 still pending); error level after domain migrations complete
**Scale/Scope**: 2 config files modified, 0 source files, ~18k module codebase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. Domain-Driven Frontend Boundaries | PASS | No domain logic changes — config and docs only |
| II. React 19 Concurrent UX Discipline | PASS | Enforces compiler-driven optimization, aligns with concurrency-safe rendering |
| III. GraphQL Contract Fidelity | N/A | No GraphQL changes |
| IV. State & Side-Effect Isolation | PASS | Lint rules enforce compiler-managed memoization, reducing manual side-effect risks |
| V. Experience Quality & Safeguards | PASS | Performance validation via benchmark suite; accessibility unaffected |
| Architecture Standards #5 (Import transparency) | PASS | No barrel exports introduced |
| Architecture Standards #6 (SOLID) | PASS | Single-purpose config changes |
| Engineering Workflow #5 (Root Cause Analysis) | PASS | Rules address root cause of memoization reintroduction — automated enforcement vs. manual vigilance |

**Post-design re-check**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/041-react-compiler-lint-rules/
├── plan.md              # This file
├── research.md          # Phase 0 output (ESLint selector research, warn/error strategy)
├── quickstart.md        # Developer guide for the new lint rules
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
eslint.config.mjs           # Add no-restricted-syntax rules (4 selectors)
CLAUDE.md                   # Update State & Hooks section, React Compiler section
biome.json                  # Read-only verification (useExhaustiveDependencies: 'off')
```

**Structure Decision**: This feature modifies only root-level config and documentation files. No new source directories or components are created.

## Implementation Tasks

### T1: Add ESLint no-restricted-syntax rules [DONE]

**File**: `eslint.config.mjs`
**Change**: Add `no-restricted-syntax` rule at warn level with 4 AST selectors for `useMemo`, `useCallback`, `memo()`, `React.memo()`. Each selector includes a descriptive message explaining the React Compiler handles memoization.
**Validation**: `pnpm eslint src/` produces 0 errors, 48 warnings (all from documented exceptions + pending T040-T042).

### T2: Update CLAUDE.md [DONE]

**File**: `CLAUDE.md`
**Changes**:
- "State & Hooks" section: Replace useMemo/useCallback guidance with prohibition policy and exception instructions
- "React Compiler benefits" section: Update to reflect prohibition (not just "reduces need")
- Add Biome `useExhaustiveDependencies: 'off'` documentation

### T3: Verify Biome configuration [DONE]

**File**: `biome.json` (read-only)
**Verification**: `useExhaustiveDependencies: 'off'` is set in `correctness` rules. Documented in CLAUDE.md as intentional (compiler handles dependency tracking).

### T4: Run test suite [DONE]

**Command**: `pnpm vitest run`
**Result**: 592 tests passed, 3 skipped, 57 test files.

### T5: Run ESLint validation [DONE]

**Command**: `pnpm eslint src/`
**Result**: 0 errors, 48 warnings. All warnings from documented exceptions (MarkdownInput ecosystem) and pending T040-T042 migrations.

### T6: Run production build [PENDING]

**Command**: `pnpm build`
**Expected**: Build succeeds with no new errors. Bundle size stable or decreased from 14.19 MB baseline.

### T7: Run bundle analysis [PENDING — requires build]

**Command**: `pnpm analyze`
**Expected**: Interactive visualization at `build/stats.html`. Document size delta vs baseline.

### T8: Run Lighthouse benchmarks [DEFERRED — requires backend]

**Command**: `pnpm benchmark --build-name "post-migration-final"` then `pnpm benchmark:compare pre-migration-baseline post-migration-final`
**Blocked by**: Running Alkemio backend at localhost:3000

### T9: Run memory leak detection [DEFERRED — requires backend]

**Command**: `pnpm benchmark:memory`
**Blocked by**: Running Alkemio backend at localhost:3000

### T10: Warn → Error transition [FUTURE]

**When**: After T040-T042 (domain/common, domain/space, domain/collaboration) are complete
**Change**: In `eslint.config.mjs`, change the severity of the `no-restricted-syntax` rule from `'warn'` to `'error'`

## Verification Checklist

- [x] ESLint warns on useMemo/useCallback/memo() usage
- [x] Documented exceptions with eslint-disable are accepted
- [x] CLAUDE.md documents no-memoization policy
- [x] CLAUDE.md documents Biome useExhaustiveDependencies setting
- [x] All 592 tests pass
- [x] ESLint reports 0 errors
- [ ] Production build succeeds
- [ ] Bundle size documented vs baseline
- [ ] Lighthouse benchmarks compared (deferred)
- [ ] Memory leak detection run (deferred)
