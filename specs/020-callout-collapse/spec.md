# Feature Specification: Configurable Callout Collapse/Expand State

**Feature Branch**: `020-callout-collapse`
**Created**: 2026-03-11
**Status**: Draft
**Input**: User description: "Improve the collapse/expand logic of a Post #9340 - configurable collapsed/expanded callout descriptions per space with persisted state"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Space Admin Configures Callout Display Mode (Priority: P1)

As a space administrator, I want to configure whether callout descriptions in my space appear collapsed or expanded by default, so that I can control the visual density and readability of the space for all users.

**Why this priority**: This is the core feature — without the ability to configure the display mode at the space level, no other functionality is possible.

**Independent Test**: Can be fully tested by navigating to Space -> Admin -> Layout tab, toggling the callout display mode setting, and verifying that all callout descriptions in the space reflect the chosen mode.

**Acceptance Scenarios**:

1. **Given** a space admin is on the Space Admin -> Layout tab, **When** they set the callout display mode to "Collapsed", **Then** all callout descriptions in that space render in their collapsed state for all users.
2. **Given** a space admin is on the Space Admin -> Layout tab, **When** they set the callout display mode to "Expanded", **Then** all callout descriptions in that space render in their fully expanded state for all users.
3. **Given** a space admin changes the display mode, **When** the setting is saved, **Then** all callouts in the space reactively update their state without a full page reload.

---

### User Story 2 - Consistent Callout State Across a Space (Priority: P1)

As a user browsing a space, I want all callout descriptions to have a consistent initial display state (all collapsed or all expanded), so that my reading experience is predictable and uniform.

**Why this priority**: Consistency is a core requirement — without it, the feature has limited value. Users should not see a mix of collapsed and expanded callouts within the same space.

**Independent Test**: Can be fully tested by navigating to a space with the display mode set to "Collapsed", verifying all callouts are collapsed, then switching the setting to "Expanded" and verifying all callouts are expanded.

**Acceptance Scenarios**:

1. **Given** a space has the display mode set to "Collapsed", **When** a user navigates to any page within that space that contains callouts, **Then** all callout descriptions appear collapsed.
2. **Given** a space has the display mode set to "Expanded", **When** a user navigates to any page within that space that contains callouts, **Then** all callout descriptions appear fully expanded.
3. **Given** a space has multiple subspaces, **When** the parent space display mode is configured, **Then** subspace callouts are unaffected — each subspace has its own independent display mode setting.

---

### User Story 3 - User Temporarily Toggles Individual Callout (Priority: P2)

As a user, I want to temporarily expand a collapsed callout or collapse an expanded one, so that I can read or hide content as needed without affecting other users.

**Why this priority**: This preserves the existing toggle behavior users are accustomed to, layered on top of the new persisted default.

**Independent Test**: Can be fully tested by clicking the expand/collapse toggle on an individual callout and verifying it changes state, then navigating away and back to confirm the callout reverts to the space's default state.

**Acceptance Scenarios**:

1. **Given** a space is set to "Collapsed" and a user views a callout, **When** the user clicks the expand toggle on that callout, **Then** the callout description expands for that user only.
2. **Given** a user has manually expanded a callout, **When** they navigate away and return to the same page, **Then** the callout reverts to the space's default state (collapsed).
3. **Given** a space is set to "Expanded", **When** a user clicks the collapse toggle on a callout, **Then** that callout collapses for that user only, and reverts on navigation.

---

### User Story 4 - Default Behavior for New and Existing Spaces (Priority: P1)

As a platform operator, I want new spaces to default to "Collapsed" and all existing spaces to default to "Expanded", so that current behavior is preserved while new spaces get the optimized default.

**Why this priority**: Migration behavior is critical for a non-breaking rollout. Existing spaces must continue to behave as they do today (expanded), while new spaces benefit from the collapsed default.

**Independent Test**: Can be fully tested by creating a new space and verifying callouts are collapsed by default, and by checking an existing space to confirm callouts remain expanded.

**Acceptance Scenarios**:

1. **Given** a new space is created after this feature is deployed, **When** the space is viewed, **Then** all callout descriptions are collapsed by default.
2. **Given** an existing space that was created before this feature, **When** the space is viewed, **Then** all callout descriptions remain expanded (preserving current behavior).
3. **Given** an existing space admin, **When** they visit the Layout tab, **Then** the callout display mode shows "Expanded" as the current setting.

---

### Edge Cases

