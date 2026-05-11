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
2. **Phase 2 (Foundational)**: build the shared shell (`SettingsShell`, `SettingsTabStrip`, `SettingsCard`), extract `FieldFooter` from 045 to `@/crd/components/common/FieldFooter.tsx` (the per-section Save button + dirty indicator + status pill), the per-actor predicate hooks (`useCanEditUserSettings`, `useCanEditOrganizationSettings`), the `CrdUserSettingsRoutes` and `CrdOrgSettingsRoutes` route shells. Wire the toggle dispatch in `TopLevelRoutes.tsx` (User) and `CrdOrganizationRoutes.tsx` (Org). At this point, all tabs render an "empty" page that proves the routing works.
3. **Phase 3+ (Per-tab)**: implement each of the 12 tabs in any order — they're independent. The smoke checklist below validates each one in isolation.
4. **Phase Polish**: translations for all 6 languages, axe accessibility scan per tab, lint, bundle delta check, end-to-end smoke through every tab × every authorization variant.

## Smoke checklist (per tab)

Each item should be verified manually with the toggle ON. After all 12 are green, run again with the toggle OFF to confirm the MUI fallback works (no regressions on the existing pages).

### User Story 1 — User Profile

- [ ] Open `/user/<self>/settings/profile`. Sticky header (`top-16 z-20`, `bg-card border-b`) shows avatar + name + 7-tab strip; Profile is highlighted with `border-primary text-primary` underline. Body content centered via 12-col grid (`col-start-2 col-span-10` on `lg+`).
- [ ] **Identity card layout** — Display Name on its own row (full-width); First Name + Last Name in a 2-col `FieldPairRow` on `md+` (stacked below `md`); Email + Phone in a 2-col `FieldPairRow` on `md+`. Email field is a styled read-only `<Input>` with `cursor-not-allowed bg-muted/50 pl-9` and a `Mail` lucide icon prefix (no plain-text rendering).
- [ ] **Social Links card** — LinkedIn / Bluesky / GitHub rows each render with a brand-tinted rounded-full icon tile (`size-10 rounded-full bg-{brand}/10 text-{brand}`) sourcing the brand SVG from `@/crd/components/common/icons/social/*.svg?react` (icons use `fill="currentColor"`). No separate `<Label>` above the input — the icon tile is the visual identifier.
- [ ] **About You card** — Skills and Keywords are rendered as **two independent** tagset sections (each with its own `FieldFooter` + Save). There is NO single unified "Tags" field. Saving Skills MUST NOT touch Keywords and vice versa.
- [ ] Edit **First Name** in its inline input — the section's `FieldFooter` shows a dirty indicator and the Save button enables. **No per-field pencil / check / × icons anywhere on the tab.**
- [ ] Click the section's **Save** button — value persists; "Saved!" indicator flashes adjacent to the Save button for **~1.8 s** (`SAVED_FLASH_MS = 1800`) and the section returns to idle.
- [ ] Edit Phone with an invalid format — the section's Save button is disabled while the value is format-invalid (live URL/email/phone validation per FR-023).
- [ ] Click Save with **Display Name** / First Name / Last Name empty — inline error appears beneath the offending input, the section stays dirty, and no mutation fires. Re-type a valid value — the error clears.
- [ ] Edit Bio (markdown) — Enter inserts a newline (no Enter-to-Save semantics). Click the Bio section's Save — change persists with the same "Saved!" flash.
- [ ] Add a new LinkedIn URL via the recognized Social Links row — the row appears as unsaved (temp-id) in the local References-section buffer; nothing fires server-side until the section's Save click. Click the **References-section Save** — the mutation batch fires (createReferenceOnProfile) and the reference appears on `/user/<self>` (public profile, sibling 096) after reload.
- [ ] Click trash on a saved reference — a `ConfirmationDialog` (`AlertDialog`, destructive variant) opens (Rule #9 / FR-025). **Cancel** dismisses with no change. **Confirm** queues the row for deletion in the section buffer (still local). Click the References-section Save — the mutation batch (`deleteReference`) fires and the row disappears.
- [ ] Click "Add Another Reference" — a new arbitrary row appears in the buffer; fill name + URL + description; click the References-section Save — created.
- [ ] Click "Change Avatar" → pick a JPG → preview updates **immediately**, no Save click needed (FR-024 — file picker IS the commit). On success the avatar slot's status flashes "Saved!" for ~1.8 s.
- [ ] Edit any field, click another tab without saving — navigation completes immediately, the in-progress edit is silently dropped, no confirmation dialog (FR-016).
- [ ] **Failure smoke (per-section)**: temporarily kill backend connection (DevTools → Network → Offline) → edit a field → click the section's Save — the section stays dirty with the typed value preserved + an inline error message persists in the section. Re-enable network → edit any field in the section (clears the error and re-enables Save) → click Save — succeeds without retyping. There is no auto-retry and no auto-revert.
- [ ] As a platform admin viewer: open `/user/<otherUser>/settings/profile` — page is fully editable, per-section saves persist against the target user.
- [ ] As a non-admin viewer: open `/user/<otherUser>/settings/profile` — redirected to `/user/<otherUser>` (public profile).

### User Story 2 — User Account

- [ ] Open `/user/<self>/settings/account`. Help banner + 4 card groups visible.
- [ ] Click "Create New Space" (dashed card) — the CRD `CrdCreateSpaceDialog` opens (no route navigation). Complete it; the new space appears in the Hosted Spaces grid and is reachable on reload.
- [ ] Click "Create Virtual Contributor" — the CRD VC wizard opens at its first step. Walk the **create-knowledge** branch (add a post + a document, then pick/create a community space); the VC appears in the Virtual Contributors group. Repeat for the **use-existing-space** and **external-AI** branches (the external branch ends straight on the VC profile).
- [ ] Click "Empty Slot" `+` (Template Packs) — `CrdCreateInnovationPackDialog` opens; submit it; the new pack appears in the Innovation Packs group.
- [ ] With 0 Custom Homepages — the centered empty-state shows ("No Custom Homepages" + "Capacity: 0/1 Used" + CTA); click the CTA — `CrdCreateInnovationHubDialog` opens; submit it; the new homepage appears.
- [ ] Open any CRD creation dialog and Cancel/Escape — nothing is created, no navigation. With DevTools → Network → Offline, submit a creation dialog — the dialog stays open with an inline error toast.
- [ ] Click a hosted space's kebab → Manage — the app navigates to that resource's settings URL.
- [ ] Click a hosted resource's kebab → Delete — opens the CRD `ConfirmationDialog`; on confirm, the existing delete mutation fires and the card disappears.

### User Story 3 — User Membership

- [ ] Open `/user/<self>/settings/membership`. Three sections visible: Home Space card on top, Memberships card grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) in the middle, Pending Applications list at the bottom. Each membership card shows: aspect-video banner (cardBanner image, or deterministic gradient when absent), Type badge (Space / Subspace) bottom-left of banner, kebab top-right with two items only ("View Space" / "View Subspace" + "Leave Space" / "Leave Subspace" — no Options label), title, role badge, tagline body, and a "Led by:" footer with avatar stack when the space has community leads. Above the grid: search input, segmented "All / Spaces / Subspaces" filter, and "Showing X of Y memberships" caption.
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

