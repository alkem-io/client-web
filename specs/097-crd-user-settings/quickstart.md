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
- [ ] Click "Change Avatar" → pick a JPG → the CRD `ImageCropDialog` opens with the avatar's aspect ratio + size constraints (FR-024 — crop-then-commit). Drag to reposition; optionally fill the alt-text field; click **Save** → the dialog closes, the cropped image uploads, and the avatar slot's status flashes "Saved!" for ~1.8 s. Repeat once and click **Cancel** in the crop dialog instead — the avatar stays unchanged and no network call fires.
- [ ] Edit any field, click another tab without saving — navigation completes immediately, the in-progress edit is silently dropped, no confirmation dialog (FR-016).
- [ ] **Failure smoke (per-section)**: temporarily kill backend connection (DevTools → Network → Offline) → edit a field → click the section's Save — the section stays dirty with the typed value preserved + an inline error message persists in the section. Re-enable network → edit any field in the section (clears the error and re-enables Save) → click Save — succeeds without retyping. There is no auto-retry and no auto-revert.
- [ ] As a platform admin viewer: open `/user/<otherUser>/settings/profile` — page is fully editable, per-section saves persist against the target user.
- [ ] As a non-admin viewer: open `/user/<otherUser>/settings/profile` — redirected to `/user/<otherUser>` (public profile).

### User Story 2 — User Account

- [ ] Open `/user/<self>/settings/account`. Help banner + 4 card groups visible.
- [ ] Each of the 4 section headings shows a `X/Y` capacity badge (FR-034a). Hover the **Hosted Spaces** badge → the tooltip lists three per-plan rows ("X out of Y Free Spaces / Plus Spaces / Premium Spaces"). Hover each of the other three → single-line "You have created X out of your Y available …" tooltip. As a user without any space entitlement, the Spaces badge reads "Not available" with the contact-team tooltip. The Custom Homepages empty-state caption "Capacity: X/Y Used" matches the same numbers (no hard-coded `0/1`).
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
- [ ] Upload a new logo — the CRD `ImageCropDialog` opens with the logo's aspect ratio + size constraints (FR-093 — crop-then-commit). Click **Save** in the dialog → cropped image uploads, preview updates. Click **Cancel** in a second attempt → logo stays unchanged.
- [ ] **Verified badge** displays current `verification.status` read-only — click does nothing (FR-094 — there is no edit affordance).
- [ ] **Mid-edit tab switch**: edit any field, click another tab — navigation completes, the in-progress edit is silently dropped, no confirmation dialog (FR-016).
- [ ] **Failure smoke (per-section)**: kill network → edit a field → click Save — section stays dirty with typed values preserved + inline error. Re-enable network, edit any field (clears the error), click Save — succeeds.
- [ ] As a viewer without `Update` privilege: open `/organization/<orgSlug>/settings/profile` — redirected to `/organization/<orgSlug>` (public profile).

### User Story 9 — Org Account

- [ ] Open `/organization/<orgSlug>/settings/account` as an org admin. 4 card groups render with the org's resources.
- [ ] Each of the 4 section headings shows a `X/Y` capacity badge (FR-034a) with the same hover-tooltip wording as User Account (per-plan breakdown on Spaces, single-line on the other three). If the org lacks `CreateInnovationHub` privilege, that section's badge reads "Not available".
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

### User Story 13 — VC Profile

