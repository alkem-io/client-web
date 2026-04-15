# Quickstart: CRD Space Settings Page

**Feature**: 045-crd-space-settings

## Prerequisites

- Node 24.14.0 (Volta-pinned) / pnpm ≥ 10.17.1
- Alkemio backend reachable at `localhost:3000`
- You are logged in as an admin of the space you will edit

## Enable the CRD toggle

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

## Run the dev server

```bash
pnpm install
pnpm start
# open http://localhost:3001
```

Navigate to a space you administer → `Settings` in the space menu. The CRD Space Settings page should render with:

- The CRD space hero on top (same as the CRD Space page from spec 042)
- A horizontal tab strip below the hero with 8 tabs
- The About tab active by default
- The Preview card on the right showing your space card

## Implementation walkthrough

Follow the order below; each step is independently runnable.

### Step 1 — Shell

1. Create `src/crd/components/space/settings/SpaceSettingsShell.tsx` consuming `SpaceSettingsShellProps` from `contracts/shell.ts`.
2. Create `SpaceSettingsTabStrip.tsx` — render a `role="tablist"`, arrow-key navigation, horizontally scrollable on narrow viewports.
3. Create `SpaceSettingsSaveBar.tsx` — sticky at `bottom-right`, only visible when `state.kind !== 'clean'`.
4. Create `SpaceSettingsCard.tsx` — title + description + body slot; this is the card primitive every tab composes.
5. Create `src/crd/primitives/ConfirmDiscardDialog.tsx` if not present; reuse `ConfirmDeleteDialog` from 084.
6. Create the page controller `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`; wire it to `TopLevelRoutes.tsx` gated by `useCrdEnabled()`.
7. Create `useSpaceSettingsTab.ts` — syncs active tab with the URL.
8. Create `useDirtyTabGuard.ts` — centralizes the tab-switch / navigate-away confirmation.

### Step 2 — About tab (P1)

1. Implement `SpaceSettingsAboutView.tsx` against `AboutViewProps`.
2. Implement `about/useAboutTabData.ts` and `about/aboutMapper.ts` wiring the existing space profile mutations.
3. Verify: editing the name updates the Preview card live; Save persists; Reset reverts.

### Step 3 — Layout tab (P1)

1. Add dependencies:
   ```bash
   pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/accessibility
   ```
2. Implement `LayoutPageRow.tsx` and `LayoutPoolColumn.tsx`.
3. Implement `SpaceSettingsLayoutView.tsx` using dnd-kit with a `KeyboardSensor` configured for the FR-021 keybindings.
4. Implement `layout/useLayoutTabData.ts` and `layoutMapper.ts`. Mark system pages with `kind: 'system'`.
5. Verify: drag-and-drop reorder + cross-column move; keyboard grab-mode (Space/Enter/Arrow/Enter/Escape); pinned rows are not draggable.

### Step 4 — Subspaces / Templates / Storage (P2)

1. Implement each `*View.tsx` against its props contract.
2. Implement each tab's `use*TabData.ts` and mapper.
3. All destructive actions route through `ConfirmDeleteDialog`.

### Step 5 — Community / Settings / Account (P3)

1. Implement `SpaceSettingsCommunityView.tsx` reusing the `MemberRow` shape from 084's Pending Memberships dialog.
2. Implement `SpaceSettingsSettingsView.tsx` and `SpaceSettingsAccountView.tsx`.
3. Account tab is read-only — no save bar, no onChange.

### Step 6 — i18n

1. Create `src/crd/i18n/spaceSettings/spaceSettings.en.json`.
2. Register the namespace following the pattern in `src/core/i18n/i18n.ts` (lazy load).
3. All CRD text uses `useTranslation('crd-spaceSettings')`.

### Step 7 — Testing

Following `research.md` Decision 9:

```bash
pnpm vitest run src/main/crdPages/topLevelPages/spaceSettings
pnpm vitest run src/crd/components/space/settings
```

- Mapper unit tests per tab.
- Component tests for tab strip arrow-nav, Layout grab-mode, and save-bar state transitions.
- One integration test for `useDirtyTabGuard` proving tab switch is blocked while dirty.

### Step 8 — Lint & type-check

```bash
pnpm lint
pnpm vitest run
```

### Manual test checklist

- [ ] CRD toggle on → CRD Space Settings renders with hero + tab strip.
- [ ] All 8 tabs are reachable; each tab deep-links via URL.
- [ ] About → edit name → Preview updates live; Save persists.
- [ ] Layout → drag a callout across columns; pinned system pages refuse to move.
- [ ] Layout → keyboard: Tab to handle → Space → arrows → Enter → persists.
- [ ] Subspaces / Templates / Storage → delete → confirm dialog → item gone.
- [ ] Any dirty tab → try switching tab → confirm dialog blocks; Cancel keeps state.
- [ ] CRD toggle off → old MUI Space Settings renders unchanged.
- [ ] Narrow viewport → tab strip scrolls horizontally; Layout columns stack.
- [ ] Keyboard-only walk-through across all tabs.

## Rollback

Turn off the CRD toggle. The MUI Space Admin pages remain untouched and continue to serve admins.