- What happens when a callout has no description content? The collapse/expand toggle should not appear for empty descriptions.
- What happens when a space admin changes the setting while on the admin page? The callouts reactively update their state without a full page reload (for the admin's own session). Other users see the change on their next navigation or data refetch.
- What happens with subspaces? Each subspace is configured independently; no inheritance from parent space. New subspaces default to "Collapsed", existing ones to "Expanded".
- What happens if the setting is missing or corrupted? The server returns `EXPANDED` as the fallback when the `layout` or `calloutDescriptionDisplayMode` field is absent. The client should also treat a missing/null value as `EXPANDED`.
- What happens when a space is created from a template? The template's display mode is inherited during space creation (server-side behavior). The client does not need special handling — it reads the resulting setting from the space's settings as usual.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a space-level setting to configure the default display mode (Collapsed/Expanded) for all callout types that have markdown descriptions.
- **FR-002**: The callout display mode setting MUST be accessible in the Space -> Admin -> Layout tab.
- **FR-003**: The configured display mode MUST apply consistently to all callouts within the configured space only (no inheritance to subspaces).
- **FR-004**: System MUST persist the display mode setting via the `updateSpaceSettings` mutation (field path: `layout.calloutDescriptionDisplayMode`) so it survives page reloads and applies across all users of that space.
- **FR-005**: New spaces MUST default to "Collapsed" display mode.
- **FR-006**: All existing spaces MUST default to "Expanded" display mode upon feature deployment (preserving current behavior).
- **FR-007**: Users MUST still be able to temporarily expand or collapse individual callouts, with the state resetting to the space default on navigation.
- **FR-008**: The collapse/expand toggle MUST NOT appear for callouts with no description content.
- **FR-009**: Each space and subspace MUST be configured independently; there is no inheritance of the display mode setting from parent to child.
- **FR-010**: System MUST support bulk update of the display mode setting (configurable per space, applied to all callouts in that space).
- **FR-011**: When a space admin saves a change to the display mode setting, all callouts in that space MUST reactively update their collapse/expand state without requiring a full page reload.

### Key Entities

- **Space Settings**: Extended with a `layout` sub-object (type `SpaceSettingsLayout`) containing `calloutDescriptionDisplayMode`. This follows the same sub-object pattern as `privacy`, `membership`, and `collaboration` within `ISpaceSettings`. The `layout` settings are public metadata (no READ privilege required, same pattern as `sortMode`), enabling the client to determine display mode before full space data loads.
- **CalloutDescriptionDisplayMode (Enum)**: GraphQL enum with values `COLLAPSED` and `EXPANDED`. Used in both query responses (`SpaceSettingsLayout.calloutDescriptionDisplayMode`) and mutation inputs (`UpdateSpaceSettingsLayoutInput.calloutDescriptionDisplayMode`).
- **Callout**: Existing entity within a space. The collapse/expand setting applies to all callout types that have markdown descriptions (e.g., Posts, and any other callout types with markdown content). Callout types without markdown descriptions (e.g., Whiteboards, Links) are unaffected.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Space administrators can configure the callout display mode in under 30 seconds via the Layout tab.
- **SC-002**: 100% of callouts within a space reflect the configured display mode on page load.
- **SC-003**: Existing spaces continue to display callouts in expanded mode after deployment with zero user-reported regressions.
- **SC-004**: New spaces display callouts in collapsed mode by default without requiring admin configuration.
- **SC-005**: Users can still temporarily toggle individual callout state, with the toggle reverting to the space default on navigation.

## Clarifications

### Session 2026-03-11

- Q: Does the collapse/expand setting apply to all callout types or only Post-type callouts? → A: All callout types with markdown descriptions.
- Q: What does "collapsed" mean visually? → A: Use the existing collapse/expand visual logic already in the codebase. This feature only controls the default initial state per space, not the visual mechanism itself.
- Q: How deep does subspace inheritance of the display mode go? → A: No inheritance. Each space/subspace must be configured independently.
- Aligned with server spec (`043-callout-collapse`): GraphQL field path is `settings.layout.calloutDescriptionDisplayMode` (enum `CalloutDescriptionDisplayMode`). Layout settings are public metadata (no READ privilege). Server fallback for missing values is `EXPANDED`. Template-based space creation inherits display mode from template.

## Assumptions

- The "Layout" tab already exists in the Space Admin interface and can accommodate a new setting.
- The backend exposes `settings.layout.calloutDescriptionDisplayMode` via GraphQL (see server spec `043-callout-collapse`). The client reads this field to determine the default display mode and writes it via `updateSpaceSettings` mutation.
- Layout settings are publicly accessible without READ privilege (same pattern as `sortMode`), so the client can determine the display mode during initial render before full space data loads.
- The existing collapse/expand toggle mechanism and visual behavior on individual callouts will be preserved exactly as-is. This feature only changes the default initial state, not the collapse/expand rendering logic.
- "Bulk update" means the setting applies to all callouts in a space at once (not individual per-callout configuration).
- No inheritance between spaces/subspaces; each is configured independently.
- Template-based space creation inherits the template's display mode setting server-side; no special client handling needed.
