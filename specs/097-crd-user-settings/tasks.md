---
description: "Implementation tasks for CRD Contributor Settings (12 settings tabs across User + Organization)"
---

# Tasks: CRD Contributor Settings (User + Organization)

**Input**: Design documents from `/specs/097-crd-user-settings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/
**Sibling spec**: `096-crd-user-pages` covers the public-profile views. Helpers marked **[SHARED-096]** are owned jointly with 096; if 096 has already landed those pieces in a feature branch, this spec reuses them.
**Tests**: Per-story functional UI tests are NOT included (per CRD-spec convention from 091/045/096 — manual verification follows quickstart.md). Targeted unit tests ARE included for: pure mappers (research §1–§7), the `EditableField` state machine, the per-actor predicate hooks (`useCanEditUserSettings`, `useCanEditOrganizationSettings`), push-availability gating, optimistic-overrides, and i18n key parity. Authorization route-guard integration tests are also included.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task belongs to (US1 / US2 / US3 / US4 / US5 / US6 / US7 / US8 / US9 / US10 / US11 / US12)
- **[SHARED-096]**: Foundational task also referenced by sibling spec 096-crd-user-pages — implement once
- All paths are absolute under `/home/carlos/DEV/Alkemio/client-web-097/` (the active worktree)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the i18n namespace + scaffold the two integration subtrees.

- [ ] T001 Register the new `crd-contributorSettings` i18n namespace in `/home/carlos/DEV/Alkemio/client-web-097/src/core/i18n/config.ts` by adding it to `crdNamespaceImports` (lazy-load all 6 languages from `src/crd/i18n/contributorSettings/contributorSettings.<lang>.json`) — mirror the pattern used for `crd-spaceSettings` / `crd-userPages`
- [ ] T002 Add `'crd-contributorSettings'` to the i18next namespace type union in `/home/carlos/DEV/Alkemio/client-web-097/@types/i18next.d.ts` so `useTranslation('crd-contributorSettings')` is type-checked
- [ ] T003 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/i18n/contributorSettings/contributorSettings.en.json` with the full skeleton of keys covering: `shell.tabs.user.{profile,account,membership,organizations,notifications,settings,security}`, `shell.tabs.org.{profile,account,community,authorization,settings}`, plus per-tab keys (Identity / About You / Social Links / Avatar / Account / Membership / Organizations / Notifications / Settings / Security for User; Identity / About / Contact & Legal / Social Links / Account / Community / Authorization / Settings for Org), plus `shared.{saved,saveFailed,addAnotherReference,...}` — full key inventory per data-model.md and contracts/
- [ ] T004 [P] Create empty placeholder JSON files for the other five languages: `/home/carlos/DEV/Alkemio/client-web-097/src/crd/i18n/contributorSettings/contributorSettings.{nl,es,bg,de,fr}.json` — each starts as `{}` and is filled during the Polish phase
- [ ] T005 [P] Create the User integration directory at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/` with empty subdirectories `myProfile/`, `account/`, `membership/`, `organizations/`, `notifications/`, `settings/`, `security/`
- [ ] T006 [P] Create the Org integration directory at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/` with empty subdirectories `profile/`, `account/`, `community/`, `authorization/`, `settings/`

**Checkpoint**: i18n namespace registered, both integration directory skeletons in place — Foundational phase can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared CRD primitives + per-actor predicate hooks + route shells the entire contributor-settings vertical depends on.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

### Per-actor route context + predicate helpers

- [ ] T007 [P] [SHARED-096] Verify `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` exists per the `UseUserPageRouteContext` contract in `specs/097-crd-user-settings/contracts/data-mapper.ts`. Owned by 096; this spec reuses without modification. If absent, create per the contract: wraps `useUserProvider` + `useCurrentUserContext` to return `{ userSlug, userId, currentUserId, loading }`, resolves `/user/me` to the current user's nameID
- [ ] T008 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/useCanEditUserSettings.ts` per the `UseCanEditUserSettings` contract. Returns `{ canEditSettings, isOwner, isPlatformAdmin, loading }`. `isPlatformAdmin` calls `userWrapper.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin)` — the canonical predicate already used by `UserAdminNotificationsPage` line 172. Replaces / supersedes any prior `useCanEditSettings.ts` from 096
- [ ] T009 Unit-test `useCanEditUserSettings` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/useCanEditUserSettings.test.ts`: assert true when `currentUser.id === profileUser.id`, true when admin viewing other user, false when neither, false when both ids are undefined (anonymous). Depends on T008
- [ ] T010 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/useCanEditOrganizationSettings.ts` per the `UseCanEditOrganizationSettings` contract. Reads `useOrganizationProvider().permissions.canEdit` (the existing predicate used by MUI `NonAdminRedirect`). Returns `{ canEditSettings, hasUpdatePrivilege, loading }`
- [ ] T011 Unit-test `useCanEditOrganizationSettings` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/useCanEditOrganizationSettings.test.ts`: assert true when `permissions.canEdit === true`, false when false, false when permissions missing. Depends on T010

### Shared CRD presentational components — Shell + cards

