# Research: Configurable Callout Collapse/Expand State

**Feature Branch**: `020-callout-collapse`
**Date**: 2026-03-11

## R1: Existing Collapse/Expand Mechanism

**Decision**: Reuse the existing `ExpandableMarkdown` component; only change the initial state source.

**Rationale**: `ExpandableMarkdown` (`src/core/ui/markdown/ExpandableMarkdown.tsx`) already implements the full collapse/expand UX:

- Internal state: `OverflowState = 'detecting' | 'no-overflow' | 'expanded' | 'collapsed'`
- Starts in `'detecting'` mode, measures content overflow against `maxHeightGutters` (default: 6)
- If overflow detected, transitions to `'expanded'` (currently shows full content by default)
- User can toggle between `'expanded'` and `'collapsed'` via "Show Less" / "Read More" buttons

**Current flow**: `detecting` → `expanded` (if overflow) or `no-overflow` (if fits). The initial resolved state is always expanded.

**Required change**: Accept an optional `defaultCollapsed` prop. When `true`, the detection flow becomes: `detecting` → `collapsed` (if overflow) or `no-overflow` (if fits). This preserves all existing behavior while allowing the initial state to be driven by the space setting.

**Alternatives considered**:

- Creating a new wrapper component: Rejected — adds unnecessary abstraction over simple state initialization
- Managing collapse state at the callout list level: Rejected — `ExpandableMarkdown` already handles overflow detection and state; duplicating that logic upstream would violate DRY

## R2: Space Settings GraphQL Pattern

**Decision**: Follow the existing sub-object pattern (`privacy`, `membership`, `collaboration`) to add a `layout` sub-object.

**Rationale**: The server spec (`043-callout-collapse`) defines a new `layout` sub-object on `SpaceSettings` containing `calloutDescriptionDisplayMode`. This follows the established pattern:

- Query fragment: `SpaceSettings` fragment in `SpaceSettings.graphql` (lines 29-48)
- Mutation input: `UpdateSpaceSettingsEntityInput` accepts optional sub-objects
- Hook: `useSpaceSettingsUpdate` merges sub-objects and sends via `updateSpaceSettings` mutation

**Key files to modify**:

- `src/domain/spaceAdmin/SpaceAdminSettings/graphql/SpaceSettings.graphql` — add `layout { calloutDescriptionDisplayMode }` to fragment
- `src/domain/spaceAdmin/SpaceAdminSettings/graphql/UpdateSpaceSettings.graphql` — add `layout` to mutation response
- `src/domain/space/settings/SpaceSettingsModel.ts` — add `SpaceSettingsLayout` interface
- `src/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings.tsx` — add layout defaults
- `src/domain/spaceAdmin/SpaceAdminSettings/useSpaceSettingsUpdate.ts` — extend for layout updates

## R3: Delivering the Setting to Callout Components

**Decision**: Query the `calloutDescriptionDisplayMode` where callouts are rendered and pass it as a prop through the component tree.

**Rationale**: The `SpaceContext` (`src/domain/space/context/SpaceContext.tsx`) does NOT include space settings — it focuses on identity, permissions, and entitlements. Adding settings to SpaceContext would bloat it. Instead:

- The callout rendering entry points (`CalloutsView`, `CalloutPage`) can query the space's `layout.calloutDescriptionDisplayMode` setting
- Pass it down as a prop to `CalloutView` → `CalloutViewLayout` → `ExpandableMarkdown`
- Since layout settings are public metadata (no READ privilege needed), this query is lightweight

**Alternative**: Add to SpaceContext — rejected because SpaceContext is already large and settings are not needed by most consumers. A dedicated query or piggybacking on an existing callout query is more targeted.

**Reactive update approach**: When the admin changes the setting, the Apollo cache update from the mutation response will propagate to any active query watching `settings.layout.calloutDescriptionDisplayMode`, causing callout components to re-render with the new value automatically. No manual refetch needed.

## R4: Admin UI Placement

**Decision**: Place the callout display mode toggle in `SpaceAdminLayoutPage`, below the existing Innovation Flow editor block.

**Rationale**: Per user instruction: "The layout setting switch should be below the current layout component for updating the flow states." The `SpaceAdminLayoutPage.tsx` currently contains a single `PageContentBlock` with `InnovationFlowCollaborationToolsBlock`. A new `PageContentBlock` will be added below it with a toggle/switch for the display mode.

**UI pattern**: Follow `MemberActionsSettings` component pattern (switches with labels). A simple two-option toggle (Collapsed/Expanded) presented as a switch or radio group.

## R5: Layout Tab Availability for Subspaces

**Decision**: The Layout tab is currently only available for L0 spaces (top-level). Subspaces (L1, L2) do NOT have the Layout tab.

**Rationale**: Research confirmed that `SpaceAdminTabsL1.tsx` and `SpaceAdminTabsL2.tsx` do NOT include `SettingsSection.Layout`. This means:

- L0 spaces: Setting is configurable via Layout tab
- L1/L2 subspaces: Need an alternative path to configure the setting, OR it could be placed in the existing Settings tab for subspaces

**Resolution**: For MVP, add the callout display mode setting to the Layout tab for L0 spaces. For subspaces, the setting can be added to the Settings tab (`SpaceAdminSettingsPage`) since it already handles space settings. This aligns with the spec requirement that each space/subspace is independently configurable.
