# Quickstart — CRD Member Settings Dialog

This guide walks a developer or QA tester through validating the feature end-to-end on a local environment.

## Prerequisites

- Local dev server running: `pnpm start` (frontend at `http://localhost:3001`, expects backend at `localhost:3000`).
- A Space in the local backend where the signed-in user has the **Space-Admin** privilege (so the Space settings → Community tab is reachable).
- The community has at least:
  - 2 individual user members (one of them not the current viewer; ideally 1 lead + 1 non-lead for the cap-edge tests).
  - 1 organization member.
- 6 supported locales available: `en`, `nl`, `es`, `bg`, `de`, `fr`.

## Enable the CRD design system

Open the browser console and run:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

To verify: the Space pages render with the CRD visual language (Tailwind, shadcn primitives, no MUI elevation). Toggle off with:

```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

## Manual test matrix

The matrix below maps each spec acceptance scenario to a manual test step. All tests are run with the CRD toggle ON unless otherwise noted.

### A. Entry point (FR-015 / Story 5)

1. Navigate to `http://localhost:3001/<spaceNameId>/settings/community`.
2. On the **Members** table, click the `⋮` on any row.
3. Verify the dropdown contains, in order: **View Profile**, **Change Role**, then a separator, then **Remove from Space** (red).
4. Repeat on the **Organizations** sub-table.
5. As a non-admin viewer (separate browser, same Space), confirm Change Role and Remove from Space are not in the dropdown; View Profile remains.

### B. Lead toggle — happy path (Story 1, AC #1, #2)

1. On a non-lead user row, click `⋮` → **Change Role**. Member settings dialog opens.
2. Verify the lead checkbox is **unchecked**, and the helper text below it is visible.
3. Check the lead checkbox. Click **Save**.
4. Dialog closes; the row's role label updates to "Lead" (via the existing column).
5. Reopen the dialog on the same row: lead checkbox is now **checked**.

### C. Lead toggle — demote (Story 1, AC #3)

1. On a lead user row, click `⋮` → **Change Role**.
2. Verify the lead checkbox is **checked** and the helper text is visible (regardless of the cap).
3. Uncheck the checkbox, click **Save**.
4. Dialog closes; row label updates to "Member" (or "Admin" if applicable).

### D. Lead cap reached (Story 1, AC #4)

1. Promote leads on additional rows until the community-wide lead cap is reached. (If the cap is configured at e.g. 5, fill 5 leads.)
2. Open the Member settings dialog on a non-lead user row.
3. Verify the lead checkbox is **disabled** and the helper text remains visible.
4. Verify Save still closes the dialog (when no other change is made it acts as no-op).

### E. Cancel and outside-click (Story 1, AC #5; FR-013)

1. Open the dialog on any row, toggle the lead checkbox, then click **Cancel**.
2. Verify the dialog closes; row state did not change.
3. Reopen, toggle, press **Esc**: same result.
4. Reopen, toggle, click outside the dialog: same result.

### F. Admin toggle (Story 2)

1. Open the dialog on a non-admin user row.
2. Verify the **Authorization** section appears with the admin checkbox unchecked.
3. Check the admin checkbox, click **Save**.
4. Reopen the dialog: admin checkbox is checked.
5. Open the dialog on an **organization** row.
6. Verify the Authorization section is **not** displayed.

### G. Combined lead + admin save (Story 2, AC #4)

1. On a user row, open the dialog.
2. Toggle both the lead and admin checkboxes.
3. Click **Save**.
4. Verify both changes are persisted. (Check the row label and reopen the dialog to confirm both checkboxes reflect new state.)

### H. Removal — from inside the dialog (Story 3, AC #1, #2, #3)

1. Open the Member settings dialog on a non-self user row.
2. Click the destructive **"Click here to remove this user…"** affordance.
3. Verify a separate confirmation prompt appears with the member's display name and the cascade-removal warning.
4. Click **Cancel** on the prompt: prompt closes; Member settings dialog stays open at the same state; no row change.
5. Reopen the prompt; click **Confirm**: prompt and dialog both close; row disappears from the table.

### I. Removal — from the dropdown (Story 5, AC #3)

1. On a non-self user row, click `⋮` → **Remove from Space**.
2. Verify the same confirmation prompt as in Test H appears (same title, same body text shape).
3. Cancel: row remains.
4. Trigger again, Confirm: row disappears.

### J. Self cannot self-remove (FR-016, Edge Case)

1. Open the Member settings dialog on the **current viewer's** row.
2. Verify the in-dialog Remove section is **not displayed**.
3. Verify the dropdown's **Remove from Space** item is also not displayed (the integration omits it for self).

### K. Mutation failure (FR-014)

