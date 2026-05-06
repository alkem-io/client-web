# Quickstart: CRD Contributor Settings

**Feature**: 097-crd-user-settings | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

This is the developer's hands-on guide: how to enable the toggle, where to look for issues per tab, what to smoke-test before opening a PR, and what counts as "feature complete."

## Prerequisites

- Node 24.14.0 (Volta-pinned) and pnpm 10.17.1
- Backend running locally at `localhost:3000` (Traefik reverse proxy, expects services up at `localhost:4000`, etc.)
- A user account on the local backend (or seeded test data) with at least:
  - One organization where the user has `Update` privilege (for Org settings smoke)
  - At least one space membership (for Membership tab smoke)
  - At least one associated organization (for User Organizations tab smoke)
  - Optional: PlatformAdmin role on a separate user account (for admin-on-other-user smoke)
- Browser DevTools open with cache disabled (Network tab visible) — useful for verifying no broken queries.

## One-time setup

```bash
pnpm install
pnpm codegen          # only needed when GraphQL schema changes; this spec introduces none
pnpm start            # dev server on localhost:3001
```

Enable the CRD toggle in the browser console:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

To disable (back to MUI):

```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

## Build order (per implementation strategy)

The spec ships **all 7 user tabs together** and **all 5 org tabs together**, gated by the same toggle. The recommended build order to keep the toggle usable for smoke at each stage:

1. **Phase 1 (Setup)**: register `crd-contributorSettings` i18n namespace; create empty translation files; scaffold the two integration directories.
2. **Phase 2 (Foundational)**: build the shared shell (`SettingsShell`, `SettingsTabStrip`, `SettingsCard`), the `EditableField` family, the per-actor predicate hooks (`useCanEditUserSettings`, `useCanEditOrganizationSettings`), the `CrdUserSettingsRoutes` and `CrdOrgSettingsRoutes` route shells. Wire the toggle dispatch in `TopLevelRoutes.tsx` (User) and `CrdOrganizationRoutes.tsx` (Org). At this point, all tabs render an "empty" page that proves the routing works.
3. **Phase 3+ (Per-tab)**: implement each of the 12 tabs in any order — they're independent. The smoke checklist below validates each one in isolation.
4. **Phase Polish**: translations for all 6 languages, axe accessibility scan per tab, lint, bundle delta check, end-to-end smoke through every tab × every authorization variant.

## Smoke checklist (per tab)

Each item should be verified manually with the toggle ON. After all 12 are green, run again with the toggle OFF to confirm the MUI fallback works (no regressions on the existing pages).

### User Story 1 — User My Profile

- [ ] Open `/user/<self>/settings/profile`. Sticky header shows avatar + name + 7-tab strip; My Profile is highlighted with `border-primary` underline.
- [ ] Hover **First Name** — pencil glyph appears. Click — input becomes active with check + × icons.
- [ ] Edit, click check — value persists; transient "Saved" indicator appears next to label for ~2s.
- [ ] Edit Tagline, click × — value reverts to server.
- [ ] Edit Phone with invalid format — Save is disabled and inline error shows.
- [ ] Edit Bio (markdown), press Enter — newline inserted (does NOT save). Click Save icon — change persists.
- [ ] Add a LinkedIn URL via the recognized Social Links row, click Save — appears on `/user/<self>` (public profile, sibling 096).
- [ ] Click trash on a saved reference — disappears immediately, no confirmation dialog.
- [ ] Click "Add Another Reference" — new row in edit mode; fill name + URL + description, click Save — created.
- [ ] Click "Change Avatar" → pick a JPG → preview updates immediately, no Save click needed.
- [ ] Edit a field, click another tab without saving — navigation completes, field's typed value is silently dropped, no confirmation dialog.
- [ ] **Failure smoke**: temporarily kill backend connection (DevTools → Network → Offline) → edit a field → click Save — field stays in edit mode with typed value preserved + inline error. Re-enable network, click Save — succeeds without retyping.
- [ ] As a platform admin viewer: open `/user/<otherUser>/settings/profile` — page is fully editable, saves persist against the target user.
- [ ] As a non-admin viewer: open `/user/<otherUser>/settings/profile` — redirected to `/user/<otherUser>` (public profile).

### User Story 2 — User Account

- [ ] Open `/user/<self>/settings/account`. Help banner + 4 card groups visible.
- [ ] Click "Create Virtual Contributor" — navigates to existing MUI VC creation flow.
- [ ] Click a hosted space's kebab → Manage — navigates to existing MUI manage flow.
- [ ] Click a hosted resource's kebab → Delete — opens confirmation dialog; on confirm, existing delete mutation fires.

### User Story 3 — User Membership

- [ ] Open `/user/<self>/settings/membership`. Home Space card + Memberships table + Pending Applications visible.
- [ ] Pick a Home Space — dropdown updates, mutation fires; Auto-redirect checkbox becomes enabled.
- [ ] Tick Auto-redirect — change persists.
- [ ] Type "Garden" in the memberships search — list filters client-side; pagination resets to page 1.
- [ ] Open a row's kebab → Leave → Confirm — row disappears.
- [ ] Pending Applications table is read-only (no kebab).

### User Story 4 — User Organizations

- [ ] Open `/user/<self>/settings/organizations`. Org list visible with avatar / name / location / role / associates / verified badge / website.
- [ ] If the user has `CreateOrganization` privilege — Create Organization button visible.
- [ ] Type "Alkemio" in search — list filters client-side.
- [ ] Open a row's kebab → Leave → Confirm — org disappears from list.
- [ ] Click an org name — navigates to `/organization/<orgSlug>` (public profile, sibling 096).

### User Story 5 — User Notifications

- [ ] Open `/user/<self>/settings/notifications`. All visible cards render with one row per property and three Switch columns (inApp, email, push).
- [ ] Flip an email Switch — UI updates immediately; reload — value persists.
- [ ] Flip Push master toggle ON — browser permission prompt fires; on accept, subscription appears in Push Subscriptions List.
- [ ] In a private window, open the page — push master replaced by info banner; every push column hidden.
- [ ] Confirm Space Admin / Platform Admin / Organization Notifications cards appear only with the appropriate privileges.
- [ ] **Failure smoke**: kill network, flip a switch — UI flips optimistically, then reverts on the failure response with an inline error toast.

### User Story 6 — User Settings

- [ ] Open `/user/<self>/settings/settings`. Two cards: Communication & Privacy + Design System.
- [ ] Flip "Allow other users to send me messages" — change persists after reload.
- [ ] Flip Design System OFF — page reloads in MUI mode.
- [ ] In MUI, navigate to the equivalent settings tab and flip Design System ON — page reloads back into CRD.

### User Story 7 — User Security

- [ ] Open `/user/<self>/settings/security` as the profile owner. Identity-provider passkey form renders inside CRD card shell.
- [ ] Click "Add Passkey" or equivalent — existing flow runs.
- [ ] If the account has no WebAuthn nodes — info alert reads "WebAuthn / Passkey is not enabled on this account".
- [ ] As a platform admin (not owner): open `/user/<otherUser>/settings/security` — redirected to `/user/<otherUser>/settings/profile`.
- [ ] As any non-owner viewer: tab strip omits the Security tab on `/user/<otherUser>/settings/<any>`.

### User Story 8 — Org Profile

- [ ] Open `/organization/<orgSlug>/settings/profile` as an org admin. Sticky header shows avatar + org name + 5-tab strip; Profile highlighted.
- [ ] Hover Display Name — pencil glyph. Edit + Save — value persists.
- [ ] Edit Description (markdown) — Enter inserts newline; Save icon commits.
- [ ] Edit Domain to an invalid value — inline error displays, Save disabled.
- [ ] Upload a new logo — preview updates immediately.
- [ ] Verified badge displays current `verification.status` read-only — click does nothing.
- [ ] As a non-admin viewer: open `/organization/<orgSlug>/settings/profile` — redirected to `/organization/<orgSlug>` (public profile).

### User Story 9 — Org Account

- [ ] Open `/organization/<orgSlug>/settings/account` as an org admin. 4 card groups render with the org's resources.
- [ ] Click Create Innovation Pack — existing creation flow runs.
- [ ] Click a resource's kebab → Manage — existing manage flow runs.

### User Story 10 — Org Community (Associates)

- [ ] Open `/organization/<orgSlug>/settings/community` as an org admin. Two columns: current Associates + Available Users.
- [ ] Type "Maria" in search — Available Users filters.
- [ ] Click + on an available user — they move to Associates list (mutation fires immediately).
- [ ] Click × on an existing Associate — they're removed.
- [ ] Scroll the Available Users column — load-more triggers, additional users appear.

### User Story 11 — Org Authorization

- [ ] Open `/organization/<orgSlug>/settings/authorization` as an org admin. Two sub-tabs (Admin / Owner).
- [ ] Admin sub-tab is selected by default — Admin role-assignment view renders.
- [ ] Click + on an available user — added to Admins.
- [ ] Switch to Owner sub-tab — Owner role-assignment view renders.
- [ ] Click × on an Owner — removed.
- [ ] Switch sub-tabs back and forth — local state, no URL change.

### User Story 12 — Org Settings

- [ ] Open `/organization/<orgSlug>/settings/settings` as an org admin. Card with two switches.
- [ ] Flip "Allow users matching domain to join" — change persists after reload.
- [ ] Flip "Contribution roles publicly visible" — change persists.
- [ ] Confirm there is **no** Design System toggle on this tab (FR-132).

## Cross-cutting smoke

- [ ] **Tab strip overflow**: shrink browser to `< md` width — both User (7-tab) and Org (5-tab) strips horizontally scroll; active tab auto-scrolls into view.
- [ ] **Keyboard navigation**: Tab into the tab strip → Left/Right arrows switch tabs → Enter activates. Same for the Org Authorization Admin/Owner sub-tab strip.
- [ ] **Routing**: every URL `/user/<slug>/settings/<tab>` and `/organization/<slug>/settings/<tab>` resolves directly to the matching tab (deep-linking parity).
- [ ] **CRD toggle off**: disable the toggle → every URL above resolves to the existing MUI page → no broken links → no console errors.
- [ ] **Anonymous viewer**: open any settings URL while signed out → redirected to login.
- [ ] **i18n**: switch language to nl, es, bg, de, fr → every visible string is localized (no `crd-contributorSettings.foo.bar` literal showing).
- [ ] **Accessibility**: run axe scan on each of the 12 tabs — zero critical/serious violations.

## Performance & bundle smoke

- [ ] `pnpm analyze` — combined delta of the two new lazy-loaded chunks (`userSettings*.js` and `orgSettings*.js`) ≤ +50 KB gzipped over the prior build (SC-007).
- [ ] Tab switch < 200ms; pencil-hover affordance reveal < 50ms; per-field save round-trip < 3s on a healthy connection.

## Done definition

The feature is "feature complete" when:

1. All 12 smoke checklists pass with the toggle ON.
2. The CRD-OFF smoke passes (no MUI regressions).
3. `pnpm lint` passes with no new warnings.
4. `pnpm vitest run` passes — all unit tests for mappers, predicate hooks, the editable-field state machine, push availability, optimistic overrides, and the i18n key parity test green.
5. Bundle delta within budget (SC-007).
6. Zero critical/serious axe violations on every tab (SC-006).
7. PR description includes:
   - Screenshots of each tab in CRD mode.
   - Confirmation that the toggle round-trip works in both directions.
   - Network log evidence that the per-actor predicate redirects fire correctly.
   - Bundle analyze chart screenshot.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Tab strip renders 0 tabs | `useCanEdit*Settings` returns `loading: true` indefinitely; the route guard treats loading as falsy. | Verify the underlying provider hook resolves; render a Skeleton during loading instead of evaluating the gate. |
| "Saved" indicator never disappears | The integration hook's success-flash timer never transitions back to `idle`. | Check the `idle-saved → idle` setTimeout in the per-field state machine (Decision #2). |
| Per-field save disables Save button forever after a failure | The integration hook never resets `errorMessage`. | On `onSave` retry, clear `errorMessage` before transitioning to `pending`. |
| Org Profile doesn't update after Save | The mutation fired but the cache didn't refetch. | Confirm the integration hook calls `refetch()` on the relevant query, or uses Apollo's automatic update via the mutation result + cache normalization. |
| `useCrdEnabled()` flips but Org settings still renders MUI | `CrdOrganizationRoutes.tsx` change wasn't picked up. | Verify the dispatch was added at lines 29–34 of that file (research §1). |
| Tab navigation triggers a confirmation dialog | A hidden tab-wide dirty buffer is present. | None should exist (FR-016) — review whether a Formik or controlled-form was inadvertently introduced. |
| Push master toggle flickers between ON and OFF | Optimistic-overrides clearing logic is wrong. | Verify the override is cleared only on refetch success (Decision #4), not on mutation completion alone. |
