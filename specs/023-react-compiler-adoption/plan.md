# Implementation Plan: React Compiler Adoption — Remove Manual Memoization

**Branch**: `023-react-compiler-adoption` | **Date**: 2026-03-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-react-compiler-adoption/spec.md`

## Summary

Remove all manual memoization primitives (603 useMemo, 322 useCallback, 2 React.memo) from the codebase, relying on the already-active React Compiler for automatic optimization. The migration proceeds in phases: fix compiler bail-outs first, then remove memoization from core/shared layer, then domain components, and finally add lint rules to prevent reintroduction.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: React Compiler (babel-plugin-react-compiler@^1.0.0), eslint-plugin-react-compiler@19.1.0-rc.2, Biome 2.4.6, Vite
**Storage**: N/A (no data persistence changes)
**Testing**: Vitest with jsdom (19 files, 247+ tests, ~1.2s execution)
**Target Platform**: Web (SPA served by Vite, React 19)
**Project Type**: Web (single frontend SPA)
**Performance Goals**: Equal or better Lighthouse scores and React Profiler flame graphs vs. pre-migration baseline
**Constraints**: Zero test regressions per batch; no functional behavior changes; phased rollout
**Scale/Scope**: ~925 memoization call sites across ~360 files in ~1,651 TypeScript source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. Domain-Driven Frontend Boundaries | PASS | Migration touches files in domain/, core/, and main/ but does not alter domain boundaries. Memoization removal is a mechanical transformation that preserves existing business logic separation. |
| II. React 19 Concurrent UX Discipline | PASS | Removing manual memoization aligns with React 19's model — the compiler ensures rendering remains pure and concurrency-safe. The migration explicitly validates that all components remain compiler-optimizable. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL files, schema, or generated hooks are modified. No `pnpm codegen` needed. |
| IV. State & Side-Effect Isolation | PASS | The migration removes memoization wrappers but preserves all state and effect logic. No useMemo calls with side effects were found (R5). Components remain side-effect free except for dedicated effect hooks. |
| V. Experience Quality & Safeguards | PASS | Performance validation is a P1 requirement (User Story 5). Baseline Lighthouse scores captured before migration; compared after each phase. Test suite runs after each batch. |
| Engineering Workflow #5 (Root Cause Analysis) | PASS | The migration is based on thorough audit (research.md) identifying exact counts, bail-out reasons, and fix approaches. No workarounds are applied. |

**Post-Phase 1 Re-check**: All gates still pass. No new violations identified during design.

## Project Structure

### Documentation (this feature)

```text
specs/023-react-compiler-adoption/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Migration tracking entities
├── quickstart.md        # Developer guide for the migration
├── contracts/
│   └── README.md        # Contract changes (ESLint rules only)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── core/                    # Phase 2 target: 96 useMemo, 67 useCallback
│   ├── ui/forms/            # 2 React.memo wrappers (MarkdownInput, CollaborativeMarkdownInput)
│   ├── lazyLoading/         # 1 compiler bail-out (GlobalErrorContext.tsx)
│   └── ...                  # Remaining core hooks and utilities
├── domain/                  # Phase 3 target: 443 useMemo, 202 useCallback
│   ├── collaboration/       # 2 compiler bail-outs (InnovationFlowDragNDropEditor, CollaborativeExcalidrawWrapper, useGuestSessionReturn)
│   ├── shared/              # 1 compiler bail-out (useKeepElementScroll)
│   └── ...                  # 15 other domain subdirectories
├── main/                    # Phase 2-3 target: 64 useMemo, 53 useCallback
│   └── ui/layout/topBar/    # 1 compiler bail-out (SearchBar.tsx)
eslint.config.mjs            # Phase 4: add no-restricted-syntax rules
```

**Structure Decision**: No new directories or files beyond the specs/ documentation and the ESLint config change in Phase 4.

## Migration Phases

### Phase 1 — Fix Compiler Bail-Outs

**Goal**: Reduce compiler bail-outs from 6 to documented-exception minimum.

**Fix order** (by confidence):

| # | File | Action | Risk |
| - | ---- | ------ | ---- |
| 1 | SearchBar.tsx | Replace `window.location.href` with `navigate()` from react-router | Low — navigate is already imported |
| 2 | useGuestSessionReturn.ts | Move `globalThis.location.href` to proper navigation pattern | Low — standard refactor |
| 3 | useKeepElementScroll.ts | Verify whether the compiler actually bails out (DOM mutation is already in useEffect) | Low — may be a false positive |
| 4 | CollaborativeExcalidrawWrapper.tsx | Move ref assignment to useEffect | Medium — depends on useCollab lifecycle |
| 5 | InnovationFlowDragNDropEditor.tsx | Already uses `'use no memo'` directive; assess if render props can be extracted | Medium — library constraint |
| 6 | GlobalErrorContext.tsx | Document as permanent exception (singleton module-level mutation) | None — exception |

**Validation**: Run `pnpm eslint` after each fix; target 0 errors excluding documented exceptions.

### Phase 2 — Core/Shared Layer Removal

**Goal**: Remove useMemo/useCallback from `src/core/` and `src/domain/shared/`, plus React.memo wrappers where safe.

**Exception**: The MarkdownInput/CollaborativeMarkdownInput ecosystem (10 files, ~34 calls, 2 React.memo) is excluded — TipTap editor lifecycle dependencies cause functional regressions when memoization is removed.

**Batch order**:

1. **Batch 2a — Shared hooks and utilities** (`src/domain/shared/`)
   - useMemo and useCallback in shared hooks, utility functions
   - Lower risk — utilities have fewer UI side effects
   - Validate: `pnpm vitest run`

2. **Batch 2b — Core UI components** (`src/core/ui/`, excl. MarkdownInput ecosystem)
   - Buttons, inputs, dialogs, forms
   - ~~Includes the 2 React.memo wrappers in MarkdownInput and CollaborativeMarkdownInput~~ — **SKIPPED**: TipTap editor lifecycle requires manual memoization
   - Validate: `pnpm vitest run` + visual QA on editor pages

3. **Batch 2c — Core infrastructure and providers** (`src/core/` excluding ui/)
   - Apollo client setup, auth, routing, state, analytics
   - Higher risk — foundational code used everywhere
   - Validate: `pnpm vitest run` + `pnpm build` + smoke test critical pages

### Phase 3 — Domain Component Removal

**Goal**: Remove 443 useMemo + 202 useCallback across 18 domain subdirectories.

**Execution strategy**: Process one domain subdirectory at a time. Order by risk (lowest first):

| Priority | Domain | useMemo (est.) | useCallback (est.) | Notes |
| -------- | ------ | --------------- | ------------------- | ----- |
| 1 | timeline | Low | Low | Small, isolated |
| 2 | license | Low | Low | Small, isolated |
| 3 | storage | Low | Low | Small, isolated |
| 4 | access | Low | Low | Auth-related but isolated |
| 5 | account | Low-Med | Low | User account management |
| 6 | communication | Med | Med | Messaging components |
| 7 | community | Med | Med | User/org management |
| 8 | templates | Med | Low | Template management |
| 9 | templates-manager | Med | Low | Template editing |
| 10 | InnovationPack | Low | Low | Innovation packs |
| 11 | innovationHub | Med | Med | Innovation hubs |
| 12 | platform | Med | Med | Platform-wide components |
| 13 | platformAdmin | Med | Med | Admin interfaces |
| 14 | spaceAdmin | Med | Med | Space admin pages |
| 15 | common | High | Med | Shared domain utilities (includes whiteboard) |
| 16 | space | High | High | Core space management (largest domain) |
| 17 | collaboration | High | High | Collaboration features (includes bail-out files) |
| 18 | shared | Already done | Already done | Handled in Phase 2 |

**Validation per domain**: `pnpm vitest run` + `pnpm eslint`

**Execution**: Batch per domain — Claude Code transforms one domain subdirectory at a time in dedicated commits, with validation after each domain.

### Phase 4 — Cleanup & Lint Rules

**Goal**: Add lint rules to prevent reintroduction.

**Changes to `eslint.config.mjs`**:

```javascript
rules: {
  'react-compiler/react-compiler': 'error',
  'no-restricted-syntax': [
    'warn', // Phase 4a: warn during transition
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
  ],
}
```

**Phase 4b**: Change `warn` → `error` after all domains are migrated.

**Additional cleanup**:
- Verify `react-hooks/exhaustive-deps` can be removed from ESLint config (already absent)
- Verify Biome's `useExhaustiveDependencies: 'off'` is documented
- Final bundle size comparison (`pnpm analyze`)
- Update CLAUDE.md to reflect the new no-memoization policy

## Complexity Tracking

No constitution violations to justify. The migration is a simplification — it removes complexity (manual memoization) rather than adding it.

## Permanent Exceptions

| File | Reason | Resolution |
| ---- | ------ | ---------- |
| Error40XBoundaryInternal | Class error boundary — React requires class components | Compiler skips; no action needed |
| LinesFitterErrorBoundary | Class error boundary — React requires class components | Compiler skips; no action needed |
| GlobalErrorContext.tsx | Singleton module-level mutation during render | Keep eslint-disable with reason |
| InnovationFlowDragNDropEditor.tsx | ~~@hello-pangea/dnd render props~~ — **RESOLVED**: migrated to @dnd-kit/core; no eslint-disable or 'use no memo' directives remain | No action needed |
| KratosPasskeyIconButton / KratosPasskeyButton | `new Function()` — already isolated leaf components | No action needed; compiler skips dynamic code |
| MarkdownInput ecosystem (10 files) | TipTap editor lifecycle dependencies cause regressions when memoization removed | Keep React.memo + useMemo/useCallback; reassess after TipTap upgrade |
