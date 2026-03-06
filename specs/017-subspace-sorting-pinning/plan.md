# Implementation Plan: Subspace Sorting & Pinning

**Branch**: `017-subspace-sorting-pinning` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-subspace-sorting-pinning/spec.md`
**Server API**: [`server/specs/041-subspace-sorting-pinning/`](/Users/borislavkolev/WebstormProjects/server/specs/041-subspace-sorting-pinning/spec.md)

## Summary

Add subspace sorting modes (Alphabetical/Custom) and pinning functionality to the Alkemio client. The server API (branch `041-subspace-sorting-pinning`) provides `SpaceSortMode` enum, `pinned` boolean on subspaces, `updateSubspacePinned` mutation, and `sortMode` on space settings. The client integrates these via GraphQL codegen, implements client-side sorting logic, replaces the modal sort dialog with inline `@dnd-kit` drag-and-drop in settings, adds sort mode dropdown, pin/unpin actions, and pin indicators on cards.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 22 LTS
**Primary Dependencies**: Apollo Client, MUI, `@dnd-kit/core` + `@dnd-kit/sortable`, `react-i18next`
**Storage**: Apollo cache (client-side); server persists via GraphQL mutations
**Testing**: Vitest with jsdom
**Target Platform**: Web (SPA via Vite, localhost:3001)
**Project Type**: React SPA (frontend only — backend is separate repo)
**Performance Goals**: Instant reorder feedback via optimistic updates; standard web app responsiveness
**Constraints**: Must run `pnpm codegen` after server schema changes. `@dnd-kit` for new drag-and-drop (not `@hello-pangea/dnd`).
**Scale/Scope**: ~10-15 files modified/created. ~500 LOC estimated.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                    | Status | Notes                                                                                                                                    |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| I. Domain-Driven Frontend Boundaries         | PASS   | Sorting logic in `src/domain/space/` hook. Pin indicator in `src/domain/space/components/`. Settings UI in `src/domain/spaceAdmin/`.     |
| II. React 19 Concurrent UX Discipline        | PASS   | Drag-and-drop uses standard event handlers. Mutations can use `useTransition` for non-blocking updates. Components remain pure.          |
| III. GraphQL Contract Fidelity               | PASS   | All data access via generated hooks from codegen. New `.graphql` documents for new mutation. Extended existing queries for new fields.   |
| IV. State & Side-Effect Isolation            | PASS   | Sort state from Apollo cache. No new global state. Pin toggle is a mutation, not local state.                                            |
| V. Experience Quality & Safeguards           | PASS   | Drag handles provide keyboard accessibility. Pin icons use semantic ARIA labels. MUI components meet WCAG 2.1 AA.                        |
| Architecture Standard 1 (Directory mapping)  | PASS   | Domain logic in `src/domain/space/`, admin UI in `src/domain/spaceAdmin/`, no new top-level dirs.                                        |
| Architecture Standard 3 (i18n)               | PASS   | All new strings via `t()` from `react-i18next`. Keys added to `translation.en.json`.                                                     |
| Architecture Standard 5 (No barrel exports)  | PASS   | All imports use explicit file paths.                                                                                                     |
| Architecture Standard 6 (SOLID)              | PASS   | SRP: sorting hook separate from UI. OCP: pin indicator composable via `iconOverlay` prop. DIP: components use hooks, not direct queries. |
| Engineering Workflow 3 (Domain-first)        | PASS   | Flow: GraphQL documents → codegen → domain hook → UI components.                                                                         |
| Engineering Workflow 5 (Root cause analysis) | PASS   | No workarounds needed. Clean additive feature.                                                                                           |

**Post-Phase 1 re-check**: All gates PASS.

## Project Structure

### Documentation (this feature)

```text
specs/017-subspace-sorting-pinning/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Design decisions
├── data-model.md        # Phase 1: GraphQL schema mapping
├── quickstart.md        # Phase 1: API usage examples
├── contracts/
│   └── graphql-documents.md  # Phase 1: GraphQL document changes
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── space/
│   │   ├── hooks/
│   │   │   └── useSubspacesSorted.ts                    # NEW: client-side sorting logic
│   │   ├── components/
│   │   │   ├── SubspacePinIndicator.tsx                  # NEW: pin icon component
│   │   │   ├── cards/
│   │   │   │   └── SpaceCard.tsx                         # MODIFIED: pass iconOverlay for pinned
│   │   │   └── subspaces/
│   │   │       └── SubspaceView.tsx                      # MODIFIED: use sorted subspaces
│   │   ├── graphql/
│   │   │   └── queries/Subspaces.graphql                 # MODIFIED: add pinned field
│   │   └── layout/tabbedLayout/Tabs/
│   │       └── SpaceSubspacesPage.tsx                    # MODIFIED: apply sorting + pin icons
│   └── spaceAdmin/
│       └── SpaceAdminSubspaces/
│           ├── SpaceAdminSubspacesPage.tsx               # MODIFIED: sort dropdown, inline DnD, pin actions
│           ├── SubspacesSortableList.tsx                  # NEW: @dnd-kit sortable list
│           ├── SubspacesSortableItem.tsx                  # NEW: @dnd-kit sortable item row
│           ├── SortModeDropdown.tsx                       # NEW: sort mode selector
│           └── graphql/
│               └── UpdateSubspacePinned.graphql           # NEW: pin mutation
├── core/
│   └── i18n/en/
│       └── translation.en.json                           # MODIFIED: add sort/pin translation keys
```

**Structure Decision**: All new files within existing `src/domain/space/` and `src/domain/spaceAdmin/` directories. No new top-level directories. Follows domain-driven structure with sorting logic in a domain hook, UI components alongside their features.

## Component Architecture

### Settings View (SpaceAdminSubspacesPage)

```
SpaceAdminSubspacesPage
├── Header: "Subspaces" title
├── Actions Row:
│   ├── SortModeDropdown (Sort By: Alphabetical | Custom)
│   └── Create Subspace button
├── Search input
└── SubspacesSortableList (@dnd-kit DndContext + SortableContext)
    └── SubspacesSortableItem (for each subspace)
        ├── PinIndicator (if pinned, in front of name)
        ├── DragHandle (if draggable per mode rules)
        ├── Avatar
        ├── Name
        ├── Chevron (navigate)
        └── ContextMenu ("...")
            ├── Pin Space / Unpin Space
            ├── Save as Template
            └── Delete
