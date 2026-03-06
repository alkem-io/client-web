# Feature Specification: Subspace Sorting & Pinning

**Feature Branch**: `017-subspace-sorting-pinning`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Extend subspace sorting with Alphabetical/Custom sort modes and pinning functionality for subspaces"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Configure Subspace Sort Mode (Priority: P1)

A space administrator navigates to the space settings (Subspaces section) and selects a sorting mode from a dropdown with two options: **Custom** (manual sort order) or **Alphabetical**. The selected mode determines how subspaces are ordered both in the settings list and on the public-facing subspaces page.

- In **Custom** mode, all subspaces can be reordered via drag-and-drop, and their positions are persisted as sort order values.
- In **Alphabetical** mode, subspaces are listed in A-Z order by name, with pinned subspaces always appearing at the top.

**Why this priority**: The sort mode dropdown is the foundation that governs how all subspaces are displayed. Without it, pinning behavior has no context.

**Independent Test**: Can be fully tested by toggling between sort modes and verifying the subspace list reorders accordingly in both settings and the subspaces page.

**Acceptance Scenarios**:

1. **Given** a space admin is on the subspaces settings page, **When** they select "Custom" from the Sort By dropdown, **Then** all subspaces are displayed in their current sort order with drag handles on every item, allowing full reordering.
2. **Given** a space admin is on the subspaces settings page, **When** they select "Alphabetical" from the Sort By dropdown, **Then** non-pinned subspaces are displayed in alphabetical order by name.
3. **Given** the sort mode is set to "Alphabetical", **When** a visitor views the subspaces page, **Then** subspaces appear in alphabetical order (with pinned subspaces at the top).
4. **Given** the sort mode is set to "Custom", **When** a visitor views the subspaces page, **Then** subspaces appear in the manually defined sort order.

---

### User Story 2 - Pin and Unpin Subspaces (Priority: P1)

A space administrator can pin subspaces to ensure they always appear at the top of the subspace list, regardless of the active sort mode. Pinning can be done from:

1. The subspace context menu ("..." menu) which includes a "Pin Space" action.
2. Clicking the pin icon on a subspace row in the settings list.

When a subspace is pinned:

- Its sort order is set to place it first (or after other pinned items).
- It appears at the top of the subspace list, above all non-pinned subspaces.
- A pin icon is displayed to indicate its pinned status.

When a subspace is unpinned:

- The pin marker is removed.
- The subspace returns to its natural position based on the active sort mode.

**Why this priority**: Pinning is the core new capability that enhances the existing sorting system.

**Independent Test**: Can be tested by pinning/unpinning subspaces and verifying they move to/from the top of the list.

**Acceptance Scenarios**:

1. **Given** a space admin is on the subspaces settings page, **When** they click "Pin Space" from a subspace's context menu, **Then** the subspace is marked as pinned, moves to the top of the list, and displays a pin icon.
2. **Given** a subspace is already pinned, **When** the admin clicks "Unpin Space" from its context menu, **Then** the subspace is unpinned and returns to its natural position based on the active sort mode.
3. **Given** multiple subspaces are pinned, **When** viewing the settings list, **Then** all pinned subspaces appear at the top grouped together, followed by non-pinned subspaces ordered by the active sort mode.
4. **Given** the sort mode is "Alphabetical" and two subspaces are pinned, **When** the admin drags a pinned subspace to a different position among other pinned items, **Then** the sort order among pinned items is updated and persisted.

---

### User Story 3 - Display Pin Indicators Across Views (Priority: P2)

Pinned subspaces display a pin icon in all relevant views:

1. **Settings list (vertical list)**: The pin icon appears **in front of** the subspace name (per Figma design).
2. **Subspaces page (card grid)**: The pin icon appears in the **top-left corner** of the subspace card, similar to the pinned home space indicator on the dashboard's recent spaces cards.

**Why this priority**: Visual indicators are important for usability but the feature is functional without them being perfectly placed.

**Independent Test**: Can be tested by pinning subspaces and verifying pin icon placement in settings list and card grid views.

**Acceptance Scenarios**:

1. **Given** a subspace is pinned, **When** viewing the settings subspaces list, **Then** a pin icon (MUI PushPin / "keep" icon) is displayed in front of the subspace name.
2. **Given** a subspace is pinned, **When** viewing the subspaces page (card grid), **Then** a pin icon appears in the top-left corner of that subspace's card.
3. **Given** a subspace is not pinned, **When** viewing any list or card view, **Then** no pin icon is displayed for that subspace.

---

### User Story 4 - Drag-and-Drop Behavior per Sort Mode (Priority: P2)

The drag-and-drop behavior adapts based on the active sort mode:

- **Custom mode**: All subspaces have drag handles and can be freely reordered as one flat list. Pin markers are cosmetic only in this mode — they do not create a separate section or affect drag behavior. No auto-pinning occurs on drag.
- **Alphabetical mode**: Only pinned subspaces have drag handles and can be reordered among themselves. Non-pinned subspaces are locked in alphabetical order and cannot be dragged. Dragging a non-pinned subspace into the pinned section automatically pins it.

**Why this priority**: Contextual drag behavior is important for preventing user confusion but the basic pin/sort functionality works without it.

