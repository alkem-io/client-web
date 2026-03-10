# Tasks: Subspace Sorting & Pinning

**Input**: Design documents from `/specs/017-subspace-sorting-pinning/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (GraphQL & Codegen)

**Purpose**: Generate types from updated server schema and prepare GraphQL documents

- [x] T001 Add `pinned` field to subspaces query in `src/domain/space/graphql/queries/Subspaces.graphql` — add `pinned` to the subspace selection set alongside existing `sortOrder`
- [x] T002 Add `sortMode` field to space settings in the GraphQL query/fragment where `SpaceSettings` is fetched (find the document that queries `settings { privacy, membership, collaboration }` and add `sortMode`)
- [x] T003 Create `UpdateSubspacePinned.graphql` mutation document at `src/domain/spaceAdmin/SpaceAdminSubspaces/graphql/UpdateSubspacePinned.graphql` with mutation `updateSubspacePinned(pinnedData: $pinnedData) { id pinned sortOrder }`
- [x] T004 Add `pinned` field to the subspace card fragment (find the fragment used by `SpaceSubspacesPage` / `SubspaceCard` and add `pinned`)
- [x] T005 Add `sortMode` to the `updateSpaceSettings` mutation input wherever it's defined (extend the existing mutation document to include `sortMode` in the response)
- [x] T006 Run `pnpm codegen` to generate TypeScript types and hooks (requires server branch `041-subspace-sorting-pinning` running at localhost:4000/graphql)

**Checkpoint**: Generated types include `SpaceSortMode` enum, `useUpdateSubspacePinnedMutation` hook, and `pinned` field on subspace types.

---

## Phase 2: Foundational (Domain Hook & Shared Components)

**Purpose**: Core sorting logic and pin indicator component used by all user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create `useSubspacesSorted` hook in `src/domain/space/hooks/useSubspacesSorted.ts` — accepts subspaces array and sortMode, returns sorted array. Logic: if CUSTOM → sort all by sortOrder (flat list); if ALPHABETICAL → pinned first (by sortOrder), then non-pinned (by name A-Z). Use `useMemo` for the sorted result.
- [x] T008 [P] Create `SubspacePinIndicator` component in `src/domain/space/components/SubspacePinIndicator.tsx` — small `Paper` wrapper with `PushPinOutlinedIcon` (fontSize 14, color primary), following the `HomeSpacePinButton` pattern. Include accessible tooltip text via `t()`. No click handler — this is a display-only indicator.
- [x] T009 [P] Add i18n keys to `src/core/i18n/en/translation.en.json` — add keys for: sort mode labels ("Alphabetical", "Custom"), "Sort By" label, "Pin Space" / "Unpin Space" menu items, pin indicator tooltip, and any other user-visible strings needed.

**Checkpoint**: Sorting hook and pin indicator are available for use in all views.

---

## Phase 3: User Story 1 - Configure Subspace Sort Mode (Priority: P1)

**Goal**: Space admins can select between Alphabetical and Custom sort modes via a dropdown in the subspaces settings. The selected mode determines subspace ordering in both settings and public views.

**Independent Test**: Toggle between sort modes on the settings page and verify subspaces reorder. Check the public subspaces page reflects the mode.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create `SortModeDropdown` component in `src/domain/spaceAdmin/SpaceAdminSubspaces/SortModeDropdown.tsx` — MUI `Select` or dropdown with two options: "Alphabetical" and "Custom". On change, call `useUpdateSpaceSettingsMutation` (or the existing update settings mutation) with `sortMode` field. Display current mode from query data.
- [x] T011 [US1] Update `SpaceAdminSubspacesPage` in `src/domain/spaceAdmin/SpaceAdminSubspaces/SpaceAdminSubspacesPage.tsx` — replace the "Reorder Subspaces" sort button with the `SortModeDropdown` component. Fetch `sortMode` from space settings query. Pass `sortMode` to the subspace list to control ordering. Remove or deprecate the `SubspacesSortDialog` modal trigger.
- [x] T012 [US1] Update `SpaceSubspacesPage` in `src/domain/space/layout/tabbedLayout/Tabs/SpaceSubspacesPage.tsx` — fetch `sortMode` from space settings, use `useSubspacesSorted` hook to sort subspaces before rendering them in the card grid.

**Checkpoint**: Sort mode dropdown works in settings. Subspaces reorder in both settings list and public page based on selected mode.

---

## Phase 4: User Story 2 - Pin and Unpin Subspaces (Priority: P1)

**Goal**: Space admins can pin/unpin subspaces via context menu. Pinned subspaces appear at the top of the list (in Alphabetical mode, sorted by sortOrder; in Custom mode, pin is cosmetic only).

**Independent Test**: Pin a subspace via context menu, verify it moves to top in Alphabetical mode. Unpin and verify it returns to alphabetical position.

### Implementation for User Story 2

- [x] T013 [US2] Add "Pin Space" / "Unpin Space" action to the context menu in `src/domain/spaceAdmin/SpaceAdminSubspaces/SpaceAdminSubspacesPage.tsx` — extend the `getSubSpaceActions` function with a new `MenuItemWithIcon` using `PushPinOutlinedIcon`. Toggle label based on current `pinned` state. On click, call `useUpdateSubspacePinnedMutation` with the subspace ID and toggled pinned value.
- [x] T014 [US2] Integrate pinned state into the settings subspaces list in `src/domain/spaceAdmin/SpaceAdminSubspaces/SpaceAdminSubspacesPage.tsx` — after pin/unpin mutation, the Apollo cache auto-updates. Ensure the list re-sorts via `useSubspacesSorted` to reflect the new pinned state (pinned items move to top in Alphabetical mode).
- [x] T015 [US2] Update `SpaceSubspacesPage` in `src/domain/space/layout/tabbedLayout/Tabs/SpaceSubspacesPage.tsx` — ensure `pinned` field is available from the query (from T004) and the `useSubspacesSorted` hook (from T007) correctly handles pinned subspaces in the public view.

**Checkpoint**: Pin/unpin works via context menu. Pinned subspaces appear at top in Alphabetical mode. Apollo cache updates correctly.

---

## Phase 5: User Story 3 - Display Pin Indicators Across Views (Priority: P2)

**Goal**: Pinned subspaces show a pin icon in the settings list (in front of name) and on subspace cards (top-left corner).

**Independent Test**: Pin a subspace, verify pin icon appears in settings list and on its card in the subspaces page. Unpin and verify icon disappears.

### Implementation for User Story 3

- [x] T016 [P] [US3] Add pin indicator to settings list items in `src/domain/spaceAdmin/SpaceAdminSubspaces/SpaceAdminSubspacesPage.tsx` — for each subspace row, render `SubspacePinIndicator` in front of the subspace name when `pinned === true`. Ensure it's positioned per Figma design (before avatar/name).
- [x] T017 [P] [US3] Add pin indicator to subspace cards in `src/domain/space/layout/tabbedLayout/Tabs/SpaceSubspacesPage.tsx` — pass `SubspacePinIndicator` as the `iconOverlay` prop on `SpaceCard` when the subspace is pinned. This places it in the top-left corner (same position as `HomeSpacePinButton` on recent spaces).

**Checkpoint**: Pin icons visible in correct positions in both settings list and card grid.

---

## Phase 6: User Story 4 - Drag-and-Drop Behavior per Sort Mode (Priority: P2)

**Goal**: Inline drag-and-drop in the settings list using `@dnd-kit`. In Custom mode, all items are draggable. In Alphabetical mode, only pinned items are draggable; dragging a non-pinned item into the pinned section auto-pins it.

**Independent Test**: In Custom mode, drag any item to reorder. In Alphabetical mode, drag only pinned items. Drag a non-pinned item into the pinned section and verify it auto-pins.

### Implementation for User Story 4

- [x] T018 [US4] Create `SubspacesSortableItem` component in `src/domain/spaceAdmin/SpaceAdminSubspaces/SubspacesSortableItem.tsx` — uses `useSortable` from `@dnd-kit/sortable`. Renders a subspace row with: optional drag handle (via `DragIndicatorIcon`), pin indicator (if pinned), avatar, name, chevron, and context menu. The `disabled` prop on `useSortable` controls whether the item is draggable (based on sort mode and pinned state).
- [x] T019 [US4] Create `SubspacesSortableList` component in `src/domain/spaceAdmin/SpaceAdminSubspaces/SubspacesSortableList.tsx` — wraps items with `DndContext` and `SortableContext` from `@dnd-kit`. Configure `PointerSensor` and `KeyboardSensor`. On drag end: reorder items and call `useUpdateSubspacesSortOrderMutation` with new ID order. In Alphabetical mode, if a non-pinned item is dragged into the pinned section, also call `useUpdateSubspacePinnedMutation` to auto-pin it.
- [x] T020 [US4] Integrate `SubspacesSortableList` into `SpaceAdminSubspacesPage` in `src/domain/spaceAdmin/SpaceAdminSubspaces/SpaceAdminSubspacesPage.tsx` — replace the current `SearchableList` (or equivalent list rendering) with `SubspacesSortableList`. Pass sorted subspaces, sort mode, and mutation handlers. In Custom mode: all items draggable. In Alphabetical mode: only pinned items have drag handles; non-pinned items are disabled for drag but can be dragged into pinned section.
- [x] T021 [US4] Handle drag-to-pin logic in `SubspacesSortableList` — when sort mode is Alphabetical and a non-pinned item is dropped among pinned items: call `updateSubspacePinned` mutation first, then call `updateSubspacesSortOrder` with the new order. Ensure optimistic UI update so the item appears pinned immediately.

**Checkpoint**: Drag-and-drop works correctly in both modes. Auto-pin on drag works in Alphabetical mode.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, accessibility, and edge cases

- [x] T022 Verify keyboard accessibility for drag-and-drop — ensure `KeyboardSensor` from `@dnd-kit` is configured with `sortableKeyboardCoordinates`. Test that drag handles are focusable and operable via keyboard (Space/Enter to grab, arrow keys to move).
- [x] T023 Handle edge case: empty subspaces list — verify sort mode dropdown and create button are still visible when no subspaces exist. The sortable list should render an empty state gracefully.
- [x] T024 Run `pnpm lint` and `pnpm vitest run` to verify no regressions.
- [x] T025 Remove or deprecate the old `SubspacesSortDialog` component at `src/domain/spaceAdmin/SpaceAdminSubspaces/SubspacesSortDialog/SubspacesSortDialog.tsx` if it's fully replaced by inline drag-and-drop. Check for any remaining references.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately (requires running server)
- **Foundational (Phase 2)**: Depends on Phase 1 (codegen must complete first)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (needs sorting hook)
- **User Story 2 (Phase 4)**: Depends on Phase 2 (needs sorting hook + pin indicator)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (needs pin indicator component)
- **User Story 4 (Phase 6)**: Depends on US1 + US2 (needs sort mode + pin/unpin working)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Sort Mode)** + **US2 (Pin/Unpin)**: Both P1, can proceed in parallel after Phase 2
- **US3 (Pin Indicators)**: P2, can proceed in parallel with US1/US2 after Phase 2
- **US4 (Drag-and-Drop)**: P2, depends on US1 and US2 being functional (needs sort mode context and pin mutations)

### Within Each User Story

- GraphQL documents → codegen → domain hooks → UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T007, T008, T009 can all run in parallel (Phase 2)
- T010 (SortModeDropdown) can be built in parallel with T013 (pin menu action)
- T016 and T017 can run in parallel (different views)
- US1, US2, US3 can proceed in parallel after Phase 2

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all foundational tasks together:
Task T007: "Create useSubspacesSorted hook in src/domain/space/hooks/useSubspacesSorted.ts"
Task T008: "Create SubspacePinIndicator in src/domain/space/components/SubspacePinIndicator.tsx"
Task T009: "Add i18n keys to src/core/i18n/en/translation.en.json"
```

## Parallel Example: US1 + US2 (after Phase 2)

```bash
# US1 and US2 can proceed in parallel:
Task T010: "[US1] Create SortModeDropdown component"
Task T013: "[US2] Add Pin Space / Unpin Space to context menu"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (GraphQL + codegen)
2. Complete Phase 2: Foundational (sorting hook + pin indicator + i18n)
3. Complete Phase 3: US1 (sort mode dropdown)
4. Complete Phase 4: US2 (pin/unpin via context menu)
5. **STOP and VALIDATE**: Both P1 stories functional
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (sort mode) → Settings and public page respect sort mode (MVP!)
3. US2 (pinning) → Pin/unpin works, pinned items at top
4. US3 (pin icons) → Visual indicators in settings + cards
5. US4 (drag-and-drop) → Full inline DnD with mode-aware behavior
6. Polish → Cleanup, accessibility, edge cases

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Server branch `041-subspace-sorting-pinning` must be running for codegen (Phase 1)
- All new user-visible strings must use `t()` from react-i18next
- Follow `@dnd-kit` patterns from `CalloutFramingMediaGalleryField.tsx`
- Pin indicator follows `HomeSpacePinButton` visual pattern
- Apollo cache auto-updates after mutations (normalized by `id`)
