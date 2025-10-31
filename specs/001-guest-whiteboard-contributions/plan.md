# Implementation Plan: Guest Whiteboard Contributions Toggle

**Branch**: `client-8727` | **Date**: 2025-10-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-guest-whiteboard-contributions/spec.md`

## Summary

Add a space-level admin toggle (`allowGuestContributions`) to control whether whiteboard creators can share whiteboards publicly. This establishes the permission gate for future public whiteboard sharing features while maintaining security through admin control. Implementation involves extending the existing space settings infrastructure with a new boolean field, updating the settings UI, and preparing extensibility points for Share dialog integration.

## Technical Context

**Language/Version**: TypeScript 5.x + React 19
**Primary Dependencies**: Apollo GraphQL Client, MUI v5, Emotion CSS-in-JS, React Router v6, Vite
**Storage**: GraphQL backend via Apollo Client cache (normalized by space ID)
**Testing**: Vitest for unit tests, React Testing Library for component tests
**Target Platform**: Modern web browsers (Chrome 100+, Firefox 100+, Safari 14+)
**Project Type**: Single-page React application
**Performance Goals**: <500ms p95 for mutation, <10s toggle persistence, no UI blocking during updates
**Constraints**: WCAG 2.1 AA accessibility compliance, React 19 concurrency-safe patterns
**Scale/Scope**: Tested with spaces containing 10-20 whiteboards, single boolean field addition

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Domain Alignment**:
  - **Affected contexts**: `src/domain/spaceAdmin` (settings management), `src/domain/space/settings` (state façade)
  - **Façade updates**: New hook `useSpaceGuestContributionsEnabled(spaceId)` in `src/domain/space/settings`
  - **UI orchestration**: `SpaceAdminSettingsPage.tsx` remains orchestration-only, consuming domain hooks
  - ✅ **Compliant**: No business logic in React components

- **React 19 Concurrency**:
  - **New components**: Settings toggle uses `useTransition` for non-blocking mutations
  - **Optimistic updates**: `useOptimistic` for immediate UI feedback before server confirmation
  - **Error handling**: Revert optimistic state on mutation failure
  - **Legacy surfaces**: Extends existing `SpaceAdminSettingsPage.tsx` (already function-based)
  - ✅ **Compliant**: No deprecated lifecycle methods, uses React 19 primitives

- **GraphQL Contract**:
  - **Schema changes**: Add `allowGuestContributions: Boolean!` to `SpaceSettingsCollaboration`
  - **Fragments updated**: `SpaceSettings.graphql`, `UpdateSpaceSettings.graphql`
  - **Generated hooks**: `useSpaceSettingsQuery`, `useUpdateSpaceSettingsMutation`
  - **Schema diff review**: Required before merge
  - ✅ **Compliant**: Uses generated hooks, no raw GraphQL queries

- **State & Effects**:
  - **State sources**: Apollo cache (space settings), React context for notifications
  - **Adapters**: `useNotification` for toast messages, existing Apollo error handling
  - **Side effects**: Mutations via Apollo hooks, no direct DOM manipulation
  - ✅ **Compliant**: Pure components, isolated side effects

- **Experience Safeguards**:
  - **Accessibility**: ARIA labels, keyboard navigation, semantic HTML (`<Switch>` component)
  - **Performance**: Lighthouse audit pre/post, mutation timing measurement
  - **Testing**: Unit tests for toggle logic, integration tests for mutation flow
  - **Observability**: Toast notifications for user feedback (no analytics per clarification)
  - ✅ **Compliant**: All safeguards addressed

## Project Structure

### Documentation (this feature)

```text
specs/001-guest-whiteboard-contributions/
├── plan.md              # This file
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── spaceAdmin/
│   │   └── SpaceAdminSettings/
│   │       ├── SpaceAdminSettingsPage.tsx          # Update: add new toggle
│   │       ├── SpaceDefaultSettings.tsx            # Update: add default value
│   │       └── graphql/
│   │           ├── SpaceSettings.graphql           # Update: add field
│   │           └── UpdateSpaceSettings.graphql     # Update: add input
│   └── space/
│       └── settings/
│           ├── SpaceSettingsModel.ts               # Update: add field to interface
│           └── useSpaceGuestContributions.ts       # New: domain façade hook
├── core/
│   ├── apollo/generated/                           # Update: run codegen
│   └── ui/notifications/                           # Existing: toast system
└── main/                                           # No changes needed

tests/
├── domain/
│   └── spaceAdmin/
│       └── SpaceAdminSettings/
│           └── SpaceAdminSettingsPage.test.tsx     # New: toggle functionality
└── integration/
    └── space-settings-mutation.test.ts             # New: end-to-end flow
```

**Structure Decision**: Extending the existing single React application structure. The space settings infrastructure is already established, so this feature adds minimal new files while reusing the proven patterns for settings management.

## Complexity Tracking

> **No violations detected - all Constitution principles followed**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |

---

## Phase 0: Outline & Research

### Research Tasks Identified

Based on Technical Context unknowns and dependencies:

1. **GraphQL Schema Integration**: Research current `SpaceSettingsCollaboration` structure and backend coordination process
2. **React 19 Optimistic Updates**: Find best practices for `useOptimistic` with Apollo mutations
3. **Accessibility Patterns**: Research ARIA patterns for toggle controls with warning text
4. **Error Handling**: Find patterns for mutation error handling with optimistic updates

### Phase 0 Execution

Generating research.md to resolve all technical unknowns before design phase.

---

## Next Steps

1. **Phase 0**: Generate `research.md` with decisions on GraphQL integration, React 19 patterns, and error handling
2. **Phase 1**: Create `data-model.md`, `contracts/`, and `quickstart.md` based on research findings
3. **Phase 2**: Execute `/speckit.tasks` to break down implementation into actionable tasks

**Status**: Ready for Phase 0 research execution