- [ ] T012 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/SettingsShell.tsx` per the `SettingsShellProps` contract. Renders sticky header (avatar + display name only) + `SettingsTabStrip` + `{children}` outlet
- [ ] T013 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/SettingsTabStrip.tsx` per the `SettingsTabStripProps` contract. Wraps the CRD `tabs.tsx` primitive. Each tab is a `lucide-react` icon + uppercase label. Active tab uses `border-primary` underline. **Responsive:** on viewports below `md` the strip uses `overflow-x-auto no-scrollbar` (FR-014); the active tab MUST be auto-scrolled into view on mount and on `activeTabId` change (use a ref on the active button + `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`). Hidden tabs are omitted entirely
- [ ] T014 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/SettingsCard.tsx` per the `SettingsCardProps` contract — primary-colored icon + bottom-bordered title + helper-text + body. Uses CRD `card.tsx` primitive

### Shared CRD presentational components — EditableField family

- [ ] T015 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/EditableField.tsx` per the `EditableFieldShellProps` contract. Implements the five-state machine from research §2 (`idle` / `editing` / `pending` / `idle-saved` / `editing-error`). Hover-reveal pencil glyph. Save (check) and Cancel (×) icons in `editing`. Spinner replacing Save in `pending`. Disabled Save/Cancel in `pending`; `aria-busy="true"` on the input. Inline error beneath the input in `editing-error`. Transient "Saved" indicator next to the label for ~2 s in `idle-saved`. Enter-key behavior gated by `enterIsNewline` prop. State is owned BY the parent (controlled component) — primitive renders the right UI for the passed `status`
- [ ] T016 Unit-test `EditableField` state-driven rendering at `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/EditableField.test.tsx`: idle hover reveals pencil; click value → onEnterEdit fires; editing renders Save+Cancel; click × → onCancel fires; click Save → onSave fires; pending disables Save+Cancel + sets aria-busy; idle-saved renders the "Saved" indicator; editing-error renders inline error and Save+Cancel re-enabled. Use Vitest + `@testing-library/react`. Depends on T015
- [ ] T017 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/EditableTextField.tsx` per the `EditableTextFieldProps` contract. Wraps `EditableField` with a CRD `input.tsx`. Supports `text` / `email` / `tel` and an optional leading `lucide-react` icon (used by City — `MapPin`). Surfaces client-side `validate` errors as inline messages (mutation never fires when invalid)
- [ ] T018 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/EditableMarkdownField.tsx` per `EditableMarkdownFieldProps`. Wraps `EditableField` (with `enterIsNewline=true`) around the existing `@/crd/forms/markdown/MarkdownEditor`. Save / Cancel only via the icons (Enter inserts newline)
- [ ] T019 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/EditableSelectField.tsx` per `EditableSelectFieldProps<T>`. Wraps `EditableField` around the CRD `select.tsx` primitive (used by Country selector on both Profile tabs)
- [ ] T020 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/EditableTagsField.tsx` per `EditableTagsFieldProps`. Wraps `EditableField` around `@/crd/forms/tags-input.tsx`
- [ ] T021 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/EditableReferenceRow.tsx` per `EditableReferenceRowProps`. Renders a circular icon-tile (LinkedIn / Bluesky / GitHub / generic Link), a name input (editable only when `kind === 'arbitrary'`), a URL input (with the `validateUrl` callback gating Save), an optional description input (arbitrary only), the `EditableField` Save / Cancel pair, and a trash icon that calls `onDelete` immediately (no confirmation per FR-025)

### Shared CRD presentational components — composite views

- [ ] T022 [P] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/AccountResourceCard.tsx` per the `AccountResourceCardItem` shape in `contracts/tab-userAccount.ts`. Horizontal card: avatar / displayName / description / kebab dropdown. Uses CRD `card.tsx`, `dropdown-menu.tsx`, `avatar.tsx`. Each kebab entry is a `lucide-react` icon + label that calls the entry's `onClick`. Pure presentational
- [ ] T023 [US2 US9] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/ContributorAccountView.tsx` per the `ContributorAccountViewProps` contract. Renders the help-text info banner + four sections (Hosted Spaces, Virtual Contributors, Innovation Packs, Innovation Hubs), each with its title, optional Create button (gated by `canCreate`), the list of `AccountResourceCard`s, and an empty-state line when the list is empty. **Shared across US2 (User Account) and US9 (Org Account)** — single implementation, two integrations. Depends on T022
- [ ] T024 [P] [US10 US11] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/contributor/settings/RoleAssignmentView.tsx` per the `RoleAssignmentViewProps` contract. Two-column layout: current members (left, with × per row) + available users (right, with search + + per row + load-more). Uses CRD `card.tsx`, `input.tsx`, `avatar.tsx`. **Shared across US10 (Org Community) and US11 (Org Authorization Admin/Owner sub-tabs)** — single implementation, three integrations

### Route shells