- [ ] Open `/organization/<orgSlug>/settings/profile` as an org admin. Sticky header shows avatar + org name + 5-tab strip; Profile highlighted. **Same per-section save model as User Profile (FR-090) — no per-field pencil / check / × icons anywhere.**
- [ ] Edit **Display Name** in its inline input — the section's `FieldFooter` shows a dirty indicator and the Save button enables. Click the section's Save — value persists; "Saved!" flashes for ~1.8 s.
- [ ] Edit Description (markdown) — Enter inserts a newline. Click the Description section's Save — change persists.
- [ ] Edit Contact Email / Domain / Website to an invalid format — that section's Save is disabled live (FR-023). Re-enter a valid value — Save re-enables.
- [ ] Click Save with Display Name (or Description) empty — inline error appears beneath the input; section stays dirty; no mutation fires.
- [ ] Trash a saved reference (Social Links / References section) — `ConfirmationDialog` (destructive variant) opens (Rule #9 / FR-025 / FR-092). Confirm queues the row for deletion in the buffer; only the References-section Save click fires the actual `deleteReference` mutation in the batch. Cancel dismisses with no change.
- [ ] Upload a new logo — preview updates **immediately**, no Save click (FR-093 — file picker IS the commit).
- [ ] **Verified badge** displays current `verification.status` read-only — click does nothing (FR-094 — there is no edit affordance).
- [ ] **Mid-edit tab switch**: edit any field, click another tab — navigation completes, the in-progress edit is silently dropped, no confirmation dialog (FR-016).
- [ ] **Failure smoke (per-section)**: kill network → edit a field → click Save — section stays dirty with typed values preserved + inline error. Re-enable network, edit any field (clears the error), click Save — succeeds.
- [ ] As a viewer without `Update` privilege: open `/organization/<orgSlug>/settings/profile` — redirected to `/organization/<orgSlug>` (public profile).

### User Story 9 — Org Account

- [ ] Open `/organization/<orgSlug>/settings/account` as an org admin. 4 card groups render with the org's resources.
- [ ] Click Create Innovation Pack — the CRD `CrdCreateInnovationPackDialog` opens (the **same** dialog as User Account, just targeting `organization.account.id`); submit it; the new pack appears in the Innovation Packs group.
- [ ] Click Create Virtual Contributor — the CRD VC wizard opens; the create mutation runs against `organization.account.id`.
- [ ] Click Create New Space / Create Homepage — the CRD `CrdCreateSpaceDialog` / `CrdCreateInnovationHubDialog` open; submit; the resource appears.
- [ ] Click a resource's kebab → Manage — the app navigates to that resource's settings URL. → Delete — opens the CRD `ConfirmationDialog`; on confirm, the existing delete mutation fires.

### User Story 10 — Org Community (Associates)

- [ ] Open `/organization/<orgSlug>/settings/community` as an org admin. Two columns: current Associates + Available Users.
- [ ] Type "Maria" in search — Available Users filters.
- [ ] Click + on an available user — they move to Associates list (mutation fires immediately, no dialog per FR-110).
- [ ] Click × on an existing Associate — `ConfirmationDialog` (destructive variant) opens with copy "Remove {{name}} as Associate" (Rule #9 / FR-112). **Cancel** dismisses with no mutation. **Confirm** fires `removeRoleFromUser` and the row disappears with a success toast.
- [ ] Scroll the Available Users column — load-more triggers, additional users appear.

### User Story 11 — Org Authorization

- [ ] Open `/organization/<orgSlug>/settings/authorization` as an org admin. Two sub-tabs (Admin / Owner).
- [ ] Admin sub-tab is selected by default — Admin role-assignment view renders.
- [ ] Click + on an available user — added to Admins (no dialog per FR-110).
- [ ] Click × on a current Admin — `ConfirmationDialog` opens with role-aware copy "Remove {{name}} as Admin" (Rule #9 / FR-121). Confirm fires `removeRoleFromUser` against the Admin role.
- [ ] Switch to Owner sub-tab — Owner role-assignment view renders. Each sub-tab keeps its own search term and pendingRemove state independently.
- [ ] Click × on an Owner — `ConfirmationDialog` opens with role-aware copy "Remove {{name}} as Owner". Confirm fires the mutation against the Owner role.
- [ ] Switch sub-tabs back and forth — local React state, no URL change (FR-120). Sub-tab strip is keyboard-navigable per FR-152.

### User Story 12 — Org Settings

- [ ] Open `/organization/<orgSlug>/settings/settings` as an org admin. Two cards (Membership + Privacy), each with a single switch.
- [ ] Flip "Allow users matching domain to join" — switch flips optimistically; mutation fires; change persists after reload.
- [ ] Flip "Contribution roles publicly visible" — switch flips optimistically; mutation fires; change persists.
- [ ] Confirm there is **no** Design System toggle on this tab (FR-132 — User-only).
- [ ] **Hard-failure smoke**: kill backend connection (DevTools → Network → Offline) → flip either switch — switch flips optimistically, then **reverts** when the mutation fails, accompanied by an inline error toast (FR-133, parity with User Notifications + User Settings).

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
- [ ] Tab switch < 200ms; per-section save round-trip < 1s perceived (mutation + refetch + "Saved!" flash for 1.8s); avatar / logo upload commit immediate on file-pick.

## Done definition

The feature is "feature complete" when:

1. All 12 smoke checklists pass with the toggle ON.
2. The CRD-OFF smoke passes (no MUI regressions).
3. `pnpm lint` passes with no new warnings.
4. `pnpm vitest run` passes — all unit tests for mappers, predicate hooks, the per-section save state machine (`useUserProfileTabData` / `useOrgProfileTabData` — `idle | saving | saved | error`), push availability, optimistic overrides + hard-failure revert, and the i18n key parity test green.
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
| "Saved!" indicator never disappears | The integration hook's success-flash timer never transitions back to `idle`. | Check the `saved → idle` setTimeout (`SAVED_FLASH_MS = 1800`) in the per-section state machine (Decision #2 / `useUserProfileTabData` / `useOrgProfileTabData`). |
| Section's Save button stays disabled after a failure | The integration hook left `saveStatusByField[section]` in `error` and never clears it on the next edit. | The next field edit in the section MUST reset `saveStatusByField[section]` to `idle` and clear the inline error. Verify the `onChange` path runs that reset (Decision #2 transition: `error → idle on next edit`). |
| Reference deletion fires immediately with no dialog | Trash icon wired directly to the `deleteReference` mutation, bypassing the `pendingReferenceDeleteId` state + `ConfirmationDialog`. | Trash MUST set `pendingReferenceDeleteId`; the dialog's Confirm queues the row in the section buffer; the actual `deleteReference` fires only on the References-section Save click batch (Rule #9 / FR-025). |
| Org Profile doesn't update after Save | The mutation fired but the cache didn't refetch. | Confirm the integration hook calls `refetch()` on the relevant query, or uses Apollo's automatic update via the mutation result + cache normalization. |
| `useCrdEnabled()` flips but Org settings still renders MUI | `CrdOrganizationRoutes.tsx` change wasn't picked up. | Verify the dispatch was added at lines 29–34 of that file (research §1). |
| Tab navigation triggers a confirmation dialog | A hidden tab-wide dirty buffer is present. | None should exist (FR-016) — review whether a Formik or controlled-form was inadvertently introduced. |
| Push master toggle flickers between ON and OFF | Optimistic-overrides clearing logic is wrong. | Verify the override is cleared only on refetch success (Decision #4), not on mutation completion alone. |
