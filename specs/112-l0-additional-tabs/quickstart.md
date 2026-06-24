# Quickstart: Additional Tabs on L0 Spaces

**Feature**: 112-l0-additional-tabs · **Story**: client-web#9857

## Run the gates

```bash
# from the worktree root
pnpm install
pnpm vitest run                      # unit/integration tests (non-interactive)
pnpm build                           # production build
pnpm lint                            # TypeScript + Biome + ESLint
```

## Manual verification (against a local/staging backend with server#6177)

1. **Add a tab (US1, FR-001/FR-011)**
   - Open a **top-level (L0) Space** as an admin → **Settings → Layout**.
   - Click **Add tab**, enter a name ("Archive"), submit.
   - Expect: a fifth column "Archive" appears in the Layout editor; navigating to the Space's main tab bar shows "Archive" after Dashboard / Community / Subspaces / Knowledge Base; it opens an empty content area. No page reload.

2. **Max limit (FR-004, SC-004)**
   - On a Space at the configured maximum tab count, the **Add tab** control is **disabled** (visible, greyed).

3. **Protected built-ins (US2, FR-006, SC-002)**
   - Open the per-tab kebab on Dashboard, Community, Subspaces, Knowledge Base → **no Delete** option present.

4. **Delete an additional tab (US2, FR-005/FR-007/FR-009, SC-003)**
   - Put a post in "Archive". Open its kebab → **Delete tab** → confirm in the dialog.
   - Expect: "Archive" disappears from the editor and the tab bar; the post now lives in the **first** tab and is still accessible.

5. **Delete the active additional tab (FR-008)**
   - Make "Archive" the active tab, then delete it → active advances to an adjacent surviving tab first; delete succeeds.

6. **Rename / hide consistency (US3, FR-012)**
   - Rename "Archive" and toggle its visibility — both behave exactly as on a subspace phase.

7. **Templates (FR-013, SC-006)**
   - Save the L0 Space as a template → create a new Space from it → all tabs (built-in + additional) are reproduced.

8. **Non-admin (FR-010, SC-007)**
   - View the L0 Space as a non-admin member → tabs visible, but no Add/Delete/rename/visibility affordances.

9. **Subspaces unchanged (FR-015, SC-005)**
   - Open an L1 or L2 subspace → phase add/delete/rename/hide behave exactly as before; wording still says "phase".

## Where the changes live

- CRD view + types + menu: `src/crd/components/space/settings/{SpaceSettingsLayoutView.tsx,SpaceSettingsLayoutView.types.ts,LayoutPoolColumn.tsx,AddPhaseDialog.tsx}`
- Integration: `src/main/crdPages/topLevelPages/spaceSettings/{CrdSpaceSettingsPage.tsx,layout/layoutMapper.ts,layout/useColumnMenu.ts,layout/useLayoutTabData.ts}`
- i18n: `src/crd/i18n/spaceSettings/spaceSettings.<lang>.json` (en, nl, es, bg, de, fr)
- Tab-bar rendering of additional L0 tabs: already handled by `src/main/crdPages/space/hooks/useCrdSpaceTabs.tsx` + `tabs/CrdSpaceCustomTabPage.tsx` (no change).