**Independent Test**: Can be tested by switching sort modes and attempting drag operations, verifying allowed/disallowed behaviors.

**Acceptance Scenarios**:

1. **Given** the sort mode is "Custom", **When** an admin drags any subspace to a new position, **Then** the sort order updates for all affected subspaces.
2. **Given** the sort mode is "Alphabetical", **When** an admin drags a pinned subspace among other pinned subspaces, **Then** the pinned subspaces reorder while non-pinned subspaces remain in alphabetical order.
3. **Given** the sort mode is "Alphabetical", **When** an admin drags a non-pinned subspace into the pinned section, **Then** that subspace becomes pinned and is placed at the drop position among other pinned items.

---

### Edge Cases

- What happens when the only pinned subspace is unpinned? It returns to its alphabetical or sort-order position; the pinned section becomes empty.
- What happens when all subspaces are pinned in Alphabetical mode? All items are draggable; the behavior effectively matches Custom mode.
- What happens when a subspace is renamed while in Alphabetical mode? Non-pinned subspaces re-sort based on the new name.
- What happens if a space has zero subspaces? The sort mode dropdown and pinning controls are still visible but the list is empty.
- What happens when a new subspace is created? It is added as non-pinned with a sort order that places it at the end (Custom mode) or in its alphabetical position (Alphabetical mode).

## Clarifications

### Session 2026-03-06

- Q: What should the default sort mode be for existing spaces when this feature is deployed? → A: Default to "Alphabetical" — this restores the original alphabetical ordering that was the default before custom sorting was introduced.
- Q: In Custom mode, if a user drags a non-pinned subspace above pinned ones, should it auto-pin? → A: No — in Custom mode the entire list is one flat reorderable area; pin markers are cosmetic only. Auto-pin on drag only applies in Alphabetical mode.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a "Sort By" dropdown in the space subspaces settings with two options: "Custom" and "Alphabetical".
- **FR-002**: System MUST persist the selected sort mode as a space-level setting.
- **FR-003**: System MUST allow space administrators to pin and unpin individual subspaces.
- **FR-004**: System MUST persist the pinned state of each subspace.
- **FR-005**: When displaying subspaces, the system MUST show pinned subspaces first (ordered by their sort order), followed by non-pinned subspaces ordered according to the active sort mode.
- **FR-006**: When a subspace is pinned, the system MUST assign it a sort order value that places it at the first available position among pinned items (or at the specific drop position if dragged).
- **FR-007**: In "Custom" mode, all subspaces MUST be reorderable via drag-and-drop.
- **FR-008**: In "Alphabetical" mode, only pinned subspaces MUST be reorderable via drag-and-drop; non-pinned subspaces MUST be locked in alphabetical order.
- **FR-009**: The "Pin Space" / "Unpin Space" action MUST be available in the subspace context menu ("..." menu).
- **FR-010**: Pinned subspaces MUST display a pin icon (MUI PushPin / "keep" icon) in the settings list (in front of the name) and in card views (top-left corner of the card).
- **FR-011**: When a non-pinned subspace is dragged into the pinned section (Alphabetical mode only), it MUST automatically become pinned. In Custom mode, no auto-pinning occurs; the list is one flat reorderable area.
- **FR-012**: The sort mode and pinning state MUST be respected on the public-facing subspaces page, not just in settings.
- **FR-013**: The default sort mode for all spaces (including existing ones) MUST be "Alphabetical".

### Key Entities

- **Space Settings (Sort Mode)**: A space-level configuration that stores the active sort mode ("Custom" or "Alphabetical") for its subspaces.
- **Subspace**: Extended with a `pinned` boolean marker. The existing `sortOrder` field continues to govern ordering. Pinned subspaces are displayed first, ordered by `sortOrder`, followed by non-pinned subspaces ordered by either `sortOrder` (Custom) or name (Alphabetical).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Space administrators can switch between Custom and Alphabetical sort modes and see subspaces reorder immediately in both settings and the subspaces page.
- **SC-002**: Pinned subspaces consistently appear at the top of subspace lists across all views (settings, subspaces page).
- **SC-003**: Pin icons are visible in the correct positions: in front of the name in settings list, top-left corner in card views.
- **SC-004**: Drag-and-drop reordering works correctly in Custom mode (all items) and Alphabetical mode (pinned items only).
- **SC-005**: Pinning/unpinning via the context menu and drag-to-pin in Alphabetical mode work reliably without page refresh.
- **SC-006**: Sort mode selection persists across sessions and is reflected for all users viewing the space.

## Assumptions

- The backend API will be extended to support a `pinned` boolean on subspaces and a `sortMode` setting on spaces. The exact API shape will be determined during planning.
- The existing `sortOrder` numeric field on subspaces will continue to be used for ordering; pinning adds a filter layer on top.
- Drag-and-drop will use the `@dnd-kit` library (already used for the gallery) following the same patterns as the existing `@hello-pangea/dnd` usage.
- Only users with space admin (or equivalent) permissions can change the sort mode, pin/unpin subspaces, or reorder them.
- The pin icon used is MUI's `PushPin` icon (referred to as "keep" in the Figma design).
- The "Sort By" dropdown replaces or augments the existing "Reorder Subspaces" button in the space admin subspaces settings.
