# Implementation Plan: SubSpace Innovation Flow Replace Options

**Branch**: `001-subspace-flow-replace-options` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-subspace-flow-replace-options/spec.md`
**Reference**: [GitHub Issue #8895](https://github.com/alkem-io/client-web/issues/8895)

## Summary

This feature extends the SubSpace innovation flow template selection dialog to provide three distinct options for handling existing content when changing templates:

1. **Replace All** - Delete all existing posts and replace with template posts (requires confirmation)
2. **Add Template Posts** - Keep existing posts and add template posts alongside them
3. **Flow Only** - Replace only the innovation flow structure, keeping existing posts unchanged

The implementation extends the existing `ApplySpaceTemplateDialog` component and requires a backend API extension to support the new "delete existing callouts" functionality.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19
**Primary Dependencies**: Apollo Client, MUI, react-i18next
**Storage**: N/A (backend handles persistence via GraphQL)
**Testing**: Vitest
**Target Platform**: Web (SPA)
**Project Type**: Web application (frontend only - backend changes separate)
**Performance Goals**: Operation completes in < 30 seconds (per spec SC-001)
**Constraints**: Must follow Figma design specifications
**Scale/Scope**: Single SubSpace at a time, no bulk operations

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Domain-Driven Frontend Boundaries

- **Status**: PASS
- Business logic stays in `src/domain/collaboration/InnovationFlow/`
- UI extends existing dialog patterns in `src/domain/templates/components/Dialogs/`
- No ad-hoc state shapes; uses existing domain hooks

### Principle II: React 19 Concurrent UX Discipline

- **Status**: PASS
- Uses existing patterns with loading states
- Confirmation dialogs use standard platform components
- No blocking operations in render

### Principle III: GraphQL Contract Fidelity

- **Status**: PASS (pending codegen after backend update)
- Uses generated hooks from `src/core/apollo/generated/apollo-hooks.ts`
- Will run `pnpm codegen` after backend schema update
- Mutation update follows existing patterns

### Principle IV: State & Side-Effect Isolation

- **Status**: PASS
- State managed through existing hooks
- No direct DOM manipulation
- Side effects contained in mutation handlers

### Principle V: Experience Quality & Safeguards

- **Status**: PASS
- Confirmation dialog for destructive action (Option 1)
- Accessible UI using existing MUI patterns
- Clear feedback on success/error

### Architecture Standard 3: Internationalization

- **Status**: PASS
- All new strings added to `translation.en.json`
- Uses `react-i18next` via `t()` function

### Architecture Standard 5: Import Transparency

- **Status**: PASS
- No barrel exports; explicit file paths

### Architecture Standard 6: SOLID Principles

- **Status**: PASS
- SRP: Dialog handles one concern (option selection)
- OCP: Extended via new option enum, not modification
- DIP: Uses hooks abstractions, not direct queries

## Project Structure

### Documentation (this feature)

```text
specs/010-subspace-flow-replace-options/
├── plan.md              # This file
├── research.md          # Research findings and decisions
├── data-model.md        # Data model and API changes
├── quickstart.md        # Implementation guide
├── contracts/           # GraphQL contract changes
│   └── graphql-changes.md
├── checklists/          # Quality checklists
│   └── requirements.md
├── spec.md              # Feature specification
└── tasks.md             # Tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/generated/    # Regenerated after backend update
│   └── i18n/en/
│       └── translation.en.json  # Add new translation keys
├── domain/
│   ├── collaboration/InnovationFlow/InnovationFlowDialogs/
│   │   ├── InnovationFlowSettings.graphql  # Update mutation
│   │   └── useInnovationFlowSettings.tsx   # Update handler signature
│   └── templates/components/Dialogs/
│       └── ApplySpaceTemplateDialog.tsx    # Extend with 3 options + confirmation
```

**Structure Decision**: This is a frontend-only change extending existing domain components. The structure follows the established patterns in `src/domain/collaboration/` for innovation flow logic and `src/domain/templates/` for dialog components.

## Complexity Tracking

No constitution violations. All changes follow existing patterns and architecture.

## Implementation Phases

### Phase 0: Backend Coordination (BLOCKING)

- **Status**: Waiting on backend team
- **Dependency**: `deleteExistingCallouts` parameter must be added to `UpdateCollaborationFromSpaceTemplateInput`
- **Action**: Coordinate with backend team on timeline

### Phase 1: GraphQL Layer Update

After backend is ready:

1. Run `pnpm codegen` to regenerate types
2. Update `InnovationFlowSettings.graphql` mutation
3. Update `useInnovationFlowSettings.tsx` handler

### Phase 2: UI Components

1. Create `FlowReplaceOption` enum
2. Extend `ApplySpaceTemplateDialog` with three options
3. Add confirmation dialog for Option 1
4. Add translation keys

### Phase 3: Testing & Polish

1. Manual testing of all options
2. Edge case verification
3. Accessibility audit

## Key Decisions

| Decision                                       | Rationale                                           |
| ---------------------------------------------- | --------------------------------------------------- |
| Extend existing dialog vs. new dialog          | Reuses tested components, follows existing patterns |
| Backend API extension vs. client-side deletion | Atomic operation required for data integrity        |
| Secondary confirmation for Option 1            | Spec requirement, prevents accidental data loss     |

## Dependencies

| Dependency                 | Status       | Impact                               |
| -------------------------- | ------------ | ------------------------------------ |
| Backend API extension      | **BLOCKING** | Cannot implement Option 1 without it |
| Figma design               | Available    | UI follows design specs              |
| Existing dialog components | Available    | Reuse `ConfirmationDialog`           |

## Risks

1. **Backend timeline**: Feature blocked until API ready
2. **Data loss**: Option 1 is destructive - must have clear confirmation
3. **Atomicity**: Backend must ensure atomic operation

## Related Artifacts

- [research.md](./research.md) - Detailed research findings
- [data-model.md](./data-model.md) - Data model and state changes
- [contracts/graphql-changes.md](./contracts/graphql-changes.md) - GraphQL contract updates
- [quickstart.md](./quickstart.md) - Implementation guide
