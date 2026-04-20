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

Navigate to a space you administer → Settings. The CRD Space Settings page should render with:

- The CRD space hero on top (same as the CRD Space Page from spec 042)
- A horizontal tab strip below the hero: **About → Layout → Community → Subspaces → Templates → Storage → Settings → Account** in that order
- The About tab active by default
- The Preview card on the right showing your space card

## Per-tab save semantics

| Tab | Save bar? | Commit model |
|---|---|---|
| About | No | **Per-field autosave** — 2s debounce on text fields, immediate on file uploads. Spinner / "Saved!" / error indicator next to each field label. |
| Layout | **Yes** | Local buffer + Save Changes / Reset. Zero mutations before Save. |
| Community | No | Per action (confirm → mutation) |
| Subspaces | No | Per action (confirm → mutation) |
| Templates | No | Per action (confirm → mutation) |
| Storage | No | Per action (confirm → mutation) |
| Settings | No | Per toggle (immediate mutation) |
| Account | No | Read-only + single destructive action |

## Implementation walkthrough

All eight tabs are P1 and ship together. You may implement them in any order after foundational (Phase 2). Suggested developer split is in `tasks.md`.

### Step 1 — Foundational shell

1. `@dnd-kit/core` and `@dnd-kit/sortable` are already installed in the repo. No additional `pnpm add` is needed — the `Announcements` API from `@dnd-kit/core` covers FR-011's live-region requirements.
2. Port the three missing primitives from the prototype:
   - `src/crd/primitives/tabs.tsx` (Radix Tabs)
   - `src/crd/primitives/textarea.tsx`
   - `src/crd/primitives/table.tsx`
