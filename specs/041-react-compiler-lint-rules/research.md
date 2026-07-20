# Research: React Compiler Lint Rules, Prevention & Final Validation

**Feature**: 041-react-compiler-lint-rules
**Date**: 2026-03-31

## R1: ESLint `no-restricted-syntax` for React Hooks

**Decision**: Use ESLint's built-in `no-restricted-syntax` rule with AST selectors to flag `useMemo`, `useCallback`, `memo()`, and `React.memo()`.

**Rationale**: `no-restricted-syntax` is a zero-dependency ESLint core rule that uses AST selectors — no custom plugin needed. It supports per-pattern custom messages and integrates with existing eslint-disable comments. The project already uses ESLint flat config (`eslint.config.mjs`) for the `react-compiler/react-compiler` rule, so adding `no-restricted-syntax` entries fits naturally.

**Alternatives considered**:
- **Custom ESLint plugin**: Rejected — over-engineered for 4 simple AST patterns. Maintenance burden not justified.
- **Biome lint rules**: Biome does not have an equivalent to `no-restricted-syntax` with custom messages. Its `noRestrictedImports` rule blocks imports but not call-site usage, which wouldn't catch renamed imports or destructured hooks.
- **`no-restricted-imports`**: Would block the import but not the usage. A developer could import from a re-export or alias. AST-level call detection is more robust.

## R2: AST Selectors for Memoization Patterns

**Decision**: Four AST selectors cover all patterns:

| Pattern | Selector |
| ------- | -------- |
| `useMemo(...)` | `CallExpression[callee.name="useMemo"]` |
| `useCallback(...)` | `CallExpression[callee.name="useCallback"]` |
| `memo(...)` | `CallExpression[callee.name="memo"]` |
| `React.memo(...)` | `CallExpression[callee.object.name="React"][callee.property.name="memo"]` |

**Rationale**: These selectors match the named import pattern used throughout the codebase (`import { useMemo, useCallback, memo } from 'react'`). The `React.memo` selector covers the namespace import pattern. Together they catch all four call-site variations.

**Validation**: Running ESLint with these selectors against the current codebase produces 48 warnings — all from documented exceptions (MarkdownInput ecosystem) and not-yet-migrated files (T040-T042). Zero false positives detected.

## R3: Warn vs Error Level Strategy

**Decision**: Start at `warn` level. Transition to `error` once all Phase 4 domain migrations (T040-T042) are complete and only documented exceptions remain.

**Rationale**: The warn-level approach allows the rules to be merged and active in CI while the remaining domain migrations complete in parallel. Developers get immediate feedback without blocking their work. The transition to error is a one-line change (`'warn'` → `'error'`) once T040-T042 are done.

**Alternative considered**: Starting at error level immediately — rejected because T040-T042 (domain/common, domain/space, domain/collaboration) still contain ~48 usages that would cause CI failures.

## R4: Documentation Location

**Decision**: Update the "State & Hooks" subsection of CLAUDE.md and the "React Compiler benefits" section. Document Biome's `useExhaustiveDependencies: 'off'` as intentional in the same update.

**Rationale**: CLAUDE.md is the primary developer onboarding document and is loaded as context by AI assistants. The "State & Hooks" section previously recommended using useMemo/useCallback — this must be corrected to prevent mixed signals. Biome documentation belongs alongside the hook policy since `useExhaustiveDependencies` is directly related to the compiler-manages-dependencies rationale.

## R5: Benchmark Tooling Availability

**Decision**: Bundle analysis (`pnpm analyze`) and test suite (`pnpm vitest run`) can run without a backend. Lighthouse benchmarks (`pnpm benchmark`) require a running backend and are deferred.

**Rationale**: The benchmark suite uses Lighthouse against a running app, which needs the Alkemio backend at localhost:3000. Bundle analysis only needs a production build. For this PR, we validate with: tests passing, ESLint clean, and production build succeeding.
