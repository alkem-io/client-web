# Quickstart: Callout Collapse/Expand Feature

**Feature Branch**: `020-callout-collapse`

## Prerequisites

- Server branch `043-callout-collapse` deployed with the `layout.calloutDescriptionDisplayMode` schema changes
- Backend running at `localhost:4000/graphql` (for codegen)
- Node 22 + pnpm 10.17.1

## Implementation Order

### Step 1: GraphQL & Codegen

1. Update `src/domain/spaceAdmin/SpaceAdminSettings/graphql/SpaceSettings.graphql` — add `layout { calloutDescriptionDisplayMode }` to the `SpaceSettings` fragment
2. Update `src/domain/spaceAdmin/SpaceAdminSettings/graphql/UpdateSpaceSettings.graphql` — add `layout { calloutDescriptionDisplayMode }` to mutation response
3. Run `pnpm codegen` to regenerate types and hooks
4. Verify `CalloutDescriptionDisplayMode` enum and `SpaceSettingsLayout` type appear in `graphql-schema.ts`

### Step 2: Client-Side Types & Defaults

1. Add `SpaceSettingsLayout` interface to `src/domain/space/settings/SpaceSettingsModel.ts`
2. Add layout default to `src/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings.tsx`

### Step 3: Settings Update Hook

1. Extend `useSpaceSettingsUpdate.ts` to support `layout` in `SpaceSettingsUpdateParams`, `currentSettings`, optimistic state, and mutation variables

### Step 4: Admin UI (Layout Tab)

1. Add a display mode toggle component below the Innovation Flow editor in `SpaceAdminLayoutPage.tsx`
2. The toggle should call `updateSettings` with the new `layout.calloutDescriptionDisplayMode` value
3. For subspaces (L1/L2), add the toggle to the Settings tab

### Step 5: ExpandableMarkdown Enhancement

1. Add `defaultCollapsed?: boolean` prop to `ExpandableMarkdown`
2. Change detection resolution: `detecting` → `collapsed` (if overflow + defaultCollapsed) instead of `expanded`

### Step 6: Callout Rendering Integration

1. Query the space's `layout.calloutDescriptionDisplayMode` in callout rendering contexts
2. Pass `defaultCollapsed={mode === CalloutDescriptionDisplayMode.Collapsed}` to `ExpandableMarkdown` in `CalloutViewLayout`

## Verification

```bash
pnpm lint          # Type checking + linting
pnpm vitest run    # Run tests
```

Manual testing:

1. Navigate to Space Admin → Layout tab → verify toggle appears below Innovation Flow editor
2. Toggle to "Collapsed" → verify all callouts in the space collapse
3. Toggle to "Expanded" → verify all callouts expand
4. Click "Read More" on collapsed callout → verify temporary expand
5. Navigate away and back → verify callout reverts to space default
6. Create new space → verify defaults to Collapsed