- [ ] Open `/vc/<vcNameId>/settings/profile` as a VC admin (e.g. the user who hosts the VC). Confirm the CRD shell loads with the 3-tab strip: **Profile / Membership / Settings**.
- [ ] Edit **Display name** → click Save → "Saved!" indicator flashes for 1.8s → reload → value persisted via `updateVirtualContributor`.
- [ ] Edit **Tagline** → Save → persisted.
- [ ] Edit **Description** in the markdown editor (`MarkdownEditor` from `@/crd/forms/markdown`) → Save → persisted.
- [ ] Edit **Keywords** tagset → Save → persisted. **First-save lazy-create**: on a VC that doesn't yet have a `Keywords` tagset, the first Save fires `createTagsetOnProfile({ name: 'Keywords' })`; subsequent saves patch the existing tagset.
- [ ] Click the avatar upload button → file picker → select an image → **`ImageCropDialog` opens with the VC avatar's constraints** → adjust crop → Save → upload succeeds via `uploadImageOnVisual` and the avatar updates in-place. Cancel → no upload fires.
- [ ] Click **Add another reference** in the References section → enter name + URL → Save → batch fires (`createReferenceOnProfile`).
- [ ] Edit an existing reference → Save → batch fires (`updateReference`).
- [ ] Click the × on a reference → **`ConfirmationDialog`** opens (per Rule #9 / FR-025) → Confirm → row removed pending Save → Save → batch fires (`deleteReference`).
- [ ] Confirm the read-only metadata rows render under the form: **Host organization** (clickable link to the org) and **Body of Knowledge** name (when the VC has one). Both rows are absent when the underlying field is null.
- [ ] No read-only mode (parity with FR-026): the form is fully editable for any user with `Update` privilege.

### User Story 14 — VC Membership

- [ ] Open `/vc/<vcNameId>/settings/membership` as the VC admin. Confirm the card grid renders at least one confirmed membership.
- [ ] Per membership row: avatar/banner + display name + type badge (Space / Subspace) + optional tagline + kebab menu with **View Space** and **Leave Space** items (no Options label, no separator — parity with User Membership grid).
- [ ] Click **View Space** on a row → navigates to the space URL.
- [ ] Click **Leave Space** on a row → **`ConfirmationDialog`** opens (per FR-172 / Rule #9) with copy reflecting the row's type ("Leave space" / "Leave subspace") → Confirm → mutation fires (`removeRoleFromVirtualContributor`) → row disappears from the grid.
- [ ] If the VC has at least one pending invitation, confirm the **Pending Invitations** section renders below the grid with one card per invitation (inviting space name + optional banner + welcome-message preview).
- [ ] Click **Accept** on a pending invitation → **`ConfirmationDialog`** opens with the welcome message in the dialog body (per FR-173) → Confirm → mutation fires → invitation moves to confirmed memberships on refetch.
- [ ] Click **Decline** on a pending invitation → `ConfirmationDialog` (destructive variant) → Confirm → mutation fires → invitation removed.
- [ ] Confirm **no Home Space dropdown**, **no Auto-redirect checkbox**, **no search / filter strip** (smaller surface than User Membership US3).
- [ ] Empty state: on a VC with zero memberships, the grid renders a muted caption ("This Virtual Contributor isn't a member of any space yet."). When there are no pending invitations the Pending block is hidden entirely.

### User Story 15 — VC Settings

- [ ] Open `/vc/<vcNameId>/settings/settings` as the VC admin. The **Visibility** card is always present.
- [ ] **Visibility radio**: flip between Public / Account / Hidden → control flips optimistically → mutation fires (`updateVirtualContributorSettings`) → change persists after reload. **Hard-failure**: kill the backend connection → flip → control reverts and a toast surfaces the error (parity with FR-064 / FR-133).
- [ ] **Listed in Store** toggle: when `searchVisibility === Public`, the toggle is enabled; for Account or Hidden it is disabled. Flipping fires the same mutation with the same revert-on-failure behavior.
- [ ] **Body of Knowledge card** — for a VC where `bodyOfKnowledgeType ∈ {AlkemioSpace, AlkemioKnowledgeBase}` OR `engine === Guidance`:
  - [ ] Flip the privacy toggle (`knowledgeBaseContentVisible`) → commits immediately.
  - [ ] Click **Refresh Knowledge** → button enters loading state → mutation fires (`refreshBodyOfKnowledge`) → on success the last-updated timestamp updates.
- [ ] **Prompt card** — for a `GenericOpenai` or `LibraFlow` engine VC:
  - [ ] Edit the markdown editor → FieldFooter shows the dirty indicator + Save button.
  - [ ] Click Save → "Saved!" indicator flashes for 1.8s → mutation fires (`updateAiPersona`) → reload → value persisted.
  - [ ] Reload mid-edit (with dirty changes) → typed values are dropped (no global dirty buffer, parity with FR-016).
- [ ] **External Config card** — for a `LibraFlow` / `OpenaiAssistant` / `GenericOpenai` engine VC:
  - [ ] **`apiKey` is always rendered empty** on load, regardless of whether a key is stored on the server.
  - [ ] Enter a new API key → Save → mutation fires with the new key in the payload.
  - [ ] Re-open the page → the `apiKey` input is empty again (the value is never echoed back).
  - [ ] Save without entering an apiKey → the apiKey is omitted from the mutation payload (matches MUI semantics).
  - [ ] When `engine === 'openaiAssistant'`: confirm `assistantId` input is present and required.
  - [ ] Select a different `model` from the dropdown → Save → mutation fires with the new model.
- [ ] **Prompt Graph fallback tile** — for an `Expert` engine VC where the viewer is a platform admin (or `platformSettings.promptGraphEditingEnabled === true`):
  - [ ] A small read-only tile renders with the heading "Prompt Graph editing remains in MUI" + a CTA link.
  - [ ] Click the CTA → navigates to the legacy MUI Settings page (`/vc/<nameId>/settings` with CRD off).
  - [ ] Confirm the actual node/edge editor is NOT rendered in CRD (deferred — Decision #17).
- [ ] **Engine-conditional rendering**: switch between VCs with different engines and confirm only the cards that match the engine are present (Visibility always present; BoK card only when applicable; Prompt only on GenericOpenai/LibraFlow; ExternalConfig only on LibraFlow/OpenaiAssistant/GenericOpenai; Prompt Graph fallback only on Expert with the admin flag).

## Cross-cutting smoke

- [ ] **Tab strip overflow**: shrink browser to `< md` width — User (7-tab), Org (5-tab), and VC (3-tab) strips horizontally scroll; active tab auto-scrolls into view.
- [ ] **Keyboard navigation**: Tab into the tab strip → Left/Right arrows switch tabs → Enter activates. Same for the Org Authorization Admin/Owner sub-tab strip.
- [ ] **Routing**: every URL `/user/<slug>/settings/<tab>`, `/organization/<slug>/settings/<tab>`, and `/vc/<vcNameId>/settings/<tab>` resolves directly to the matching tab (deep-linking parity).
- [ ] **CRD toggle off**: disable the toggle → every URL above resolves to the existing MUI page → no broken links → no console errors. Specifically: `/vc/<vcNameId>/settings/*` falls back to the existing `MuiVCSettingsRoute` (the VC admin shell at `src/domain/community/virtualContributorAdmin/`).
- [ ] **Anonymous viewer**: open any settings URL while signed out → User: redirected to login; Org / VC: redirected to the public profile owned by 096.
- [ ] **Non-editor (logged in but lacking Update privilege)**: open `/vc/<vcNameId>/settings/profile` as a user who is not the VC's host or platform admin → redirected to `/vc/<vcNameId>` (the public profile, FR-013).
- [ ] **i18n**: switch language to nl, es, bg, de, fr → every visible string is localized (no `crd-contributorSettings.foo.bar` literal showing). Includes the new `shell.tabs.vc.*` and `vc.*` keys.
- [ ] **Accessibility**: run axe scan on each of the 15 tabs — zero critical/serious violations.

## Performance & bundle smoke

- [ ] `pnpm analyze` — combined delta of the three new lazy-loaded chunks (`userSettings*.js`, `orgSettings*.js`, `vcSettings*.js`) ≤ +60 KB gzipped over the prior build (SC-007, +10 KB budget for the VC shell).
- [ ] Tab switch < 200ms; per-section save round-trip < 1s perceived (mutation + refetch + "Saved!" flash for 1.8s); avatar / logo upload commit immediate on file-pick.

## Done definition

The feature is "feature complete" when:

1. All 15 smoke checklists pass with the toggle ON.
2. The CRD-OFF smoke passes (no MUI regressions).
3. `pnpm lint` passes with no new warnings.
4. `pnpm vitest run` passes — all unit tests for mappers, predicate hooks (`useCanEditUserSettings`, `useCanEditOrganizationSettings`, `useCanEditVcSettings`), the per-section save state machine (`useUserProfileTabData` / `useOrgProfileTabData` / `useVcProfileTabData` — `idle | saving | saved | error`), push availability, optimistic overrides + hard-failure revert (User Notifications + Org Settings + VC Visibility), engine-conditional sub-section presence (`useVcSettingsTabData`), and the i18n key parity test green.
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