- [ ] T025 [P] [SHARED-096] Verify `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` exists (owned by 096). If present, extend it to nest a `path="settings/*"` sub-route that delegates to `CrdUserSettingsRoutes` (T026). All page components are lazy-loaded
- [ ] T026 Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/CrdUserSettingsRoutes.tsx` — the seven settings sub-routes (`profile`, `account`, `membership`, `organizations`, `notifications`, `settings`, `security`) with the index redirecting to `profile`. At route-resolution time, evaluate `useCanEditUserSettings()`: when false, `<Navigate to={`/user/${slug}`} replace />`. For the `security` route specifically, additionally redirect to `/user/<slug>/settings/profile` when `isOwner === false` (FR-084). Each tab page component is lazy-loaded. Depends on T008, T025
- [ ] T027 [SHARED-096] Modify `/home/carlos/DEV/Alkemio/client-web-097/src/main/routing/TopLevelRoutes.tsx` at the `/user/*` route block: inside the existing `<NoIdentityRedirect>` and `<Suspense>`, dispatch on `useCrdEnabled()` between the lazy-loaded `<CrdUserRoutes />` and the existing `<UserRoute />` — the existing wrapping (`<NoIdentityRedirect>`, `<WithApmTransaction>`, `<Suspense>`) MUST stay exactly as-is (research §1: anonymous viewers stay redirected to login for parity). Add a new lazy import `const CrdUserRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/userPages/CrdUserRoutes'))`. Depends on T025
- [ ] T028 Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/CrdOrgSettingsRoutes.tsx` — the five settings sub-routes (`profile`, `account`, `community`, `authorization`, `settings`) with the index redirecting to `profile`. At route-resolution time, evaluate `useCanEditOrganizationSettings()`: when false, `<Navigate to={`/organization/${slug}`} replace />`. Each tab page component is lazy-loaded. Depends on T010
- [ ] T029 Modify `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes.tsx` at lines 29–34 (currently hard-codes `<MuiOrganizationAdminRoutes />` for `path="settings/*"`): replace with `useCrdEnabled() ? <CrdOrgSettingsRoutes /> : <MuiOrganizationAdminRoutes />`. Add lazy import for `CrdOrgSettingsRoutes`. Depends on T028

**Checkpoint**: All shared primitives, helpers, and route shells ready. The 12 settings tabs can now be built in parallel.

---

## Phase 3: User Story 1 — User My Profile Tab (Priority: P1) 🎯 MVP

**Goal**: `/user/<self>/settings/profile` renders the per-field-explicit-save form (Identity / About You / Social Links + right-column avatar preview) with the full state machine (idle → editing → pending → success / failure).

**Independent Test**: Per quickstart.md "User Story 1" — edit each field type (text, markdown, select, tags, reference), verify save / cancel / failure-retry / network-offline flows, verify silent-drop-on-tab-switch behavior, verify avatar upload commits on file-select, verify trash icon deletes references immediately.

### CRD presentational components

- [ ] T030 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/MyProfileAvatarColumn.tsx` per the `AvatarColumnProps` contract. Right-column profile picture preview: large circular avatar (with optional uploading overlay spinner), display name + tagline, "Change Avatar" file picker button, "Recommended: 400x400px. JPG, PNG or GIF." caption. The button accepts a file and calls `onAvatarFilePicked(file)` immediately (FR-024)
- [ ] T031 [US1] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/MyProfileView.tsx` per `UserMyProfileViewProps`. Two-column layout on `lg+` (form on the left, avatar on the right) and single column on smaller viewports. Three subsections (`Identity`, `About You`, `Social Links`), each with the icon + bottom-bordered title treatment from `SettingsCard`. Renders the field instances passed via props. The "Add Another Reference" button at the bottom of Social Links calls `onAddAnotherReference`. Depends on T015–T021, T030

### Integration

- [ ] T032 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/myProfile/useUserMyProfileFields.ts` — for each editable field, owns the `EditableFieldStatus` state and exposes `onEnterEdit / onSave / onCancel` callbacks. The `onSave` of each field fires a single targeted `useUpdateUserMutation` call that preserves the rest of the user payload, then transitions `pending → idle-saved → idle` (timer ~2 s) on success or `pending → editing-error` on failure with the typed value preserved (FR-022). Implements the state machine ownership for: `displayName`, `firstName`, `lastName`, `phone`, `tagline`, `city`, `country`, `bio` (markdown), `tags` (delegates to T033 for first-tag creation)
- [ ] T033 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/myProfile/useUserTagsetSave.ts` — for the `tags` field on the form. When the user has no existing default tagset, the first save fires `useCreateTagsetOnProfileMutation`. Subsequent saves fire `useUpdateUserMutation` against the existing tagset id within `profile.tagsets`
- [ ] T034 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/myProfile/useUserReferenceCrud.ts` — owns the per-row state for every Social Links row (recognized + arbitrary). Wraps `useCreateReferenceOnProfileMutation`, `useUpdateReferenceMutation`, `useDeleteReferenceMutation`. Add Another Reference appends an unsaved row in `editing` (id=null); Save → `createReferenceOnProfile`; trash icon → `deleteReference` immediately (no confirmation, FR-025). Reuses the existing `referenceSegmentSchema` URL validator
- [ ] T035 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/myProfile/useUserAvatarUpload.ts` — exposes `{ onAvatarFilePicked: (file: File) => Promise<void>; uploading: boolean }`. Calls the same upload mutation the existing MUI avatar uploader uses. On error, surfaces a CRD `Toast` and reverts the avatar via refetch
- [ ] T036 [US1] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/myProfile/userMyProfileMapper.ts` — pure function mapping `useUserQuery` results + the four hooks above into the full `UserMyProfileViewProps` object. Pulls the `COUNTRIES` constant for the Country select options
- [ ] T037 [US1] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/myProfile/CrdUserMyProfilePage.tsx` — composes the four hooks + the mapper, renders `<SettingsShell>` with `<MyProfileView>` inside. Depends on T031, T032, T033, T034, T035, T036
- [ ] T038 [US1] Wire the `profile` route in `CrdUserSettingsRoutes.tsx` (T026) → `<CrdUserMyProfilePage />`. Depends on T037

### Tests

- [ ] T039 [P] [US1] Unit-test `userMyProfileMapper` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/myProfile/userMyProfileMapper.test.ts`: handles missing optional fields (no phone, no tagline, no bio, empty tagsets); recognized references (LinkedIn, Bluesky, GitHub) sort to `socialLinks.recognized` even when missing in the data (auto-inserted as empty rows); arbitrary references end up in `socialLinks.arbitrary` in stable order; the helper text for Email is the i18n-resolved "Contact support to change email"

### Manual smoke

- [ ] T040 [US1] Run quickstart.md "User Story 1" smoke checklist. Verify each field type (text / markdown / select / tags / reference) edits and saves; verify the offline-Save flow keeps the typed value preserved; verify trash deletes references immediately; verify avatar upload commits on file-select. Capture deviations as follow-up tasks

**Checkpoint**: User Story 1 complete — User My Profile is independently editable end-to-end. MVP boundary.

---

## Phase 4: User Story 2 — User Account Tab (Priority: P1)

**Goal**: `/user/<self>/settings/account` renders the four card groups (Hosted Spaces / VCs / Innovation Packs / Innovation Hubs) with kebab actions that navigate to existing flows.

**Independent Test**: Per quickstart.md "User Story 2".

### Integration

- [ ] T041 [P] [US2] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/account/useUserAccountActions.ts` — exposes `{ onCreateSpace, onCreateVC, onCreatePack, onCreateHub, onView, onManage, onTransferOut, onDelete }` callbacks. Each one calls `useNavigate()` to the corresponding existing MUI admin route (research §3). The Delete callback opens the existing CRD `ConfirmationDialog` and on confirm fires the corresponding existing delete mutation. No new mutations added
- [ ] T042 [P] [US2] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/account/userAccountMapper.ts` — pure function mapping `useUserAccountQuery` + `useAccountInformationQuery({ accountId: user.account.id })` + the action callbacks into the shared `ContributorAccountViewProps` shape. Reads privilege flags from the same authorization fields the MUI `ContributorAccountView` reads
- [ ] T043 [US2] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountPage.tsx` composing the hook + mapper + `<ContributorAccountView>` (the shared component from T023). Depends on T023, T041, T042
- [ ] T044 [US2] Wire the `account` route in `CrdUserSettingsRoutes.tsx`. Depends on T043

### Tests

- [ ] T045 [P] [US2] Unit-test `userAccountMapper` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/account/userAccountMapper.test.ts`: privilege gating (Create button hidden when the corresponding privilege flag is false); empty resource lists; kebab entries match the `AccountKebabAction` discriminated union exactly

### Manual smoke

- [ ] T046 [US2] Run quickstart.md "User Story 2" smoke checklist

**Checkpoint**: User Story 2 complete.

---

## Phase 5: User Story 3 — User Membership Tab (Priority: P1)

**Goal**: `/user/<self>/settings/membership` renders the Home Space card + paginated My Memberships table + read-only Pending Applications table.

**Independent Test**: Per quickstart.md "User Story 3".

### CRD presentational components

- [ ] T047 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/HomeSpaceCard.tsx` per `HomeSpaceCardProps`. CRD `select.tsx` for the Home Space picker + `checkbox.tsx` for Auto-redirect (disabled when no Home Space, with the explanatory caption). Spinner overlay during the `saving` flag
- [ ] T048 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/MembershipsTable.tsx` per `MembershipsTableProps`. Uses CRD `table.tsx` + `input.tsx` (search) + `select.tsx` (filter dropdown) + `dropdown-menu.tsx` (per-row kebab with a Leave action). Pagination at ~10 rows visible, controlled via `page` / `pageSize` / `onPageChange`. Click on the row name navigates to `spaceUrl` (renders as `<a href>` per CRD architectural rules)
- [ ] T049 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/PendingApplicationsTable.tsx` per `PendingApplicationsTableProps`. Pure read-only — no kebab, no actions. Empty-state line when `rows` is empty
- [ ] T050 [US3] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/MembershipView.tsx` per `UserMembershipViewProps`. Composes T047 + T048 + T049 inside `SettingsCard` containers. Depends on T047, T048, T049

### Integration

- [ ] T051 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/membership/useHomeSpace.ts` — wraps `useUpdateUserSettingsMutation` for both the Home Space picker and the Auto-redirect checkbox. Exposes `{ selectedSpaceId, autoRedirect, saving, onSelectSpace, onToggleAutoRedirect }`. Refetches `useUserSettingsQuery` after each mutation
- [ ] T052 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/membership/useLeaveMembership.ts` — wraps the existing leave-community flow. Opens the CRD `ConfirmationDialog`; on confirm fires the leave action and refetches `useUserContributionsQuery`. On failure surfaces the error inside the open dialog so the user can retry
- [ ] T053 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/membership/userMembershipMapper.ts` — pure function. Includes the client-side filter + search logic over the fetched memberships list and the pagination slicing (page/pageSize). Pending applications come from `useUserPendingMembershipsQuery`
- [ ] T054 [US3] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/membership/CrdUserMembershipPage.tsx`. Depends on T050, T051, T052, T053
- [ ] T055 [US3] Wire the `membership` route in `CrdUserSettingsRoutes.tsx`. Depends on T054

### Tests

- [ ] T056 [P] [US3] Unit-test `userMembershipMapper` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/membership/userMembershipMapper.test.ts`: search filters by `displayName` substring (case-insensitive); filter dropdown narrows by `Spaces` / `Subspaces` / `Active` / `Archived`; pagination resets to page 1 when search/filter change; the `Auto-redirect disabled when no Home Space` flag is correctly produced

### Manual smoke

- [ ] T057 [US3] Run quickstart.md "User Story 3" smoke checklist

**Checkpoint**: User Story 3 complete.

---

## Phase 6: User Story 4 — User Organizations Tab (Priority: P1)

**Goal**: `/user/<self>/settings/organizations` renders the user's associated organizations with search, optional Create button (privilege-gated), and a Leave kebab.

**Independent Test**: Per quickstart.md "User Story 4".

### CRD presentational components

- [ ] T058 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/OrganizationsTable.tsx` per `OrganizationsTableProps`. CRD `table.tsx`-based; columns: avatar, name, description, location, role, associates count, verified badge, website link. Click on the org name navigates to `url` (`<a href>`). Per-row kebab with a single Leave entry
- [ ] T059 [US4] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/OrganizationsView.tsx` per `UserOrganizationsViewProps`. Search input + (privilege-gated) Create button + the table. Empty-state line when no organizations. Depends on T058

### Integration

- [ ] T060 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/organizations/useLeaveOrganization.ts` — wraps the existing leave-organization mutation (locate via `grep` in `src/domain/community/organization/`). Opens CRD `ConfirmationDialog`; refetches the organization list after leaving
- [ ] T061 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/organizations/useCreateOrganization.ts` — exposes `{ canCreate, onCreate }`. `canCreate` is true iff the user has the `CreateOrganization` platform privilege. `onCreate` calls `useNavigate()` to the existing organization-creation route
- [ ] T062 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/organizations/userOrganizationsMapper.ts` — pure function. Implements client-side search by `displayName` substring (case-insensitive)
- [ ] T063 [US4] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/organizations/CrdUserOrganizationsPage.tsx`. Depends on T059, T060, T061, T062
- [ ] T064 [US4] Wire the `organizations` route in `CrdUserSettingsRoutes.tsx`. Depends on T063

### Tests

- [ ] T065 [P] [US4] Unit-test `userOrganizationsMapper` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/organizations/userOrganizationsMapper.test.ts`: search filter logic; `canCreateOrganization` privilege gating; row shape (location resolves from city/country, fallback when one is missing)

### Manual smoke

- [ ] T066 [US4] Run quickstart.md "User Story 4" smoke checklist

**Checkpoint**: User Story 4 complete.

---

## Phase 7: User Story 5 — User Notifications Tab (Priority: P1)

**Goal**: `/user/<self>/settings/notifications` renders every notification group / property / channel the current MUI exposes, with the optimistic-overrides update pattern, the push master toggle (gated by availability), and the push subscriptions list.

**Independent Test**: Per quickstart.md "User Story 5".

### CRD presentational components

- [ ] T067 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/NotificationRow.tsx` per `NotificationRow` shape in `contracts/tab-userNotifications.ts`. One row with the property label + three switches (`inApp`, `email`, `push` — push hidden when `null`). Each switch gets `aria-busy` while `saving`
- [ ] T068 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/NotificationGroupCard.tsx` — wraps a `SettingsCard` with the group title + list of `NotificationRow`s
- [ ] T069 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/PushAvailabilityBanner.tsx` per the `PushAvailability` discriminated shape — info banner shown when push is unavailable, with the reason-specific copy
- [ ] T070 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/PushSubscriptionsListCard.tsx` per `PushSubscriptionItem`. CRD `table.tsx`-based: one row per subscription with display name, last-used timestamp, current-device badge, and a remove button. Pure presentational — `onRemove` is a callback prop
- [ ] T071 [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/NotificationsView.tsx` per `UserNotificationsViewProps`. Composes the master toggle / banner + Push Subscriptions card + the visible groups (privilege-gated; hidden groups simply omitted). Depends on T067, T068, T069, T070

### Integration

- [ ] T072 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/notifications/useNotificationToggle.ts` — implements the optimistic-overrides dictionary from research §4. Reads server values from `useUserSettingsQuery`, holds an in-memory override dictionary keyed by `(group, property, channel)`. Each `onToggle` writes the override + fires `useUpdateUserSettingsMutation`; clears the override on success; rolls back the override on failure
- [ ] T073 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/notifications/usePushSubscriptionList.ts` — wraps `usePushNotificationContext` (subscribe/unsubscribe + availability flags) and the existing push subscriptions queries / mutations the MUI component uses. Returns `{ pushAvailability, pushSubscriptions }` shapes for the view
- [ ] T074 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/notifications/userNotificationsMapper.ts` — pure function. Reads the source-of-truth notification properties from `src/domain/community/userAdmin/tabs/model/NotificationSettings.model.ts` so the CRD layer stays in sync with the MUI side. Privilege gating reuses the existing `useCurrentUserContext.userWrapper.hasPlatformPrivilege(...)` predicates exactly as `UserAdminNotificationsPage` does. Hidden groups are omitted entirely from `groups`
- [ ] T075 [US5] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/notifications/CrdUserNotificationsPage.tsx`. Depends on T071, T072, T073, T074
- [ ] T076 [US5] Wire the `notifications` route in `CrdUserSettingsRoutes.tsx`. Depends on T075

### Tests

- [ ] T077 [P] [US5] Unit-test `userNotificationsMapper` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/notifications/userNotificationsMapper.test.ts`: privilege gating hides Space Admin / Platform Admin / Organization Notifications correctly; the push column on each row is `null` when `pushAvailability.available` is false
- [ ] T078 [P] [US5] Unit-test `useNotificationToggle` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/notifications/useNotificationToggle.test.ts`: an override is applied immediately on `onToggle`; cleared on mutation success; rolled back on mutation failure
- [ ] T079 [P] [US5] Unit-test the push-availability gating: a small render test on `NotificationsView` (or `PushAvailabilityBanner`) at `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/NotificationsView.test.tsx`: when `available: false`, master toggle replaced by banner; every push column hidden across every group

### Manual smoke

- [ ] T080 [US5] Run quickstart.md "User Story 5" smoke checklist

**Checkpoint**: User Story 5 complete.

---

## Phase 8: User Story 6 — User Settings Tab (Priority: P1)

**Goal**: `/user/<self>/settings/settings` renders the Communication & Privacy switch + Design System on/off switch with the existing localStorage write + reload semantics.

**Independent Test**: Per quickstart.md "User Story 6".

### CRD presentational components

- [ ] T081 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/DesignSystemSwitchCard.tsx` per `DesignSystemSwitchCardProps`. `SettingsCard` wrapper + CRD `switch.tsx`. Pure presentational — `onToggle` callback owns localStorage + reload
- [ ] T082 [US6] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/SettingsView.tsx` per `UserSettingsViewProps`. Two cards: Communication & Privacy (single switch for `allowOtherUsersToSendMessages`) + Design System. Depends on T081

### Integration

- [ ] T083 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/settings/useDesignSystemToggle.ts` — reads `localStorage.getItem('alkemio-crd-enabled')` at mount; on toggle writes `localStorage.setItem('alkemio-crd-enabled', 'true')` or `removeItem` and calls `window.location.reload()`. The toggle is viewer-scoped (FR-073) — never tied to the target user
- [ ] T084 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/settings/useAllowMessagesToggle.ts` — wraps `useUpdateUserSettingsMutation` for `settings.communication.allowOtherUsersToSendMessages`
- [ ] T085 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/settings/userSettingsMapper.ts` — pure function combining the two hooks above into `UserSettingsViewProps`
- [ ] T086 [US6] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/settings/CrdUserSettingsPage.tsx`. Depends on T082, T083, T084, T085
- [ ] T087 [US6] Wire the `settings` route in `CrdUserSettingsRoutes.tsx`. Depends on T086

### Manual smoke

- [ ] T088 [US6] Run quickstart.md "User Story 6" smoke checklist; in particular verify that toggling Design System reloads the page into the chosen renderer in both directions

**Checkpoint**: User Story 6 complete.

---

## Phase 9: User Story 7 — User Security Tab (Priority: P1)

**Goal**: `/user/<self>/settings/security` mounts the existing identity-provider `settings` flow inside a CRD card shell. Owner-only — admins viewing other users get redirected to `/profile`.

**Independent Test**: Per quickstart.md "User Story 7".

### CRD presentational components

- [ ] T089 [US7] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/user/settings/tabs/SecurityView.tsx` per `SecurityViewProps`. Outer `SettingsCard` shell + a body that switches on `state.kind`: `loading` → CRD `skeleton.tsx`; `error` → `errorView` prop; `noWebauthn` → CRD info banner with the i18n-resolved alert text; `ready` → calls `renderKratos(state.flow)` (the integration layer supplies the actual rendering). The view itself never imports the identity-provider SDK

### Integration

- [ ] T090 [P] [US7] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/security/useIdentityProviderSettingsFlow.ts` — reuses the same flow loader the existing `UserSecuritySettingsPage` uses. Reuses the existing `REMOVED_FIELDS` filter so password / profile / OIDC link controls remain hidden. Returns the `SecurityViewState` shape
- [ ] T091 [US7] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/security/CrdUserSecurityPage.tsx` — calls `useIdentityProviderSettingsFlow`, supplies a `renderKratos` function that wraps the flow in `<KratosForm><KratosUI /></KratosForm>`. Depends on T089, T090
- [ ] T092 [US7] Wire the `security` route in `CrdUserSettingsRoutes.tsx` (T026) — already gated to owner-only by the redirect logic at the routing level. Depends on T091

### Manual smoke

- [ ] T093 [US7] Run quickstart.md "User Story 7" smoke checklist

**Checkpoint**: User Story 7 complete — the User vertical is fully migrated to CRD.

---

## Phase 10: User Story 8 — Org Profile Tab (Priority: P1)

**Goal**: `/organization/<orgSlug>/settings/profile` renders the per-field-explicit-save form using the same shared edit-pattern primitives as User My Profile (Identity / About / Contact & Legal / Social Links + right-column logo preview + read-only verified badge).

**Independent Test**: Per quickstart.md "User Story 8".

### CRD presentational components

- [ ] T094 [P] [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/organization/settings/tabs/OrgProfileAvatarColumn.tsx` per `OrgAvatarColumnProps` — same shape as User MyProfileAvatarColumn
- [ ] T095 [P] [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/organization/settings/tabs/OrgVerifiedBadge.tsx` per `OrgVerifiedBadgeProps` — three states (Verified / Pending / NotVerified) with appropriate `lucide-react` icons (CheckCircle2 / Clock / Shield) and i18n labels. Read-only — no edit affordance (FR-094)
- [ ] T096 [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/organization/settings/tabs/OrgProfileView.tsx` per `OrgProfileViewProps`. Two-column layout on `lg+` (form on the left, logo + verified badge on the right). Four subsections (`Identity`, `About`, `Contact & Legal`, `Social Links`), each with the icon + bottom-bordered title treatment from `SettingsCard`. Renders the EditableField instances passed via props. Depends on T015–T021, T094, T095

### Integration

- [ ] T097 [P] [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/profile/useOrgProfileFields.ts` — for each editable field on the form, owns the `EditableFieldStatus` state and exposes `onEnterEdit / onSave / onCancel` callbacks. The `onSave` of each field fires a single targeted `useUpdateOrganizationMutation` call that preserves the rest of the org payload. Implements the state machine ownership for: `displayName`, `tagline`, `description` (markdown), `city`, `country`, `tags`, `contactEmail`, `domain`, `legalEntityName`, `website`. Excludes `nameID` (read-only after creation, FR-091)
- [ ] T098 [P] [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/profile/useOrgTagsetSave.ts` — same shape as `useUserTagsetSave.ts`, using `organization.profile.tagsets`
- [ ] T099 [P] [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/profile/useOrgReferenceCrud.ts` — same shape as `useUserReferenceCrud.ts`, using `organization.profile.references`
- [ ] T100 [P] [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/profile/useOrgAvatarUpload.ts` — same shape as `useUserAvatarUpload.ts`, using the org logo upload mutation
- [ ] T101 [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/profile/orgProfileMapper.ts` — pure function mapping `useOrganizationProvider` results + the four hooks above into the full `OrgProfileViewProps` object. Resolves `verifiedBadge.status` from `organization.verification.status` mapping to `'Verified'` / `'Pending'` / `'NotVerified'`
- [ ] T102 [US8] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/profile/CrdOrgProfilePage.tsx` — composes the four hooks + the mapper, renders `<SettingsShell>` with `<OrgProfileView>` inside. Depends on T096, T097, T098, T099, T100, T101
- [ ] T103 [US8] Wire the `profile` route in `CrdOrgSettingsRoutes.tsx` (T028) → `<CrdOrgProfilePage />`. Depends on T102

### Tests

- [ ] T104 [P] [US8] Unit-test `orgProfileMapper` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/profile/orgProfileMapper.test.ts`: handles missing optional fields (no contactEmail, no domain, no legalEntityName, no website); recognized references (LinkedIn, Bluesky, GitHub) sort to `socialLinks.recognized`; arbitrary references end up in `socialLinks.arbitrary`; `verifiedBadge.status` resolves correctly for each `OrganizationVerificationEnum` value; `nameID` is rendered read-only

### Manual smoke

- [ ] T105 [US8] Run quickstart.md "User Story 8" smoke checklist

**Checkpoint**: User Story 8 complete — Org Profile editable end-to-end.

---

## Phase 11: User Story 9 — Org Account Tab (Priority: P1)

**Goal**: `/organization/<orgSlug>/settings/account` renders the four card groups for the org's account (sourced from `useOrganizationAccountQuery`).

**Independent Test**: Per quickstart.md "User Story 9".

### Integration

- [ ] T106 [P] [US9] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/account/useOrgAccountActions.ts` — same shape as `useUserAccountActions.ts`, exposing the same callback set. Each callback navigates to the corresponding existing MUI admin route
- [ ] T107 [P] [US9] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/account/orgAccountMapper.ts` — pure function mapping `useOrganizationAccountQuery({ organizationId })` + `useAccountInformationQuery({ accountId: org.account.id })` + the action callbacks into the shared `ContributorAccountViewProps` shape
- [ ] T108 [US9] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountPage.tsx` composing the hook + mapper + `<ContributorAccountView>` (T023). Depends on T023, T106, T107
- [ ] T109 [US9] Wire the `account` route in `CrdOrgSettingsRoutes.tsx`. Depends on T108

### Tests

- [ ] T110 [P] [US9] Unit-test `orgAccountMapper` at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/account/orgAccountMapper.test.ts`: same property assertions as the user-account-mapper test (privilege gating, empty lists, kebab discriminated-union); plus assert the org's `displayName` is used as `accountHostName`

### Manual smoke

- [ ] T111 [US9] Run quickstart.md "User Story 9" smoke checklist

**Checkpoint**: User Story 9 complete.

---

## Phase 12: User Story 10 — Org Community (Associates) Tab (Priority: P1)

**Goal**: `/organization/<orgSlug>/settings/community` renders the role-assignment view for the `Associate` role (current associates + available users with add/remove).

**Independent Test**: Per quickstart.md "User Story 10".

### CRD presentational components

- [ ] T112 [US10] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/organization/settings/tabs/OrgCommunityView.tsx` per `OrgCommunityViewProps`. Wraps the shared `<RoleAssignmentView>` (T024) for the Associate role. Depends on T024

### Integration

- [ ] T113 [P] [US10] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/community/useOrgAssociates.ts` — wraps `useRoleSetManager({ roleSetId, relevantRoles: [Associate], contributorTypes: [User], fetchContributors: true })` + `useRoleSetAvailableUsers({ roleSetId, mode: 'platform', role: Associate, filter: searchTerm, usersAlreadyInRole })`. Exposes the `RoleAssignmentViewProps` shape. Add/remove fire `assignRoleToUser(userId, Associate)` / `removeRoleFromUser(userId, Associate)` immediately on click
- [ ] T114 [P] [US10] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/community/orgCommunityMapper.ts` — pure function combining the hook output into `OrgCommunityViewProps`
- [ ] T115 [US10] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/community/CrdOrgCommunityPage.tsx`. Depends on T112, T113, T114
- [ ] T116 [US10] Wire the `community` route in `CrdOrgSettingsRoutes.tsx`. Depends on T115

### Manual smoke

- [ ] T117 [US10] Run quickstart.md "User Story 10" smoke checklist

**Checkpoint**: User Story 10 complete.

---

## Phase 13: User Story 11 — Org Authorization Tab (Priority: P1)

**Goal**: `/organization/<orgSlug>/settings/authorization` renders two sub-tabs (Admin / Owner) each wrapping the role-assignment view.

**Independent Test**: Per quickstart.md "User Story 11".

### CRD presentational components

- [ ] T118 [US11] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/organization/settings/tabs/OrgAuthorizationView.tsx` per `OrgAuthorizationViewProps`. Renders the Admin/Owner sub-tab strip (uses CRD `tabs.tsx` primitive at the inner level) + the active sub-tab's `<RoleAssignmentView>`. Active sub-tab is held in a `useState('admin')` inside the integration page (no URL sync). Depends on T024

### Integration

- [ ] T119 [P] [US11] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/authorization/useOrgRoleAssignment.ts` — parameterized by `RoleName` (`Admin` or `Owner`). Wraps `useRoleSetManager` + `useRoleSetAvailableUsers` for the given role. Two instances are used by the page — one per sub-tab
- [ ] T120 [P] [US11] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/authorization/orgAuthorizationMapper.ts` — pure function combining the two hook outputs into `OrgAuthorizationViewProps`
- [ ] T121 [US11] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/authorization/CrdOrgAuthorizationPage.tsx`. Holds the `activeSubTab` local state. Depends on T118, T119, T120
- [ ] T122 [US11] Wire the `authorization` route in `CrdOrgSettingsRoutes.tsx`. Depends on T121

### Manual smoke

- [ ] T123 [US11] Run quickstart.md "User Story 11" smoke checklist

**Checkpoint**: User Story 11 complete.

---

## Phase 14: User Story 12 — Org Settings Tab (Priority: P1)

**Goal**: `/organization/<orgSlug>/settings/settings` renders two switches (domain-membership + contribution-roles-public).

**Independent Test**: Per quickstart.md "User Story 12".

### CRD presentational components

- [ ] T124 [US12] Create `/home/carlos/DEV/Alkemio/client-web-097/src/crd/components/organization/settings/tabs/OrgSettingsView.tsx` per `OrgSettingsViewProps`. `SettingsCard` wrapper containing two `OrgSettingsSwitchRow`s. **No Design System toggle here** (FR-132)

### Integration

- [ ] T125 [P] [US12] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/settings/useOrgDomainMembershipToggle.ts` — wraps `useUpdateOrganizationSettingsMutation` for `settings.membership.allowUsersMatchingDomainToJoin`. On failure, reverts the switch to its prior state and surfaces an inline toast (FR-133)
- [ ] T126 [P] [US12] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/settings/useOrgContributionRolesToggle.ts` — same shape, for `settings.privacy.contributionRolesPubliclyVisible`
- [ ] T127 [P] [US12] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/settings/orgSettingsMapper.ts` — pure function combining the two hooks into `OrgSettingsViewProps`
- [ ] T128 [US12] Create `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/settings/CrdOrgSettingsPage.tsx`. Depends on T124, T125, T126, T127
- [ ] T129 [US12] Wire the `settings` route in `CrdOrgSettingsRoutes.tsx`. Depends on T128

### Manual smoke

- [ ] T130 [US12] Run quickstart.md "User Story 12" smoke checklist

**Checkpoint**: User Story 12 complete — every settings tab in the contributor vertical is reachable in CRD with parity to MUI for every action.

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: i18n completeness, authorization integration tests, lint, bundle delta, end-to-end smoke.

### i18n + accessibility

- [ ] T131 [P] Translate every key in `contributorSettings.en.json` (T003) to Dutch in `/home/carlos/DEV/Alkemio/client-web-097/src/crd/i18n/contributorSettings/contributorSettings.nl.json`
- [ ] T132 [P] Translate to Spanish in `/home/carlos/DEV/Alkemio/client-web-097/src/crd/i18n/contributorSettings/contributorSettings.es.json`
- [ ] T133 [P] Translate to Bulgarian in `/home/carlos/DEV/Alkemio/client-web-097/src/crd/i18n/contributorSettings/contributorSettings.bg.json`
- [ ] T134 [P] Translate to German in `/home/carlos/DEV/Alkemio/client-web-097/src/crd/i18n/contributorSettings/contributorSettings.de.json`
- [ ] T135 [P] Translate to French in `/home/carlos/DEV/Alkemio/client-web-097/src/crd/i18n/contributorSettings/contributorSettings.fr.json`
- [ ] T136 Add an i18n key-parity Vitest at `/home/carlos/DEV/Alkemio/client-web-097/src/crd/i18n/contributorSettings/__tests__/keyParity.test.ts` — asserts every language file has the exact same key shape as the English source. Depends on T131–T135
- [ ] T137 [P] Run an `axe` accessibility scan against each CRD settings tab on the running dev server (all 7 user tabs + all 5 org tabs) and fix any critical / serious violations (SC-006). Document results in the PR description

### Authorization integration tests

- [ ] T138 [P] Add a User route-guard integration test at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/userPages/settings/CrdUserSettingsRoutes.test.tsx`: a non-owner non-admin viewer hitting `/user/<other>/settings/profile` is redirected to `/user/<other>` within one render cycle (SC-008); an admin viewer hitting the same URL renders the settings shell; an admin hitting `/user/<other>/settings/security` is redirected to `/user/<other>/settings/profile` (FR-084)
- [ ] T139 [P] Add an Org route-guard integration test at `/home/carlos/DEV/Alkemio/client-web-097/src/main/crdPages/topLevelPages/organizationPages/settings/CrdOrgSettingsRoutes.test.tsx`: a viewer without `Update` privilege hitting `/organization/<slug>/settings/profile` is redirected to `/organization/<slug>` within one render cycle (SC-009); a viewer with `Update` privilege renders the settings shell

### Cleanup, lint, bundle

- [ ] T140 Run `pnpm lint` from `/home/carlos/DEV/Alkemio/client-web-097/` and fix all reported issues (Biome / ESLint / TypeScript)
- [ ] T141 Run `pnpm vitest run` and confirm all tests pass (T009, T011, T016, T039, T045, T056, T065, T077, T078, T079, T104, T110, T136, T138, T139)
- [ ] T142 Run `pnpm analyze` and verify the combined delta of the User-settings + Org-settings chunks is ≤ +50 KB gzipped over the previous build (SC-007). If not, document any unavoidable budget overrun in the PR description with mitigation plan
- [ ] T143 [P] Sweep every new file under `src/crd/components/contributor/settings/`, `src/crd/components/user/settings/`, `src/crd/components/organization/settings/`, `src/crd/i18n/contributorSettings/`, `src/main/crdPages/topLevelPages/userPages/settings/`, and `src/main/crdPages/topLevelPages/organizationPages/settings/` to confirm no `@mui/*`, `@emotion/*`, or generated GraphQL types leak through view imports (FR-006 / FR-007). Run `grep -rln '@mui\|@emotion\|@/core/apollo/generated' src/crd/components/contributor/settings src/crd/components/user/settings src/crd/components/organization/settings src/main/crdPages/topLevelPages/userPages/settings src/main/crdPages/topLevelPages/organizationPages/settings`; expected output: only mappers (`*Mapper.ts`) may show `@/core/apollo/generated`
- [ ] T144 [P] Sweep all CRD settings components for explicit `aria-label` on every icon-only button (Save, ×, kebabs, trash, file-pick, +/× role-assignment buttons) per FR-150

### Final validation

- [ ] T145 Run the full quickstart.md smoke checklist end-to-end: every user story (US1–US12), every authorization variant (own / admin-other / non-admin-other / anonymous; org-admin / non-admin / anonymous), every CRD-on/off toggle path. Capture any regressions as bugs to fix before merge
- [ ] T146 Confirm Success Criteria SC-001 through SC-010 from spec.md hold and document in PR description (90-s My Profile + Org Profile edit flows; CRD/MUI toggle reload < 3 s; 100% notifications parity; 100% URL parity; zero critical/serious axe issues; ≤ +50 KB bundle delta; non-admin redirects within one render cycle for both actors; role-assignment network-parity)

**Checkpoint**: All 12 user stories complete, validated, and ready for merge alongside sibling spec 096-crd-user-pages.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T001 must precede T002. T003–T006 are parallel siblings.
- **Foundational (Phase 2)**: Depends on Setup completion. Internally:
  - T007 (verify 096 helper), T008 (User predicate), T010 (Org predicate) parallel.
  - T009 depends on T008. T011 depends on T010.
  - T012, T013, T014 (Shell + Strip + Card) parallel.
  - T015 must precede T016, T017, T018, T019, T020, T021 (EditableField variants reuse the shell).
  - T022 must precede T023.
  - T024 has no internal deps.
  - T026 depends on T008 + T025. T027 depends on T025. T028 depends on T010. T029 depends on T028.
- **User Stories (Phases 3–14)**: All 12 depend on Foundational. Once Foundational is complete, all 12 stories can be developed in parallel — they touch different files.
- **Polish (Phase 15)**: Depends on all 12 user stories being complete (translations need final keys; lint/analyze run on the merged surface; final smoke covers everything).

### User Story Dependencies

- **US1–US12 (12 settings tabs)**: independent of each other — each tab has its own view, mapper, and route. They share Foundational primitives:
  - All 12 share `SettingsShell` + `SettingsTabStrip` + `SettingsCard` (T012–T014).
  - US1 + US8 share the `EditableField` family (T015–T021).
  - US2 + US9 share `ContributorAccountView` (T023).
  - US10 + US11 share `RoleAssignmentView` (T024).
- All 12 stories are independently testable per the spec's "Independent Test" criteria.

### Parallel Opportunities

- **Within Phase 1**: T003, T004, T005, T006 in parallel after T002 lands.
- **Within Phase 2**: T012–T014 parallel; T017–T021 parallel after T015; T007 / T008 / T010 / T022 / T024 parallel.
- **Across Phases 3–14**: With multiple developers, all 12 stories run in parallel after Foundational completes.
- **Within each user-story phase**: CRD presentational components and integration hooks are parallel siblings; the per-tab page component (`Crd<Tab>Page.tsx`) and the route wiring are sequential at the end.
- **Within Phase 15**: T131–T135 (translations) all parallel; T137, T138, T139, T143, T144 parallel.

---

## Parallel Example: User Story 1 (My Profile)

```bash
# Foundational primitives (Phase 2) already complete. Now launch in parallel:
Task: "Create useUserMyProfileFields.ts (T032)"
Task: "Create useUserTagsetSave.ts (T033)"
Task: "Create useUserReferenceCrud.ts (T034)"
Task: "Create useUserAvatarUpload.ts (T035)"
Task: "Create MyProfileAvatarColumn.tsx (T030)"

# After all five complete, sequentially:
Task: "Create MyProfileView.tsx (T031)"
Task: "Create userMyProfileMapper.ts (T036)"
Task: "Create CrdUserMyProfilePage.tsx (T037)"
Task: "Wire profile route (T038)"

# Then in parallel:
Task: "Unit-test userMyProfileMapper (T039)"
Task: "Run smoke per quickstart (T040)"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational — every shared CRD primitive + the route shell + the conditional in `TopLevelRoutes.tsx` + the conditional in `CrdOrganizationRoutes.tsx`.
3. Complete Phase 3: User Story 1 (User My Profile).
4. **STOP and VALIDATE**: smoke-test User My Profile per quickstart.md US1.
5. With User Story 1 in place, the other 11 tabs are routed but not yet implemented. Keep the localStorage toggle OFF in production until Phase 14 completes; only enable it for developer / QA validation per phase.

### Incremental Delivery (per the spec's "ship together" rule)

The spec explicitly says all 7 user tabs ship together (FR-001) and all 5 org tabs ship together (FR-002), and they ship together with the public profiles (sibling spec 096). The phases above are organized so each user story is independently testable and demonstrable, but the PR that merges to `develop` should land all 12 (and 096's 3 stories) at once. Use the `alkemio-crd-enabled` localStorage toggle to gate developer / QA testing along the way:

1. Land Phase 1 + Phase 2 in a feature branch — toggle stays OFF for everyone except devs.
2. Land each user-story phase in sequence (or in parallel if multiple devs are working). After each, smoke-test under the toggle locally.
3. Once Phase 14 is complete and Phase 15 polish passes, open the PR for review (combined with the 096 PR if working off a single feature branch).
4. Merge with the toggle still default OFF — validation in production is gated to opted-in users until ramp-up.

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together (two or three devs; mostly parallel within Foundational). The **[SHARED-096]** tasks are coordinated with the 096 work stream.
2. Once Foundational is done, the 12 stories are split among developers (any combination — they're independent):
   - Developer A: US1 (User My Profile — the largest tab) + US8 (Org Profile — uses the same primitives)
   - Developer B: US2 + US9 (User Account + Org Account — share `ContributorAccountView`)
   - Developer C: US3 + US4 (User Membership + User Organizations)
   - Developer D: US5 (User Notifications — second largest tab)
   - Developer E: US6 + US7 (User Settings + User Security)
   - Developer F: US10 + US11 (Org Community + Org Authorization — share `RoleAssignmentView`) + US12 (Org Settings)
3. Stories complete and integrate independently; final cross-cutting Polish phase runs on the combined surface.

---

## Notes

- **Tests included**: pure mapper unit tests (T039, T045, T056, T065, T077, T104, T110); the `EditableField` state-driven rendering (T016); `useCanEditUserSettings` predicate (T009); `useCanEditOrganizationSettings` predicate (T011); `useNotificationToggle` optimistic-overrides (T078); push-availability gating (T079); i18n key parity (T136); authorization route-guard integration tests for both User (T138) and Org (T139). No per-tab functional UI tests — manual smoke per quickstart.md (precedent from 091/045/096).
- **[P] tasks** = different files, no dependencies on incomplete tasks.
- **[Story] label** maps each task to a specific user story for traceability — Setup, Foundational, and Polish phases have NO story label. Tasks shared across two stories carry both labels (e.g., `[US10 US11]` on `RoleAssignmentView`).
- **[SHARED-096]** label flags tasks shared with sibling spec 096-crd-user-pages — implement once, both specs benefit. Coordinate with 096 work stream.
- Each user story is independently completable and testable.
- Verify lint + tests after each phase; commit after each task or logical group.
- **Avoid**: vague tasks, same-file conflicts within a phase, cross-story dependencies that break independence. CRD components MUST stay free of `@mui/*` / `@emotion/*` / `@/core/apollo/generated` imports; integration mappers are the only place generated GraphQL types may surface.