1. Disconnect the backend (e.g., stop `localhost:3000` or block the GraphQL endpoint in DevTools).
2. Open the dialog, toggle the lead checkbox, click **Save**.
3. Verify a toast / notification appears reporting the failure; dialog stays open; controls are re-enabled.
4. Reconnect backend; click Save again: change persists.
5. Repeat with the admin toggle and with the Remove confirmation.

### L. Concurrency guard (FR-011, FR-012)

1. Open dialog, toggle lead, click **Save** while throttling network in DevTools to "Slow 3G".
2. While the request is in flight, verify Save shows a busy state; Cancel and the checkboxes are disabled.
3. Repeat with the Remove flow on the AlertDialog.

### M. Keyboard operability (FR-018, FR-019)

1. Open the dialog using only the keyboard:
   - Tab to a row's `⋮` button, press Enter / Space; arrow-key down to **Change Role**; press Enter.
2. Tab through controls in this order: Lead checkbox → Admin checkbox (if shown) → Remove link (if shown) → Cancel → Save → Close (X).
3. Press **Esc**: dialog closes; focus returns to the `⋮` trigger.
4. In the AlertDialog, press **Enter** to activate Confirm; press **Esc** to Cancel.

### N. Mobile viewport (FR-020, SC-009)

1. Open Chrome DevTools, set viewport to 360 × 640 (e.g., iPhone SE).
2. Repeat tests B, F, H. Verify:
   - No horizontal scroll inside the dialog.
   - All checkboxes have ≥ 44 px touch targets.
   - Close (X) is reachable and not overlapped.

### O. i18n (FR-017, SC-007)

1. Switch app language via the language selector (footer / header, depending on layout).
2. Cycle through `en`, `nl`, `es`, `bg`, `de`, `fr`.
3. For each, open the dialog and confirm: title, section headings, checkbox labels, helper text, removal warning, Cancel, Save, Confirm, Cancel-confirm — all render their language's translation (English placeholders are acceptable for non-English locales until translated by the translation team).
4. Confirm no missing-key console warnings.

### P. CRD toggle off (FR-002, FR-022)

1. Disable the CRD toggle (`localStorage.removeItem('alkemio-crd-enabled')`, reload).
2. Navigate to the same Space settings community page. Verify the legacy MUI page renders.
3. Open the **MUI** Member settings dialog (edit-pencil affordance per row). Verify it still renders correctly.
4. Toggle CRD on, reload, repeat the CRD test set: no errors, no stale rendering.

## Smoke checklist before opening the PR

- [ ] All 16 manual tests above (A–P) pass on a fresh local environment.
- [ ] `pnpm lint` passes (TypeScript + Biome + ESLint).
- [ ] `pnpm vitest run` passes.
- [ ] `pnpm build` succeeds.
- [ ] No new `@mui/*` or `@emotion/*` imports introduced in `src/crd/` or `src/main/crdPages/topLevelPages/spaceSettings/community/` (verify via `git diff` + `grep -E '@mui|@emotion' src/crd src/main/crdPages/topLevelPages/spaceSettings`).
- [ ] All six locale JSON files in `src/crd/i18n/spaceSettings/` updated with the new `community.memberSettings.*` keys (English placeholders OK in non-EN).
- [ ] Visual diff against the prototype's `SpaceSettingsCommunity.tsx` dropdown order and labels.

## Where to find things

| Concern | Location |
|---|---|
| Spec & clarifications | `specs/094-crd-member-settings-dialog/spec.md` |
| Phase 0 research | `specs/094-crd-member-settings-dialog/research.md` |
| Component data shapes | `specs/094-crd-member-settings-dialog/data-model.md` |
| Component contracts | `specs/094-crd-member-settings-dialog/contracts/crd-components.md` |
| MUI dialog (read-only reference) | `src/domain/spaceAdmin/SpaceAdminCommunity/dialogs/CommunityMemberSettingsDialog.tsx` |
| Prototype reference | `prototype/src/app/components/space/SpaceSettingsCommunity.tsx:534-562` |
| Existing CRD community view | `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx` |
| Existing integration | `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts` |
| Existing primitives | `src/crd/primitives/{dialog,alert-dialog,checkbox,label,button,avatar,dropdown-menu}.tsx` |

## Troubleshooting

- **The Member settings dialog opens but the lead checkbox is always disabled.** Inspect `leadPolicy.canAddLeadUser` / `canAddLeadOrganization`. The role-set policy is wired in `useCommunityTabData.ts` via `useCommunityPolicyChecker`. If empty / undefined, confirm the underlying GraphQL query returns the policy data.
- **Toast does not appear on mutation failure.** The toast plumbing is in `useCommunityAdmin` (existing). If the failure is silent, the mutation may be returning success-with-error rather than rejecting; check the GraphQL response shape.
- **Dropdown items render but are no-ops.** Confirm `useCommunityTabData.ts` is wiring the new `onMemberChangeRole` / `onUserRemoveRequest` callbacks (and their org equivalents) into `<SpaceSettingsCommunityView>`.
