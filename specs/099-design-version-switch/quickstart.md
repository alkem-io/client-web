# Quickstart — Design Version Switch

End-to-end manual verification recipe. Designed to be the smallest path that exercises SC-001 through SC-007 and FR-001 through FR-016.

## Prerequisites

- Alkemio backend running locally at `localhost:3000` (Traefik) with the `designVersion` field deployed on `UserSettings`. (The server PR referenced in the spec must be merged and deployed first.)
- Codegen has been run **against that deployed schema**:
  ```bash
  pnpm codegen
  ```
  The PR diff should include updates to `src/core/apollo/generated/graphql-schema.ts` and `src/core/apollo/generated/apollo-hooks.ts` showing `designVersion` on `UserSettings` and `UpdateUserSettingsEntityInput`.
- `pnpm install` is current.
- Two browsers (or one browser + one incognito window) so you can simulate "another device" without juggling localStorage.

## Build & static checks

Before touching the browser:

```bash
pnpm codegen          # regenerate from deployed schema (backend at localhost:4000/graphql per codegen.yml)
pnpm lint             # tsc --noEmit + biome ci + eslint
pnpm vitest run       # unit tests, including the two new hook tests
pnpm build            # production build sanity check (~20–60s)
```

All four must pass before proceeding.

## Start the dev server

```bash
pnpm start
```

The app listens at `http://localhost:3001`. Have the browser DevTools console + Application → Local Storage panel + Network tab open for the duration.

## Scenario walkthroughs

### Scenario A — first-ever fresh session, no preference, anonymous user (FR-008b, FR-009, FR-003, SC-005)

1. Open a clean private/incognito window. Visit `http://localhost:3001`.
2. **Expected** *(updated 2026-05-26 — default flipped)*: The CRD (new design) shell renders by default — `useCrdEnabled()` returns `true` when LS is unset (FR-008b as revised 2026-05-26). No reload occurs. The user menu does NOT show the design switch row (anonymous users never see it, FR-003), and the migration-nudge modal does NOT appear (anonymous users have no server `designVersion`, so the gate fails).
3. Open Local Storage — neither `alkemio-design-version` nor `alkemio-design-version-upgrade-dismissed` nor the legacy `alkemio-crd-enabled` key should be set.
4. Open DevTools Network — no `updateUserSettings` mutation should have fired. The `CurrentUserLight` query may have fired but with no authenticated user.

### Scenario B — authenticated user, server says `1`, local cache says `'2'` (FR-007, SC-003)

1. Sign in as a user whose server `designVersion` is `1` (old design). If you don't have one, set it via Scenario D first then return.
2. Manually set `localStorage.setItem('alkemio-design-version', '2')` from the console.
3. Reload the page (`Cmd-R`).
4. **Expected**:
   - The CRD shell appears briefly (rendered from the cached `'2'`).
   - `CurrentUserLight` resolves with `designVersion: 1`.
   - `useDesignVersionSync` detects mismatch, writes LS `'1'`, and calls `window.location.reload()`.
   - The MUI shell loads.
   - Exactly **one** reconciliation reload — verified by counting page-load entries in Network/Performance.
5. Open the MUI user menu — the design-version switch is present above "Dashboard", in the OFF position, with the beta caption visible.

### Scenario C — authenticated user, cache already matches saved preference (FR-007, SC-004)

1. With Scenario B's user (now on MUI, LS=`'1'`, server=`1`), reload.
2. **Expected**: zero reconciliation reloads. The MUI shell renders directly. `CurrentUserLight` returns `1`, matches the cached `'1'`, no-op.

### Scenario D — toggle ON from the MUI menu (FR-001, FR-002, FR-004, FR-006, FR-012, FR-014, FR-016, SC-001, SC-002)

