# Research: React Compiler Adoption — Remove Manual Memoization

**Feature Branch**: `023-react-compiler-adoption`
**Date**: 2026-03-17

## R1: Current Memoization Counts (Updated)

**Decision**: The RFC's audit numbers are outdated; current counts are significantly higher due to codebase growth.

**Current counts (as of 2026-03-17)**:

| Primitive       | Count | Files | RFC Estimate |
| --------------- | ----- | ----- | ------------ |
| useMemo         | 603   | 237   | 284 / 205    |
| useCallback     | 322   | 124   | 194 / 123    |
| React.memo      | 2     | 2     | 2            |

**Distribution by directory**:

| Directory    | useMemo | useCallback |
| ------------ | ------- | ----------- |
| src/core/    | 96      | 67          |
| src/domain/  | 443     | 202         |
| src/main/    | 64      | 53          |

**Rationale**: Using actual counts ensures migration planning has accurate scope.

**Alternatives considered**: Using RFC numbers — rejected because the codebase has grown ~2x in memoization usage since the audit.

## R2: React.memo Wrapper Locations

**Decision**: Both React.memo instances are in markdown editor components in `src/core/ui/forms/`.

**Locations**:
1. `src/core/ui/forms/MarkdownInput/MarkdownInput.tsx` (line 45) — `export const MarkdownInput = memo<MarkdownInputProps>(...)`
2. `src/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput.tsx` (line 30) — `export const CollaborativeMarkdownInput = memo<MarkdownInputProps>(...)`

**Rationale**: Both wrap components with forwardRef for managing editor focus and state. The compiler handles this automatically.

## R3: Domain Subdirectory Count

**Decision**: 18 domain subdirectories exist (RFC stated 19).

**Directories**: access, account, collaboration, common, communication, community, innovationHub, InnovationPack, license, platform, platformAdmin, shared, space, spaceAdmin, storage, templates, templates-manager, timeline

**Note**: `src/dev/` contains 2 useMemo occurrences but is not a domain slice.

## R4: Compiler Bail-Out Analysis

**Decision**: Of the 6 known bail-outs, 3 are fixable, 1 needs verification, 1 is partially fixable, and 1 is a permanent exception.

| File | Fixable? | Approach |
| ---- | -------- | -------- |
| GlobalErrorContext.tsx | NO | Permanent exception — intentional singleton mutation of module-level variable during render |
| InnovationFlowDragNDropEditor.tsx | RESOLVED | ~~@hello-pangea/dnd render props~~ — migrated to @dnd-kit/core during bail-out resolution; no eslint-disable or 'use no memo' directives remain, zero compiler errors |
| useGuestSessionReturn.ts | YES | Move `globalThis.location.href` assignment out of useCallback into proper navigation pattern |
| CollaborativeExcalidrawWrapper.tsx | VERIFY | Ref assignment (`combinedCollabApiRef.current = collabApi`) in callback — may be fixable by moving to useEffect |
| useKeepElementScroll.ts | VERIFY | DOM mutation already inside useEffect — may be a compiler false positive; verify the warning still triggers |
| SearchBar.tsx | YES | Replace `window.location.href` with existing `navigate()` from react-router |

**Rationale**: Prioritizing fixable bail-outs first reduces the exception list to a minimum.

## R5: useMemo Purity Audit

**Decision**: No useMemo calls with side effects were found.

**Rationale**: All useMemo calls are used for value/object/array memoization. Mutations and fetches are properly separated into useCallback or useEffect. This means FR-008 (refactor impure useMemo to useEffect) has zero instances to address.

**Alternatives considered**: Deep static analysis — rejected as grep-based search covered the common side-effect patterns (setState, console.log, fetch, mutation, dispatch) and found none.

## R6: Lint Rule Strategy for Preventing Reintroduction

**Decision**: Use ESLint `no-restricted-syntax` rule in the existing `eslint.config.mjs`.

**Rationale**:
- ESLint is already installed and configured (only for react-compiler rule)
- `no-restricted-syntax` supports AST selectors to match `useMemo()`, `useCallback()`, `React.memo()` calls
- No custom plugin needed
- Biome v2.4.6 does not have built-in rules for restricting specific hook calls
- Pre-commit hooks currently only run Biome, but CI runs ESLint — enforcement would be in CI

**Implementation**:
```javascript
'no-restricted-syntax': [
  'warn', // start as warn, transition to error
  {
    selector: 'CallExpression[callee.name="useMemo"]',
    message: 'useMemo is not allowed; React Compiler handles memoization automatically.',
  },
  {
    selector: 'CallExpression[callee.name="useCallback"]',
    message: 'useCallback is not allowed; React Compiler handles memoization automatically.',
  },
  {
    selector: 'CallExpression[callee.object.name="React"][callee.property.name="memo"]',
    message: 'React.memo is not allowed; React Compiler handles memoization automatically.',
  },
]
```

**Alternatives considered**:
- Biome custom rule: Not available in Biome's fixed rule set.
- Custom ESLint plugin: Unnecessary complexity when `no-restricted-syntax` works.
- `no-restricted-imports` for React hooks: Too broad — would also block useEffect, useState, etc.

## R7: Compiler Configuration

**Decision**: The React Compiler uses default settings with no custom options.

**Configuration**:
- `babel-plugin-react-compiler@^1.0.0` — default options in both `vite.config.mjs` and `vite.sentry.config.mjs`
- `eslint-plugin-react-compiler@19.1.0-rc.2` — error level in `eslint.config.mjs`
- Biome's `useExhaustiveDependencies` is disabled (compiler handles dependency tracking)

**Rationale**: Default configuration is sufficient. No custom targets, bail-out behaviors, or compilation modes are needed.

## R8: Pre-commit and CI Pipeline

**Decision**: Pre-commit runs Biome only; ESLint runs in CI.

**Current lint-staged config** (`.lintstagedrc.json`):
```json
{
  "src/**/*.ts{,x}": ["biome check --fix --no-errors-on-unmatched", "biome format --write --no-errors-on-unmatched"],
  "*.{json,md}": "biome format --write --no-errors-on-unmatched"
}
```

**Implication**: The `no-restricted-syntax` lint rule for memoization will only be enforced in CI, not pre-commit. This is acceptable since the migration is phased — pre-commit enforcement would block developers working on files not yet migrated.

**Rationale**: Adding ESLint to pre-commit would slow the commit hook and create friction during the transition period.