3. Extend (don't duplicate) `src/crd/components/dialogs/ConfirmationDialog.tsx` so it covers both delete and discard variants.
4. Create `src/crd/components/common/InlineEditText.tsx` — the shared inline-edit primitive used by Layout column titles and column descriptions only. Individual callouts are read-only on the Layout tab.
5. Create the Settings shell primitives: `SpaceSettingsShell.tsx`, `SpaceSettingsTabStrip.tsx` (Radix-Tabs-based), `SpaceSettingsCard.tsx`, `SpaceSettingsSaveBar.tsx`.
6. Create the integration layer: `CrdSpaceSettingsPage.tsx`, `useSpaceSettingsTab.ts`, `useDirtyTabGuard.ts`.
7. Wire `TopLevelRoutes.tsx` to branch on `useCrdEnabled()`.
8. Seed `src/crd/i18n/spaceSettings/spaceSettings.en.json` with tab labels and the generic Save / Reset / Cancel / confirmation strings.

### Step 2 — About tab (US1)

1. Implement `SpaceSettingsAboutView.tsx` composing (exact parity with MUI — no phantom fields): Name `input`, Tagline `input`, **Space Branding** card grouping avatar + page banner (1536×256) + card banner (416×256) uploads via the existing `VisualUpload` + `CropDialog` flow, Location (country + city), `MarkdownEditor` for What / Why / Who, `tags-input` for tags, References list with full CRUD (title + URL + description per row, Add Reference button). The Preview is the shared `SpaceCard` on the right. Render per-field spinner / "Saved!" / error indicator next to each field label driven by `autosaveState[field]`. **Render NO Save Changes or Reset button. NO email, NO pronouns, NO standalone "visuals gallery" — those fields do not exist on Space profile.**
2. Implement `about/useAboutTabData.ts` + `aboutMapper.ts`. The hook maintains local form state + per-field debounce timer map; text fields autosave after 2s idle, file uploads / references / visuals fire immediately. Expose `flushPending()`. Call `pickColorFromId(space.id)` in the mapper for the Preview color. Wrap every mutation in `useTransition`.
3. Wire `flushPending` into `useDirtyTabGuard` so tab-away flushes any pending autosave immediately — no confirm dialog on About.
4. Render per-card skeletons while the initial query loads and an inline error banner for fetch errors (FR-028).

### Step 3 — Layout tab (US2)

1. Implement `LayoutCalloutRow.tsx` — callout title and description are **read-only** on this tab. Render the visible three-dot kebab on every movable row (not pinned) with exactly three entries: **Move to** (submenu with the other three columns), **View Post** (navigate), **Remove from Tab** (destructive-styled; buffers a pending removal, NOT a deletion). When `pendingRemoval === true` the row stays visible with reduced opacity + strikethrough / badge, and its kebab swaps Remove for **Undo removal**. Implement `LayoutPoolColumn.tsx` using `InlineEditText` for the column title and column description (these are the only inline-editable fields on the Layout tab).
2. Implement `SpaceSettingsLayoutView.tsx` with a `DndContext` + `KeyboardSensor`; configure dnd-kit's `Announcements` API for FR-011 grab-mode messages.
3. Implement `layout/useLayoutTabData.ts` with the **local buffer + Reset** model. Save flushes in one `useTransition` block: column rename (+ cascade retag) → callout cross-column moves → within-column reorders → `updateSpaceSettings` for `calloutDescriptionDisplayMode`. `onMoveToColumn` reuses the `onReorder` pipeline. There is NO `onRemoveFromTab` — the backend has no unassigned state.
4. Implement `layout/useColumnMenu.ts` and wire `columnMenuActions` on the view. The per-column overflow menu lives on the column header (top-right three-dot button) and exposes "Active phase" + "Default post template". Cover both actions with unit tests (SC-009).
5. Include the Post description display toggle (`calloutDescriptionDisplayMode`) in the buffer.

### Step 4 — Community tab (US3)

1. Implement the shared `MemberRow` template in a single component reused by `CommunityUsersTable.tsx`, `CommunityOrgsTable.tsx`, `CommunityVirtualContributorsTable.tsx` — all built on `table.tsx`.
2. Users table: 10 rows visible + pagination + search + role/status filters + Invite button.
3. Organizations and Virtual Contributors: each inside its own collapsible card, each with its own 5-rows-visible table.
4. Implement `community/useCommunityTabData.ts` dispatching `onRowAction(kind, id, action)` to the correct existing mutation. Wrap every mutation in `useTransition`.

### Step 5 — Subspaces tab (US4)

1. Implement `SpaceSettingsSubspacesView.tsx` with the Default Subspace Template selector, Create Subspace button, and subspace grid/list.
2. Kebab menu per subspace — exactly three entries: **Pin/Unpin** (alphabetical mode), **Save as Template**, **Delete**. No Edit Details. No Archive. No View.
3. Add search input, filter (All / Active / Archived via `SpaceVisibility.Archived`), Grid/List toggle. Client-side.
4. Title click → navigate to the subspace (existing route).
5. Implement `subspaces/useSubspacesTabData.ts` reusing existing mutations. Wrap in `useTransition`.

### Step 6 — Templates tab (US5)

1. Implement `SpaceSettingsTemplatesView.tsx` with five collapsible categories in order: Space, Collaboration Tool, Whiteboard, Post, Community Guidelines.
2. Global search filters across all categories.
3. Per-card kebab: Preview / Duplicate as Custom / Edit (custom only) / Delete (custom only, confirm dialog).
4. Implement `templates/useTemplatesTabData.ts`. Wrap in `useTransition`.

### Step 7 — Storage tab (US6)

1. Implement `SpaceSettingsStorageView.tsx` using `table.tsx` + custom expand/collapse for folders. Columns: name / size / uploader / uploaded-at. Actions: open-in-new-tab / delete.
2. Delete → `ConfirmationDialog` → `deleteDocument` mutation wrapped in `useTransition`.
3. Skeletons while loading; inline error banner above the tree on fetch error.

### Step 8 — Settings tab (US7)

1. Implement `SpaceSettingsSettingsView.tsx` with accordion sections: Visibility / Membership / Applicable Organizations / Allowed Actions / Danger Zone.
2. Every toggle fires `updateSpaceSettings` immediately (wrapped in `useTransition`). Danger Zone Delete opens `ConfirmationDialog` (destructive variant).

### Step 9 — Account tab (US8)

1. Implement `SpaceSettingsAccountView.tsx` with URL (Copy button), License card, Visibility Status badge, Host Information card (NO Change Host CTA), Support footer, optional Delete Space button.
2. Read-only content + three action buttons. No save bar.

### Step 10 — Testing

```bash
pnpm vitest run src/main/crdPages/topLevelPages/spaceSettings
pnpm vitest run src/crd/components/space/settings
```

- Mapper unit tests per tab.
- Component tests for tab strip arrow-nav, Layout grab-mode, save-bar state transitions (Layout), About per-field autosave indicator transitions (`pending` → `saving` → `saved` → `idle`), and inline-edit flow on column headers.
- Integration test: `useDirtyTabGuard` blocks tab switch while dirty on About or Layout; no-op on other tabs.
- Integration test: `useColumnMenu` exercises both per-column `onChangeActivePhase(columnId, phaseId)` and `onSetAsDefaultPostTemplate(columnId, templateId)` against mocked Apollo responses.

### Step 11 — Lint & type-check

```bash
pnpm lint
pnpm vitest run
```

### Manual test checklist

- [ ] Tab strip renders all 8 tabs in the correct order; icons match the design.
- [ ] About: edit name → Preview updates live → wait 2 seconds → spinner next to Name label → "Saved!" after mutation returns. Banner / avatar uploads fire autosave immediately on upload completion. **Verify there is NO Save Changes or Reset button anywhere on this tab.** Edit a field then switch to another tab inside the 2s window → pending autosave flushes immediately; nothing is lost.
- [ ] Layout: drag a callout Home → Community. Don't save. Reset reverts. Drag again, rename a **column** title inline (not a callout — callouts are read-only on this tab), flip Post description display, click Save Changes — all persist together.
- [ ] Layout per-callout kebab: Move to → pick another column → callout moves in the buffer. View Post → if clean, navigate; if dirty, discard-confirm dialog blocks. Kebab has exactly two entries; no "Remove from Tab".
- [ ] Layout zero-mutations invariant: open Network devtools, make moves and removals, Reset. Confirm zero GraphQL mutation requests left the client before the Save Changes click.
- [ ] Layout: keyboard-only grab mode (Tab → Space → arrows → Enter) works across columns; ARIA live region announces transitions.
- [ ] Community: users table paginates. Expand Organizations — a 5-row table appears. Expand Virtual Contributors — another 5-row table appears. Add / remove rows with confirmation.
- [ ] Subspaces: Default Subspace Template selector works. Pin / Save as Template / Delete via kebab. No Edit Details / Archive / View entries visible. Title click navigates. Search / Filter / Grid-List toggle work.
- [ ] Templates: five categories collapsible. Global search filters. Preview / Duplicate / Edit / Delete per card.
- [ ] Storage: hierarchical tree renders. Open-in-new-tab works. Delete with confirm.
- [ ] Settings: every toggle fires immediately. Danger Zone Delete Space shows confirmation listing what will be deleted.
- [ ] Account: URL Copy works. No Change Host button. Support link opens. Delete Space (if permitted) runs existing flow.
- [ ] Dirty tab (About or Layout) + tab switch → confirm dialog blocks. Cancel keeps state.
- [ ] CRD toggle off → old MUI Space Settings renders unchanged.
- [ ] Narrow viewport → tab strip scrolls horizontally; Layout columns stack; About two-column stacks.

## Rollback

Turn off the CRD toggle. The MUI Space Admin pages remain untouched and continue to serve admins.
