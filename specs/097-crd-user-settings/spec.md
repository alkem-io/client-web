# Feature Specification: CRD Contributor Settings (User + Organization)

**Feature Branch**: `097-crd-user-settings`
**Created**: 2026-04-30 (rewritten 2026-05-06 to expand scope from User-only to User + Organization)
**Status**: Draft
**Input**: Migrate the **Settings shells for both User and Organization** to the CRD design system (shadcn/ui + Tailwind). VC settings remain in MUI and are explicitly out of scope (deferred to a future spec). The branch name remains `097-crd-user-settings` for git continuity, but the spec scope is **contributor settings** — both User and Organization actors. Sibling spec `096-crd-user-pages` covers the public-profile views that the Settings (gear) icon links into; that spec line 282–283 explicitly defers the Org admin shell to "a future spec" — **this spec is that future spec**, expanded to also cover the User admin shell so both actor verticals migrate in lockstep.

## Clarifications

### Session 2026-05-06

- Q: Empty-state UX for list-bearing tabs (Account sub-sections, Membership, Organizations, Pending Applications, Authorization) — uniform pattern, prototype-faithful, or hide-when-empty? → A: **Per-tab split, prototype-faithful for Account.** The User Account and Org Account tabs port `prototype/src/app/pages/UserAccountPage.tsx`'s per-sub-section empty-state patterns verbatim (Hosted Spaces and Virtual Contributors render a dashed "Create New" card inline at the end of the grid, always present; Template Packs render up to 3 dashed "Empty Slot" placeholders — `Math.max(0, 3 − packs.length)` — each with a `+` icon; Custom Homepages render a centered full empty-state when the list is empty, with an icon + heading + descriptive copy + Create Homepage CTA + a "Capacity: 0/1 Used" indicator). Read-only list tabs (User Membership table, Pending Applications, User Organizations list, Org Authorization Admin / Owner sub-tabs, Org Community current-Associates and available-Users lists) render a single muted caption line when empty — no icon, no CTA. The Org Community add affordance is the search-and-add `+` flow above the list (FR-110), not an empty-state CTA.
- Q: Should remove (×) clicks on Org Community Associates and Org Authorization Admin / Owner sub-tabs require confirmation dialogs (per `src/crd/CLAUDE.md` Rule #9), or commit immediately on click (parity with current MUI)? → A: **Apply Rule #9 across the board.** Every remove × on Org Community current-Associates, Org Authorization Admin sub-tab, and Org Authorization Owner sub-tab MUST render a `ConfirmationDialog` (CRD `AlertDialog` primitive) with `variant="destructive"` and a role-aware confirm label (e.g., *"Remove {{name}} as Associate"* / *"as Admin"* / *"as Owner"*) before the role-set manager mutation fires. Add (+) clicks remain click-immediate (not destructive). User-side Leave dialogs (FR-044, FR-053) keep their existing confirmation flow. This diverges from current MUI's no-dialog Org admin flows on purpose — accidental Owner removal can lock an org out of self-administration, and re-adding via search is much higher friction than confirming the click.
- Q: User-side first tab label — keep `My Profile` (earlier draft) or rename to `Profile` to match the Org-side label and the contributor-vertical norm? → A: **`Profile`** for both User and Org. The User-side first tab is renamed everywhere — User Story 1 narrative and acceptance scenarios, the FR section header for FR-020–FR-026, and every prose reference. Route segment stays `/settings/profile` (already lowercase, no URL change). Downstream rename: contract file `tab-userMyProfile.ts` → `tab-userProfile.ts`; any `userProfile.myProfile.*` i18n keys → `userProfile.profile.*`; corresponding references in plan.md / tasks.md / data-model.md / research.md updated in the same PR. Prose disambiguation between actor verticals uses the `User Profile` / `Org Profile` prefix.
- Q: Per-field save UX on User Profile and Org Profile — pencil/Save/Cancel inline affordance per field (earlier draft) or match the 045 About-tab pattern? → A: **Match 045 About verbatim.** Both Profile tabs use the **per-section explicit-save model** as already implemented in `src/main/crdPages/topLevelPages/spaceSettings/about/` (`useAboutTabData.ts` + `SpaceSettingsAboutView.tsx` + `@/crd/components/common/InlineEditText`). Each editable section uses one `FieldFooter` containing the section's dirty indicator, Save button, and per-render status (`idle | saving | saved | error`). Save commits ONLY that section's patch via one targeted mutation. On success a grayed-out "Saved!" indicator flashes adjacent to the Save button for **1800 ms** (`SAVED_FLASH_MS` in 045's `useAboutTabData.ts`) before returning to idle. On failure the section stays dirty with the user's typed values preserved, plus an inline error message that persists until the admin edits a field in the section again — no auto-retry, no auto-revert. There are NO per-field pencil / check / × icons; the section's Save button is the only commit affordance. NO tab-wide Save bar, NO Reset, NO global dirty buffer; mid-edit values silently drop on tab-switch / nav-away (FR-016). Avatar / logo uploads commit immediately on upload completion (the picker IS the commit). Reference list add / edit / delete operate on the local section buffer until the References-section Save fires (one mutation batch — patch existing + create new + delete pending); **delete opens a `ConfirmationDialog` first** per Rule #9 — the earlier "references are cheap to recreate" exception is removed. Validation: format validators (URL, email, phone) run live and disable the section's Save while invalid; required-field empty checks fire on Save click and surface inline.
- Q: Notifications toggle hard-failure behavior — what happens when a `updateUserSettings` mutation hard-fails (network error, 500) on a Notifications toggle, since FR-064's "optimistic-overrides" only spells out the divergence path? → A: **Match FR-133 verbatim.** On hard failure of any toggle on the User Notifications tab (every row's inApp / email / push switch, plus the Push master toggle), the switch MUST revert to its prior state and an inline toast MUST surface the error message — same rule that already governs Org Settings (FR-133) and Org Notifications. The optimistic-overrides pattern (FR-064) still handles the divergence case where the server returns a different value than the optimistic one (the optimistic override clears after refetch, UI re-renders to authoritative server state). The two rules compose: optimistic on the way out, revert-and-toast on hard failure, refetch-resync on divergence. This makes the failure UX consistent across every settings toggle in the contributor vertical (User Notifications, User Settings communication switch, Org Notifications, Org Settings).

- Q: The four "Create" affordances on the User Account and Org Account tabs (Create Space, Create Virtual Contributor, Create Innovation Pack, Create Custom Homepage) — should they navigate to a separate route, or open a dialog the way the current MUI `ContributorAccountView` does (each button opens an inline MUI dialog / wizard, never navigates)? → A: **Each Create affordance opens a CRD (shadcn) creation dialog — a parity port of the corresponding MUI dialog, mounted by the integration page.** The current MUI `ContributorAccountView` opens four inline dialogs: `CreateSpace` (single-step form → `useSpaceCreation`), the multi-step `useVirtualContributorWizard` (VC type / name / link-or-create space / knowledge base / external AI / community), `CreateInnovationPackDialog` (single-step `InnovationPackForm` → `useCreateInnovationPackMutation`), and `CreateInnovationHubDialog` (single-step `InnovationHubForm` → `useCreateInnovationHubMutation`). There are **no** `/admin/spaces/new` (or similar) routes — the earlier draft's "navigate to existing MUI admin creation flow" language was a research error and is corrected here. CRD ships four new presentational dialogs/wizard under `src/crd/components/contributor/settings/create/` (and a `src/crd/components/contributor/settings/createVc/` sub-tree for the VC wizard's step components), driven by per-flow integration hooks under `src/main/crdPages/topLevelPages/.../account/` that wire the **existing** mutation hooks (`useCreateSpaceMutation` / `useSpaceCreation`, `useCreateVirtualContributorOnAccountMutation` + the wizard's supporting mutations, `useCreateInnovationPackMutation`, `useCreateInnovationHubMutation`) and the existing visual-upload helpers. **The Virtual Contributor flow is a full parity port of the multi-step MUI wizard** — every step (initial profile, add-knowledge content, choose-community, existing-space, external-AI, try-VC) and every supporting mutation is reproduced; the create flow's behavior must not regress. The dialogs are pure CRD (no `@mui/*` / `@emotion/*`, plain-TS props, all behavior via callbacks per `src/crd/CLAUDE.md`); the integration hooks own the Apollo wiring. No new GraphQL types or mutations are introduced — only the existing ones, restyled. The `Manage` kebab action still navigates to the resource's existing settings URL (read off `profile.url`); the `Delete` kebab action keeps its CRD `ConfirmationDialog` + existing delete mutation. This diverges from the prior 097 draft's "no CRD ports of large existing creation dialogs" stance — the dead-route navigation was a user-facing break, so the ports are now in scope for this spec.

## User Scenarios & Testing

The CRD contributor-settings migration delivers two parallel settings shells — one for each actor — sharing the same generalized shell primitive, the same edit-pattern conventions, and the same `useCrdEnabled` localStorage gate as the rest of the CRD migration. The User shell has 7 tabs; the Organization shell has 5 tabs. **All 7 User tabs ship together; all 5 Org tabs ship together.** The two cohorts are gated by the same toggle, so when a user enables CRD they see CRD across the entire contributor vertical (public profiles per 096, settings per this spec) and when they disable it they see MUI across the entire vertical. There is no half-CRD / half-MUI mix.

The priority labels are P1 throughout for traceability with the ship-together constraint — no per-tab differentiation. Each user story is independently testable within its own page.

### User Story 1 - User Profile Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/profile` (the default landing tab of `/user/<self>/settings`) and sees a CRD restyle of the current MUI `UserAdminProfilePage`. The shell consists of a **sticky settings header** containing the user's avatar + display name and a **horizontal tab strip** in this exact order: **Profile, Account, Membership, Organizations, Notifications, Settings, Security** — each entry an icon + uppercase label. The active tab is highlighted with a `border-primary` underline. On viewports below `md` the strip is horizontally scrollable; all seven tabs stay inline (no dropdown / hamburger collapse) and the active tab auto-scrolls into view on mount and on every tab change.

The body of the Profile tab is a two-column layout on `lg+` (form on the left, profile picture preview on the right) and a single column on smaller viewports. The form section is divided into three subsections, each prefaced by a primary-colored icon and a bottom-bordered title. **Field set mirrors the current MUI `UserForm` exactly:**

- **Identity** — **Display Name** (`profile.displayName`, required), **First Name** (`User.firstName`, required), **Last Name** (`User.lastName`, required), **Email** (`User.email`, read-only with a "Contact support to change email" caption — email is managed by the platform identity provider), **Phone** (`User.phone`, validated against the existing phone-format regex).
- **About You** — **Tagline** (`profile.tagline`), **City** (`profile.location.city`), **Country** (`profile.location.country`, single-select from the existing country list), **Bio** (`profile.description`, markdown), **Skills** (`profile.tagsets[name='Skills'].tags`, freeform tag editor), **Keywords** (`profile.tagsets[name='Keywords'].tags`, freeform tag editor). Each named tagset is its own per-section input — there is NO unified "Tags" field. Lookup by `tagset.name` is case-insensitive (parity with the existing `UserProfileView`).
- **Social Links / References** — three **recognized** social references rendered with their brand icon-tile + URL input: **LinkedIn**, **Bluesky** (`bsky`), **GitHub**. Below the three recognized rows, an **arbitrary references** list shows every other `profile.references[]` entry (name + URL + description), with an **Add Another Reference** button to append a new generic row. Reference CRUD reuses the existing reference mutations.

The right column shows a **profile picture preview**: a large circular avatar of the current uploaded image, the user's display name + tagline, a "Change Avatar" button that opens the existing avatar upload + crop flow, and a "Recommended: 400x400px. JPG, PNG or GIF." helper line.

**Save model — per-section explicit save (matches spec 045 About).** The Profile tab uses the same `FieldFooter` + `InlineEditText` / `MarkdownEditor` / `CountryCombobox` / `TagsField` building blocks as 045's `SpaceSettingsAboutView.tsx`:

- Each editable section (Display Name, First Name, Last Name, Phone, Tagline, Location [city + country], Bio, Skills, Keywords, Social Links / References) renders its inputs inline and below them a `FieldFooter` containing a hint, the section's dirty indicator, the Save button, and the per-render status (`idle | saving | saved | error`). There are NO per-field pencil / check / × icons — the section's Save button is the only commit affordance. Skills and Keywords are independent per-section saves — each writes to its own named tagset.
- Clicking the section's Save button fires one targeted mutation that patches ONLY that section's fields. On success the section returns to idle with a transient grayed-out "Saved!" indicator next to the Save button for **1800 ms** (matches `SAVED_FLASH_MS` in 045's `useAboutTabData.ts`). **On failure** the section stays dirty with the user's typed values preserved, and an inline error message persists in the section until the admin edits a field in it again (the next edit clears the error and re-enables Save). There is no auto-retry and no auto-revert.
- The Save button exposes `aria-busy="true"` while the mutation is pending and is disabled while saving (parity with 045).
- **Validation**: format validators (URL, email, phone) run live and disable the section's Save button while any field in the section is format-invalid; required-field empty checks (Display Name / First Name / Last Name) fire on Save click and surface inline below the offending input — the section stays dirty and no mutation fires.
- **Social Links / References** (one list-managed section): adding a reference appends an unsaved (temp-ID) row to the local section buffer; editing patches in the buffer; deleting opens a `ConfirmationDialog` (CRD `AlertDialog`, `variant="destructive"`) and only the dialog's Confirm queues the row for deletion. The actual mutation batch (patch existing + create new + delete pending) fires on the section's Save button — there is no per-row Save and no immediate per-row delete. Per `src/crd/CLAUDE.md` Rule #9.
- **Avatar uploads** commit IMMEDIATELY on upload completion (the file picker IS the commit) — no separate Save click and no debounce, same pattern as 045 About's branding visuals.

Because there is no tab-wide dirty buffer, **switching tabs never blocks the navigation**. If the user navigates away while any section has dirty pending edits, those edits are **silently dropped** — no mutation fires, no confirmation dialog appears.

**Access**: only the profile owner OR a platform admin can open `/user/<slug>/settings/profile`. Non-owner non-admin viewers are redirected to the public profile page (`/user/<slug>`). Both authorized viewer types see the same fully editable form — there is no separate read-only mode.

**Independent Test**: Open `/user/<self>/settings/profile`. Edit First Name — the section's `FieldFooter` shows a dirty indicator and the Save button enables; click the section's Save — the change persists, "Saved!" flashes for ~1.8 s next to the Save button (verify via reload). Repeat with Tagline. Start editing Bio and click another tab — the dirty edit is silently abandoned and tab navigation completes with no dialog. Add a new LinkedIn reference via Add Another Reference (row appears as unsaved in the References section); click the References-section Save — the create-reference mutation fires and the reference appears on the public profile page after reload. Click trash on an existing reference — confirmation dialog appears; Confirm queues the row for deletion (still local); click the section's Save — the delete mutation batches and the reference disappears. Upload a new avatar — preview updates immediately on upload completion without a Save click.

**Acceptance Scenarios**:

1. **Given** the owner opens `/user/<self>/settings/profile`, **When** the page renders, **Then** the sticky header with all 7 tabs is shown, the Profile tab is active, and the form sections (Identity / About You / Social Links) plus the right-column profile picture preview are visible. There is no tab-wide Save Changes or Discard Changes button anywhere on the tab.
2. **Given** the owner edits any field within a section, **When** the value differs from the server-saved value, **Then** the section's `FieldFooter` shows a dirty indicator and the Save button enables; there are NO per-field pencil / check / × icons.
3. **Given** a section has dirty edits, **When** the owner clicks the section's Save button, **Then** one targeted mutation fires patching ONLY that section's fields, the section returns to idle on success with a transient "Saved!" indicator adjacent to the Save button for ~1800 ms, and the new values persist on reload.
4. **Given** a section's per-section save fails, **When** the response returns an error, **Then** the section stays dirty with the user's typed values preserved, an inline error message appears in the section, and the error persists until the admin edits any field in the section again (which clears the error and re-enables Save). The admin retries by clicking the section's Save again; there is no auto-retry.
5. **Given** the owner adds a new social reference via Add Another Reference, **When** they click the References-section Save, **Then** the mutation batch fires (creating the new reference); the reference appears on the public profile page after reload. **Given** the owner clicks trash on an existing saved reference, **Then** a `ConfirmationDialog` (destructive variant) opens; Confirm queues the row for deletion in the section buffer; the actual delete fires only when the section's Save is clicked.
6. **Given** the owner is mid-edit on any field, **When** they click another tab in the strip, **Then** the navigation completes immediately, the in-progress edit is silently dropped, and no confirmation dialog appears.
7. **Given** a platform admin opens `/user/<otherUser>/settings/profile`, **When** the page renders, **Then** the form is fully editable; per-field saves persist against the target user's id.
8. **Given** a non-owner non-admin viewer opens `/user/<otherUser>/settings/profile`, **When** the route resolves, **Then** the app redirects to `/user/<otherUser>` (public profile) — the settings tab never renders.

---

### User Story 2 - User Account Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/account` and sees a CRD restyle of the current MUI `UserAdminAccountPage`. The Account tab is a **parity-only restyle** — every field, action, and permission is preserved exactly as today; no new affordances or backend capabilities are introduced. The four "Create" affordances open CRD (shadcn) creation dialogs that are parity ports of the current MUI dialogs — they do **not** navigate to a separate route (matching the current MUI `ContributorAccountView`, whose four "Create" buttons each open an inline dialog / wizard).

The body is a single 12-column section divided into four card groups, each with the prototype's icon + heading treatment:

- **Hosted Spaces** — list of L0 spaces this user hosts, rendered as horizontal cards with avatar, name, description, and a kebab menu offering the existing actions (View, Manage, etc.). The "Create New Space" affordance opens the CRD `CrdCreateSpaceDialog` (parity port of MUI `CreateSpace` → `useSpaceCreation`).
- **Virtual Contributors** — list of VCs the user owns, with a "Create Virtual Contributor" affordance that opens the CRD `CrdCreateVirtualContributorWizard` — a full parity port of the multi-step MUI `useVirtualContributorWizard` (initial-profile → add-knowledge content / use-existing-space / external-AI → choose-community → try-VC), reproducing every step and every supporting mutation.
- **Innovation Packs** — the user's owned innovation packs; the "Create Innovation Pack" affordance opens the CRD `CrdCreateInnovationPackDialog` (parity port of MUI `CreateInnovationPackDialog` → `useCreateInnovationPackMutation`).
- **Custom Homepages** (Innovation Hubs) — the user's owned innovation hubs; the "Create Homepage" affordance opens the CRD `CrdCreateInnovationHubDialog` (parity port of MUI `CreateInnovationHubDialog` → `useCreateInnovationHubMutation`).

A **Help text** info-banner sits at the top reading: "Here you can view your active resources and manage your account allocation limits."

All capabilities — create / edit / delete / transfer-ownership — are preserved. **Create** opens the corresponding CRD creation dialog (FR-034) — a parity port of the MUI dialog that calls the same existing mutation. **Manage** navigates to the resource's existing settings URL (read off the resource's `profile.url`). **Delete** opens a CRD `ConfirmationDialog` (Rule #9) and on confirm fires the existing delete mutation. The CRD Account view itself stays presentational (no `@mui/*` imports, no GraphQL types, all behavior via callback props); the integration page mounts the CRD creation dialogs and owns their Apollo wiring.

**Access**: owner or platform admin only. Non-owner non-admin viewers are redirected to the public profile.

**Independent Test**: Open `/user/<self>/settings/account`. Confirm the four card groups render with the user's hosted spaces / VCs / packs / hubs. Click "Create New Space" — the CRD `CrdCreateSpaceDialog` opens; complete it and the new space appears in the Hosted Spaces grid (and is reachable). Click "Create Virtual Contributor" — the CRD VC wizard opens at its first step. Click a hosted space's kebab → Manage — the app navigates to that space's settings URL. Click a resource's kebab → Delete — the CRD `ConfirmationDialog` opens; Confirm fires the existing delete mutation and the card disappears.

**Acceptance Scenarios**:

1. **Given** the owner opens the Account tab, **When** the page renders, **Then** the Help banner and the four card groups (Hosted Spaces, Virtual Contributors, Innovation Packs, Custom Homepages) are visible with the user's existing resources.
2. **Given** the owner clicks Create Space / Create Virtual Contributor / Create Innovation Pack / Create Homepage, **When** they click, **Then** the corresponding CRD creation dialog (or, for VC, the CRD wizard at its first step) opens — never a route navigation; submitting it fires the same existing mutation the MUI dialog fires and refetches the same queries (the resource appears in its card group on success).
3. **Given** the owner clicks a resource's kebab and picks **Manage**, **When** they pick it, **Then** the app navigates to that resource's existing settings URL. **Given** they pick **Delete**, **When** they confirm the CRD `ConfirmationDialog`, **Then** the existing delete mutation runs and the card is removed.
4. **Given** a platform admin opens `/user/<otherUser>/settings/account`, **When** the page renders, **Then** every action is fully enabled and operates on the target user's account.
5. **Given** the owner opens a CRD creation dialog and cancels (or the create mutation fails), **When** that happens, **Then** the dialog closes (cancel) or stays open with an inline error toast (failure) — no card is added; no navigation occurs.

---

### User Story 3 - User Membership Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/membership` and sees a CRD restyle of the current MUI `UserAdminMembershipPage`. Sections (parity with the current MUI page):

- **Home Space** card — a single-select dropdown of every L0 space the user is a member of, plus an **Auto-redirect to home space on login** checkbox. Selecting a Home Space fires `updateUserSettings` immediately. The Auto-redirect checkbox is disabled until a Home Space is selected; when disabled, a caption explains why ("Select a home space to enable auto-redirect"). A spinner replaces the checkbox while the mutation is in flight.
- **My Memberships** card grid — a responsive `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (matches `prototype/src/app/pages/UserMembershipPage.tsx`) of every space and subspace the user is a member of. Each card has: aspect-video banner image (cardBanner from `useSpaceContributionDetailsQuery`; deterministic gradient fallback when absent), Type badge (`Space` / `Subspace`) bottom-left of the banner, kebab menu top-right with **two items only** (no Options label, no separator) — **View Space** / **View Subspace** (navigates to `space.profile.url`) and **Leave Space** / **Leave Subspace** (destructive — opens `ConfirmationDialog` per Rule #9). Card body: title + role badge (Admin / Lead / Member, primary tint), tagline as `line-clamp-2` description. Card footer (when the space has community leads): "Led by:" caption + overlapping avatar stack rendered via the **shared** `@/crd/components/common/StackedPersonAvatars` primitive (also consumed by `CalloutPoll` for poll-voter rows; both sites pass their own pre-localized labels), styled with a darker `bg-muted/30 border-t` band. Above the grid: search input + segmented filter (`All / Spaces / Subspaces` — type-axis only; status filter rejected as not in the prototype) + "Showing X of Y memberships" caption. Filtered-empty state is a centered dashed-border block with a "Clear Filters" CTA (matches prototype). Untouched-empty state per FR-018: single muted caption.
- **Pending Applications** compact list (separate section below My Memberships) — community applications the user has submitted that are still pending. Each row is a small horizontal card with the space display name + a "Pending" status badge. **No actions** (read-only).

All mutations fire immediately on action confirmation; there is no Save / Reset bar on this tab.

**Access**: owner or platform admin only.

**Independent Test**: Open `/user/<self>/settings/membership`. Pick a Home Space — the dropdown updates, mutation fires. Tick Auto-redirect — checkbox commits. Search "Garden" in the memberships grid — the cards filter client-side. Open a card's kebab → Leave Space — confirmation dialog appears; confirm — the card is removed from the grid. Confirm the Pending Applications list renders below with no kebab menu. With the search filter cleared, every card shows its banner image (or deterministic gradient fallback), tagline, role badge, and "Led by:" footer with avatars.

**Acceptance Scenarios**:

1. **Given** the owner opens the Membership tab, **When** the page renders, **Then** the Home Space card, the My Memberships card grid, and the Pending Applications list are all visible.
2. **Given** the owner picks a Home Space from the dropdown, **When** they pick, **Then** the mutation fires immediately and a spinner is shown until it completes.
3. **Given** a Home Space is selected, **When** the owner ticks Auto-redirect, **Then** the change persists.
4. **Given** no Home Space is selected, **When** the owner inspects Auto-redirect, **Then** the checkbox is disabled and a caption explains why.
5. **Given** the owner types in the search input, **When** they type, **Then** the visible memberships filter client-side by name; pagination state is reset to page 1.
6. **Given** the owner clicks Leave on a membership row, **When** they confirm the dialog, **Then** the leave-community mutation fires and the row disappears.
7. **Given** the user has pending applications, **When** the page renders, **Then** the Pending Applications table lists them as read-only rows (no kebab).

---

### User Story 4 - User Organizations Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/organizations` and sees a CRD restyle of the current MUI `UserAdminOrganizationsPage`. The body shows a table / grid of organizations the user is associated with, with these visible attributes per row: organization avatar, name, description, location, role (Admin / Associate), associates count, verified badge, website link.

Above the list: a **search** input filtering organizations by name client-side, and — when the current user has the `CreateOrganization` platform privilege — a **Create Organization** button that opens the existing organization creation dialog. Each row's kebab menu offers a **Leave** action preceded by a confirmation dialog. Clicking the organization name navigates to its profile page.

**Access**: owner or platform admin only.

**Independent Test**: Open `/user/<self>/settings/organizations`. Confirm associated organizations render. Search "Alkemio" — list filters client-side. Click Create Organization (if privileged) — the existing creation flow runs. Open a row's kebab → Leave — confirmation dialog appears; confirm — the organization is removed from the list.

**Acceptance Scenarios**:

1. **Given** the owner opens the Organizations tab, **When** the page renders, **Then** the user's associated organizations are listed with avatar / name / location / role / associates / verified badge.
2. **Given** the owner has the `CreateOrganization` privilege, **When** the page renders, **Then** the Create Organization button is visible.
3. **Given** the owner does not have the `CreateOrganization` privilege, **When** the page renders, **Then** the Create Organization button is hidden.
4. **Given** the owner types in the search input, **When** they type, **Then** the visible organizations filter client-side by name.
5. **Given** the owner clicks Leave on a row, **When** they confirm the dialog, **Then** the existing leave-organization mutation fires and the row disappears.
6. **Given** the owner clicks the organization name, **When** they click, **Then** the app navigates to that organization's profile.

---

### User Story 5 - User Notifications Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/notifications` and sees a CRD restyle of the current MUI `UserAdminNotificationsPage`. **Every notification group, property, and channel the current MUI page exposes is preserved** — no notification rule is added or removed. The CRD restyle's only changes are visual: the existing settings tables are replaced with CRD cards using `Switch` primitives.

Sections (parity with the current MUI):

- **Push Notifications master toggle** — a single `Switch` to subscribe / unsubscribe via the existing push-notification context. When push is unavailable (browser unsupported, requires PWA mode, or private browsing) the section renders an info banner instead of the toggle. Below the master toggle, the **Push Subscriptions List** card shows the user's currently registered push subscriptions.
- **Space Notifications** card — every property the current MUI exposes, each as a row with three `Switch`es (inApp, email, push). Push column is hidden / disabled when push is unavailable.
- **Space Admin Notifications** card — visible only when the current user has `ReceiveNotificationsSpaceAdmin` or `ReceiveNotificationsSpaceLead` privilege, or is a Platform Admin.
- **User Notifications** card — `commentReply`, `mentioned`, `messageReceived`, `membership.spaceCommunityInvitationReceived`, `membership.spaceCommunityJoined`.
- **Platform Notifications** card — `forumDiscussionComment`, `forumDiscussionCreated`.
- **Platform Admin Notifications** card — visible only when the current user is a Platform Admin.
- **Organization Notifications** card — visible only when the current user has `ReceiveNotificationsOrganizationAdmin` or is a Platform Admin.
- **Virtual Contributor Notifications** card.

Every toggle commits its change via `updateUserSettings` immediately, with the same **optimistic-overrides** pattern the current MUI uses (the UI flips immediately, then resyncs from the refetch). There is no Save / Reset bar.

**Access**: owner or platform admin only.

**Independent Test**: Open `/user/<self>/settings/notifications`. Flip an email toggle — the UI updates immediately and persists after reload. Flip the push master toggle — the browser permission prompt fires. Confirm Space Admin / Platform Admin / Organization sections appear only with the appropriate privileges.

**Acceptance Scenarios**:

1. **Given** the owner opens the Notifications tab, **When** the page renders, **Then** all notification cards visible to that user's privilege set are shown with one row per property and three `Switch` columns (inApp, email, push).
2. **Given** the owner flips any switch, **When** they flip it, **Then** the UI updates optimistically, the mutation fires, and the value persists after reload.
3. **Given** the owner flips the push master toggle to ON, **When** they confirm browser permission, **Then** the subscribe call runs and the subscription appears in the Push Subscriptions List.
4. **Given** push is unavailable, **When** the page renders, **Then** the master toggle is replaced by an info banner and every push column is hidden across every card.

---

### User Story 6 - User Settings Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/settings` and sees a CRD restyle of the current MUI `UserAdminSettingsPage`. The page renders two cards (parity with current MUI):

- **Communication & Privacy** — a `Switch` for "Allow other users to send me messages" (binds to `settings.communication.allowOtherUsersToSendMessages`).
- **Design System** — the `alkemio-crd-enabled` localStorage toggle. When flipped, the value is written / removed and the page reloads. A short caption explains "Switch between the new (CRD) and the previous (MUI) design system. The page will reload after the change."

Each toggle commits its change immediately. There is no Save / Reset bar.

**Access**: owner or platform admin only. Note: the Design System switch is **always tied to the viewer's own browser localStorage**, so even a platform admin viewing another user's settings sees their **own** CRD/MUI toggle state, not the target user's preference.

**Independent Test**: Open `/user/<self>/settings/settings`. Flip the messages-from-others switch — the change persists after reload. Flip the Design System switch off — the page reloads in MUI mode. Flip it on again from the equivalent MUI page — the page reloads back into CRD mode.

**Acceptance Scenarios**:

1. **Given** the owner opens the Settings tab, **When** the page renders, **Then** the Communication & Privacy and Design System cards are visible with their current values.
2. **Given** the owner flips the messages switch, **When** they flip, **Then** the mutation fires immediately with the new value.
3. **Given** the owner flips the Design System switch off, **When** they flip, **Then** the localStorage entry is removed and the page reloads into MUI.
4. **Given** the owner flips the Design System switch on (from MUI), **When** they flip, **Then** the localStorage entry is set to `'true'` and the page reloads into CRD.

---

### User Story 7 - User Security Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/security` and sees a CRD restyle of the current MUI `UserSecuritySettingsPage`. CRD ships a Security tab to maintain feature parity with the existing MUI page; passkey / WebAuthn management is a current capability that must not regress in the CRD release.

The page renders the existing identity-provider settings flow exactly as the current MUI does, with the same field-removal filter that hides password change, profile fields, and OIDC link / unlink (those are managed elsewhere). Only WebAuthn / Passkey nodes are surfaced. When the flow contains no WebAuthn nodes, an info alert reads "WebAuthn / Passkey is not enabled on this account". On flow load error, the existing error display is shown.

The page styling adopts the CRD card / heading treatment used by the other settings tabs but the identity-provider UI markup itself is unchanged — Kratos renders its own form fields, and CRD does not restyle them in this iteration.

**Access**: profile owner only. Even a platform admin viewing another user's settings does **not** see this tab — the identity provider can only mutate the currently-authenticated identity, so a passkey form for "another user" is technically meaningless. When a platform admin is editing another user's profile, the tab strip omits Security and the route `/user/<other>/settings/security` redirects to `/user/<other>/settings/profile`.

**Independent Test**: Open `/user/<self>/settings/security`. Confirm the passkey form renders. Add a passkey via the existing flow. As a platform admin, open `/user/<otherUser>/settings/security` — the route redirects to `/user/<otherUser>/settings/profile`.

**Acceptance Scenarios**:

1. **Given** the owner opens the Security tab, **When** the page renders, **Then** the identity-provider settings flow loads and only WebAuthn / Passkey controls are surfaced.
2. **Given** the flow contains no WebAuthn nodes, **When** the page renders, **Then** an info alert reads "WebAuthn / Passkey is not enabled on this account".
3. **Given** the flow fails to load, **When** the error is caught, **Then** the existing error display is shown.
4. **Given** any viewer who is not the profile owner (including a platform admin), **When** the tab strip renders, **Then** the Security tab is hidden; visiting `/user/<other>/settings/security` directly redirects to `/user/<other>/settings/profile`.

---

### User Story 8 - Organization Profile Tab (Priority: P1)

An organization admin opens `/organization/<orgSlug>/settings/profile` (the default landing tab of `/organization/<orgSlug>/settings`) and sees a CRD restyle of the current MUI `OrganizationAdminProfilePage` (which today renders `OrganizationForm` in edit mode). The shell consists of a **sticky settings header** containing the org's avatar/logo + display name and a **horizontal tab strip** in this exact order: **Profile, Account, Community, Authorization, Settings** — each entry an icon + uppercase label. Same responsive horizontal-scroll behavior as the User strip.

The body is the same two-column layout as User Profile (form on the left, avatar/logo preview on the right). The form is divided into four subsections, each with the icon + bottom-bordered title treatment. **Field set mirrors the current MUI `OrganizationForm` exactly:**

- **Identity** — **Display Name** (`profile.displayName`, required), **Name ID** (`nameID`, read-only after creation — the URL slug), **Tagline** (`profile.tagline`).
- **About** — **Description** (`profile.description`, markdown), **City** (`profile.location.city`), **Country** (`profile.location.country`, single-select), **Keywords** (`profile.tagsets[name='Keywords'].tags`, freeform tag editor), **Capabilities** (`profile.tagsets[name='Capabilities'].tags`, freeform tag editor). Each named tagset is its own per-section input — there is NO unified "Tags" field on Org Profile. Lookup by `tagset.name` is case-insensitive (parity with `useOrganization.ts`).
- **Contact & Legal** — **Contact Email** (`contactEmail`, validated email), **Domain** (`domain`, optional), **Legal Entity Name** (`legalEntityName`, optional), **Website** (`website`, validated URL).
- **Social Links / References** — three recognized social references (LinkedIn, Bluesky, GitHub) + arbitrary references list with **Add Another Reference** button — same shape as User Profile.

The right column shows the org's avatar/logo with a "Change Avatar" file picker that opens the CRD `ImageCropDialog` (parity with User — see FR-024 / FR-093).

A **Verified** badge displays the current `verification.status` value (Verified / Not Verified / Pending) as a read-only indicator. The badge cannot be changed from this tab — verification status is managed by platform admins via a separate platform-admin flow (out of scope here). When the org is verified, the badge renders with a check-mark; otherwise it renders muted.

**Save model — per-section explicit save**, identical to User Profile (matches spec 045 About). Each editable section uses one `FieldFooter` containing the section's dirty indicator, Save button, and status (`idle | saving | saved | error`); there are NO per-field pencil / check / × icons. Display Name + Description are required (Save click with empty input surfaces inline error, no mutation fires). Domain, Legal Entity Name, Contact Email, Website are optional; format-validated fields (Contact Email, Website URL, Domain) run live-validation and disable the section's Save button while the input is format-invalid. Per-section save failures keep the section dirty with an inline error that persists until the admin edits a field in it again — no auto-retry, no auto-revert. "Saved!" flashes for 1800 ms after success. There is **no** tab-wide Save / Discard bar — a deliberate UX divergence from MUI's Formik-with-single-Save (`OrganizationForm`), chosen for consistency with User Profile and the rest of the contributor settings vertical.

**Access**: visible only to viewers with `Update` privilege on the organization (existing predicate). Other viewers are redirected to `/organization/<orgSlug>` (public profile).

**Independent Test**: Open `/organization/<orgSlug>/settings/profile` as an org admin. Confirm the sticky header with all 5 tabs is shown. Hover Display Name — pencil appears. Edit it, click Save — change persists. Edit Description, switch tabs mid-edit — change is silently dropped. Upload a new logo — preview updates without a Save click. As a non-admin, hit the URL — redirect to `/organization/<orgSlug>`.

**Acceptance Scenarios**:

1. **Given** an org admin opens `/organization/<orgSlug>/settings/profile`, **When** the page renders, **Then** the sticky header with all 5 tabs is shown, the Profile tab is active, and the four sections (Identity / About / Contact & Legal / Social Links) plus the avatar preview column are visible.
2. **Given** an org admin edits any per-field control and clicks Save, **When** the request completes successfully, **Then** the field returns to idle with a transient "Saved" indicator and the new value persists on reload.
3. **Given** an org admin edits Domain to an invalid value (e.g., empty string when value was previously set, or a value failing client-side validation), **When** they click Save, **Then** the inline error displays beneath the input and no mutation fires.
4. **Given** an org admin uploads a new logo, **When** the upload completes, **Then** the avatar updates immediately without a Save click.
5. **Given** the org has `verification.status === VerifiedManualAttestation`, **When** the Profile tab renders, **Then** a Verified badge is shown read-only; clicking the badge does nothing (no edit affordance).
6. **Given** a viewer without `Update` privilege opens `/organization/<orgSlug>/settings/profile`, **When** the route resolves, **Then** the app redirects to `/organization/<orgSlug>` (public profile) — the settings shell never renders.

---

### User Story 9 - Organization Account Tab (Priority: P1)

An organization admin opens `/organization/<orgSlug>/settings/account` and sees a CRD restyle of the current MUI `OrganizationAdminAccountPage`. **Same shape as User Account** (User Story 2): four card groups — Hosted Spaces, Virtual Contributors, Innovation Packs, Custom Homepages — sourced from the org's account. The four "Create" affordances open the **same** CRD creation dialogs as User Account (FR-034) — `CrdCreateSpaceDialog`, `CrdCreateVirtualContributorWizard`, `CrdCreateInnovationPackDialog`, `CrdCreateInnovationHubDialog` — mounted by the Org Account integration page with the org's `account.id` as the target. **Manage** navigates to the resource's existing settings URL; **Delete** uses the CRD `ConfirmationDialog` + existing delete mutation.

The CRD shell uses a **shared** `ContributorAccountView`-equivalent presentational component consumed by both User Account and Organization Account. Per-actor mappers feed the same view with the actor-specific account data hooks, and both integration pages mount the same four CRD creation dialogs.

**Access**: viewers with `Update` privilege on the org.

**Independent Test**: Open `/organization/<orgSlug>/settings/account` as an org admin. Confirm the four card groups render with the org's resources. Click Create Innovation Pack — the CRD `CrdCreateInnovationPackDialog` opens; submit it and the new pack appears in the Innovation Packs group. Click Create Virtual Contributor — the CRD VC wizard opens at its first step.

**Acceptance Scenarios**:

1. **Given** an org admin opens the Account tab, **When** the page renders, **Then** the four card groups are visible with the org's existing resources.
2. **Given** the org admin clicks any Create affordance (Space / VC / Innovation Pack / Homepage), **When** they click, **Then** the corresponding CRD creation dialog (or the CRD VC wizard at its first step) opens — never a route navigation — and submitting it fires the same existing mutation against the org's `account.id`.
3. **Given** the org admin clicks a resource's kebab and picks **Manage**, **When** they pick it, **Then** the app navigates to that resource's existing settings URL; **Given** they pick **Delete** and confirm the CRD `ConfirmationDialog`, **Then** the existing delete mutation runs and the card is removed.

---

### User Story 10 - Organization Community (Associates) Tab (Priority: P1)

An organization admin opens `/organization/<orgSlug>/settings/community` and sees a CRD restyle of the current MUI `OrganizationAdminCommunityPage` (which renders `OrganizationAssociatesView`). The page lists the organization's members in the **Associate** role with the same affordances as today: a search input (filters by name), a current-associates list with a remove (×) action per row, and an available-users list with an add (+) action per row. Pagination on the available-users list is preserved (load-more or infinite scroll, parity with current MUI).

All add / remove actions commit immediately on click via the existing role-set manager (no Save bar). On error, the row keeps its prior state and an inline toast surfaces the error message.

**Access**: viewers with `Update` privilege on the org.

**Independent Test**: Open `/organization/<orgSlug>/settings/community` as an org admin. Search "Maria" — available users filter. Click + on a user — they move to the associates list (mutation fires immediately, no dialog). Click × on an existing associate — confirmation dialog appears with the destructive variant; click Confirm — they're removed.

**Acceptance Scenarios**:

1. **Given** an org admin opens the Community tab, **When** the page renders, **Then** the current-associates list and the available-users list are visible with the org's data.
2. **Given** an org admin types in the search input, **When** they type, **Then** the available-users list filters by name.
3. **Given** an org admin clicks + on an available user, **When** they click, **Then** the assign-role mutation fires immediately and the user moves from the available list to the associates list.
4. **Given** an org admin clicks × on an associate, **When** they click, **Then** a `ConfirmationDialog` (destructive variant) opens with the label *"Remove {{name}} as Associate"*; clicking Confirm fires the remove-role mutation and the user is removed from the associates list. Clicking Cancel dismisses the dialog and the row stays unchanged.
5. **Given** the available-users list has more results than the current page, **When** the user scrolls / clicks load-more, **Then** the next page is fetched.

---

### User Story 11 - Organization Authorization Tab (Priority: P1)

An organization admin opens `/organization/<orgSlug>/settings/authorization` and sees a CRD restyle of the current MUI `OrganizationAdminAuthorizationPage`. The page exposes two sub-tabs (`Admin` and `Owner`) inside the Authorization tab body, each rendering a role-assignment view identical in shape to the Community tab (current-members + available-users with add/remove). The active sub-tab is local React state (parity with current MUI).

All add / remove actions commit immediately on click. The same role-set manager backs all three role assignments (Associate on Community, Admin / Owner on Authorization).

**Access**: viewers with `Update` privilege on the org.

**Independent Test**: Open `/organization/<orgSlug>/settings/authorization` as an org admin. Confirm two sub-tabs (Admin, Owner). On the Admin sub-tab, click + on an available user — they move to the Admin list (no dialog). Switch to Owner sub-tab — see the org's Owner list. Click × on an Owner — confirmation dialog appears with the destructive variant; click Confirm — they're removed from the Owner role.

**Acceptance Scenarios**:

1. **Given** an org admin opens the Authorization tab, **When** the page renders, **Then** two sub-tabs (Admin, Owner) are visible, with Admin selected by default and the Admin role-assignment view rendered.
2. **Given** an org admin clicks the Owner sub-tab, **When** they click, **Then** the body switches to the Owner role-assignment view (no URL change — local state only).
3. **Given** an org admin clicks + on an available user in the Admin sub-tab, **When** they click, **Then** the assign-role mutation fires and the user moves to the Admin list.
4. **Given** an org admin clicks × on an existing Owner, **When** they click, **Then** a `ConfirmationDialog` (destructive variant) opens with the label *"Remove {{name}} as Owner"*; clicking Confirm fires the remove-role mutation and the user is removed from the Owner list. Clicking Cancel dismisses the dialog and the Owner list stays unchanged.

---

### User Story 12 - Organization Settings Tab (Priority: P1)

An organization admin opens `/organization/<orgSlug>/settings/settings` and sees a CRD restyle of the current MUI `OrganizationAdminSettingsPage` (which renders `OrganizationAdminSettingsView`). The page renders two switches inside a single card with the prototype's icon + heading treatment:

- **Allow users matching domain to join** (`settings.membership.allowUsersMatchingDomainToJoin`) — when enabled, users whose email matches the org's `domain` field can join the organization automatically without admin approval.
- **Contribution roles publicly visible** (`settings.privacy.contributionRolesPubliclyVisible`) — when enabled, the org's role assignments are visible on public profile pages.

Each toggle commits its change via `updateOrganizationSettings` immediately. There is no Save / Reset bar. **There is no Design System toggle on the Org Settings tab** — that toggle is User-only because it is a viewer-scoped browser preference, not an org attribute.

**Access**: viewers with `Update` privilege on the org.

**Independent Test**: Open `/organization/<orgSlug>/settings/settings` as an org admin. Flip the domain-membership toggle — change persists after reload. Flip the contribution-roles toggle — change persists.

**Acceptance Scenarios**:

1. **Given** an org admin opens the Settings tab, **When** the page renders, **Then** the two switches are visible with their current values.
2. **Given** an org admin flips either switch, **When** they flip, **Then** `updateOrganizationSettings` fires immediately with the new value.
3. **Given** the mutation fails, **When** the response returns an error, **Then** the switch reverts to its prior state and an inline toast surfaces the error.

---

### Edge Cases

- **Unauthenticated viewer hits a User settings URL**: every user settings route is wrapped by the existing `NoIdentityRedirect`, which redirects to login. Once authenticated, the user lands back on the requested settings tab if they are the owner or platform admin, and on the public profile otherwise.
- **Unauthenticated viewer hits an Org settings URL**: the existing org admin route wrapping handles redirect to login. Once authenticated, viewers without `Update` privilege are redirected to `/organization/<orgSlug>` (public profile).
- **Signed-in non-owner non-admin hits a User settings URL**: the route guard redirects them to `/user/<slug>` (public profile, owned by sibling spec 096). No flash of disabled form, no error page.
- **Signed-in viewer without `Update` hits an Org settings URL**: the route guard redirects them to `/organization/<orgSlug>` (public profile, owned by sibling spec 096).
- **CRD toggled off mid-session**: the User Settings tab's Design System switch reloads the page. Both User and Org settings revert to MUI on the next render. URL stays the same; routing matches the MUI handler.
- **User Profile / Org Profile mid-edit + tab switch**: there is no tab-wide dirty buffer. When the user is mid-edit on a single field and navigates away (tab click, link click, browser back), the in-progress value is silently dropped — no confirmation dialog appears.
- **Avatar / logo upload failure**: the existing upload error flow surfaces a toast with the error message; the preview reverts to the previous avatar.
- **Account-tab Create dialog — cancel**: closing the CRD creation dialog (Cancel / Escape / backdrop) fires no mutation and leaves the card group unchanged; no navigation occurs.
- **Account-tab Create dialog — mutation hard-failure**: the dialog stays open with the user's input preserved, an inline error toast surfaces the error message, and the submit button re-enables for retry; no card is added and no navigation occurs.
- **Account-tab Create — VC wizard mid-flow abandon**: closing the CRD VC wizard before the create mutation has fired leaves nothing created. If the wizard is closed *after* the VC create mutation succeeded but before community assignment, the VC exists (as in MUI) and appears in the Virtual Contributors group; the wizard does not roll back partially-completed steps.
- **Per-section save failure (User Profile or Org Profile)**: the section stays in dirty state with the user's typed values preserved, and an inline error message appears in the section. The error persists until the admin edits any field in the section again (which clears the error and re-enables Save). The admin retries by clicking the section's Save again; there is no auto-retry. To discard the section's pending edits, the admin tab-switches or navigates away (FR-016).
- **Reference (social link) URL validation**: malformed URLs surface an inline error on the URL input; the per-row Save button is disabled while the URL is invalid.
- **Notifications: push permission denied**: the master toggle reverts to OFF; an inline alert reads "Browser blocked push permission. Update your browser settings to enable."
- **Notifications: server returns updated state different from optimistic value**: the optimistic override is cleared after the refetch and the UI re-renders to the authoritative server value.
- **Notifications: mutation hard-failure (network error / 5xx)**: the switch reverts to its prior state and an inline toast surfaces the error message (FR-064 — parity with FR-133 / Org Settings). The user retries by re-flipping the switch.
- **Viewing your own settings via the `/me` shorthand**: `/user/me/settings/...` resolves through the existing user-me route to `/user/<self>/settings/...`. There is no analogous shorthand for organizations — orgs always use the slug.
- **Long lists**: My Memberships, Organizations, the Notifications matrix, the Authorization sub-tabs, and the Community Associates list scroll within their own card body without breaking the sticky tab strip.
- **Authorization at the User settings shell**: the canonical predicate is `canEditUserSettings = currentUser.id === profileUser.id || currentUserHasPlatformAdminPrivilege`. The shell evaluates this once at route-resolution and either renders fully editable settings or redirects the viewer to `/user/<slug>` (public profile). No read-only fallback. The Security tab is owner-only regardless of admin status.
- **Authorization at the Org settings shell**: the canonical predicate is `canEditOrganizationSettings = organization.authorization.myPrivileges.includes(AuthorizationPrivilege.Update)`. Same render-or-redirect pattern as User. No read-only fallback.
- **Verified-status badge on Org Profile**: the badge is read-only on the Profile tab. Mutating verification status happens via a separate platform-admin flow (out of scope for this spec).

## Requirements

### Functional Requirements

#### Migration scope and routing

- **FR-001**: System MUST render all 7 **User Settings** tabs (`/user/:userSlug/settings/{profile,account,membership,organizations,notifications,settings,security}`) in CRD when `localStorage('alkemio-crd-enabled')` is `'true'`.
- **FR-002**: System MUST render all 5 **Organization Settings** tabs (`/organization/:orgSlug/settings/{profile,account,community,authorization,settings}`) in CRD when `localStorage('alkemio-crd-enabled')` is `'true'`.
- **FR-003**: System MUST render the existing MUI `UserAdminRoute` and `OrganizationAdminRoutes` pages unchanged when `localStorage('alkemio-crd-enabled')` is unset or any other value (default OFF).
- **FR-004**: System MUST gate the CRD vs. MUI choice via `useCrdEnabled` and add conditional dispatch blocks at two routing locations: `TopLevelRoutes.tsx` (for the `/user/*` block) and `CrdOrganizationRoutes.tsx` (which currently delegates `settings/*` unconditionally to MUI). Lazy-loaded chunks for both versions; only the active chunk is fetched.
- **FR-005**: System MUST keep the existing MUI files in place: `src/domain/community/userAdmin/`, `src/domain/community/user/routing/UserRoute.tsx`, `src/domain/community/organizationAdmin/`, `src/domain/community/organization/routing/OrganizationRoute.tsx`. CRD pages live under two parallel subtrees: `src/main/crdPages/topLevelPages/userPages/settings/` (User) and `src/main/crdPages/topLevelPages/organizationPages/settings/` (Organization), each with one subfolder per settings tab.
- **FR-006**: CRD page components MUST NOT import from `@mui/*` or `@emotion/*` and MUST NOT import GraphQL-generated types directly into views; per-tab data mappers in each integration subtree are the only place GraphQL types meet CRD prop types.
- **FR-007**: CRD presentational components in `src/crd/components/contributor/settings/` (shared shell + edit primitives), `src/crd/components/user/settings/` (user-specific tabs), and `src/crd/components/organization/settings/` (org-specific tabs) MUST be presentational only (zero `@mui/*` imports, zero GraphQL-type imports, all behavior received as `on*` callback props per the CRD architectural rules in `src/crd/CLAUDE.md`).
- **FR-008**: System MUST resolve `/user/me/settings/*` to the current user's settings exactly as the current MUI `UserMeRoute` does. There is no `/me` shorthand for organizations.
- **FR-009**: System MUST honor the existing `NoIdentityRedirect` wrapper on the `/user/*` route so anonymous users hitting any user-settings route are redirected to login. The org admin route MUST continue to honor its existing authentication wrapping.

#### Authorization (per-actor predicates)

- **FR-010**: System MUST evaluate `canEditUserSettings = currentUser.id === profileUser.id || hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin)` at the User settings-shell route boundary. When false, every `/user/<slug>/settings/*` URL MUST redirect to `/user/<slug>` (public profile, owned by sibling spec 096). When true, the shell MUST render the requested tab with every control fully enabled — no read-only mode anywhere in the CRD User settings shell.
- **FR-011**: System MUST evaluate `canEditOrganizationSettings = organization.authorization.myPrivileges.includes(AuthorizationPrivilege.Update)` at the Organization settings-shell route boundary. When false, every `/organization/<orgSlug>/settings/*` URL MUST redirect to `/organization/<orgSlug>` (public profile, owned by sibling spec 096). When true, the shell MUST render the requested tab with every control fully enabled — no read-only mode anywhere in the CRD Org settings shell.
- **FR-012**: The User Security tab MUST be hidden in the tab strip for any viewer who is not the profile owner, including platform admins editing another user's profile. The route `/user/<other>/settings/security` MUST redirect to `/user/<other>/settings/profile` when the current user is a platform admin but not the profile owner.

#### Settings shell (shared)

- **FR-013**: The CRD `SettingsShell` component MUST be a shared, actor-agnostic primitive accepting a `tabs: SettingsTab[]` prop. The User integration passes 7 tabs; the Organization integration passes 5 tabs. The shell renders a sticky header (avatar + display name) and a horizontal tab strip below it, with the active tab highlighted by a `border-primary` underline.
- **FR-014**: On viewports below the `md` breakpoint the tab strip MUST be horizontally scrollable (`overflow-x-auto no-scrollbar`); all tabs (7 or 5) MUST remain rendered inline (no dropdown / hamburger / two-row wrap variant) and the active tab MUST be auto-scrolled into view on mount and on every tab change. Same responsive behavior as the public-profile resource strip in sibling spec 096.
- **FR-015**: All settings tabs (User and Org) MUST be reachable by direct URL; opening a deep URL MUST highlight the corresponding tab.
- **FR-016**: No settings tab — User Profile, Org Profile, or any other — carries a tab-wide dirty buffer. Tab strip clicks and out-of-page navigations MUST NOT be blocked by a confirmation dialog. Any field that is mid-edit when the user navigates away has its in-progress value silently dropped.
- **FR-017**: All settings tabs MUST commit changes immediately on per-control confirmation (no tab-wide Save / Reset bar anywhere) — User Profile and Org Profile use the per-field explicit-save model (FR-020 / FR-090); all other tabs commit per-control on click.
- **FR-018**: Empty-state UX is **per-tab**, not a single shared pattern:
  - **Account tabs (User Story 2 / FR-030–FR-033 and User Story 9 / FR-100–FR-103)** — port the prototype's per-sub-section patterns verbatim from `prototype/src/app/pages/UserAccountPage.tsx`. See FR-033 (User) and FR-103 (Org) for the full sub-section breakdown.
  - **Read-only list tabs without inline-add affordance** — User Membership grid (untouched empty state), User Pending Applications, User Organizations list (when not privileged), Org Authorization Admin / Owner sub-tabs, and the Org Community current-Associates and available-Users lists when their respective list is empty — MUST render a single muted caption line (e.g., "No memberships yet"). No icon, no CTA, no full empty-state card. The Org Community **add affordance is the search-and-add `+` flow above the available-users list** (FR-110) — that flow is always present regardless of list contents, so the available-users empty caption only appears when the search returns no matches.

#### User Profile tab (User Story 1)

- **FR-020**: The User Profile tab MUST use the **per-section explicit-save model** as implemented in spec 045 About (`src/main/crdPages/topLevelPages/spaceSettings/about/` — `useAboutTabData.ts` + `SpaceSettingsAboutView.tsx`). Each editable section renders its inputs via `InlineEditText` (single-line text), `MarkdownEditor` (Bio), `CountryCombobox` (Country), `TagsField` (one instance per profile tagset), and one `FieldFooter` per section containing a hint, the section's dirty indicator, the Save button, and the section's per-render status (`idle | saving | saved | error`). There are NO per-field pencil / check / × icons; the section's Save button is the only commit affordance. There is NO tab-wide Save / Reset bar, NO global dirty buffer, NO autosave or debounce. Mid-edit values are silently dropped on tab-switch / nav-away (FR-016). Baseline section units (final mapping documented in plan.md / data-model.md): Display Name, First Name, Last Name, Phone, Tagline, Bio as their own single-input sections; Skills (tagset `Skills`) and Keywords (tagset `Keywords`) as two **independent** per-section tagset editors (each section saves only its own tagset); Location (city + country) as one compound section; Social Links / References as one list-managed section.
- **FR-021**: The User Profile tab MUST render the editable fields mirroring the current MUI `UserForm` exactly: Identity (Display Name, First Name, Last Name — required; Email — read-only; Phone — validated), About You (Tagline, City, Country select, Bio markdown, **Skills**, **Keywords** — each its own labeled tagset editor), Social Links (LinkedIn, Bluesky, GitHub recognized refs + arbitrary references list with Add Another Reference). The system MUST NOT surface a single unified "Tags" field, an Organization input, or a Twitter / X tile. **Identity layout** mirrors the prototype's 2-column rows: Display Name renders on its own row (full-width); First Name + Last Name share a `md+` 2-col `FieldPairRow`; Email + Phone share a `md+` 2-col `FieldPairRow`. **Email** field uses a styled read-only `<Input>` with `cursor-not-allowed bg-muted/50 pl-9` and a `Mail` lucide icon prefix (no plain-text rendering). **Social Links** rows use brand-tinted rounded-full icon tiles (`size-10 rounded-full bg-{brand}/10 text-{brand}`) sourcing the brand SVGs from `@/crd/components/common/icons/social/{LinkedIn,BlueSky,GitHub}.svg?react` (the SVGs use `fill="currentColor"` so they pick up the tile's text color). The brand-name `<Label>` above each input is dropped — the icon tile is the visual identifier, with `aria-label` on the input preserving screen-reader access.
- **FR-022**: Each per-section Save click MUST fire one targeted mutation that patches ONLY that section's fields (preserving the rest of the user payload). On success the section MUST return to idle with a transient grayed-out "Saved!" indicator adjacent to the Save button for **1800 ms** (matching `SAVED_FLASH_MS` in 045's `useAboutTabData.ts`) before returning to idle. **On failure** the section MUST stay dirty with the user's typed values preserved (no auto-revert) and an inline error message MUST appear in the section. The error MUST persist until the admin edits any field in that section again — the next edit clears the error and re-enables the Save button. There is no auto-retry. The Save button MUST expose `aria-busy="true"` while the mutation is pending and MUST be `disabled` while saving.
- **FR-023**: Validation timing on the User Profile tab follows 045's pattern: format validators (URL pattern on References, phone regex on Phone, and any future format-validated field) MUST run **live** as the admin types and MUST disable the section's Save button while any field in that section is format-invalid (parity with the URL Edge Case in this spec). Required-field empty checks (Display Name / First Name / Last Name) MUST fire on Save click — clicking Save with a required field empty surfaces an inline error beneath the offending input, the section stays dirty, and no mutation fires. Server-side validation errors (e.g. Display Name uniqueness) surface inline per FR-022.
- **FR-024**: Avatar uploads on the User Profile tab MUST route the picked file through the CRD `ImageCropDialog` (`@/crd/components/common/ImageCropDialog` — the same primitive 045 About uses for branding visuals). The flow is: file pick → crop dialog opens with the avatar's `VisualModelFull` constraints (aspectRatio, min/max dimensions); the user crops + optionally enters alt text → on Save the cropped/resized file fires `uploadImageOnVisual` with the supplied `alternativeText`; on Cancel nothing happens. There is no separate Save click on the Profile tab itself and no debounce — the crop dialog's Save IS the commit. On upload success the avatar slot's status flashes "Saved!" for 1800 ms; on upload failure an inline error appears in the avatar slot and the previous avatar remains in place.
- **FR-025**: Reference list management on the User Profile tab MUST mirror 045 About's references section. Adding a new reference appends an unsaved (temp-ID) row to the local section buffer; editing patches the row in the buffer; **deleting opens a `ConfirmationDialog` (CRD `AlertDialog`, `variant="destructive"`) first** — only the dialog's Confirm queues the row for deletion in the section buffer. The actual mutation batch (patch existing + create new + delete pending) fires only on the References-section Save click — the same one-mutation-per-section pattern as every other section. There is NO per-row Save and NO immediate per-row delete. Reuses the existing reference mutations the MUI `UserForm` already wires; no new mutation is introduced. Per `src/crd/CLAUDE.md` Rule #9 — the earlier "references are cheap to recreate" exception is REMOVED in favour of consistent confirmation policy across the spec.
- **FR-026**: There is no read-only mode on the User Profile tab. The shell either renders fully editable Profile fields (when `canEditUserSettings` is true) or has redirected the viewer to the public profile.

