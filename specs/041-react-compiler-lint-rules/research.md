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

**Decision**: Three combined AST selectors cover both the bare-identifier and the namespaced (`React.*`) call forms:

| Pattern | Selector |
| ------- | -------- |
| `useMemo(...)` / `React.useMemo(...)` | `CallExpression:matches([callee.name="useMemo"], [callee.property.name="useMemo"])` |
| `useCallback(...)` / `React.useCallback(...)` | `CallExpression:matches([callee.name="useCallback"], [callee.property.name="useCallback"])` |
| `memo(...)` / `React.memo(...)` | `CallExpression:matches([callee.name="memo"], [callee.property.name="memo"])` |

Two further selectors ban the class-based equivalents (`PureComponent`, `shouldComponentUpdate`).

**Rationale**: `callee.name` catches the named-import form (`import { useMemo } from 'react'`); `callee.property.name` catches the namespace form (`React.useMemo(...)`), closing a bypass where a namespaced call would otherwise slip through. Together they catch every call-site variation.

**Validation**: `pnpm eslint .` against the current codebase is clean (0 errors, 0 warnings) at **error** level — the 11 remaining genuine exceptions each carry an `eslint-disable … -- <reason>` comment, and a probe confirms both bare and namespaced (`React.useMemo`) new usages are rejected. Zero false positives detected.

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