```

### Subspaces Page (public-facing)

```
SpaceSubspacesPage
└── SubspaceView
    └── CardLayoutContainer
        └── SpaceCard (for each subspace)
            ├── iconOverlay: SubspacePinIndicator (if pinned)
            ├── Banner
            ├── Name
            └── Tagline
```

### Sorting Logic (useSubspacesSorted hook)

```
Input:  subspaces[], sortMode
Output: sortedSubspaces[]

if sortMode === CUSTOM:
  return subspaces.sort(by sortOrder)        // flat list, pin cosmetic only

if sortMode === ALPHABETICAL:
  pinned = subspaces.filter(s => s.pinned).sort(by sortOrder)
  unpinned = subspaces.filter(s => !s.pinned).sort(by name)
  return [...pinned, ...unpinned]
```

### Drag-and-Drop Rules

| Sort Mode    | Pinned Items | Non-Pinned Items | Drag-to-Pin |
| ------------ | ------------ | ---------------- | ----------- |
| Custom       | Draggable    | Draggable        | No          |
| Alphabetical | Draggable    | Not draggable    | Yes         |

## Key Implementation Notes

1. **@dnd-kit migration**: The existing `SubspacesSortDialog` uses `@hello-pangea/dnd` in a modal. Replace with inline `@dnd-kit` drag-and-drop directly in the settings list. Follow the pattern from `CalloutFramingMediaGalleryField.tsx` (sensors, SortableContext, useSortable).

2. **Pin icon reuse**: `SubspacePinIndicator` follows the `HomeSpacePinButton` pattern — small `Paper` wrapper with `PushPinOutlinedIcon`. On cards, passed as `iconOverlay` prop (same slot). On settings rows, rendered inline before the name.

3. **Context menu extension**: Add "Pin Space" / "Unpin Space" to the existing `getSubSpaceActions` function in `SpaceAdminSubspacesPage`. Toggle text based on current `pinned` state. Use `PushPinOutlinedIcon` as the menu item icon.

4. **Apollo cache updates**: After pin/unpin mutation, the returned `Space` object with updated `pinned` field will auto-update the Apollo cache (normalized by `id`). No manual cache eviction needed.

5. **Sort mode persistence**: Uses the existing `updateSpaceSettings` mutation with the new optional `sortMode` field. The dropdown triggers this mutation on change.

6. **Codegen dependency**: Must run `pnpm codegen` with server branch `041-subspace-sorting-pinning` running before implementation. Generated types include `SpaceSortMode` enum and `useUpdateSubspacePinnedMutation` hook.

## Complexity Tracking

No constitution violations to justify. All changes follow established patterns with minimal complexity.
