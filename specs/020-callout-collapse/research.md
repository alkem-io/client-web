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

**Implementation note**: A `useEffect` re-enters `'detecting'` state when `defaultCollapsed` changes. This handles two cases: (1) the setting loads asynchronously after the component mounts, and (2) the admin reactively toggles the setting while callouts are mounted. Without this, the initial overflow detection fires before the query resolves (with `defaultCollapsed=false`), and later changes to the prop are ignored because the state is no longer `'detecting'`.

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

**Decision**: Create a dedicated `useCalloutDescriptionDisplayMode(spaceId)` hook that encapsulates the `useSpaceSettingsQuery` call and returns a `defaultCollapsed` boolean. Call it directly in `CalloutView`.

**Rationale**: The `SpaceContext` (`src/domain/space/context/SpaceContext.tsx`) does NOT include space settings — it focuses on identity, permissions, and entitlements. Adding settings to SpaceContext would bloat it. Instead:

- A `useCalloutDescriptionDisplayMode` hook (`src/domain/space/settings/useCalloutDescriptionDisplayMode.ts`) follows the `useSpaceGuestContributions` pattern — a thin wrapper around `useSpaceSettingsQuery` that returns a single derived value
- The hook is called in `CalloutView`, which already has access to `useSpace()` and `useSubSpace()` for the space ID
- The resulting `defaultCollapsed` boolean is passed via prop to `CalloutViewLayout` → `ExpandableMarkdown`
- `CalloutsView` and `CalloutPage` are NOT modified — the setting is fetched at the `CalloutView` level

**Gotcha**: `SubspaceContext` default value has `subspace.id: ''` (empty string, not null/undefined) when no subspace is active. The space ID resolution must use `||` (not `??`) to correctly fall through: `subspace?.id || space?.id`.

**Alternative**: Add to SpaceContext — rejected because SpaceContext is already large and settings are not needed by most consumers. Prop-drilling from `CalloutsView` — rejected because `CalloutsView` doesn't have space settings access and the hook approach is cleaner.

**Reactive update approach**: When the admin changes the setting, the Apollo cache update from the mutation response propagates to `useSpaceSettingsQuery` in the hook, causing `CalloutView` to re-render with the new `defaultCollapsed` value. The `ExpandableMarkdown` re-enters `'detecting'` state via the `useEffect` and re-evaluates. No manual refetch needed.

## R4: Admin UI Placement

**Decision**: Place the callout display mode toggle in `SpaceAdminLayoutPage`, below the existing Innovation Flow editor block.

**Rationale**: Per user instruction: "The layout setting switch should be below the current layout component for updating the flow states." The `SpaceAdminLayoutPage.tsx` currently contains a single `PageContentBlock` with `InnovationFlowCollaborationToolsBlock`. A new `PageContentBlock` will be added below it with a toggle/switch for the display mode.

**UI pattern**: Follow `MemberActionsSettings` component pattern (switches with labels). A simple two-option toggle (Collapsed/Expanded) presented as a switch or radio group.

## R5: Layout Tab Availability for Subspaces

**Decision**: The Layout tab is now available at all space levels (L0, L1, L2).

**Rationale**: Initially, `SpaceAdminTabsL1.tsx` and `SpaceAdminTabsL2.tsx` did not include `SettingsSection.Layout`, so the callout display mode toggle was placed in the Settings tab for subspaces as a workaround.

**Resolution**: The Layout tab was added to L1 and L2 tab definitions and routing, reusing the existing `SpaceAdminLayoutPage` component with `useL0Layout: false`. The workaround in `SpaceAdminSettingsPage` (conditional `CalloutDisplayModeSettings` for subspaces) was removed. All levels now consistently use the Layout tab for layout-related settings, including the Innovation Flow editor and the callout display mode toggle.

**Gotcha — spaceId prop**: `SpaceAdminLayoutPage` originally used `useSpace()` to get `space.id` for all queries/mutations. Since `useSpace()` always returns the L0 space context (even when rendered inside a subspace route), an optional `spaceId` prop was added. When provided (with the subspace ID from the routing files), it overrides the `useSpace()` fallback. Without this fix, the Layout tab on L1/L2 would read and write the L0 space's settings instead of the subspace's settings.
