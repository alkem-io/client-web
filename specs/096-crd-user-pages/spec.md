# Feature Specification: CRD User Profile Pages

**Feature Branch**: `096-crd-user-pages`
**Created**: 2026-04-29
**Status**: Draft
**Input**: Migrate the User vertical — the public **User Profile** page and the seven **User Settings** tabs (My Profile, Account, Membership, Organizations, Notifications, Settings, Security) — from the current MUI implementation to the CRD design system (shadcn/ui + Tailwind). Use the prototype reference at `prototype/src/app/pages/UserProfilePage.tsx`, `UserProfileSettingsPage.tsx`, `UserAccountPage.tsx`, `UserMembershipPage.tsx`, `UserOrganizationsPage.tsx`, `UserNotificationsPage.tsx`, `UserGenericSettingsPage.tsx`. Follow the migration pattern established by spec `045-crd-space-settings` and the architectural rules in `docs/crd/migration-guide.md`. Related sibling effort: `045-crd-space-settings` (same dual MUI / CRD coexistence model, shared layout shell `CrdLayoutWrapper`, shared `useCrdEnabled` toggle).

## Clarifications

### Session 2026-04-29

- Q: My Profile save model — per-field autosave, form-wide Save bar, or per-field explicit save? → A: **Per-field with explicit (manual) save — no autosave, no form-wide buffer.** Each editable field on My Profile has its own commit affordance (a check / Save icon revealed when the field is in edit mode, plus a Cancel / × that reverts the field). Each field's mutation fires only when the user clicks Save on that field. Tabs don't carry a global dirty buffer — switching tabs while a field is mid-edit cancels the in-progress edit silently (no confirmation dialog needed). This matches the spirit of the rest of the User Settings area, where every tab commits its changes per-control on explicit user action without autosave.
- Q: Online-presence dot on the public profile hero — derive from `lastActiveDate`, drop entirely, or wire a real presence channel? → A: **Drop entirely.** The dot is removed from the public profile hero. This keeps the migration a parity restyle (current MUI does not surface presence) and avoids implying real-time online status without an actual presence channel. `User.lastActiveDate` exists on the schema but stays unused by CRD in this iteration.
- Q: Does the public-profile Message button stay in the CRD hero? → A: **Yes — keep it.** The CRD hero exposes a Message button for any signed-in non-owner viewer. The button reuses the existing `useSendMessageToUsersMutation` via a callback prop, mirroring the current MUI `UserPageBanner.handleSendMessage` flow exactly: clicking the button opens an in-hero compose surface (or a small dialog), the user types a message, the mutation fires with `{ message, receiverIds: [userId] }`, and on success the surface closes. No new GraphQL mutation is introduced.
- Q: Tab order — where does Security live in the strip? → A: **My Profile → Account → Membership → Organizations → Notifications → Settings → Security (matches current MUI; Security at the end).** The prototype's six-tab strip omitting Security is treated as **incomplete prototype** rather than a deliberate removal — this aligns with the broader assumption (see Assumptions) that the prototype is incomplete for several capabilities (Security tab, presence dot wiring, etc.) and that current-MUI parity is the source of truth where the prototype is silent or contradicts a working capability.
- Q: Public-profile resource sections — pagination strategy for users with many memberships? → A: **No pagination cap; render every item; match current MUI `TilesContributionsView` exactly.** The current MUI does not paginate — it renders every contribution inside a `ScrollableCardsLayoutContainer` (horizontal scroll). CRD ports this behavior: each resource section (Hosted Spaces, Virtual Contributors, Spaces Leading, Member Of) renders **all** its items in a CRD card grid with no "Show more" affordance, no Next/Previous controls, no infinite scroll. The grid handles overflow via standard page scrolling. The section is omitted entirely when its item count is zero (FR-015). If the data ever explodes (1000+ items), pagination becomes a separate future enhancement; for the migration scope, parity with current MUI is the rule.
- Q: My Profile Identity / About You / Social Links — exact field set? → A: **Mirror current MUI `UserForm` exactly.** Identity: **Display Name** (`profile.displayName`, required), **First Name** (`User.firstName`, required), **Last Name** (`User.lastName`, required), **Email** (`User.email`, read-only — managed by Kratos), **Phone** (`User.phone`, validated against the existing phone regex). About You: **Tagline** (`profile.tagline`), **City** (`profile.location.city`), **Country** (`profile.location.country`, select from the existing `COUNTRIES` list), **Bio** (`profile.description`, markdown via the existing CRD `@/crd/forms/markdown/MarkdownEditor`), **Tags** (`profile.tagsets`). Social Links: **LinkedIn**, **Bluesky** (replaces the prototype's Twitter — current MUI has bsky, not Twitter), **GitHub** as the three recognized social references; plus the existing **arbitrary references** list (each with name + URL + description) for everything else (Personal Website, etc.) — same structure the current MUI `UserForm` exposes via `referenceSegmentWithSocialSchema`. The prototype's "Organization" input is **dropped** because no backing field exists on `User`.
- Q: Who can access another user's `/user/<slug>/settings/*` tabs? → A: **Owner OR platform admin only — both with full edit access. Everyone else is redirected.** The CRD settings routes drop the legacy "read-only-for-other-viewers" branch entirely. There is no read-only mode anywhere in the settings shell. Effective canonical predicate: `canEditSettings = (currentUser.id === profileUser.id) || currentUserHasPlatformAdminPrivilege`. Non-owner non-admin viewers hitting any `/user/<other>/settings/*` URL are redirected to the public profile (`/user/<other>`). When `canEditSettings` is true the entire settings shell renders with every input enabled, every action visible, and the Security tab present (Security still requires the user's own Kratos session and therefore is auto-hidden when the admin is editing someone else's profile, since Kratos can only mutate the currently-authenticated identity — see FR-093a).
- Q: My Profile per-field save failure — does the field stay in edit mode with the typed value, or revert to idle? → A: **Stay in edit mode with the typed value preserved.** On a failed per-field save mutation (network error, server validation rejection, etc.) the field does NOT return to idle and does NOT auto-revert to the server value; the user's input remains live in the editor and an inline error message appears beneath the input. The error persists until the user (a) clicks Save again to retry, or (b) clicks Cancel / presses Escape to discard the typed value and revert to the last server value. This keeps retry friction-free — the user never has to retype after a transient failure.
- Q: Settings (gear) icon on the public-profile hero — owner-only, or also visible to platform admins on other users' profiles? → A: **Owner OR platform admin.** The Settings icon mirrors the same `canEditSettings = (currentUser.id === profileUser.id) || currentUserHasPlatformAdminPrivilege` predicate used by FR-008a — visible for the profile owner AND for any platform-admin viewer of someone else's profile. This removes the inconsistency between FR-011 and FR-008a (an admin who can fully edit `/user/<other>/settings/*` should be able to one-click into it from the public profile, not have to type the URL or detour through `/admin/users`). Same icon, same destination (`/user/:userSlug/settings/profile`); for an admin, it links to the target user's settings, not their own. The Message button stays visible for the admin too, since admins can also message other users — so an admin viewing a non-self public profile sees BOTH the Settings icon and the Message button in the hero.
- Q: Tab strip overflow on small viewports — how do the 7 settings tabs and the 5 public-profile resource tabs behave below `md`? → A: **Horizontal scroll on both strips.** For viewports below the `md` breakpoint, every tab remains rendered inline; the strip itself overflows and is horizontally scrollable (touch swipe, wheel, or trackpad gesture) using `overflow-x-auto no-scrollbar` (matching the prototype's existing approach on the resource strip). The active tab MUST be auto-scrolled into view on mount and on tab change so it never starts off-screen. No dropdown / hamburger / two-row wrap variant is introduced — both strips share the exact same responsive behavior so the visual identity stays consistent across the user pages.

## User Scenarios & Testing

**The public User Profile page and all seven User Settings tabs ship together in a single release (FR-001 / FR-002).** No tab is migrated in isolation — when CRD is enabled, the entire user vertical renders in CRD; when CRD is disabled, the entire vertical renders in MUI. The priority labels below are P1 throughout for traceability; each user story is independently testable within its own page.

### User Story 1 - Public User Profile Page (Priority: P1)

Anyone with access to the platform opens `/user/:userSlug` and sees a public profile of that user, replacing the current MUI `UserProfilePage` with a CRD shell. The page presents:

- A **profile hero**: a wide banner image (using `pickColorFromId` for a deterministic gradient fallback when no banner is set), the user's avatar overlaid on the banner, the user's display name, a short location line (city + country), and — when the viewer satisfies `canEditSettings` (the profile owner OR a platform admin) — a **Settings** icon button that links to `/user/:userSlug/settings/profile` for the profile being viewed. There is no online-presence dot in this iteration (the prototype's mock dot is dropped); presence remains a future enhancement.
- A **left sidebar** (`col-span-2` on `lg+`, hidden on smaller viewports) showing two sections: an **About** block rendering the user's bio (`profile.description`, markdown) and an **Organizations** block listing the user's associated organizations as compact `OrganizationCard` rows (logo, name, role, member count) — same data the current MUI `AssociatedOrganizationsLazilyFetched` consumes.
- A **right column** (8 cols) with a sticky **resource tab strip**: All Resources, Hosted Spaces, Virtual Contributors, Leading, Member Of. The default active tab is "All Resources". Each tab filters the visible resource sections. On viewports below `md` the strip is horizontally scrollable (`overflow-x-auto no-scrollbar`); all five tabs stay inline and the active tab auto-scrolls into view.
- Below the tab strip the page renders, depending on the active tab:
  - **Resources Hosted** — a section combining the user's hosted spaces (rendered as the same reusable CRD space-card the Explore Spaces feature consumes) and the user's hosted virtual contributors (rendered as `Sparkles`-iconed cards with name, description, type badge).
  - **Spaces Leading** — spaces in which the user holds the `lead` role (host, admin, lead per `useFilteredMemberships`), rendered as space-cards.
  - **Member Of** — remaining memberships, rendered as space-cards.

If the user has no hosted resources / no leading spaces / no memberships, the corresponding section either renders an empty-state message ("No memberships yet") or is omitted, mirroring the current MUI behavior.

The page is **read-only**: there is no editing capability anywhere on the public profile. Editing happens exclusively in `/user/:userSlug/settings/*` (User Stories 2–8).

The page also includes a **Message** button in the hero. When the viewer is signed in and is **not** the profile owner, clicking Message opens an in-hero compose surface (a small popover or inline textarea); submitting fires the existing `useSendMessageToUsersMutation` against this user as recipient — same handler shape as the current MUI `UserPageBanner.handleSendMessage`. The Message button is hidden on the user's own profile and on every settings tab.

**Independent Test**: Toggle CRD on. Open `/user/jeroen`. Verify the hero, the bio, the organizations list, the sticky tab strip with All Resources active, and the rendered space cards. Click each tab — only the matching sections render. Confirm the Settings icon button is visible when viewing your own profile (links to `/user/<self>/settings/profile`) AND when a platform admin views another user's profile (links to `/user/<otherUser>/settings/profile`); for non-admin viewers on someone else's profile, the Settings icon is hidden. Confirm the Message button is visible on other users' profiles (for any signed-in viewer, including admins) and hidden on your own.

**Acceptance Scenarios**:

1. **Given** any signed-in user opens `/user/<otherUser>`, **When** the page renders, **Then** the CRD hero, bio, organizations sidebar, sticky tab strip (All Resources active), and the user's hosted/leading/member space sections are visible.
2. **Given** the viewer is on their own profile, **When** the hero renders, **Then** a Settings icon button is visible and a Message button is **not** visible.
3. **Given** a non-admin viewer is on someone else's profile, **When** the hero renders, **Then** the Message button is visible and the Settings icon button is **not** visible.
3a. **Given** a platform-admin viewer is on someone else's profile, **When** the hero renders, **Then** **both** the Message button **and** the Settings icon button are visible; clicking the Settings icon navigates to `/user/<otherUser>/settings/profile` (the target user's settings, not the admin's own).
4. **Given** the user has no hosted resources, **When** the All Resources tab is active, **Then** the Resources Hosted section is omitted (empty section is not rendered).
5. **Given** the user has no leading spaces, **When** the Leading tab is active, **Then** an empty-state message is rendered.
6. **Given** any user opens the public profile, **When** the hero renders, **Then** **no** online-presence dot is shown (parity with current MUI).
7. **Given** CRD is disabled via the localStorage toggle, **When** the page is opened, **Then** the existing MUI `UserProfilePage` renders unchanged.

---

### User Story 2 - My Profile Settings Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/profile` (the default landing tab of `/user/<self>/settings`) and sees a CRD restyle of the current MUI `UserAdminProfilePage`. The shell consists of a **sticky settings header** containing the user's avatar + display name and a **horizontal tab strip** in this exact order: **My Profile, Account, Membership, Organizations, Notifications, Settings, Security** — each entry a `lucide-react` icon + uppercase label. The active tab is highlighted with a `border-primary` underline. On viewports below `md` the strip is horizontally scrollable (`overflow-x-auto no-scrollbar`); all seven tabs stay inline (no dropdown / hamburger collapse) and the active tab auto-scrolls into view on mount and on every tab change.

The body of the My Profile tab is a two-column layout on `lg+` (form on the left, profile picture preview on the right) and a single column on smaller viewports. The form section is divided into three subsections, each prefaced by a primary-colored icon and a bottom-bordered title. **Field set mirrors the current MUI `UserForm` exactly** (see Clarifications, 2026-04-29):

- **Identity** — **Display Name** (`profile.displayName`, required, validated via `displayNameValidator`), **First Name** (`User.firstName`, required, validated via `nameValidator`), **Last Name** (`User.lastName`, required), **Email** (`User.email`, read-only with a "Contact support to change email" caption — email is managed by Kratos), **Phone** (`User.phone`, validated against the existing phone-format regex).
- **About You** — **Tagline** (`profile.tagline`, length-validated via `textLengthValidator({ maxLength: ALT_TEXT_LENGTH })`), **City** (`profile.location.city`, length-validated), **Country** (`profile.location.country`, single-select against the existing `COUNTRIES` list), **Bio** (`profile.description`, markdown via the existing CRD `@/crd/forms/markdown/MarkdownEditor` with `MarkdownValidator(MARKDOWN_TEXT_LENGTH)`), **Tags** (`profile.tagsets`, with the existing tagset add / remove affordance).
- **Social Links / References** — three **recognized** social references rendered with their brand icon-tile + URL input: **LinkedIn**, **Bluesky** (`bsky`), **GitHub**. These are stored as references with the well-known names (`linkedin`, `bsky`, `github`) and resolved exactly the way the current MUI `UserForm` resolves them (`references.find(x => x.name.toLowerCase() === SocialNetworkEnum.<key>)`). Below the three recognized rows, an **arbitrary references** list shows every other `profile.references[]` entry (name + URL + description), with an **Add Another Reference** button to append a new generic row. The prototype's "Organization" input is **not present** (it has no backing field on `User`); the prototype's "Twitter / X" tile is **not present** (current MUI has Bluesky in its place). Reference CRUD reuses the existing `createReferenceOnProfile` / `updateReference` / `deleteReference` mutations.

The right column shows a **profile picture preview**: a large circular avatar of the current uploaded image, the user's display name + tagline, a "Change Avatar" button that opens the existing avatar upload + crop flow, and a "Recommended: 400x400px. JPG, PNG or GIF." helper line.

**Save model — per-field with explicit save (no autosave, no tab-wide Save bar).** Each editable field commits independently:

- The value renders as plain text (or the input wrapper's idle state) by default. Hovering an editable field reveals a subtle pencil affordance; clicking the field (or the pencil) puts that field into **edit mode**: the input becomes interactive and a **Save** (check icon) and **Cancel** (× icon) appear next to it.
- Clicking **Save** fires the per-field mutation immediately (`updateUser` for `firstName` / `lastName` / `profile.displayName` / `profile.tagline` / `profile.description` / `profile.location.{city,country}` / `email`-via-Kratos out of scope; one targeted mutation call per saved field, with the rest of the user payload preserved). On success the field returns to idle with a transient grayed-out "Saved" indicator next to the field label for ~2 seconds. **On failure the field stays in edit mode with the user's typed value preserved (no auto-revert)**, and an inline error appears beneath the input; the user retries by clicking Save again or discards by clicking Cancel (or pressing Escape) to revert to the last server value.
- Clicking **Cancel** (or pressing Escape inside the input) reverts the field to its last server value with no mutation.
- Pressing **Enter** inside a single-line input is equivalent to clicking Save; pressing **Escape** is equivalent to clicking Cancel. The Bio rich-text editor is the only exception — Enter inserts a newline, so the only way to commit Bio is the Save icon and the only way to discard it is the Cancel icon.
- **Social Links / References**: each existing reference row has the same per-field Save / Cancel affordance on the URL input. The **Add Another Reference** button creates a new row already in edit mode; clicking Save creates the reference (`createReferenceOnProfile`); clicking Cancel removes the unsaved row without a mutation. The trash icon on a saved reference fires `deleteReference` immediately (no confirmation dialog — references are cheap to recreate).
- **Avatar / Banner / Card-banner uploads** also commit immediately on file-select (the act of selecting a file is the explicit commit) — they have no separate Save click because the file-picker dialog itself is the confirmation step.

Because there is no tab-wide dirty buffer, **switching tabs never blocks the navigation**. If the user navigates away while a single field is mid-edit (input still focused, unsaved value typed), that pending edit is **silently dropped** — no mutation fires, no confirmation dialog appears, and the next time the user returns to the field it shows the last server value. This is parity with how the rest of the User Settings area behaves (Notifications / Settings / Membership all commit per-control immediately and never block tab navigation).

**Access**: only the profile owner OR a platform admin can open `/user/<slug>/settings/profile`. Non-owner non-admin viewers are redirected to the public profile page (`/user/<slug>`). Both authorized viewer types (owner and admin) see the same fully editable form — there is no separate read-only mode. When a platform admin edits another user's profile, the per-field saves call the same `updateUser` mutation against that user's id; the form behaves identically to the owner's view.

**Independent Test**: Open `/user/<self>/settings/profile`. Hover First Name — pencil appears. Click into it, edit, click the green check — the change persists immediately (verify via reload). Repeat with Tagline, then start editing Bio and click another tab — the edit is silently abandoned and tab navigation completes with no dialog. Add a new LinkedIn reference via Add Another Reference, click Save on the row — reference appears on the public profile page after reload. Click trash on a reference — it disappears immediately (no confirmation). Upload a new avatar — preview updates immediately without a Save click.

**Acceptance Scenarios**:

1. **Given** the owner opens `/user/<self>/settings/profile`, **When** the page renders, **Then** the sticky header with all 7 tabs is shown, the My Profile tab is active, and the form sections (Identity / About You / Social Links) plus the right-column profile picture preview are visible. There is no tab-wide Save Changes or Discard Changes button anywhere on the tab.
2. **Given** the owner hovers any editable field, **When** they hover, **Then** a subtle pencil edit affordance appears trailing the field; clicking the field or the pencil enters edit mode and reveals Save (check) + Cancel (×) icons next to the input.
3. **Given** a field is in edit mode, **When** the owner clicks Save (or presses Enter on a single-line input), **Then** the per-field `updateUser` mutation fires, the field returns to idle on success with a transient "Saved" indicator next to the label, and the new value is reflected on reload.
4. **Given** a field is in edit mode, **When** the owner clicks Cancel (or presses Escape), **Then** the field reverts to its last server value and no mutation fires.
5. **Given** the owner adds a new social reference, **When** they click Save on the new row, **Then** `createReferenceOnProfile` fires and the reference appears on the public profile page after reload.
6. **Given** the owner clicks the trash icon on an existing reference, **When** they click, **Then** `deleteReference` fires immediately and the row disappears (no confirmation dialog).
7. **Given** the owner uploads a new avatar via the right-column "Change Avatar" button, **When** the upload completes, **Then** the avatar updates immediately without an additional Save click and the preview reflects the new image.
8. **Given** the owner is mid-edit on any field, **When** they click another tab in the strip, **Then** the navigation completes immediately, the in-progress edit is silently dropped, and **no confirmation dialog appears**.
9. **Given** a platform admin viewer opens `/user/<otherUser>/settings/profile`, **When** the page renders, **Then** the form is fully editable; per-field saves persist against the target user's id.
10. **Given** a non-owner non-admin viewer opens `/user/<otherUser>/settings/profile`, **When** the route resolves, **Then** the app redirects to `/user/<otherUser>` (public profile) — the settings tab never renders.

---

### User Story 3 - Account Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/account` and sees a CRD restyle of the current MUI `UserAdminAccountPage`. The Account tab is a **parity-only restyle** — every field, action, and permission is preserved exactly as today; no new affordances or backend capabilities are introduced.

The body is a single 12-column section divided into four card groups, each with the prototype's icon + heading treatment:

- **Hosted Spaces** — list of L0 spaces this user hosts (existing `useUserAccountQuery` + `useAccountInformationQuery` data), rendered as horizontal cards with avatar, name, description, and a kebab menu offering the existing actions (View, Manage, etc. as today's `ContributorAccountView`).
- **Virtual Contributors** — list of VCs the user owns, with a "Create Virtual Contributor" button (existing flow).
- **Innovation Packs / Template Packs** — the user's owned innovation packs (existing flow, including the "Create Innovation Pack" entry point).
- **Custom Homepages / Innovation Hubs** — the user's owned innovation hubs (existing flow, including "Create Innovation Hub").

A **Help text** info-banner sits at the top of the page reading: "Here you can view your active resources and manage your account allocation limits." (parity with the prototype).

All capabilities — create / edit / delete / transfer-ownership of any account-owned resource — are preserved via the **existing** mutations (`createSpace`, `createInnovationPack`, `createInnovationHub`, `createVirtualContributor`, etc.). The CRD layer wraps the same `useAccountInformation` and `ContributorAccountView` hooks; only the visual shell changes.

**Access**: owner or platform admin only. Non-owner non-admin viewers are redirected to the public profile.

**Independent Test**: Open `/user/<self>/settings/account`. Confirm the four card groups render with the user's hosted spaces / VCs / packs / hubs. Click "Create Virtual Contributor" — the existing creation flow runs. Click a hosted space's kebab → Manage — the existing manage flow runs.

**Acceptance Scenarios**:

1. **Given** the owner opens the Account tab, **When** the page renders, **Then** the Help banner and the four card groups (Hosted Spaces, Virtual Contributors, Innovation Packs, Custom Homepages) are visible with the user's existing resources.
2. **Given** the owner clicks Create Virtual Contributor / Create Innovation Pack / Create Innovation Hub, **When** they click, **Then** the existing creation flow opens (no new behavior introduced).
3. **Given** the owner clicks a resource's kebab and picks an action, **When** they confirm, **Then** the existing action runs (no new behavior introduced).
4. **Given** a platform admin opens `/user/<otherUser>/settings/account`, **When** the page renders, **Then** every action is fully enabled and operates on the target user's account. **Given** a non-owner non-admin opens the URL, **When** the route resolves, **Then** the app redirects to `/user/<otherUser>` (public profile).

---

### User Story 4 - Membership Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/membership` and sees a CRD restyle of the current MUI `UserAdminMembershipPage`. Sections (parity with the current MUI page):

- **Home Space** card — a single-select dropdown of every L0 space the user is a member of (sourced from `useUserContributionsQuery`), and an **Auto-redirect to home space on login** checkbox. Selecting a Home Space fires `updateUserSettings` immediately. The Auto-redirect checkbox is disabled until a Home Space is selected; when disabled, a caption explains why ("Select a home space to enable auto-redirect"). A spinner replaces the checkbox while the mutation is in flight. **No new behavior introduced.**
- **My Memberships** table — a paginated list (~10 rows visible) of every space and subspace the user is a member of. Columns: name + avatar, type (Space / Subspace), description, role, member count, status (Active / Archived), actions. Above the table: a search input filtering by name and a filter dropdown (All / Spaces / Subspaces / Active / Archived) — added from the prototype as a UX improvement, but no new server-side filtering is introduced; both filter and search are client-side over the already-fetched list. The kebab menu on each row offers a single **Leave** action (existing `useLeaveCommunityMutation` flow) preceded by a CRD confirmation dialog. Clicking a row's name navigates to that space (same behavior as today).
- **Pending Applications** table (separate section below My Memberships) — list of community applications the user has submitted that are still pending, sourced from the existing `useUserPendingMembershipsQuery`. Each row shows the space name, application date, and status. **No actions** on this table (read-only — parity with current MUI).

All mutations fire immediately on action confirmation; there is no Save / Reset bar on this tab.

**Access**: owner or platform admin only. Non-owner non-admin viewers are redirected to the public profile. Both authorized viewer types see the same fully editable controls; there is no read-only fallback.

**Independent Test**: Open `/user/<self>/settings/membership`. Pick a Home Space — the dropdown updates, mutation fires. Tick Auto-redirect — checkbox commits. Search "Garden" in the memberships table — the list filters client-side. Open a row's kebab → Leave — confirmation dialog appears; confirm — the membership is removed from the list. Confirm the Pending Applications table renders below with no kebab menu.

**Acceptance Scenarios**:

1. **Given** the owner opens the Membership tab, **When** the page renders, **Then** the Home Space card, the My Memberships table (~10 rows visible), and the Pending Applications table are all visible.
2. **Given** the owner picks a Home Space from the dropdown, **When** they pick, **Then** `updateUserSettings` fires immediately and a spinner is shown until it completes.
3. **Given** a Home Space is selected, **When** the owner ticks Auto-redirect, **Then** the change persists via `updateUserSettings`.
4. **Given** no Home Space is selected, **When** the owner inspects Auto-redirect, **Then** the checkbox is disabled and a caption explains why.
5. **Given** the owner types in the search input, **When** they type, **Then** the visible memberships filter client-side by name; pagination state is reset to page 1.
6. **Given** the owner clicks Leave on a membership row, **When** they confirm the CRD confirmation dialog, **Then** `useLeaveCommunityMutation` fires and the row disappears from the list.
7. **Given** the owner cancels the Leave confirmation, **When** they click Cancel or press Escape, **Then** no mutation fires.
8. **Given** the user has pending applications, **When** the page renders, **Then** the Pending Applications table lists them as read-only rows (no kebab).

---

### User Story 5 - Organizations Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/organizations` and sees a CRD restyle of the current MUI `UserAdminOrganizationsPage`. The body shows a table / grid of organizations the user is associated with (sourced from `useUserOrganizationIds` + the existing `AssociatedOrganizationsLazilyFetched` data path), with these visible attributes per row: organization avatar, name, description, location, role (Admin / Associate), associates count, verified badge, website link.

Above the list: a **search** input filtering organizations by name client-side (added from the prototype), and — when the current user has the `CreateOrganization` platform privilege — a **Create Organization** button that opens the existing organization creation dialog. Each row's kebab menu offers a **Leave** action (existing flow) preceded by a CRD confirmation dialog. Clicking the organization name navigates to its profile page. **No new behaviors introduced** beyond the search affordance and the visual restyle.

**Access**: owner or platform admin only. Non-owner non-admin viewers are redirected to the public profile. Both authorized viewer types see Create Organization (gated by privilege) and Leave actions enabled.

**Independent Test**: Open `/user/<self>/settings/organizations`. Confirm associated organizations render. Search "Alkemio" — list filters client-side. Click Create Organization (if privileged) — the existing creation flow runs. Open a row's kebab → Leave — confirmation dialog appears; confirm — the organization is removed from the list.

**Acceptance Scenarios**:

1. **Given** the owner opens the Organizations tab, **When** the page renders, **Then** the user's associated organizations are listed with avatar / name / location / role / associates / verified badge.
2. **Given** the owner has the `CreateOrganization` privilege, **When** the page renders, **Then** the Create Organization button is visible.
3. **Given** the owner does not have the `CreateOrganization` privilege, **When** the page renders, **Then** the Create Organization button is hidden (parity with current MUI).
4. **Given** the owner types in the search input, **When** they type, **Then** the visible organizations filter client-side by name.
5. **Given** the owner clicks Leave on a row, **When** they confirm the CRD confirmation dialog, **Then** the existing leave-organization mutation fires and the row disappears.
6. **Given** the owner clicks the organization name, **When** they click, **Then** the app navigates to that organization's profile.

---

### User Story 6 - Notifications Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/notifications` and sees a CRD restyle of the current MUI `UserAdminNotificationsPage`. **Every notification group, property, and channel the current MUI page exposes is preserved** — no notification rule is added or removed. The CRD restyle's only changes are visual: the existing `SwitchSettingsGroup` MUI tables are replaced with CRD cards using `Switch` primitives and the prototype's section layout.

Sections (parity with the current MUI):

- **Push Notifications master toggle** — a single `Switch` to subscribe / unsubscribe via the existing `usePushNotificationContext` (subscribe/unsubscribe functions). When push is unavailable (browser unsupported, requires PWA mode, or private browsing) the section renders an info banner instead of the toggle, matching current MUI logic exactly. Below the master toggle, the **Push Subscriptions List** card shows the user's currently registered push subscriptions (existing `PushSubscriptionsList` component, restyled).
- **Space Notifications** card — every property the current MUI exposes (`communicationUpdates`, `collaborationCalloutPublished`, `collaborationCalloutPostContributionComment`, `collaborationCalloutContributionCreated`, `collaborationCalloutComment`, `communityCalendarEvents`, all `collaborationPoll*`), each as a row with three `Switch`es (inApp, email, push). Push column is hidden / disabled when push is unavailable.
- **Space Admin Notifications** card — `communityApplicationReceived`, `communityNewMember`, `collaborationCalloutContributionCreated`, `communicationMessageReceived`. Visible only when the current user has the `ReceiveNotificationsSpaceAdmin` or `ReceiveNotificationsSpaceLead` privilege, or is a Platform Admin (parity with current MUI gating).
- **User Notifications** card — `commentReply`, `mentioned`, `messageReceived`, `membership.spaceCommunityInvitationReceived`, `membership.spaceCommunityJoined`.
- **Platform Notifications** card — `forumDiscussionComment`, `forumDiscussionCreated`.
- **Platform Admin Notifications** card — `userProfileCreated`, `userProfileRemoved`, `userGlobalRoleChanged`, `spaceCreated`. Visible only when the current user is a Platform Admin (parity with current MUI gating).
- **Organization Notifications** card — `adminMentioned`, `adminMessageReceived`. Visible only when the current user has `ReceiveNotificationsOrganizationAdmin` or is a Platform Admin (parity with current MUI gating).
- **Virtual Contributor Notifications** card — `adminSpaceCommunityInvitation`.

Every toggle commits its change via the existing `updateUserSettings` mutation immediately, with the same **optimistic-overrides** pattern the current MUI uses (the UI flips immediately, then resyncs from the refetch). There is no Save / Reset bar on this tab.

**Access**: owner or platform admin only. Non-owner non-admin viewers are redirected to the public profile. Both authorized viewer types see every privilege-applicable Switch enabled and operating on the target user's settings.

**Independent Test**: Open `/user/<self>/settings/notifications`. Flip an email toggle in Space Notifications — the UI updates immediately and persists after reload. Flip the push master toggle — the browser permission prompt fires. Confirm Space Admin / Platform Admin / Organization sections appear only with the appropriate privileges. Confirm the layout matches the prototype's card-grouped style.

**Acceptance Scenarios**:

1. **Given** the owner opens the Notifications tab, **When** the page renders, **Then** all notification cards visible to that user's privilege set are shown with one row per property and three `Switch` columns (inApp, email, push).
2. **Given** the owner flips any switch, **When** they flip it, **Then** the UI updates optimistically, `updateUserSettings` fires, and the value persists after reload.
3. **Given** the owner flips the push master toggle to ON, **When** they confirm browser permission, **Then** `pushSubscribe` runs and the subscription appears in the Push Subscriptions List.
4. **Given** the owner is not a Space / Platform / Organization admin, **When** the page renders, **Then** the Space Admin / Platform Admin / Organization Notifications cards are hidden.
5. **Given** push is unavailable in the current browser, **When** the page renders, **Then** the master toggle is replaced by an info banner and every push column is hidden across every card.
6. **Given** a non-owner non-admin viewer opens `/user/<otherUser>/settings/notifications`, **When** the route resolves, **Then** the app redirects to `/user/<otherUser>` (public profile).

---

### User Story 7 - Settings Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/settings` (or `/general` per prototype URL) and sees a CRD restyle of the current MUI `UserAdminSettingsPage`. The page renders two cards (parity with current MUI):

- **Communication & Privacy** — a `Switch` for "Allow other users to send me messages" (binds to `settings.communication.allowOtherUsersToSendMessages` via the existing `updateUserSettings` mutation). Future privacy / communication toggles introduced by the backend will land here without needing a CRD spec change.
- **Design System** — the `alkemio-crd-enabled` localStorage toggle. When flipped, the value is written / removed and `location.reload()` is called (parity with current MUI behavior). A short caption explains "Switch between the new (CRD) and the previous (MUI) design system. The page will reload after the change."

Each toggle commits its change immediately. There is no Save / Reset bar on this tab.

**Access**: owner or platform admin only. Non-owner non-admin viewers are redirected to the public profile. Note: the Design System switch is **always tied to the viewer's own browser localStorage**, so even a platform admin viewing another user's settings sees their **own** CRD/MUI toggle state, not the target user's preference (the toggle is a viewer-scoped preference, not a stored user attribute).

**Independent Test**: Open `/user/<self>/settings/settings`. Flip the messages-from-others switch — the change persists after reload. Flip the Design System switch off — the page reloads in MUI mode. Flip it on again from the equivalent MUI page — the page reloads back into CRD mode.

**Acceptance Scenarios**:

1. **Given** the owner opens the Settings tab, **When** the page renders, **Then** the Communication & Privacy and Design System cards are visible with their current values.
2. **Given** the owner flips the messages switch, **When** they flip, **Then** `updateUserSettings` fires immediately with `communication.allowOtherUsersToSendMessages` set to the new value.
3. **Given** the owner flips the Design System switch off, **When** they flip, **Then** `localStorage.removeItem('alkemio-crd-enabled')` is called and the page reloads into MUI.
4. **Given** the owner flips the Design System switch on (from MUI), **When** they flip, **Then** `localStorage.setItem('alkemio-crd-enabled', 'true')` is called and the page reloads into CRD.

---

### User Story 8 - Security Tab (Priority: P1)

The profile owner opens `/user/<self>/settings/security` and sees a CRD restyle of the current MUI `UserSecuritySettingsPage`. **The Security tab is not in the prototype** — the prototype's six-tab strip (Profile, Account, Membership, Organizations, Notifications, Settings) omits it. CRD nevertheless ships a Security tab to maintain feature parity with the existing MUI page; passkey / WebAuthn management is a current capability that must not regress in the CRD release.

The page renders the Kratos `settings` flow exactly as the current MUI does: a `KratosForm` wrapper around `KratosUI`, with the same `REMOVED_FIELDS` filter that hides password change, profile fields, and OIDC link / unlink (those are managed elsewhere). Only WebAuthn / Passkey nodes are surfaced. When the flow contains no WebAuthn nodes, an info alert reads "WebAuthn / Passkey is not enabled on this account" (existing copy). On flow load error, the existing `ErrorDisplay` is shown.

The page styling adopts the CRD card / heading treatment used by the other settings tabs (heading + bottom-bordered title + body) but the Kratos UI markup itself is unchanged — Kratos renders its own form fields, and CRD does not restyle them in this iteration.

**Access**: profile owner only. Even a platform admin viewing another user's settings does **not** see this tab — Kratos can only mutate the currently-authenticated identity, so a passkey form for "another user" is technically meaningless. When a platform admin is editing another user's profile, the tab strip omits Security and the route `/user/<other>/settings/security` redirects to `/user/<other>/settings/profile`.

**Independent Test**: Open `/user/<self>/settings/security`. Confirm the Kratos passkey form renders. Add a passkey via the existing flow. As a platform admin, open `/user/<otherUser>/settings/security` — the route redirects to `/user/<otherUser>/settings/profile`.

**Acceptance Scenarios**:

1. **Given** the owner opens the Security tab, **When** the page renders, **Then** the Kratos settings flow loads and only WebAuthn / Passkey controls are surfaced (password / profile / OIDC link controls are hidden).
2. **Given** the Kratos flow contains no WebAuthn nodes, **When** the page renders, **Then** an info alert reads "WebAuthn / Passkey is not enabled on this account".
3. **Given** the Kratos flow fails to load, **When** the error is caught, **Then** the existing `ErrorDisplay` is shown.
4. **Given** any viewer who is not the profile owner (including a platform admin), **When** the tab strip renders, **Then** the Security tab is hidden; visiting `/user/<other>/settings/security` directly redirects to `/user/<other>/settings/profile`.

---

### Edge Cases

- **Unauthenticated viewer on a public profile**: the public profile (User Story 1) loads as today; the Settings icon button is hidden, the Message button is hidden (no signed-in identity to send from). Settings routes (User Stories 2–8) redirect to login via the existing `NoIdentityRedirect` wrapper.
- **Signed-in non-owner non-admin hits a settings URL**: the route guard (FR-008a) redirects them to `/user/<slug>` (the target user's public profile) — no flash of disabled form, no error page.
- **CRD toggled off mid-session**: the Settings tab's Design System switch reloads the page; the user lands on the equivalent MUI page. URL stays the same; routing matches the MUI handler.
- **My Profile mid-edit + tab switch**: there is no tab-wide dirty buffer. When the user is mid-edit on a single field and navigates away (tab click, link click, browser back), the in-progress value is silently dropped — no confirmation dialog appears. This is intentional: every other edit mechanism on My Profile is per-field-explicit-save, so an unconfirmed value has no claim to persistence.
- **Avatar upload failure**: the existing upload error flow surfaces a CRD `Toast` with the error message; the preview reverts to the previous avatar.
- **My Profile per-field save failure**: the field stays in edit mode with the user's typed value preserved (no auto-revert), and an inline error message appears beneath the input. The user can correct the input and click Save again (retry) without retyping, or click Cancel / press Escape to discard and revert to the last server value. The error indicator clears the next time the user enters edit mode after a successful save or discard.
- **Reference (social link) URL validation**: malformed URLs surface an inline error on the URL input; the per-row Save button is disabled while the URL is invalid (parity with current MUI `UserForm` validation).
- **Notifications: push permission denied**: the master toggle reverts to OFF, an inline alert reads "Browser blocked push permission. Update your browser settings to enable." (parity with current MUI behavior).
- **Notifications: server returns updated state different from optimistic value**: the optimistic override is cleared after the refetch and the UI re-renders to the authoritative server value.
- **Public profile URL with stale `nameID`**: the existing redirect logic in `useUserProvider` resolves the canonical URL; CRD reuses the same hook.
- **Viewing your own profile via the `/me` shorthand**: `/user/me` resolves to the current user's profile page (existing `UserMeRoute` behavior), then renders the public profile. The Settings icon links to `/user/me/settings/profile`.
- **Long lists**: My Memberships, Organizations, and the Notifications matrix scroll within their own card body without breaking the sticky tab strip.
- **Authorization at the settings shell**: the canonical predicate is `canEditSettings = currentUser.id === profileUser.id || currentUserHasPlatformAdminPrivilege`. The shell evaluates this once at route-resolution and either renders fully editable settings or redirects the viewer to `/user/<slug>` (the public profile). There is no read-only fallback. The Security tab is owner-only regardless of admin status (Kratos session constraint).
- **Platform admin editing another user**: every per-field save / per-toggle commit calls the same mutation against the target user's id. The schema and resolvers already authorize platform admins to mutate any user (current MUI relies on this; CRD does not change it). If the resolver rejects (privilege revoked mid-session, etc.), the inline error appears next to the affected field exactly as it would for the owner case.

## Requirements

### Functional Requirements

#### Migration scope and routing

- **FR-001**: System MUST render the public **User Profile** page (`/user/:userSlug`) and all seven **User Settings** tabs (`/user/:userSlug/settings/{profile,account,membership,organizations,notifications,settings,security}`) in CRD when `localStorage('alkemio-crd-enabled')` is `'true'`.
- **FR-002**: System MUST render the existing MUI `UserProfilePage` and `UserAdminRoute` pages unchanged when `localStorage('alkemio-crd-enabled')` is unset or any other value (default OFF).
- **FR-003**: System MUST gate the CRD vs. MUI choice via `useCrdEnabled` and add a conditional block in `TopLevelRoutes.tsx` exactly as documented in `docs/crd/migration-guide.md` (lazy-loaded chunks for both versions; only the active chunk is fetched).
- **FR-004**: System MUST keep the existing MUI page files in `src/domain/community/user/userProfilePage/`, `src/domain/community/userAdmin/`, and the wiring in `src/domain/community/user/routing/UserRoute.tsx` in place; CRD pages live under a new `src/main/crdPages/userPages/` directory with one subfolder per page (public profile + 7 settings tabs).
- **FR-005**: CRD page components MUST NOT import from `@mui/*` or `@emotion/*` and MUST NOT import GraphQL-generated types directly into views; data mappers in `src/main/crdPages/userPages/<page>/dataMapper.ts` are the only place GraphQL types meet CRD prop types.
- **FR-006**: CRD components in `src/crd/components/user/` MUST be presentational only (zero `@mui/*` imports, zero GraphQL-type imports, all behavior received as `on*` callback props per the CRD architectural rules in `src/crd/CLAUDE.md`).
- **FR-007**: System MUST resolve `/user/me/*` to the current user's settings exactly as the current MUI `UserMeRoute` does — both routing variants (`/user/me/settings/...` and `/user/<slug>/settings/...`) MUST be supported by the CRD wiring.
- **FR-008**: System MUST honor the existing `NoIdentityRedirect` wrapper on the `/user/*` route so anonymous users hitting any settings route are redirected to login. The public profile page MUST be reachable without authentication (parity with current MUI).
- **FR-008a**: System MUST evaluate `canEditSettings = currentUser.id === profileUser.id || hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin)` at the settings-shell route boundary, where the platform-admin check is the canonical `AuthorizationPrivilege.PlatformAdmin` predicate already used by the current MUI (`UserAdminNotificationsPage` line 172 — `userWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin)`). When `canEditSettings` is `false`, every `/user/<slug>/settings/*` URL MUST redirect to `/user/<slug>` (the public profile page). When `true`, the shell MUST render the requested tab with every control fully enabled — there is no read-only mode anywhere in the CRD settings shell.

#### Public profile page (User Story 1)

- **FR-010**: The public profile hero MUST render the user's banner (or a deterministic gradient fallback computed via `pickColorFromId` from `@/crd/lib/pickColorFromId`), avatar, display name, and location line. The hero MUST NOT render an online-presence indicator (parity with current MUI; the prototype's mock dot is intentionally dropped).
- **FR-011**: The public profile hero MUST show a Settings icon button linking to `/user/:userSlug/settings/profile` (the profile being viewed) when the viewer satisfies the `canEditSettings` predicate from FR-008a — i.e., the profile owner OR a platform admin. The icon MUST be hidden for every other viewer (non-owner non-admin signed-in viewers, anonymous viewers). For admin viewers on another user's profile, the icon MUST coexist with the Message button (FR-012) since admins can both edit and message.
- **FR-012**: The public profile hero MUST show a Message button only when the viewer is signed in and is **not** the profile owner. Clicking the button opens an in-hero compose surface; submitting fires the existing `useSendMessageToUsersMutation` via a callback prop with `{ message, receiverIds: [userId] }` — exact parity with the current MUI `UserPageBanner.handleSendMessage`. The mutation lives in the integration layer (`src/main/crdPages/userPages/profile/`); the CRD hero component receives `onSendMessage(messageText: string): Promise<void>` as a prop and knows nothing about GraphQL.
- **FR-013**: The public profile MUST render five resource sections (All Resources, Hosted Spaces, Virtual Contributors, Leading, Member Of) in a sticky tab strip, with All Resources active by default.
- **FR-014**: The public profile MUST reuse the same CRD space-card primitive that `043-crd-search-dialog` and the planned Explore Spaces page consume. No new space-card variant is introduced.
- **FR-015**: When a section has no items, the section MUST be either omitted or replaced by a CRD empty-state message — parity with current MUI behavior.
- **FR-015a**: Each public-profile resource section MUST render **every** item the data hooks return — no pagination cap, no "Show more" affordance, no Next/Previous controls, no infinite scroll. The grid container handles overflow via standard page scrolling. This matches the current MUI `TilesContributionsView` exactly.

#### Settings shell (User Stories 2–8)

- **FR-020**: The Settings shell MUST render a sticky header with the user's avatar + display name and a horizontal tab strip in this exact order: My Profile, Account, Membership, Organizations, Notifications, Settings, Security. Each tab is a `lucide-react` icon + uppercase label; the active tab uses a `border-primary` underline. On viewports below the `md` breakpoint the strip MUST horizontally scroll (`overflow-x-auto no-scrollbar`); all seven tabs MUST remain rendered inline (no dropdown / hamburger / two-row wrap variant) and the active tab MUST be auto-scrolled into view on mount and on every tab change. The same horizontal-scroll responsive behavior MUST apply to the public-profile resource tab strip (FR-013).
- **FR-021**: The Security tab MUST be hidden for any viewer who is **not the profile owner**, including platform admins editing another user's profile. The route `/user/<other>/settings/security` MUST redirect to `/user/<other>/settings/profile` when the current user is a platform admin but not the profile owner. (Kratos can only mutate the currently-authenticated identity; surfacing the Kratos UI for "another user" is technically meaningless.)
- **FR-022**: All seven settings tabs MUST be reachable by direct URL; opening a deep URL MUST highlight the corresponding tab.
- **FR-023**: No settings tab — including My Profile — carries a tab-wide dirty buffer. Tab strip clicks and out-of-page navigations MUST NOT be blocked by a confirmation dialog. Any field that is mid-edit when the user navigates away has its in-progress value silently dropped.
- **FR-024**: All settings tabs MUST commit changes immediately on per-control confirmation (no tab-wide Save / Reset bar anywhere) — parity with current MUI behavior on Membership / Notifications / Settings, and the per-field-explicit-save model on My Profile (FR-031).

#### My Profile tab (User Story 2)

- **FR-030**: The My Profile tab MUST render the editable fields mirroring the current MUI `UserForm` exactly. Identity: **Display Name** (required), **First Name** (required), **Last Name** (required), **Email** (read-only — Kratos), **Phone** (validated phone format). About You: **Tagline**, **City**, **Country** (select from the existing `COUNTRIES` list), **Bio** (markdown via `@/crd/forms/markdown/MarkdownEditor`), **Tags** (`profile.tagsets`). Social Links: **LinkedIn**, **Bluesky**, **GitHub** as recognized references, plus an arbitrary-references list with **Add Another Reference**. The system MUST NOT surface an Organization input (no backing field) and MUST NOT surface Twitter / X (replaced by Bluesky in current MUI).
- **FR-031**: The My Profile tab MUST use a **per-field explicit-save** model. Each editable field commits independently via its own Save (check) + Cancel (×) affordance revealed when the field enters edit mode. There is NO tab-wide Save Changes / Discard Changes bar, and there is NO autosave / debounce.
- **FR-032**: Each per-field Save click MUST fire one targeted `updateUser` mutation (or `createTagsetOnProfile` when adding a new tagset, or the matching `createReferenceOnProfile` / `updateReference` / `deleteReference` for the references row), preserving the rest of the user payload. On success, the field MUST return to idle with a transient "Saved" indicator next to the label for ~2 seconds. **On failure, the field MUST stay in edit mode with the user's typed value preserved — the system MUST NOT auto-revert to the server value** — and an inline error message MUST appear beneath the input. The error MUST persist until the user clicks Save again (retry) or clicks Cancel / presses Escape (discard and revert).
- **FR-032a**: A per-field **Cancel** (× icon, or Escape inside the input) MUST revert the field to its last server value with no mutation. **Enter** inside a single-line input MUST be equivalent to clicking Save; the Bio rich-text field is exempt because Enter inserts a newline (commit only via the Save icon, discard only via the Cancel icon).
- **FR-032b**: When the user navigates away (tab click, link click, browser back) while a field is mid-edit, the in-progress value MUST be silently dropped — no mutation fires, no confirmation dialog appears, and the next visit shows the last server value.
- **FR-033**: Avatar / banner / card-banner uploads MUST commit immediately on file-select (the file-picker dialog is the explicit commit). They have no separate Save click.
- **FR-034**: Reference CRUD (create / update / delete) MUST reuse the existing `Reference` mutations the MUI `UserForm` already wires; the spec adds no new mutation. Deleting a reference fires `deleteReference` immediately on trash-icon click with **no** confirmation dialog (references are cheap to recreate).
- **FR-035**: There is no read-only mode on the My Profile tab. The shell either renders fully editable My Profile fields (when `canEditSettings` per FR-008a is true) or has redirected the viewer to the public profile (when false). Removed: the legacy read-only caption / disabled-inputs branch from the current MUI `editMode = readOnly` path is intentionally not ported.

#### Account tab (User Story 3)

- **FR-040**: The Account tab MUST render four card groups — Hosted Spaces, Virtual Contributors, Innovation Packs, Custom Homepages — using the existing `useUserAccountQuery` and `useAccountInformationQuery` data hooks via the existing `ContributorAccountView` data path.
- **FR-041**: The Account tab MUST preserve every action the current MUI `ContributorAccountView` exposes (Create / Manage / Transfer / Delete on each resource type) — no action added, no action removed.
- **FR-042**: There is no read-only mode on the Account tab. The shell either renders fully editable Account controls (when `canEditSettings` per FR-008a is true) or has redirected the viewer to the public profile (when false).

#### Membership tab (User Story 4)

- **FR-050**: The Membership tab MUST render the Home Space dropdown + Auto-redirect checkbox card, the My Memberships table (~10 rows visible per page, paginated client-side), and the Pending Applications table.
- **FR-051**: The Home Space and Auto-redirect controls MUST commit their change via the existing `updateUserSettings` mutation immediately.
- **FR-052**: The Auto-redirect checkbox MUST be disabled and accompanied by an explanatory caption when no Home Space is selected.
- **FR-053**: The My Memberships table MUST support a client-side search (filters by name) and a client-side filter dropdown (All / Spaces / Subspaces / Active / Archived). Both are UX-only — no new server-side filtering is introduced.
- **FR-054**: Each My Memberships row's kebab MUST offer a single **Leave** action preceded by a CRD confirmation dialog; on confirm, the existing `useLeaveCommunityMutation` fires.
- **FR-055**: The Pending Applications table MUST be read-only (no kebab, no actions) — parity with current MUI.

#### Organizations tab (User Story 5)

- **FR-060**: The Organizations tab MUST render the user's associated organizations (existing `useUserOrganizationIds` data path) with avatar, name, description, location, role, associates count, verified badge, and website link.
- **FR-061**: A client-side search input MUST filter organizations by name.
- **FR-062**: A Create Organization button MUST be visible only when the current user has the `CreateOrganization` platform privilege (parity with current MUI).
- **FR-063**: Each row's kebab MUST offer a Leave action preceded by a CRD confirmation dialog (existing leave-organization flow).

#### Notifications tab (User Story 6)

- **FR-070**: The Notifications tab MUST render every notification group, every property, and every channel (inApp / email / push) the current MUI `UserAdminNotificationsPage` exposes — no rule added, no rule removed.
- **FR-071**: The Push Notifications master toggle MUST be hidden behind the same availability checks as today (`isSupported && isServerEnabled && !requiresPWAMode && !isPrivateBrowsing`); when unavailable, an info banner replaces it.
- **FR-072**: The Push Subscriptions List card MUST reuse the existing `PushSubscriptionsList` component (restyled with CRD primitives).
- **FR-073**: The Space Admin, Platform Admin, and Organization Notifications cards MUST be gated by the same privileges the current MUI uses (`ReceiveNotificationsSpaceAdmin`, `ReceiveNotificationsSpaceLead`, `PlatformAdmin`, `ReceiveNotificationsOrganizationAdmin`).
- **FR-074**: Each toggle MUST use the optimistic-overrides pattern (immediate UI update, then resync after server refetch) — parity with current MUI behavior.

#### Settings tab (User Story 7)

- **FR-080**: The Settings tab MUST render two cards — Communication & Privacy (single switch for `allowOtherUsersToSendMessages`) and Design System (CRD on/off toggle).
- **FR-081**: The Design System switch MUST flip `localStorage('alkemio-crd-enabled')` and call `location.reload()` — parity with current MUI behavior.
- **FR-082**: A caption beneath the Design System switch MUST explain "The page will reload after the change."
- **FR-083**: The Design System switch MUST always reflect (and write to) the **viewer's own browser** localStorage — never a server-stored user attribute — so a platform admin editing another user's profile sees their own toggle state, not the target user's preference.

#### Security tab (User Story 8)

- **FR-090**: The Security tab MUST mount the same Kratos `settings` flow with the same `REMOVED_FIELDS` filter the current MUI `UserSecuritySettingsPage` uses (passwords / profile / OIDC link controls hidden).
- **FR-091**: When the Kratos flow contains no WebAuthn / Passkey nodes, an info alert MUST read "WebAuthn / Passkey is not enabled on this account" (parity with current MUI).
- **FR-092**: On Kratos flow load error, the existing `ErrorDisplay` MUST be shown.
- **FR-093**: The Security tab MUST be hidden in the tab strip for any viewer who is not the profile owner — including platform admins.
- **FR-093a**: A direct hit on `/user/<other>/settings/security` by a non-owner (regardless of platform-admin privilege) MUST redirect to `/user/<other>/settings/profile`.

#### Internationalization

- **FR-100**: All user-visible strings on CRD user pages MUST live in `src/crd/i18n/userPages/userPages.<lang>.json` (one namespace per CRD feature, per `src/crd/CLAUDE.md`). The namespace MUST be registered in `src/core/i18n/config.ts` and `@types/i18next.d.ts`.
- **FR-101**: All six supported languages (en, nl, es, bg, de, fr) MUST be created and edited in the same PR that introduces or removes a key, per the CRD i18n manual workflow (no Crowdin).

#### Accessibility

- **FR-110**: Every interactive element on every CRD user page MUST meet WCAG 2.1 AA — semantic HTML, visible focus indicators, accessible names on icon-only buttons (Settings, Message, Save, Discard, kebabs), keyboard reachability, and `aria-busy` on async-pending buttons.
- **FR-111**: The settings tab strip MUST be navigable by keyboard (Tab into the strip, Left/Right arrows between tabs, Enter to activate) — same pattern the existing CRD tabs primitive provides.
- **FR-112**: All confirmation dialogs that DO appear (Leave space / Leave organization, Delete-this-account-resource flows in the Account tab) MUST be implemented with the CRD `Dialog` / `AlertDialog` primitives that already provide the required ARIA semantics. There is no Discard / Keep Editing dialog on My Profile (FR-023, FR-032b) and no per-reference delete confirmation (FR-034).

### Key Entities

- **User** — the profile being viewed/edited. Sourced from `useUserQuery` and `useUserAccountQuery`. Key attributes consumed by CRD: `id`, `nameID`, top-level identity (`firstName`, `lastName`, `email`, `phone`), `profile.{id, displayName, tagline, description, location.{city, country}, avatar, references, tagsets}`, `account.id`, `settings.{communication, privacy, notification, homeSpace}`. Note: `profile.displayName` is a separate required field (not auto-derived from `firstName + lastName`); CRD treats it as its own per-field-savable input.
- **Reference** (Social Link) — a profile reference (`profile.references[]`). Attributes: `id`, `name`, `uri`, `description`. Created via `createReferenceOnProfile`, updated via `updateReference`, deleted via `deleteReference`.
- **Membership** — an entry in `rolesUser.spaces` (and nested subspaces). Attributes used by CRD: `id`, `displayName`, `level`, role flags. Mapped to `SpaceHostedItem` for the existing actionable views.
- **Pending Application** — an entry in `me.communityApplications`. Attributes: `id`, `spacePendingMembershipInfo.{id, level, displayName}`. Read-only on the Membership tab.
- **AssociatedOrganization** — an organization the user is a member of. Sourced via `useUserOrganizationIds` + lazy fetch. Attributes: `id`, `profile.{displayName, description, location, avatar, url}`, `verified`, `associatesCount`, role.
- **NotificationSettings** — the structured settings object on `User.settings.notification` with sub-objects for `space`, `space.admin`, `user`, `user.membership`, `organization`, `platform`, `platform.admin`, `virtualContributor`. Each leaf is a `NotificationChannels` `{ inApp, email, push }` object.
- **HomeSpace** — `User.settings.homeSpace.{ spaceID, autoRedirect }`. Edited from the Membership tab.
- **AccountResource** — a hosted space, virtual contributor, innovation pack, or innovation hub. Sourced via `useAccountInformationQuery`. Listed on the Account tab.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A profile owner can complete the full edit flow on My Profile (change name, tagline, bio, location, organization, add a social link, upload a new avatar, save) in under 90 seconds with no console errors and no failed network calls.
- **SC-002**: The CRD vs. MUI design-system toggle on the Settings tab consistently reloads the page into the chosen renderer in under 3 seconds, on every supported browser, with no extra clicks.
- **SC-003**: 100% of the notification rules and channel toggles exposed by the current MUI Notifications page are present and functionally identical on the CRD Notifications tab — verified by a row-by-row checklist comparison.
- **SC-004**: 100% of the URLs that resolve to a user profile or settings page in MUI continue to resolve to the equivalent page in CRD with no broken links — verified by an automated route smoke test.
- **SC-005**: The lighthouse / axe accessibility audit reports zero critical or serious violations on every CRD user page.
- **SC-006**: Bundle size delta from this migration MUST NOT exceed +30 KB gzipped on the user-pages chunk over the prior build (lazy-loaded; verified via `pnpm analyze`).
- **SC-007**: A non-owner non-admin viewer opening any `/user/<other>/settings/*` URL is redirected to `/user/<other>` (public profile) within one render cycle — verified by an automated route guard test. A platform admin opening the same URL sees the requested settings tab fully editable, with the Security sub-tab as the only exception (always owner-only).
- **SC-008**: Public-profile resource sections render correctly for users with 0 memberships, 1 membership, 50+ memberships, and a mix of L0 / L1 / L2 spaces — verified manually with seeded test fixtures.

## Assumptions

- The CRD shell (`CrdLayoutWrapper`, header, footer, dialogs) and the design-system toggle (`useCrdEnabled`) are already in place and reused without modification — established by spec `041-crd-dashboard-page` and reused by spec `045-crd-space-settings`.
- The reusable CRD space-card primitive (used on the public profile's resource sections) already exists or will be reused from `043-crd-search-dialog` / the in-flight Explore Spaces page; this spec does not introduce a new variant.
- The existing data hooks (`useUserQuery`, `useUserAccountQuery`, `useUserContributionsQuery`, `useUserSettingsQuery`, `useUpdateUserMutation`, `useUpdateUserSettingsMutation`, `useUserOrganizationIds`, `useUserPendingMembershipsQuery`, push-notification context, Kratos flow hook) are sufficient — **no GraphQL schema change is required**.
- Email change remains a Kratos-managed concern; the My Profile email field stays read-only with a "Contact support to change email" caption (parity).
- Kratos UI markup inside the Security tab is **not** restyled in this iteration — only the surrounding card / heading shell adopts CRD; the Kratos-rendered form fields keep their default Kratos styling. A future spec may restyle Kratos itself.
- The seven-tab order in the strip (My Profile → Account → Membership → Organizations → Notifications → Settings → Security) is fixed; tabs cannot be reordered by users. The order matches the current MUI exactly; the prototype's six-tab strip omitting Security is treated as an incomplete prototype.
- **The prototype is treated as a visual reference, not an authoritative spec.** Where the prototype omits a capability that the current MUI ships (Security tab, Message button wiring, etc.), CRD ports the MUI capability, restyled. Where the prototype invents a capability that does not exist on the backend (online-presence dot, social network affordances), CRD drops it unless explicitly clarified otherwise.
- Authorization model is binary in CRD: either the viewer can edit the settings (owner OR platform admin) or they are redirected to the public profile. The legacy MUI "read-only fallback for non-owners" branch is intentionally **not** ported — it added significant conditional surface area for a use case that platform admins already cover via `/admin/users/...` if they ever need a read-only view of someone else's data.
- The 6-tab prototype omits Security; CRD adds it back to maintain parity. No new design comp is introduced for the Security tab — it adopts the same card / heading style as the other tabs.
- Translations are managed manually (AI-assisted) for all six languages in the same PR; no Crowdin involvement (per `src/crd/CLAUDE.md`).
- The existing `NoIdentityRedirect` wrapper continues to gate the `/user/<slug>/settings/*` routes; anonymous viewers hitting a settings URL are redirected to login. The public profile page (`/user/<slug>` without `/settings`) remains reachable without authentication.
- The Message button on the public-profile hero invokes the existing `useSendMessageToUsersMutation` via a callback prop on the CRD hero component (parity with current MUI `UserPageBanner.handleSendMessage`). It does **not** route through the global Messages dialog — it is a one-shot send-message-to-this-user surface.
- The existing `useLeaveCommunityMutation` and the existing leave-organization mutation are reused without change.

## Out of Scope

- **No new backend capabilities.** This migration is a presentation-layer port. No new GraphQL types, no new mutations, no new role gating, no new permission semantics.
- **No new affordances on the Account tab.** Hosted spaces, VCs, packs, and hubs remain editable / creatable / deletable through the same flows the current MUI exposes — not a single button is added or removed.
- **No "follow" / "connect" social affordances** on the public profile page. The prototype hints at social-network features (online dot, Message button) that already exist; no friend / connection system is introduced.
- **No restyle of Kratos-rendered form fields** inside the Security tab. The Kratos UI markup is left alone; only the surrounding card/heading wrapper is restyled.
- **No deletion of MUI files.** The current MUI pages (`src/domain/community/user/userProfilePage/*`, `src/domain/community/userAdmin/*`, the entry wiring in `UserRoute.tsx`) stay in place until the CRD toggle is removed globally — parity with the rule established in `docs/crd/migration-guide.md`.
- **No design refresh of the Notifications matrix beyond visual cards.** Every row, channel, and gating rule stays exactly as the current MUI implementation.
- **No public profile editing.** All edits happen exclusively in the settings tabs.
- **No tab-wide dirty buffer anywhere.** Every settings tab — including My Profile — commits per-control on explicit user action; switching tabs never triggers a discard-confirm dialog. This is a deliberate divergence from spec 045's Layout tab, motivated by the simpler shape of user-profile data (small fields with cheap individual mutations) versus space-layout's bulk reorder + rename cascade.
- **No mobile-app-specific layouts.** The page is responsive (single-column on `< lg`) but no native-app shell is targeted.