#### User Account tab (User Story 2)

- **FR-030**: The User Account tab MUST render four card groups — Hosted Spaces, Virtual Contributors, Innovation Packs, Custom Homepages — using the existing data hooks via the existing `ContributorAccountView` data path.
- **FR-031**: The User Account tab MUST preserve every action the current MUI exposes (Create / Manage / Transfer / Delete on each resource type) — no action added, no action removed.
- **FR-032**: The four "Create" affordances on the User Account tab MUST each open a CRD creation dialog (FR-034) — never a route navigation. The **Manage** kebab action MUST navigate to the resource's existing settings URL (read off the resource's `profile.url`); the **Delete** kebab action MUST open a CRD `ConfirmationDialog` (Rule #9) and on confirm fire the resource's existing delete mutation. The CRD Account view (`ContributorAccountView`) itself stays purely presentational — it never imports `@mui/*` / `@emotion/*` or GraphQL types, and every action is a callback prop; the CRD creation dialogs are mounted by the integration page (`CrdUserAccountTab`), which owns their Apollo wiring.
- **FR-033**: Empty-state UX on the User Account tab MUST mirror `prototype/src/app/pages/UserAccountPage.tsx` per sub-section:
  - **Hosted Spaces** — render existing space cards followed by a dashed-border **"Create New Space"** card with a `+` icon and the copy *"Launch a new collaborative environment for your team."* The Create card MUST always render (parity with prototype) regardless of list size.
  - **Virtual Contributors** — render existing VC cards followed by a dashed-border **"Create New Contributor"** card with a `+` icon. The Create card MUST always render (parity with prototype).
  - **Template Packs** — render existing pack cards followed by up to **three** dashed-border **"Empty Slot"** placeholder rows, each with a `+` icon (count: `Math.max(0, 3 − packs.length)`).
  - **Custom Homepages** — when the list is non-empty, render the existing homepage cards. When the list is empty, render a centered full empty-state inside the section: a circular icon tile, a *"No Custom Homepages"* heading, descriptive copy (*"Create a personalized landing page for your account."*), a **Create Homepage** CTA button, and a *"Capacity: 0/1 Used"* indicator line below the CTA.
  - Every "Create" / "+" affordance on this tab (the "Create New Space" / "Create New Contributor" dashed cards, the "Empty Slot" `+` tiles, and the "Create Homepage" CTA in the Custom Homepages empty-state) MUST open the corresponding CRD creation dialog per FR-034 — none of them navigates to a route.
- **FR-034**: The four Account-tab "Create" flows (shared by the User Account tab — FR-032 — and the Org Account tab — FR-102) MUST each be served by a dedicated CRD (shadcn) creation dialog/wizard that is a **parity port of the corresponding current-MUI dialog**, preserving every form field, every validation rule, every supporting mutation, and every refetch:
  - **Create Space** → `CrdCreateSpaceDialog` — parity port of `src/domain/space/components/CreateSpace/createSpace/CreateSpace.tsx` (`CreateSpaceForm` + `useSpaceCreation`): fields `displayName`, `nameID`, `tagline`, `description` (markdown), `tags`, `spaceTemplateID` (template picker), `addTutorialCallouts`, the `banner` + `cardBanner` visual uploads, and the `acceptedTerms` checkbox; mutation `useCreateSpaceMutation` with the `licensePlanID` auto-picked from the account's first available plan; refetches `AccountInformation` (+ dashboard spaces) and uploads the visuals after the mutation resolves; on success closes the dialog and the new space appears in the Hosted Spaces group.
  - **Create Virtual Contributor** → `CrdCreateVirtualContributorWizard` — **full parity port of the multi-step MUI `useVirtualContributorWizard`** (`src/main/topLevelPages/myDashboard/newVirtualContributorWizard/`). Every step is reproduced: (1) initial profile (`name`, `tagline`, `description` markdown, `avatar` upload, `engine`, `bodyOfKnowledgeType`, and the source selector — *create & write knowledge* / *use existing space* / *use external AI*); (2) add-knowledge content (`posts[]` → Post callouts, `documents[]` → a Link callout collection); (3) choose-community (pick an existing space to add the VC to, or create a new space for it); (4) use-existing-space (pick a space/subspace as the body of knowledge); (5) external-AI (`engine`, `apiKey`, conditional `assistantId`); (6) try-VC info. Every supporting mutation is reproduced — `useCreateVirtualContributorOnAccountMutation`, `useUploadVisualMutation` (avatar), `useRefreshBodyOfKnowledgeMutation`, `useCreateLinkOnCalloutMutation` (documents), `useCreateSpaceMutation` (when a space is created for the VC), and `useAssignRoleToVirtualContributorMutation` (community assignment) — in the same order, with the same refetches (`MyAccount`, `AccountInformation`, the account-resources query, `LatestContributionsSpacesFlat`).
  - **Create Innovation Pack** → `CrdCreateInnovationPackDialog` — parity port of `src/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog.tsx` (`InnovationPackForm`, create variant): fields `profile.displayName` (required) + `profile.description` (markdown, required); mutation `useCreateInnovationPackMutation` with `packData.accountID`; refetches `AdminInnovationPacksList`, `AccountInformation`, `InnovationLibrary`; on success toasts "pack created" and closes.
  - **Create Innovation Hub (Custom Homepage)** → `CrdCreateInnovationHubDialog` — parity port of `src/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog.tsx` (`InnovationHubForm`, create variant): fields `subdomain` (required, validated unique), `profile.displayName` (required), `profile.tagline`, `profile.description` (markdown, required); mutation `useCreateInnovationHubMutation` with `hubData.accountID`, fixed `type: List` and empty `spaceListFilter`; refetches `AdminInnovationHubsList`, `AccountInformation`; on success toasts "hub created" and closes.
  These dialogs/wizard live under `src/crd/components/contributor/settings/create/` (and `src/crd/components/contributor/settings/createVc/` for the VC wizard's step components). They are pure CRD presentational components — zero `@mui/*` / `@emotion/*` imports, plain-TypeScript props, all behavior (submit / cancel / step navigation / file pick) received as callback props per `src/crd/CLAUDE.md`. The Apollo wiring (the existing mutation hooks above, the existing visual-upload helpers, license-plan resolution, refetch lists) lives in per-flow integration hooks under `src/main/crdPages/topLevelPages/.../account/` (mirroring how `CreateSubspaceDialog` pairs with `useCreateSubspace`). No new GraphQL types, mutations, or backend capabilities are introduced — only the existing ones, restyled. On cancel the dialog closes with no side effect; on mutation hard-failure the dialog stays open and an inline error toast surfaces the message.
- **FR-034a**: Each of the four Account-tab section headers (Hosted Spaces, Virtual Contributors, Innovation Packs / Template Packs, Innovation Hubs / Custom Homepages) on BOTH User Account (FR-030) and Org Account (FR-100) MUST render a capacity badge next to the section title — `"{{usage}}/{{limit}}"` — that mirrors the MUI `BlockHeader` on `src/domain/community/contributor/Account/ContributorAccountView.tsx`. The badge's hover tooltip body MUST contain a parity-port of the MUI wording: for **Spaces**, a three-line per-plan breakdown (`From the available Spaces in your account, you have created: {{freeUsage}} out of {{freeLimit}} Free Spaces / {{plusUsage}} out of {{plusLimit}} Plus Spaces / {{premiumUsage}} out of {{premiumLimit}} Premium Spaces`); for the other three groups, a single line (`You have created {{usage}} out of your {{limit}} available …`). Numeric source data: `account.license.entitlements[]` (`{ type, limit, usage }`). When the actor lacks the corresponding `canCreate*` privilege AND `usage === 0`, the badge MUST render `"Not available"` with the contact-team tooltip (matching MUI's `BlockHeader` `isAvailable` branch) — `isAvailable` is derived from `canCreate*` (NOT from `account.license.availableEntitlements`; the two diverge in practice). The Custom Homepages empty-state caption (FR-033) MUST also read from the same capacity data — no hard-coded `"0/1"` literals. i18n keys live under `shared.account.capacity.*` in the `crd-contributorSettings` namespace (parity across all six languages — en/nl/es/bg/de/fr).

#### User Membership tab (User Story 3)

- **FR-040**: The User Membership tab MUST render the Home Space dropdown + Auto-redirect checkbox card, the My Memberships **card grid** (no client-side pagination — the grid renders every filtered row; "Load More" cursor support deferred to a follow-up), and the Pending Applications compact list. Each membership card MUST surface, when available from `useSpaceContributionDetailsQuery`: aspect-video banner (cardBanner with deterministic-gradient fallback), title, role badge, tagline, kebab menu with exactly two items ("View Space" / "View Subspace" + "Leave Space" / "Leave Subspace" — no Options label, no separator), and a "Led by:" footer with overlapping avatar stack of community leads.
- **FR-041**: The Home Space and Auto-redirect controls MUST commit their change via `updateUserSettings` immediately.
- **FR-042**: The Auto-redirect checkbox MUST be disabled and accompanied by an explanatory caption when no Home Space is selected.
- **FR-043**: The My Memberships card grid MUST support a client-side search input (case-insensitive substring match against `displayName`) and a segmented filter (`All / Spaces / Subspaces`). The status axis (`Active / Archived`) shown in the prototype is intentionally **out of scope** because the existing MUI page does not expose archived-space lifecycle filtering — adding it here would be a new affordance forbidden by the "no new affordances" rule.
- **FR-044**: Each My Memberships row's kebab MUST offer a single **Leave** action preceded by a confirmation dialog; on confirm, the existing leave-community mutation fires.
- **FR-045**: The Pending Applications table MUST be read-only (no kebab, no actions).

#### User Organizations tab (User Story 4)

- **FR-050**: The User Organizations tab MUST render the user's associated organizations with avatar, name, description, location, role, associates count, verified badge, and website link.
- **FR-051**: A client-side search input MUST filter organizations by name.
- **FR-052**: A Create Organization button MUST be visible only when the current user has the `CreateOrganization` platform privilege.
- **FR-053**: Each row's kebab MUST offer a Leave action preceded by a confirmation dialog (existing leave-organization flow).

#### User Notifications tab (User Story 5)

- **FR-060**: The User Notifications tab MUST render every notification group, every property, and every channel (inApp / email / push) the current MUI `UserAdminNotificationsPage` exposes — no rule added, no rule removed.
- **FR-061**: The Push Notifications master toggle MUST be hidden behind the same availability checks as today; when unavailable, an info banner replaces it.
- **FR-062**: The Push Subscriptions List card MUST reuse the existing push subscription data path (restyled with CRD primitives).
- **FR-063**: The Space Admin, Platform Admin, and Organization Notifications cards MUST be gated by the same privileges the current MUI uses.
- **FR-064**: Each toggle MUST use the optimistic-overrides pattern (immediate UI update, then resync after server refetch). On **divergence** (server returns a value different from the optimistic one), the optimistic override clears after the refetch and the UI re-renders to the authoritative server state. On **hard failure** (network error, 5xx, mutation throws), the switch MUST revert to its prior state and an inline toast MUST surface the error message — parity with FR-133 (Org Settings) so the failure UX is identical across every settings toggle in the contributor vertical.

#### User Settings tab (User Story 6)

- **FR-070**: The User Settings tab MUST render two cards — Communication & Privacy (single switch for `allowOtherUsersToSendMessages`) and Design System (CRD on/off toggle).
- **FR-071**: The Design System switch MUST flip `localStorage('alkemio-crd-enabled')` and reload the page.
- **FR-072**: A caption beneath the Design System switch MUST explain "The page will reload after the change."
- **FR-073**: The Design System switch MUST always reflect (and write to) the **viewer's own browser** localStorage — never a server-stored attribute — so a platform admin editing another user's profile sees their own toggle state, not the target user's preference.

#### User Security tab (User Story 7)

- **FR-080**: The User Security tab MUST mount the same identity-provider `settings` flow with the same field-removal filter the current MUI `UserSecuritySettingsPage` uses (passwords / profile / OIDC link controls hidden).
- **FR-081**: When the flow contains no WebAuthn / Passkey nodes, an info alert MUST read "WebAuthn / Passkey is not enabled on this account".
- **FR-082**: On flow load error, the existing error display MUST be shown.
- **FR-083**: The User Security tab MUST be hidden in the tab strip for any viewer who is not the profile owner — including platform admins.
- **FR-084**: A direct hit on `/user/<other>/settings/security` by a non-owner (regardless of platform-admin privilege) MUST redirect to `/user/<other>/settings/profile`.

#### Organization Profile tab (User Story 8)

- **FR-090**: The Org Profile tab MUST use the **same per-section explicit-save model** as User Profile (FR-020 — FR-025) — the same 045 About implementation, the same `FieldFooter` pattern, the same 1800 ms "Saved!" flash, the same inline-error-until-next-edit behaviour, the same `ConfirmationDialog`-gated reference deletion, the same live-format / on-Save-required validation split. This is a deliberate UX divergence from MUI's Formik-with-single-Save pattern in `OrganizationForm`, chosen for consistency with the User vertical and parity with 045 across the contributor settings family.
- **FR-091**: The Org Profile tab MUST render the editable fields mirroring the current MUI `OrganizationForm` exactly: Identity (Display Name — required, Name ID — read-only after creation, Tagline), About (Description markdown, City, Country select, **Keywords** and **Capabilities** — each its own labeled tagset editor with its own per-section save), Contact & Legal (Contact Email — validated, Domain, Legal Entity Name, Website — validated URL), Social Links (LinkedIn, Bluesky, GitHub recognized refs + arbitrary references list with Add Another Reference). The system MUST NOT surface a single unified "Tags" field on Org Profile.
- **FR-092**: Each per-section Save click on the Org Profile tab MUST fire one targeted `updateOrganization` mutation that patches ONLY that section's fields (preserving the rest of the org payload). Success / failure semantics match FR-022 — 1800 ms "Saved!" flash adjacent to Save; section stays dirty on failure with inline error until next edit; no auto-retry. Reference and tagset CRUD reuse the same per-section batched-on-Save flow as User Profile (FR-025), including the `ConfirmationDialog`-gated reference deletion.
- **FR-093**: Avatar/logo upload on the Org Profile tab MUST follow the same crop-then-commit flow as FR-024 — file pick opens the CRD `ImageCropDialog` with the visual's constraints; the dialog's Save delivers the cropped/resized file + alt text; only then does `uploadImageOnVisual` fire. No separate Save click on the Profile tab; no debounce.
- **FR-094**: The Org Profile tab MUST display the org's verification status as a **read-only badge**. Editing the verification status is out of scope for this spec — it is managed by platform admins via a separate flow.
- **FR-095**: There is no read-only mode on the Org Profile tab. The shell either renders fully editable fields (when `canEditOrganizationSettings` is true) or has redirected the viewer to the public profile.

#### Organization Account tab (User Story 9)

- **FR-100**: The Org Account tab MUST render the same four card groups as User Account (Hosted Spaces, Virtual Contributors, Innovation Packs, Custom Homepages), sourced from the org's account data hooks. The CRD presentational view MUST be a shared component reused by both User Account and Org Account.
- **FR-101**: The Org Account tab MUST preserve every action the current MUI `ContributorAccountView` exposes when consumed by the Org admin path — no action added, no action removed.
- **FR-102**: The four "Create" affordances on the Org Account tab MUST each open the same CRD creation dialog/wizard as the User Account tab (FR-034), mounted by `CrdOrgAccountTab` with the org's `account.id` as the creation target. The **Manage** kebab action MUST navigate to the resource's existing settings URL; the **Delete** kebab action MUST open a CRD `ConfirmationDialog` (Rule #9) and on confirm fire the existing delete mutation — parity with User Account behavior (FR-032). No route navigation for Create.
- **FR-103**: Empty-state UX on the Org Account tab MUST follow the same per-sub-section patterns as the User Account tab (FR-033) — same prototype source, same `Create New Space` / `Create New Contributor` inline dashed cards on Hosted Spaces and Virtual Contributors, same up-to-3 `Empty Slot` placeholders on Template Packs, same centered full empty-state with CTA + capacity indicator on Custom Homepages. The shared `ContributorAccountView`-equivalent presentational component (FR-100) renders the same affordances for both actors; per-actor mappers supply the labels and `onCreate*` callbacks, and both integration pages mount the same four CRD creation dialogs (FR-034).

#### Organization Community (Associates) tab (User Story 10)

- **FR-110**: The Org Community tab MUST render two lists — current Associates (with a remove × per row) and available Users (with an add + per row) — backed by the existing role-set manager flows.
- **FR-111**: A search input MUST filter the available-users list by name (parity with current MUI `OrganizationAssociatesView`).
- **FR-112**: **Add (+) actions** MUST commit immediately on click via the existing role-set manager. **Remove (×) actions** MUST first open a `ConfirmationDialog` (CRD `AlertDialog`, `variant="destructive"`) with a role-aware confirm label (*"Remove {{name}} as Associate"*) — only the dialog's confirm button fires the role-set manager mutation; clicking Cancel dismisses the dialog with no mutation and the row stays unchanged. On error (add or remove), the row keeps its prior state and an inline toast surfaces the error message. Per `src/crd/CLAUDE.md` Rule #9 ("All Deletions Must Be Confirmed").
- **FR-113**: Pagination on the available-users list MUST be preserved (load-more or infinite scroll, matching current MUI behavior).

#### Organization Authorization tab (User Story 11)

- **FR-120**: The Org Authorization tab MUST render two sub-tabs — `Admin` and `Owner` — held in local React state (no URL sync). Each sub-tab renders a role-assignment view identical in shape to the Community tab.
- **FR-121**: Each role-assignment view's **Add (+)** action MUST commit immediately on click via the existing role-set manager. Each **Remove (×)** action MUST first open a `ConfirmationDialog` (CRD `AlertDialog`, `variant="destructive"`) with a role-aware confirm label (*"Remove {{name}} as Admin"* on the Admin sub-tab; *"Remove {{name}} as Owner"* on the Owner sub-tab) — only the dialog's confirm button fires the role-set manager mutation; clicking Cancel dismisses the dialog with no mutation and the row stays unchanged. Per `src/crd/CLAUDE.md` Rule #9.
- **FR-122**: The Authorization tab MUST be visible only to viewers with `Update` privilege on the org (handled by FR-011's shell-level redirect — so any viewer reaching this tab already passes the gate).

#### Organization Settings tab (User Story 12)

- **FR-130**: The Org Settings tab MUST render two switches: `allowUsersMatchingDomainToJoin` (membership) and `contributionRolesPubliclyVisible` (privacy).
- **FR-131**: Each switch MUST commit its change via `updateOrganizationSettings` immediately.
- **FR-132**: The Org Settings tab MUST NOT surface a Design System toggle. The Design System toggle is User-only because it is a viewer-scoped browser preference, not an org attribute.
- **FR-133**: On mutation failure, the switch MUST revert to its prior state and surface an inline toast with the error message.

#### Internationalization

- **FR-140**: All user-visible strings on CRD contributor settings tabs MUST live in `src/crd/i18n/contributorSettings/contributorSettings.<lang>.json` — a single combined namespace covering both User and Organization tabs. The namespace key registered in `src/core/i18n/config.ts` and `@types/i18next.d.ts` is `crd-contributorSettings`.
- **FR-141**: All six supported languages (en, nl, es, bg, de, fr) MUST be created and edited in the same PR that introduces or removes a key, per the CRD i18n manual workflow (no Crowdin).
- **FR-142**: Where current MUI uses a generic translation key already defined in the global `translation` namespace (e.g., `forms.validations.elementMustBeValidUrl`, `components.profileSegment.socialLinks.linkedin`), the CRD page MAY reuse that existing key via the `translation` namespace rather than duplicating it under `crd-contributorSettings`.

#### Accessibility

- **FR-150**: Every interactive element on every CRD settings tab (User and Org) MUST meet WCAG 2.1 AA — semantic HTML, visible focus indicators, accessible names on icon-only buttons (Save, Cancel, kebabs, trash icons, +/× role-assignment buttons), keyboard reachability, and `aria-busy` on async-pending buttons.
- **FR-151**: The settings tab strip MUST be navigable by keyboard (Tab into the strip, Left/Right arrows between tabs, Enter to activate).
- **FR-152**: The Authorization sub-tab strip (Admin / Owner) MUST be keyboard-navigable using the same pattern.
- **FR-153**: All confirmation dialogs — User-side Leave (space on User Membership tab per FR-044; organization on User Organizations tab per FR-053) and Org-side role removals (Associate on Org Community per FR-112; Admin and Owner on Org Authorization per FR-121) — MUST be implemented with the CRD `AlertDialog` primitive (`variant="destructive"`) with a role-aware / action-aware confirm label, satisfying the required ARIA semantics and `src/crd/CLAUDE.md` Rule #9 ("All Deletions Must Be Confirmed").

### Key Entities

- **User** — the user being edited. Key attributes consumed by CRD: `id`, `nameID`, top-level identity (`firstName`, `lastName`, `email`, `phone`), `profile.{id, displayName, tagline, description, location.{city, country}, avatar, references, tagsets}`, `account.id`, `settings.{communication, privacy, notification, homeSpace}`.
- **Organization** — the organization being edited. Key attributes consumed by CRD: `id`, `nameID`, top-level identity (`legalEntityName`, `domain`, `contactEmail`, `website`, `verification.status`), `profile.{id, displayName, tagline, description, location.{city, country}, avatar, references, tagsets}`, `account.id`, `settings.{membership, privacy}`, `authorization.myPrivileges`.
- **Reference** (Social Link) — a profile reference (`profile.references[]`). Attributes: `id`, `name`, `uri`, `description`. Same shape on User and Organization.
- **Membership** — an entry in `rolesUser.spaces` (and nested subspaces). Attributes used by CRD: `id`, `displayName`, `level`, role flags. Mapped to a hosted-item view on the Membership tab.
- **Pending Application** — an entry in `me.communityApplications`. Read-only on the User Membership tab.
- **AssociatedOrganization** — an organization the user is a member of. Listed on the User Organizations tab.
- **NotificationSettings** — the structured settings object on `User.settings.notification`. Each leaf is a `{ inApp, email, push }` channel object.
- **HomeSpace** — `User.settings.homeSpace.{ spaceID, autoRedirect }`. Edited from the User Membership tab.
- **AccountResource** — a hosted space, virtual contributor, innovation pack, or innovation hub. Listed on both User Account and Org Account tabs; created via the per-type CRD creation dialog (FR-034) targeting the actor's `account.id`.
- **AccountCreateRequest** — the form payload of one of the four Account-tab creation dialogs (`CrdCreateSpaceDialog` / `CrdCreateVirtualContributorWizard` / `CrdCreateInnovationPackDialog` / `CrdCreateInnovationHubDialog`). Each maps 1:1 onto the variables of the existing create mutation for its resource type (`useCreateSpaceMutation` / `useCreateVirtualContributorOnAccountMutation` + supporting mutations / `useCreateInnovationPackMutation` / `useCreateInnovationHubMutation`); fields enumerated in FR-034 and data-model.md.
- **Associate** (Org Community tab) — a member of the organization in the `Associate` role. Attributes: `id`, `profile.{displayName, avatar, url}`.
- **RoleAssignment** (Org Community + Authorization tabs) — a (user, role) tuple. Roles in scope: `Associate` (Community tab), `Admin` and `Owner` (Authorization tab).
- **OrganizationSettings** — `Organization.settings.{membership.allowUsersMatchingDomainToJoin, privacy.contributionRolesPubliclyVisible}`. Edited from the Org Settings tab.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A profile owner can complete the full edit flow on User Profile (change name, tagline, bio, location, add a social link, upload a new avatar, save) in under 90 seconds with no console errors and no failed network calls.
- **SC-002**: An organization admin can complete the full edit flow on Org Profile (change display name, description, contact email, domain, add a social link, upload a new logo) in under 90 seconds with no console errors and no failed network calls.
- **SC-003**: The CRD vs. MUI design-system toggle on the User Settings tab consistently reloads the page into the chosen renderer in under 3 seconds, on every supported browser, with no extra clicks. The reload affects both User and Org settings consistently.
- **SC-004**: 100% of the notification rules and channel toggles exposed by the current MUI Notifications page are present and functionally identical on the CRD Notifications tab — verified by a row-by-row checklist comparison.
- **SC-005**: 100% of the URLs that resolve to a User-settings or Organization-settings page in MUI continue to resolve to the equivalent page in CRD with no broken links — verified by an automated route smoke test.
- **SC-006**: An accessibility audit (Lighthouse / axe) reports zero critical or serious violations on every CRD settings tab — all 7 user tabs and all 5 org tabs.
- **SC-007**: Bundle size delta from this migration MUST NOT exceed +50 KB gzipped across the two new per-tab lazy-loaded chunks combined (User settings + Org settings) over the prior build. The Account-tab creation dialogs (FR-034) load as their own additional lazy chunk, fetched only when a "Create" affordance is clicked; its gzipped size is measured and reported separately in the bundle analysis and SHOULD stay under +120 KB (the bulk being the multi-step VC wizard, whose MUI counterpart is comparably sized).
- **SC-008**: A non-owner non-admin viewer opening any `/user/<other>/settings/*` URL is redirected to `/user/<other>` (public profile) within one render cycle. A platform admin opening the same URL sees the requested settings tab fully editable, with the Security sub-tab as the only exception (always owner-only).
- **SC-009**: A viewer without `Update` privilege opening any `/organization/<orgSlug>/settings/*` URL is redirected to `/organization/<orgSlug>` (public profile) within one render cycle. A viewer with `Update` privilege sees every settings tab fully editable.
- **SC-010**: Org admins can add and remove Associates / Admins / Owners on the Community and Authorization tabs with the same data shape and same network round-trip count as the current MUI implementation — verified by capturing network logs on parity test cases.
- **SC-011**: Creating a Space / Virtual Contributor / Innovation Pack / Innovation Hub from the CRD Account tab (User or Org) fires the same mutation(s), with the same variables shape, and refetches the same queries as the current MUI dialog/wizard — verified by capturing network logs on a parity test case for each of the four flows (including each VC-wizard branch: create-knowledge, use-existing-space, external-AI).

## Assumptions

- The CRD shell (`CrdLayoutWrapper`, header, footer, dialogs) and the design-system toggle (`useCrdEnabled`) are already in place and reused without modification — established by spec `041-crd-dashboard-page` and reused by 042 / 043 / 045 / 091 / 096.
- Sibling spec `096-crd-user-pages` owns the public-profile views (`/user/:userSlug`, `/organization/:orgSlug`, `/vc/:vcSlug`) and the Settings (gear) icons on those heroes that link into this spec's settings shells. The two specs ship together as one CRD rollout cohort: the User vertical (096 user-profile + 097 user-settings) and the Organization vertical (096 org-profile + 097 org-settings) are gated by the same `useCrdEnabled` toggle.
- The existing data hooks for User (`useUserQuery`, `useUserAccountQuery`, `useUserContributionsQuery`, `useUserSettingsQuery`, `useUpdateUserMutation`, `useUpdateUserSettingsMutation`, `useUserOrganizationIds`, `useUserPendingMembershipsQuery`, push-notification context, identity-provider flow hook) and for Organization (`useOrganizationProvider`, `useOrganizationAccountQuery`, `useAccountInformationQuery`, `useOrganizationSettingsQuery`, `useUpdateOrganizationMutation`, `useUpdateOrganizationSettingsMutation`, `useRoleSetManager`, `useRoleSetAvailableUsers`) are sufficient — **no GraphQL schema change is required**. The Account-tab creation dialogs (FR-034) likewise reuse the existing create mutation hooks (`useCreateSpaceMutation` / `useSpaceCreation`, `useCreateVirtualContributorOnAccountMutation` + `useUploadVisualMutation` + `useRefreshBodyOfKnowledgeMutation` + `useCreateLinkOnCalloutMutation` + `useAssignRoleToVirtualContributorMutation`, `useCreateInnovationPackMutation`, `useCreateInnovationHubMutation`) and the existing visual-upload / license-plan helpers — **no new mutation is introduced**.
- Email change on User remains an identity-provider-managed concern; the User Profile email field stays read-only with a "Contact support to change email" caption.
- Identity-provider UI markup inside the User Security tab is **not** restyled in this iteration — only the surrounding card / heading shell adopts CRD; the rendered form fields keep their default styling.
- Verification status on Org Profile is **read-only** in this spec; the badge displays `verification.status` but mutating verification is owned by a separate platform-admin flow not covered here.
- The 7-tab User strip order (Profile → Account → Membership → Organizations → Notifications → Settings → Security) is fixed; tabs cannot be reordered. The 5-tab Org strip order (Profile → Account → Community → Authorization → Settings) is fixed.
- **The User prototype is treated as a visual reference, not an authoritative spec.** Where the prototype omits a capability the current MUI ships (Security tab, etc.), CRD ports the MUI capability, restyled. **There is no prototype for Organization settings** — Org tabs are a parity restyle of current MUI (same rule 096 used for the Org public profile).
- Authorization model is binary in CRD: either the viewer can edit (per the actor predicate) or they are redirected to the public profile. The legacy MUI "read-only fallback" branch is intentionally not ported.
- Translations are managed manually (AI-assisted) for all six languages in the same PR; no Crowdin involvement.
- The four Account-tab "Create" flows (both User and Org) open CRD (shadcn) creation dialogs that are parity ports of the current MUI dialogs (FR-034) — not route navigation. The prior 097 draft's "navigate to existing MUI admin routes" wording (and the `/admin/spaces/new`-style routes it referenced) was a research error; those routes do not exist. The CRD VC creation flow is a **full parity port** of the multi-step MUI `useVirtualContributorWizard`. The `Manage` kebab still navigates to the resource's existing settings URL; `Delete` uses a CRD `ConfirmationDialog` + the existing delete mutation.

## Out of Scope

- **VC settings shell** (`/vc/:vcSlug/settings/*`) is explicitly deferred to a future spec. The Settings (gear) icon on the VC public-profile hero (per 096 FR-031) continues to link to the existing MUI VC admin shell.
- **Public profile pages** (`/user/:userSlug`, `/organization/:orgSlug`, `/vc/:vcSlug`) without `/settings` — owned by sibling spec `096-crd-user-pages`.
- **No new backend capabilities.** This migration is a presentation-layer port. No new GraphQL types, no new mutations, no new role gating, no new permission semantics.
- **No new affordances on Account tabs** (User or Org). Hosted spaces, VCs, packs, and hubs remain editable / creatable / deletable through the same flows the current MUI exposes — not a single button is added or removed. The Account-tab "Create" buttons are restyled in CRD (FR-034) but expose exactly the same fields / steps / mutations as the MUI dialogs they port.
- **No restyle of identity-provider rendered form fields** inside the User Security tab. Only the surrounding card / heading wrapper is restyled.
- **No new fields or steps in the Account-tab creation dialogs.** The CRD `CrdCreateSpaceDialog` / `CrdCreateVirtualContributorWizard` / `CrdCreateInnovationPackDialog` / `CrdCreateInnovationHubDialog` are parity ports of the MUI `CreateSpace` / `useVirtualContributorWizard` / `CreateInnovationPackDialog` / `CreateInnovationHubDialog` — same fields, same wizard steps, same validations, same mutations. (The non-create "manage" / "edit" admin dialogs for these resource types are still reached by navigating to their existing MUI settings routes — they are NOT ported in this spec.)
- **No deletion of MUI files.** The current MUI pages stay in place until the CRD toggle is removed globally.
- **No design refresh of the Notifications matrix beyond visual cards.** Every row, channel, and gating rule stays exactly as the current MUI implementation.
- **No tab-wide dirty buffer anywhere.** Every settings tab — including User Profile and Org Profile — commits per-control on explicit user action; switching tabs never triggers a discard-confirm dialog.
- **No mutation of `Organization.verification.status`** from the Org Profile tab. The verified badge is read-only here; verification is managed by platform admins via a separate flow.
- **No mobile-app-specific layouts.** Both shells are responsive (single-column on `< lg`) but no native-app shell is targeted.
