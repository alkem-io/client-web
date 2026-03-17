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

### Step 4: Admin UI

1. Create `CalloutDisplayModeSettings` component in `src/domain/spaceAdmin/SpaceAdminSettings/components/CalloutDisplayModeSettings.tsx` — a `SwitchSettingsGroup` toggle that returns the `onUpdate` promise for loading state
2. Add the component to `SpaceAdminLayoutPage.tsx` below the Innovation Flow editor (all levels)
3. Add the Layout tab to L1/L2 tab definitions (`SpaceAdminTabsL1.tsx`, `SpaceAdminTabsL2.tsx`) and routing (`SpaceAdminRouteL1.tsx`, `SpaceAdminRouteL2.tsx`) using `SpaceAdminLayoutPage` with `useL0Layout: false` and `spaceId: subspaceId` (critical: without the explicit `spaceId`, the component falls back to `useSpace()` which always returns the L0 space)

### Step 5: ExpandableMarkdown Enhancement

1. Add `defaultCollapsed?: boolean` prop to `ExpandableMarkdown`
2. Change detection resolution: `detecting` → `collapsed` (if overflow + defaultCollapsed) instead of `expanded`
3. Add `useEffect` to re-enter `'detecting'` state when `defaultCollapsed` changes (handles async load and reactive admin toggles)

### Step 6: Callout Rendering Integration

1. Create `useCalloutDescriptionDisplayMode(spaceId)` hook in `src/domain/space/settings/useCalloutDescriptionDisplayMode.ts` — wraps `useSpaceSettingsQuery`, returns `defaultCollapsed` boolean
2. Call the hook in `CalloutView` with `subspace?.id || space?.id` (use `||` not `??` — `SubspaceContext` default has `id: ''`)
3. Add `defaultCollapsed?: boolean` to `CalloutLayoutProps` in `calloutBlock/CalloutLayoutTypes.tsx`
4. Pass `defaultCollapsed` from `CalloutView` → `CalloutViewLayout` → `ExpandableMarkdown`
5. `CalloutPage` needs no changes — it renders `CalloutView` which handles the hook internally

### Step 7: i18n

1. Add keys under `pages.admin.generic.sections.layout.calloutDisplayMode` in `translation.en.json`
2. UI uses "Post" terminology (via `$t(common.Post)` / `$t(common.post)`) instead of "Callout"

## Verification

```bash
pnpm lint          # Type checking + linting
pnpm vitest run    # Run tests
```

Manual testing:

1. Navigate to Space Admin → Layout tab → verify toggle appears below Innovation Flow editor
2. Toggle to "Collapsed" → verify all posts in the space collapse
3. Toggle to "Expanded" → verify all posts expand
4. Verify loading spinner appears on the switch while mutation is in flight
5. Click "Read More" on collapsed post → verify temporary expand
6. Navigate away and back → verify post reverts to space default
7. Check subspace Admin → Layout tab → verify toggle appears
8. Create new space → verify defaults to Collapsed

## Known Gotchas

- **SubspaceContext empty ID**: `SubspaceContext` default value has `subspace.id: ''` (empty string). Use `||` not `??` when resolving space ID for the hook.
- **useSpace() returns L0 space**: `useSpace()` always returns the top-level (L0) space, even inside subspace routes. Any admin page rendered at L1/L2 that needs the subspace ID must receive it as a prop from the routing file. `SpaceAdminLayoutPage` uses an optional `spaceId` prop for this — when omitted, it falls back to `useSpace().space.id` (correct for L0).
- **Async race condition**: The space settings query resolves after `ExpandableMarkdown`'s initial overflow detection. The `useEffect` re-detection mechanism handles this.
- **Codegen deferred**: The `.graphql` files are ready, but `pnpm codegen` requires the server with the new schema running at `localhost:4000/graphql`. Run `pnpm codegen` once the server is available to regenerate types (`SpaceSettingsQuery`, `SpaceSettingsFragment`, `UpdateSpaceSettingsMutation`). Never hand-edit generated files.
