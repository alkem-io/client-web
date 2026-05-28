# Quickstart — CRD Innovation Hub Migration

**Feature**: 102-crd-innovation-hub
**Audience**: developer implementing the feature, reviewer verifying it.

This document gives the minimum steps to (a) build the feature locally, (b) toggle into the CRD design, (c) verify each user story against the running app.

---

## Prerequisites

- Node ≥ 24.0.0, pnpm ≥ 10.17.1 (Volta-pinned to Node 24.14.0).
- Backend running at `localhost:3000` (Traefik reverse proxy with GraphQL at `/graphql`).
- An Innovation Hub seeded in the backend with at least one Space in its `spaceListFilter` (use `vng-innovation-hub` or similar).
- An admin user (owns the hub) AND a non-admin user (no `Update` privilege on the hub) for the privilege-guard verification.

```bash
pnpm install          # always pnpm; lockfile is authoritative
pnpm start            # dev server on localhost:3001
```

---

## Toggle into the CRD design

The feature is gated by the per-user `UserSettings.designVersion`. For local development:

```js
// Browser console on http://localhost:3001
localStorage.setItem('alkemio-design-version', '2');
location.reload();
```

To flip back to legacy MUI:

```js
localStorage.setItem('alkemio-design-version', '1');
location.reload();
```

In deployed environments, anonymous and unset users **default to `'2'`** — they will see the new CRD design without any action.

---

## Verifying User Story 1 — Hub home, subdomain entry

In local dev, hub subdomains are simulated via the `?subdomain=` query param:

```bash
# Open the home dispatcher with the hub-subdomain branch active
open http://localhost:3001/?subdomain=<existing-hub-subdomain>
```

Expected with `designVersion=2`:
- CRD header (search bar + platform nav + user menu) at the top.
- Full-width hub banner (or deterministic gradient) below the header.
- Info bar with hub name (`text-hero`) and tagline (italic, muted).
- Settings gear icon visible only if signed in as the hub admin.
- Description card (rendered through `MarkdownContent`).
- Spaces grid (1 / 2 / 3 columns at sm / md / lg).
- Footer CTA "Browse all Spaces on Alkemio" — clicking it navigates to `//<canonical-host>/spaces`, **exiting the subdomain**.
- CRD footer.

Expected with `designVersion=1`:
- Legacy MUI hub home page renders, unchanged. CRD chunk never fetched (verify in DevTools Network).

Also verify the path-based entry produces the same result:

```bash
open http://localhost:3001/hub/<existing-hub-slug>
```

---

## Verifying User Story 2 — Settings About tab

Sign in as the hub admin. From the hub home page on `designVersion=2`, click the settings gear icon. Or open the URL directly:

```bash
open http://localhost:3001/hub/<existing-hub-slug>/settings/about
```

Expected:
- Sticky header (avatar thumbnail — cropped banner OR gradient + initials per Q1 — + name + tagline + view-hub icon).
- About / Spaces tabs row directly under the header.
- About tab active by default.
- Six sections: Subdomain, Name, Tagline, Description, Tags, Banner.
- Each section's input control + a right-aligned `InlineSectionSave` indicator that:
  - Renders nothing when the section is clean.
  - Renders a **Save** button when the section is dirty.
  - Transitions `dirty → saving → saved → idle` on commit.
- Editing a single field and saving must NOT flicker the save state on any other section.
- Banner section: hover over the preview → "Change Banner" button appears → click and pick a file → preview updates → re-navigate and verify the new banner shows on the public hub home.

Failure path: stop the backend mid-save, edit a field, save → expect the indicator to surface an inline error and revert to `idle` (not stuck on `saving`).

---

## Verifying User Story 3 — Settings Spaces tab

```bash
open http://localhost:3001/hub/<existing-hub-slug>/settings/spaces
```

Expected:
- Sticky header unchanged.
- Active tab indicator on **Spaces**.
- Table with columns Name, Visibility, Host Account, (actions).
- Each row has a drag handle (grip icon on the left) and a remove icon button (right).
- **Drag a row** to a new position → row commits to new order optimistically → reload → order persists.
- Click **Add** → CRD `AddSpaceByUrl` dialog opens → paste a valid Space URL from another tab → submit → new row appears in the table → reload → persists.
- Click the **remove** icon → `ConfirmationDialog` appears → confirm → row disappears → reload → persists.
- Empty all rows → empty state copy appears with an inline Add button.

