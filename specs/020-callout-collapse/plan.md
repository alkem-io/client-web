# Implementation Plan: Configurable Callout Collapse/Expand State

**Branch**: `020-callout-collapse` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-callout-collapse/spec.md`

## Summary

Add a space-level setting (`layout.calloutDescriptionDisplayMode`) that controls whether callout descriptions with markdown content default to collapsed or expanded. The setting is managed in the Space Admin Layout tab (below the Innovation Flow editor) and reactively updates all callouts via Apollo cache propagation. The existing `ExpandableMarkdown` component is reused — only the initial state source changes from hardcoded "expanded" to the space's configured setting.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: Apollo Client (GraphQL), MUI (UI), React Compiler (auto-memoization)
**Storage**: Apollo normalized cache (client), server-persisted JSONB settings
**Testing**: Vitest with jsdom
**Target Platform**: Web (SPA served by Vite)
**Project Type**: Web application (client-only changes; server schema assumed ready via `043-callout-collapse`)
**Performance Goals**: Reactive setting update without full page reload; the `useCalloutDescriptionDisplayMode` hook shares the same `SpaceSettings` query via Apollo cache deduplication
**Constraints**: Must preserve existing collapse/expand visual behavior exactly; existing spaces must remain expanded after deployment
**Scale/Scope**: ~14 files modified, 2 new files, 1 prop addition to `ExpandableMarkdown`, 1 new hook

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                              | Status | Notes                                                                                                                                                                               |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Domain-Driven Frontend Boundaries   | PASS   | Setting lives in `src/domain/space/settings/` (domain model). Admin UI in `src/domain/spaceAdmin/`. No business logic in components.                                                |
| II. React 19 Concurrent UX             | PASS   | `useSpaceSettingsUpdate` already uses `useTransition` + `useOptimistic`. New code follows same pattern.                                                                             |
| III. GraphQL Contract Fidelity         | PASS   | Generated hooks only; codegen required after `.graphql` changes. No raw `useQuery`.                                                                                                 |
| IV. State & Side-Effect Isolation      | PASS   | Setting flows via Apollo cache (persistent state in `src/core/apollo`). No direct DOM or browser API usage. Temporary toggle remains component-local state in `ExpandableMarkdown`. |
| V. Experience Quality & Safeguards     | PASS   | Toggle is a standard MUI switch. Accessible (keyboard nav, semantic HTML). No performance regression — single boolean prop addition.                                                |
| Architecture Std 1 (Directory mapping) | PASS   | Feature touches `src/domain/space/settings/`, `src/domain/spaceAdmin/`, `src/core/ui/markdown/`, `src/domain/collaboration/callout/` — all correct domain contexts.                 |
| Architecture Std 3 (i18n)              | PASS   | New label strings added to `translation.en.json`.                                                                                                                                   |
| Architecture Std 5 (No barrel exports) | PASS   | All imports use explicit file paths.                                                                                                                                                |
| Architecture Std 6 (SOLID/DRY)         | PASS   | Reusing existing `ExpandableMarkdown` with a single prop addition. Following existing settings update hook pattern.                                                                 |
| Engineering Workflow 5 (Root Cause)    | PASS   | Not a bug fix; new feature with clear design rationale.                                                                                                                             |

**Post-Phase 1 Re-check**: All gates still pass. No new abstractions, no new state management patterns, no runtime complexity added.

## Project Structure

### Documentation (this feature)

```text
specs/020-callout-collapse/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: codebase research findings
├── data-model.md        # Phase 1: entity/type changes
├── quickstart.md        # Phase 1: implementation guide
├── contracts/           # Phase 1: GraphQL contract changes
│   └── graphql-changes.md
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/generated/          # Regenerated after codegen (graphql-schema.ts, apollo-hooks.ts)
│   ├── i18n/en/translation.en.json # New i18n keys for layout setting labels
│   └── ui/markdown/
│       └── ExpandableMarkdown.tsx  # MODIFY: add defaultCollapsed prop + re-detection on change
│
├── domain/
│   ├── space/settings/
│   │   ├── SpaceSettingsModel.ts                  # MODIFY: add SpaceSettingsLayout interface
│   │   └── useCalloutDescriptionDisplayMode.ts    # NEW: hook returning defaultCollapsed boolean
│   ├── spaceAdmin/
│   │   ├── SpaceAdminLayout/
│   │   │   └── SpaceAdminLayoutPage.tsx  # MODIFY: add display mode toggle + spaceId prop (all levels)
│   │   ├── layout/
│   │   │   ├── SpaceAdminTabsL1.tsx       # MODIFY: add Layout tab
│   │   │   └── SpaceAdminTabsL2.tsx       # MODIFY: add Layout tab
│   │   ├── routing/
│   │   │   ├── SpaceAdminRouteL1.tsx      # MODIFY: add layout route with subspace spaceId
│   │   │   └── SpaceAdminRouteL2.tsx      # MODIFY: add layout route with subspace spaceId
│   │   └── SpaceAdminSettings/
│   │       ├── graphql/
│   │       │   ├── SpaceSettings.graphql        # MODIFY: add layout fragment
│   │       │   └── UpdateSpaceSettings.graphql  # MODIFY: add layout to response
│   │       ├── components/
│   │       │   └── CalloutDisplayModeSettings.tsx  # NEW: admin toggle component
│   │       ├── SpaceDefaultSettings.tsx          # MODIFY: add layout defaults
│   │       └── useSpaceSettingsUpdate.ts         # MODIFY: extend for layout
│   └── collaboration/
│       └── callout/
│           ├── calloutBlock/
│           │   └── CalloutLayoutTypes.tsx    # MODIFY: add defaultCollapsed to CalloutLayoutProps
│           └── CalloutView/
│               ├── CalloutView.tsx           # MODIFY: use useCalloutDescriptionDisplayMode hook
│               └── CalloutViewLayout.tsx     # MODIFY: pass defaultCollapsed to ExpandableMarkdown
```

**Structure Decision**: Single web application (client-only). All changes within the existing `src/` directory structure following established domain boundaries.

## Design Decisions

### D1: ExpandableMarkdown prop addition

Add `defaultCollapsed?: boolean` to `ExpandableMarkdown`. When `true`, the overflow detection resolves to `'collapsed'` instead of `'expanded'`. A `useEffect` re-enters `'detecting'` state when `defaultCollapsed` changes, handling both async setting load and reactive admin toggles. This is the minimal change to support the feature while preserving all existing behavior (default is `false` / `undefined` = current expanded behavior).

### D2: Setting delivery to callout components

A dedicated `useCalloutDescriptionDisplayMode(spaceId)` hook in `src/domain/space/settings/` encapsulates the `useSpaceSettingsQuery` call and returns a `defaultCollapsed` boolean. The hook is called directly in `CalloutView` (which already has access to `useSpace()` and `useSubSpace()` for the space ID), avoiding prop-drilling from parent components. The `defaultCollapsed` value is passed as a prop through `CalloutViewLayout` → `ExpandableMarkdown`.

Note: the hook uses `||` (not `??`) to resolve the space ID from `subspace?.id || space?.id` because the `SubspaceContext` default value has `id: ''` (empty string, not null/undefined) when no subspace is active.

### D3: Admin UI placement

- **All levels (L0/L1/L2)**: The Layout tab is available at all space levels. The `CalloutDisplayModeSettings` toggle lives in `SpaceAdminLayoutPage.tsx`, positioned below the Innovation Flow editor block. L1/L2 subspaces reuse the same `SpaceAdminLayoutPage` component with `useL0Layout: false` and an explicit `spaceId` prop (the subspace ID) so that queries and mutations target the correct subspace rather than the parent L0 space from `useSpace()`.

### D4: Reactive updates (FR-011)

When the admin toggles the setting, the `updateSpaceSettings` mutation response includes the updated `layout.calloutDescriptionDisplayMode`. Apollo's normalized cache updates the space entity, and any component querying this field re-renders automatically. No manual refetch or page reload needed.

### D5: Fallback behavior

Client treats missing/null `calloutDescriptionDisplayMode` as `EXPANDED` (matching server fallback), ensuring backward compatibility with spaces that haven't been migrated or don't have the field yet.

## Complexity Tracking

> No constitution violations to justify. All gates pass.
