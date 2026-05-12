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
pnpm codegen          # regenerate from deployed schema
pnpm lint             # Biome + ESLint
pnpm vitest run       # unit tests, including the two new hook tests
pnpm build            # production build sanity check (~20s)
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
2. **Expected**: The CRD (new design) shell renders by default (inverted-default behavior). No reload occurs. The user menu (if visible to anonymous users) does NOT show the design switch row.
3. Open Local Storage — `alkemio-crd-enabled` should not be set.
4. Open DevTools Network — no `updateUserSettings` mutation should have fired. The `CurrentUserLight` query may have fired but with no authenticated user.

### Scenario B — authenticated user, server says "1", local cache says "true" (FR-007, SC-003)

1. Sign in as a user whose server `designVersion` is `"1"` (old design). If you don't have one, set it via Scenario D first then return.
2. Manually set `localStorage.setItem('alkemio-crd-enabled', 'true')` from the console.
3. Reload the page (`Cmd-R`).
4. **Expected**:
   - The CRD shell appears briefly (rendered from the cached `true`).
   - `CurrentUserLight` resolves with `designVersion: "1"`.
   - `useDesignVersionSync` detects mismatch, sets LS to `'false'`, and calls `window.location.reload()`.
   - The MUI shell loads.
   - Exactly **one** reconciliation reload — verified by counting page-load entries in Network/Performance.
5. Open the MUI user menu — the design-version switch is present above "Dashboard", in the OFF position, with the beta caption visible.

### Scenario C — authenticated user, cache already matches saved preference (FR-007, SC-004)

1. With Scenario B's user (now on MUI, LS=`'false'`, server=`"1"`), reload.
2. **Expected**: zero reconciliation reloads. The MUI shell renders directly. `CurrentUserLight` returns `"1"`, matches `'false'`, no-op.

### Scenario D — toggle ON from the MUI menu (FR-001, FR-002, FR-004, FR-006, FR-012, FR-014, FR-016, SC-001, SC-002)

1. Sign in as Scenario B's user (currently on MUI).
2. Click the avatar → open user menu.
3. Verify: switch sits above "Dashboard"; caption reads roughly "Beta — the old design will remain available for a short time."; switch is OFF.
4. Click the switch.
5. **Expected (within 5 seconds end-to-end):**
   - `updateUserSettings` mutation fires in Network with `variables.settingsData.settings.designVersion === "2"`.
   - On mutation success: LS is set to `'true'`, a Sentry breadcrumb / event labeled `DESIGN_VERSION_SWITCH` is emitted with the new value (visible in DevTools console if Sentry's `debug` mode is on).
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

1. Set LS to `'false'`. Sign in.
2. Before reload, block the `CurrentUserLight` request in DevTools.
3. Reload.
4. **Expected**: MUI shell renders from the cache (LS=`'false'`). No reload, no error toast. User menu does not show the switch (because `useCurrentUserContext` reports unloaded user — `isVisible` is false). After unblocking and reload, the switch becomes visible.

### Scenario H — legacy entry points gone (FR-011, SC-006)

1. Navigate to the user-settings page where the design toggle used to be (`/profile/settings` or equivalent — the page rendered by `CrdUserSettingsTab.tsx`). Verify no toggle is present.
2. Navigate to the platform admin layout page (`AdminLayoutPage.tsx`). Verify the "Use the new design" button is gone.
3. Verify the rest of each page still functions — open in DevTools Console and confirm no errors.

### Scenario I — cross-device persistence (User Story 2, SC-003)

1. In Browser 1: sign in, toggle to CRD.
2. In Browser 2 (different browser, not just incognito): sign in as the same user with a clean LS.
3. **Expected**: One brief flash of MUI (because LS is unset → default = CRD, but the saved preference is `"2"` → already matches → no flash actually visible; if LS is `'false'` for some reason then exactly one reload).
4. CRD shell renders.

### Scenario J — accessibility spot check (Constitution §V)

1. With the menu open, Tab to the switch. Confirm focus ring is visible (both Radix and MUI switches).
2. Press Space — switch flips. Press Enter on the menu trigger to close.
3. With a screen reader (VoiceOver: `Cmd-F5`), confirm the switch announces its label and current state. Confirm the caption is read out as supplementary text.

## Translation key sanity

1. Switch language to Dutch (or any non-English supported by CRD).
2. Reopen the user menu.
3. **Expected**: the label and caption show their Dutch translations. (Spot-check one CRD locale; the MUI side is English-only in this repo until Crowdin syncs.)

## Definition of Done

All scenarios pass, `pnpm lint`, `pnpm vitest run`, and `pnpm build` are green, and the regenerated GraphQL artifacts are committed. PR description includes:
- A short note that the inverted default is intentional (link to clarification 2026-05-12 Q3).
- Screenshots of both menus showing the switch + caption.
- Confirmation that the two legacy toggle UIs are removed.