Keyboard verification (a11y):
- Tab to a drag handle → press Space to grab → arrow keys to move → Space again to drop. Order persists.
- Tab to the Add button → press Enter → dialog opens.
- Inside the dialog, focus is trapped (Tab cycles through input + buttons); Esc closes (via `useDialogCloseGuard` if dirty).

---

## Verifying User Story 4 — Toggle coexistence

```js
// Set legacy
localStorage.setItem('alkemio-design-version', '1');
location.reload();
```

Visit `/hub/<slug>` and `/hub/<slug>/settings`. Both must render the legacy MUI pages. In DevTools Network, filter by "Crd" — no CRD hub chunks should be fetched.

```js
localStorage.setItem('alkemio-design-version', '2');
location.reload();
```

Visit the same URLs. Both must render the CRD pages. The legacy `InnovationHubHomePage` and `InnovationHubSettingsPage` chunks must NOT be fetched.

Toggling via the user menu's Design Version switch must hard-reload the page and pick the corresponding shell.

---

## Verifying privilege guard

Sign out, or sign in as a user without `Update` privilege on the hub. Type the settings URL directly:

```bash
open http://localhost:3001/hub/<existing-hub-slug>/settings/about
```

Expected on `designVersion=2`: the page redirects to `/hub/<existing-hub-slug>` (`<Navigate replace />`). No form, no permission-denied page, no read-only render.

---

## Verifying subdomain dispatch fix (FR-027)

The current `CrdHomePage` dispatcher renders the legacy MUI hub home for any hub-resolved subdomain visit, regardless of design version. This feature fixes that.

Steps to verify:
1. Set `designVersion=2`.
2. Visit `localhost:3001/?subdomain=<existing-hub-subdomain>`.
3. Expect the **CRD** hub home (CRD header/footer, Tailwind chrome).
4. Open DevTools Network and confirm the legacy `InnovationHubHomePage.tsx` chunk is NOT fetched.

Negative test:
1. Set `designVersion=2`.
2. Visit `localhost:3001/` (no subdomain).
3. Expect the regular CRD dashboard (no hub home content).

---

## i18n verification

Switch language via the footer language selector. Verify all 6 supported languages:

```bash
# In the footer, pick each language: English, Nederlands, Español, Български, Deutsch, Français
```

For each language, all user-visible strings on the home page and settings page must be translated. No raw keys (e.g. `settings.about.subdomain.label`) should appear as fallback text.

**Dutch (`nl`) glossary check**: "Spaces", "Subspace", "Post", "template", "Layout", "Virtual Contributor" must remain in English on the Dutch UI. The surrounding sentence is translated and inflected around them (e.g. `<HubName> Spaces` becomes `<HubName>-Spaces` in Dutch, not `<HubName> Ruimtes`).

---

## Lint / type / test gates

Run before opening a PR:

```bash
pnpm lint                                     # Biome + ESLint + TypeScript
pnpm vitest run                               # 57 files / 595 tests + the new ones
pnpm codegen                                  # No-op for this feature; should NOT touch generated files
pnpm vitest run src/main/crdPages/innovationHub --reporter=basic
```

Specifically:
- `useHubAboutTabData.test.ts` exercises the per-section save reducer (idle → saving → saved → idle).
- `useHubAccessGuard.test.ts` exercises the privilege check (allowed / redirect).
- `dataMappers.test.ts` exercises GraphQL → CRD prop mapping for home, settings header, about values, and spaces table rows.

---

## Bundle-size sanity check

```bash
pnpm analyze
# Open build/stats.html — find the new InnovationHub chunk under "src/main/crdPages/innovationHub/"
# Confirm the chunk does NOT contain any node_modules from @mui or @emotion.
```

---

## Done definition

This feature is "done" when:
- All 4 user stories pass their acceptance scenarios at `designVersion=2`.
- The legacy MUI pages render unchanged at `designVersion=1`.
- The home-route dispatcher correctly routes subdomain access to the CRD page when `designVersion=2`.
- The privilege guard redirects non-admins from `/hub/<slug>/settings`.
- All 6 language files contain every new key; the Dutch glossary terms are preserved in English.
- `pnpm lint` and `pnpm vitest run` pass.
- The CRD components contain zero imports from `@mui/*`, `@emotion/*`, `@/core/apollo/*`, `@/domain/*`, `react-router-dom`, `formik`.