1. Sign in as Scenario B's user (currently on MUI).
2. Click the avatar → open user menu.
3. Verify *(updated 2026-05-26)*: switch labelled "New look (old design available for a limited time)" sits above "Dashboard"; no separate caption row (the `caption` key was removed); switch is OFF. *(The label does NOT change when the toggle is flipped ON — single neutral label, same pattern as "Dark mode".)*
4. Click the switch.
5. **Expected (within 5 seconds end-to-end):**
   - `updateUserSettings` mutation fires in Network with `variables.settingsData.settings.designVersion === 2` (integer, not string).
   - On mutation success: `alkemio-design-version` is set to `'2'`, a Sentry breadcrumb / event labeled `DESIGN_VERSION_SWITCH` is emitted with the new value (visible in DevTools console if Sentry's `debug` mode is on).
   - The page reloads.
   - The CRD shell loads. Every page (`/`, `/forum`, `/space/X`, `/admin/something`) renders in the new design — verified by clicking through 3–4 routes.
   - **Auth survives the reload**: after the reload, the user avatar is still present in the top nav, no sign-in prompt is shown, and `CurrentUserLight` returns the same user id as before the toggle. (Verifies FR-013.)

### Scenario E — toggle OFF from the CRD menu (inverse of D)

Same as D, in reverse. Confirm the MUI shell takes over and the switch in the MUI menu now reflects the OFF state on next visit.

### Scenario F — toggle save failure (FR-010, SC-007)

1. With the user on MUI, open the menu.
2. In DevTools Network → Throttling, set to "Offline" (or use the right-click "Block request URL" on the GraphQL endpoint).
3. Click the toggle.
4. **Expected**: mutation fails, a non-blocking error notification appears, LS is NOT updated, no reload, the user remains on MUI, and the switch returns to OFF.
5. Restore network.

### Scenario G — preference fetch failure (FR-008a)

1. Set `localStorage.setItem('alkemio-design-version', '1')`. Sign in.
2. Before reload, block the `CurrentUserLight` request in DevTools.
3. Reload.
4. **Expected**: MUI shell renders from the cache (LS=`'1'`). No reload, no error toast. User menu does not show the switch (because `useCurrentUserContext` reports unloaded user — `isVisible` is false). After unblocking and reload, the switch becomes visible.

### Scenario H — legacy entry points gone (FR-011, SC-006)

1. Navigate to the user-settings page where the design toggle used to be (`/profile/settings` or equivalent — the page rendered by `CrdUserSettingsTab.tsx`). Verify no toggle is present.
2. Navigate to the platform admin layout page (`AdminLayoutPage.tsx`). Verify the "Use the new design" button is gone.
3. Verify the rest of each page still functions — open in DevTools Console and confirm no errors.

### Scenario I — cross-device persistence (User Story 2, SC-003)

1. In Browser 1: sign in, toggle to CRD.
2. In Browser 2 (different browser, not just incognito): sign in as the same user with a clean LS.
3. **Expected** *(updated 2026-05-26 — default flipped)*: The CRD shell renders briefly (LS unset → default = CRD post-flip). `CurrentUserLight` resolves with `designVersion: 2`, sync detects LS is `null` vs. desired `2`, writes `'2'`, fires exactly one reload (still one reload to satisfy SC-003; the only difference vs. pre-flip is that the user sees CRD both before and after the reload instead of MUI → CRD).
4. After the reload, the CRD shell renders directly from LS `'2'`. Total: one reconciliation reload, matching SC-003.
5. **Inverse case**: in Browser 1 toggle to MUI; in Browser 2 sign in with clean LS. Browser 2 renders CRD briefly (default), sync detects mismatch with server `1`, writes `'1'`, reloads, MUI renders. Same one-reload behavior, different end-state design.

### Scenario K — migration-nudge modal (FR-019, FR-020, US4) *(added 2026-05-26)*

1. Sign in as a user whose server `designVersion === 1` (old design). If you need to set this up, sign in to a fresh account so it inherits the server default, OR use Scenario E first to land on MUI explicitly. Confirm the avatar menu's design-version toggle is OFF.
2. Clear the dismissal marker: `localStorage.removeItem('alkemio-design-version-upgrade-dismissed')`. Reload any page in the app.
3. **Expected**: a CRD-styled modal appears on top of the MUI shell. Title: "A fresh new Alkemio is here". Two buttons: "Maybe later" (secondary) and "Take me to the new design" (primary). The modal renders with CRD typography and spacing even though the underlying shell is MUI — this is the `.crd-root` className on `DialogContent` doing its job.
4. Click **Maybe later** (or press Esc). Modal closes. MUI shell remains. Inspect LS: `alkemio-design-version-upgrade-dismissed === '1'`.
5. Reload. **Expected**: modal does NOT reappear (gate fails on `isDismissed`).
6. Remove the dismissal marker again, reload, and this time click **Take me to the new design**. **Expected**: the existing toggle flow runs — `updateUserSettings` mutation fires with `designVersion: 2`, LS becomes `'2'`, the dismissal marker is also set (so the modal won't return if the user later flips back to MUI), then `window.location.reload()` fires and CRD renders.
7. While on CRD, flip the avatar-menu toggle back to OFF (re-runs the toggle flow → server now `1`, LS `'1'`, reload into MUI). **Expected**: the modal does NOT re-appear on this device because the dismissal marker is still set from step 6's confirm.
8. **Negative cases**: with `designVersion === 2` (CRD user) or anonymous, confirm the modal never appears regardless of the dismissal-marker state.

### Scenario J — accessibility spot check (Constitution §V)

1. With the menu open, Tab to the switch. Confirm focus ring is visible (both Radix and MUI switches).
2. Press Space — switch flips. Press Enter on the menu trigger to close.
3. With a screen reader (VoiceOver: `Cmd-F5`), confirm the switch announces its label and current state. *(The previously documented separate caption row has been removed; the temporary-availability framing is folded into the label itself.)*

## Translation key sanity

1. Switch language to Dutch (or any non-English supported by CRD).
2. Reopen the user menu.
3. **Expected**: the toggle label shows its Dutch translation ("Nieuwe look (oud ontwerp tijdelijk beschikbaar)"). The migration-nudge modal, if it appears (Scenario K), also renders in Dutch. (Spot-check one CRD locale; the MUI side is English-only in this repo until Crowdin syncs.)

## Definition of Done

All scenarios pass, `pnpm lint`, `pnpm vitest run`, and `pnpm build` are green, and the regenerated GraphQL artifacts are committed. PR description includes:
- A short note that the platform default is now the **new design (CRD)** per clarification 2026-05-26 (superseding 2026-05-13). Anyone without an explicit preference lands on CRD; users who previously opted into MUI (`'1'` in LS or server) keep it.
- A short note that the LS format moved from `alkemio-crd-enabled = 'true'/'false'` to `alkemio-design-version = '1'/'2'`, with a one-time migration on first load. **Added 2026-05-26**: a second per-device LS key `alkemio-design-version-upgrade-dismissed` gates the migration-nudge modal.
- Screenshots of both menus showing the single neutral switch label ("New look (old design available for a limited time)" in EN); the previously documented "caption" row has been removed, and the brief state-dependent variant was reverted in favor of this single label.
- A screenshot of the migration-nudge modal (Scenario K) showing the CRD styling rendered over the MUI shell.
- Confirmation that the legacy toggle UIs are removed.
