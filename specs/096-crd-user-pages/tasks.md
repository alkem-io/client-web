---
description: "Implementation tasks for CRD User Pages (public profile + 7 settings tabs)"
---

# Tasks: CRD User Pages

**Input**: Design documents from `/specs/096-crd-user-pages/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/
**Tests**: Per-story functional UI tests are NOT included (per CRD-spec convention from 091/045 — manual verification follows quickstart.md). Targeted unit tests ARE included for: pure mappers (research §14), the `EditableField` state machine, the `canEditSettings` predicate, push-availability gating, and i18n key parity. Authorization route-guard integration tests are also included.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task belongs to (US1 / US2 / US3 / US4 / US5 / US6 / US7 / US8)
- All paths are absolute under `/home/carlos/DEV/Alkemio/client-web/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: i18n namespace, integration directory skeleton, and a single conditional in `TopLevelRoutes.tsx` that flips the user vertical between MUI and CRD.

- [ ] T001 Register the new `crd-userPages` i18n namespace in `/home/carlos/DEV/Alkemio/client-web/src/core/i18n/config.ts` by adding it to `crdNamespaceImports` (lazy-load all 6 languages from `src/crd/i18n/userPages/userPages.<lang>.json`) — mirror the pattern used for `crd-spaceSettings`
- [ ] T002 Add `'crd-userPages'` to the i18next namespace type union in `/home/carlos/DEV/Alkemio/client-web/@types/i18next.d.ts` so `useTranslation('crd-userPages')` is type-checked
- [ ] T003 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.en.json` with the full skeleton of keys covering: hero (`hero.settings`, `hero.message`, `hero.messageSend`, `hero.messagePlaceholder`), public-profile sidebar (`profile.about.title`, `profile.about.empty`, `profile.organizations.title`, `profile.organizations.empty`), public-profile resource tabs (`profile.tabs.allResources`, `profile.tabs.hostedSpaces`, `profile.tabs.virtualContributors`, `profile.tabs.leading`, `profile.tabs.memberOf`, `profile.sections.resourcesHosted`, `profile.sections.spaces`, `profile.sections.virtualContributors`, `profile.sections.spacesLeading`, `profile.sections.memberOf`, `profile.empty.leading`, `profile.empty.memberOf`), settings shell (`settings.tabs.profile`, `…account`, `…membership`, `…organizations`, `…notifications`, `…settings`, `…security`), and per-tab keys for Identity / About You / Social Links / Avatar / Account / Membership / Organizations / Notifications / Settings / Security as enumerated in `data-model.md` and `contracts/`
- [ ] T004 [P] Create empty placeholder JSON files for the other five languages: `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.nl.json`, `userPages.es.json`, `userPages.bg.json`, `userPages.de.json`, `userPages.fr.json` — each starts as `{}` and is filled during T118 (Polish phase)
- [ ] T005 [P] Create the integration directory at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/` with empty subdirectories `publicProfile/`, `myProfile/`, `account/`, `membership/`, `organizations/`, `notifications/`, `settings/`, `security/` so subsequent per-page tasks have a stable path

**Checkpoint**: i18n namespace registered, integration directory skeleton in place — Foundational phase can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared CRD primitives + integration helpers + route shells the entire user vertical depends on.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

### Integration helpers + route shells

- [ ] T006 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` per the `UseUserPageRouteContext` contract in `specs/096-crd-user-pages/contracts/data-mapper.ts`. Wraps `useUserProvider` + `useCurrentUserContext` to return `{ userSlug, userId, currentUserId, loading }`. Resolves `/user/me` to the current user's nameID before returning
- [ ] T007 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/useCanEditSettings.ts` per the `UseCanEditSettings` contract. Returns `{ canEditSettings, isOwner, isPlatformAdmin }`. `isPlatformAdmin` calls `userWrapper.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin)` exactly as `UserAdminNotificationsPage` does today (FR-008a)
- [ ] T008 Unit-test `useCanEditSettings` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/useCanEditSettings.test.ts`: assert true when `currentUser.id === profileUser.id`, true when admin viewing other user, false when neither, false when both ids are undefined (anonymous). Depends on T007
- [ ] T009 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` — top-level CRD user routes mirroring the existing `src/domain/community/user/routing/UserRoute.tsx`. Two route blocks: `path="me/*"` and `path=":userNameId/*"`. Inside each, an `<Outlet />` wrapping the public-profile index route and a `path="settings/*"` sub-route that delegates to `CrdUserAdminRoutes` (T010). All page components are lazy-loaded
- [ ] T010 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/CrdUserAdminRoutes.tsx` — the seven settings sub-routes (`profile`, `account`, `membership`, `organizations`, `notifications`, `settings`, `security`) with the index redirecting to `profile`. At route-resolution time, evaluate `useCanEditSettings()`: when false, `<Navigate to={`/user/${slug}`} replace />`. For the `security` route specifically, additionally redirect to `/user/<slug>/settings/profile` when `isOwner === false` (FR-093a). Each tab page component is lazy-loaded
- [ ] T011 Modify `/home/carlos/DEV/Alkemio/client-web/src/main/routing/TopLevelRoutes.tsx` at the `/user/*` route block (lines 209-220 today): inside the existing `<NoIdentityRedirect>` and `<Suspense>`, dispatch on `useCrdEnabled()` between the lazy-loaded `<CrdUserRoutes />` and the existing `<UserRoute />` — the existing wrapping (`<NoIdentityRedirect>`, `<WithApmTransaction>`, `<Suspense>`) MUST stay exactly as-is (research §1: anonymous viewers stay redirected to login for parity). Add a new lazy import `const CrdUserRoutes = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/topLevelPages/userPages/CrdUserRoutes'))`. Depends on T009

### Shared CRD presentational components

- [ ] T012 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserPageHero.tsx` per the `UserPageHeroProps` contract in `specs/096-crd-user-pages/contracts/shell.ts`. Pure presentational: banner image (gradient fallback via `pickColorFromId`), avatar overlay, display name, location line, optional Settings (gear) icon button (renders only when `showSettingsIcon`), optional Message button (renders only when `showMessageButton` — opens `UserPageMessagePopover` from T013). Zero `@mui/*` imports. All `aria-label`s on icon-only buttons. **No presence dot** (FR-010 — Q clarification)
- [ ] T013 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserPageMessagePopover.tsx` — Radix `Popover` containing a `Textarea` and a Send button. Props: `{ onSend: (text: string) => Promise<void>; placeholder: string }`. Closes on success, displays inline error on failure. Uses CRD `popover.tsx` + `textarea.tsx` + `button.tsx` primitives only. Forwarded by `UserPageHero`'s Message button
- [ ] T014 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/UserSettingsShell.tsx` per the `UserSettingsShellProps` contract. Renders a sticky settings header (`UserPageHero`-style abbreviated: avatar + display name only, no Settings icon, no Message button) + `UserSettingsTabStrip` (T015) + `{children}` outlet
- [ ] T015 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/UserSettingsTabStrip.tsx` per the `UserSettingsTabStripProps` contract. Wraps the CRD `tabs.tsx` primitive. Each tab is a `lucide-react` icon + uppercase label. Active tab uses a `border-primary` underline. **Responsive:** on viewports below `md` the strip uses `overflow-x-auto no-scrollbar` (Q4 clarification, FR-020); the active tab MUST be auto-scrolled into view on mount and on `activeTab` change (use a ref on the active button + `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`)
- [ ] T016 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/UserSettingsCard.tsx` — primary-colored icon + bottom-bordered title + helper-text + body (children). Used by every settings tab. Uses CRD `card.tsx` primitive

### EditableField state machine + variants

- [ ] T017 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/EditableField.tsx` per the `EditableFieldShellProps` contract in `contracts/tab-myProfile.ts`. Implements the five-state machine from research §5 (`idle` / `editing` / `pending` / `idle-saved` / `editing-error`). Hover-reveal pencil glyph. Save (check) and Cancel (×) icons in `editing`. Spinner replacing Save in `pending`. Disabled Save/Cancel in `pending`; `aria-busy="true"` on the input. Inline error beneath the input in `editing-error`. Transient "Saved" indicator next to the label for ~2 s in `idle-saved`. Enter-key behavior gated by `enterIsNewline` prop (false by default; true for Bio). The state itself is owned BY the parent (controlled component) — the parent passes `status` in and the primitive renders the right UI for it. Save/Cancel handlers call `onSave` / `onCancel` props
- [ ] T018 Unit-test `EditableField` state machine at `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/EditableField.test.tsx`: idle → click value/pencil → editing; editing → click × / Escape → idle (with onCancel called); editing → click Save / Enter → pending; pending → success → idle (with `idle-saved` visible briefly); pending → failure → editing-error with typed value preserved (Q2 clarification); editing-error → Save click → pending again (retry without retyping). Use Vitest + `@testing-library/react`. Depends on T017
- [ ] T019 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/EditableTextField.tsx` per the `EditableTextFieldProps` contract. Wraps `EditableField` with a CRD `input.tsx`. Supports `text` / `email` / `tel` input types and an optional leading `lucide-react` icon (used by City — `MapPin`). Surfaces client-side `validate` errors as inline messages (mutation never fires when invalid)
- [ ] T020 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/EditableMarkdownField.tsx` per `EditableMarkdownFieldProps`. Wraps `EditableField` (with `enterIsNewline=true`) around the existing `@/crd/forms/markdown/MarkdownEditor`. Save / Cancel only via the icons (Enter inserts newline)
- [ ] T021 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/EditableSelectField.tsx` per `EditableSelectFieldProps<T>`. Wraps `EditableField` around the CRD `select.tsx` primitive. Used by the Country selector
- [ ] T022 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/EditableTagsField.tsx` per `EditableTagsFieldProps`. Wraps `EditableField` around `@/crd/forms/tags-input.tsx`
- [ ] T023 [P] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/EditableReferenceRow.tsx` per `EditableReferenceRowProps`. Renders a circular icon-tile (LinkedIn / Bluesky / GitHub / generic Link), a name input (editable only when `kind === 'arbitrary'`), a URL input (with the existing reference URL validator), an optional description input (arbitrary only), the `EditableField` Save / Cancel pair, and a trash icon that calls `onDelete` immediately (no confirmation per FR-034)

**Checkpoint**: All shared primitives and helpers ready. The seven settings tabs and the public profile can now be built in parallel.

---

## Phase 3: User Story 1 — Public User Profile Page (Priority: P1) 🎯 MVP

**Goal**: `/user/:userSlug` renders the CRD hero + sidebar (bio + organizations) + sticky resource tab strip with the five tabs filtering the visible sections per the prototype.

**Independent Test**: Per quickstart.md "Public profile" — open `/user/<self>` and `/user/<other>` (as both regular user and platform admin); verify hero, sidebar, sticky strip, tab → section filter, no presence dot, Settings + Message visibility per Q3 clarification, mobile horizontal-scroll on the strip.

### CRD presentational components

- [ ] T024 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserResourceTabStrip.tsx` per the `UserResourceTabStripProps` contract in `contracts/publicProfile.ts`. Five tabs (`allResources`, `hostedSpaces`, `virtualContributors`, `leading`, `memberOf`) — sticky to its scroll container; on `< md` uses `overflow-x-auto no-scrollbar` and auto-scrolls the active tab into view (same responsive logic as `UserSettingsTabStrip` from T015 — extract a small shared helper if helpful)
- [ ] T025 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserResourceSections.tsx` per the `UserResourceSectionsProps` contract. Implements the tab → section filter from data-model.md exactly: `allResources` → all three sections; `hostedSpaces` / `virtualContributors` → the matching sub-section of Resources Hosted; `leading` / `memberOf` → the matching section. Empty sections are omitted (no empty container — FR-015). Reuse the existing CRD `SpaceCard` from `@/crd/components/space/SpaceCard.tsx` for space items; render VC items with `Sparkles` (or `Bot`) iconed cards
- [ ] T026 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserProfileSidebar.tsx` per `UserProfileSidebarProps`. Two sections: About (renders `bio` markdown via the existing `@/crd/components/common/MarkdownContent`) + Organizations (compact rows with avatar, name, role, member count). Hidden on `< lg` viewports
- [ ] T027 [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserPublicProfileView.tsx` per `UserPublicProfileViewProps`. Composes `UserPageHero` (T012) + `UserProfileSidebar` (T026) + `UserResourceTabStrip` (T024) + `UserResourceSections` (T025) into the two-column layout (sidebar 4 cols on `lg+`, hidden on smaller; right column 8 cols). Forwards `onClickSettings` and `onSendMessage` to the hero. Depends on T012, T024, T025, T026

### Integration

- [ ] T028 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts` per `data-model.md` "Entity: `UserPublicProfile`" + "Entity: `PublicProfileResources`". Pure function mapping `useUserQuery` + `useUserAccountQuery` + `useUserContributionsQuery` + `useUserOrganizationIdsQuery` results to the `UserPublicProfileViewProps['user']` shape. Reuses `useFilteredMemberships` to split memberships into "leading" vs "member-of"
- [ ] T029 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/useResourceTabs.ts` — `useState<ResourceTabKey>('allResources')` with a setter; persists nothing to URL (parity with prototype). Exposes `{ activeResourceTab, onSelectResourceTab }` for forwarding to the view
- [ ] T030 [P] [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/useSendMessageHandler.ts` — wraps `useSendMessageToUsersMutation` from `@/core/apollo/generated/apollo-hooks`, returning an `onSendMessage(text: string): Promise<void>` callback that fires `{ message, receiverIds: [userId] }` (mirrors `UserPageBanner.handleSendMessage` exactly)
- [ ] T031 [US1] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx`. Reads `useUserPageRouteContext`, fires the four queries (user / userAccount / userContributions / userOrganizationIds), calls `publicProfileMapper`, gets `useResourceTabs` + `useSendMessageHandler`, computes `canEditSettings` via `useCanEditSettings`, and renders `<UserPublicProfileView>` with all props wired. The `onClickSettings` prop calls `useNavigate()` to `/user/<slug>/settings/profile`. Depends on T027, T028, T029, T030
- [ ] T032 [US1] Wire the public-profile route in `CrdUserRoutes.tsx` (T009): index route (`<Route index element={<CrdUserProfilePage />} />`) inside both the `me/*` and `:userNameId/*` blocks. Depends on T031

### Tests

- [ ] T033 [P] [US1] Unit-test `publicProfileMapper` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.test.ts`: a user with hosted spaces + VCs + leading + member-of → all four lists populated correctly; a user with empty memberships → empty arrays for all sections; the `recognized` reference detection for LinkedIn / Bluesky / GitHub names is case-insensitive; sections with zero items map to empty arrays so the view can omit them
- [ ] T034 [P] [US1] Unit-test the tab → section filter: a small render test on `UserResourceSections` (with mocked `MarkdownContent` if needed) at `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/UserResourceSections.test.tsx`: `allResources` renders all three sections; `hostedSpaces` renders only the Spaces sub-section; etc. Uses fixtures from contracts

### Manual smoke

- [ ] T035 [US1] Run quickstart.md "Public profile" smoke checklist with the local dev server. Verify hero + sidebar + tab filter + Settings/Message visibility (own / non-admin other / admin other) + mobile horizontal-scroll. Capture any deviations as follow-up tasks

**Checkpoint**: User Story 1 complete — the public profile is independently demoable in CRD. MVP boundary.

---

## Phase 4: User Story 2 — My Profile Settings Tab (Priority: P1)

**Goal**: `/user/<self>/settings/profile` renders the per-field-explicit-save form (Identity / About You / Social Links + right-column avatar preview) with the full state machine (idle → editing → pending → success / failure).

**Independent Test**: Per quickstart.md "My Profile" — edit each field type (text, markdown, select, tags, reference), verify the save / cancel / failure-retry / network-offline flows, verify the silent-drop-on-tab-switch behaviour, verify avatar upload commits on file-select, verify trash icon deletes references immediately.

### CRD presentational components

- [ ] T036 [P] [US2] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/MyProfileAvatarColumn.tsx` per the `AvatarColumnProps` contract in `contracts/tab-myProfile.ts`. Right-column profile picture preview: large circular avatar (with optional uploading overlay spinner), display name + tagline, "Change Avatar" file picker button, "Recommended: 400x400px. JPG, PNG or GIF." caption. The button accepts a file and calls `onAvatarFilePicked(file)` immediately (FR-033)
- [ ] T037 [US2] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/MyProfileView.tsx` per `MyProfileViewProps`. Two-column layout on `lg+` (form on the left, avatar on the right) and single column on smaller viewports. Three subsections (`Identity`, `About You`, `Social Links`), each with the icon + bottom-bordered title treatment from `UserSettingsCard`. Renders the Identity / About You / Social Links field instances passed via props (each one is an `EditableTextFieldProps` / `EditableMarkdownFieldProps` / etc.). The "Add Another Reference" button at the bottom of Social Links calls `onAddAnotherReference`. Depends on T017–T023, T036

### Integration

- [ ] T038 [P] [US2] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/myProfile/useMyProfileFields.ts` — for each editable field on the form, owns the `EditableFieldStatus` state and exposes the `onEnterEdit / onSave / onCancel` callbacks. The `onSave` of each field fires a single targeted `useUpdateUserMutation` call that preserves the rest of the user payload, then transitions `pending → idle-saved → idle` (timer ~2 s) on success or `pending → editing-error` on failure with the typed value preserved (Q2 clarification, FR-032). Implements the state machine ownership for: `displayName`, `firstName`, `lastName`, `phone`, `tagline`, `city`, `country` (uses select instead of text), `bio` (markdown), `tags` (delegates to T039 for first-tag creation)
- [ ] T039 [P] [US2] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/myProfile/useTagsetSave.ts` — for the `tags` field on the form. When the user has no existing default tagset, the first save fires `useCreateTagsetOnProfileMutation`. Subsequent saves fire `useUpdateUserMutation` against the existing tagset id within `profile.tagsets`
- [ ] T040 [P] [US2] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/myProfile/useReferenceCrud.ts` — owns the per-row state for every Social Links row (recognized + arbitrary). Wraps `useCreateReferenceOnProfileMutation`, `useUpdateReferenceMutation`, `useDeleteReferenceMutation`. Add Another Reference appends an unsaved row in `editing` (id=null); Save → `createReferenceOnProfile`; trash icon → `deleteReference` immediately (no confirmation, FR-034). Reuses the existing `referenceSegmentSchema` URL validator
- [ ] T041 [P] [US2] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/myProfile/useAvatarUpload.ts` — exposes `{ onAvatarFilePicked: (file: File) => Promise<void>; uploading: boolean }`. Calls the same upload mutation the existing MUI avatar uploader uses (locate via search for `useUploadVisualMutation` or the equivalent helper). On error, surfaces a CRD `Toast` (Edge Cases line 255) and reverts the avatar via refetch
- [ ] T042 [US2] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/myProfile/myProfileMapper.ts` — pure function (or small set of pure functions) mapping `useUserQuery` results + the four hooks above into the full `MyProfileViewProps` object. Pulls the `COUNTRIES` constant for the Country select options
- [ ] T043 [US2] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/myProfile/CrdMyProfilePage.tsx` — composes the four hooks + the mapper, renders `<UserSettingsShell>` with `<MyProfileView>` inside. Depends on T037, T038, T039, T040, T041, T042
- [ ] T044 [US2] Wire the `profile` route in `CrdUserAdminRoutes.tsx` (T010) → `<CrdMyProfilePage />`. Depends on T043

### Tests

- [ ] T045 [P] [US2] Unit-test `myProfileMapper` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/myProfile/myProfileMapper.test.ts`: handles missing optional fields (no phone, no tagline, no bio, empty tagsets); recognized references (LinkedIn, Bluesky, GitHub) sort to `socialLinks.recognized` even when missing in the data (auto-inserted as empty rows); arbitrary references end up in `socialLinks.arbitrary` in stable order; the helper text for Email is the i18n-resolved "Contact support to change email"

### Manual smoke

- [ ] T046 [US2] Run quickstart.md "My Profile" smoke checklist. Verify each field type (text / markdown / select / tags / reference) edits and saves; verify the offline-Save flow keeps the typed value preserved; verify trash deletes references immediately; verify avatar upload commits on file-select. Capture deviations as follow-up tasks

**Checkpoint**: User Story 2 complete — My Profile is independently editable end-to-end.

---

## Phase 5: User Story 3 — Account Tab (Priority: P1)

**Goal**: `/user/<self>/settings/account` renders the four card groups (Hosted Spaces / VCs / Innovation Packs / Innovation Hubs) with kebab actions that navigate to existing flows (research §3).

**Independent Test**: Per quickstart.md "Account" — confirm the four card groups render with the user's resources; click Create Virtual Contributor (navigates to existing flow); click Manage / Delete on a kebab; verify admin viewer can do the same against another user's account.

### CRD presentational components

- [ ] T047 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/AccountResourceCard.tsx` per the `AccountResourceCardItem` shape in `contracts/tab-account.ts`. Horizontal card: avatar / displayName / description / kebab dropdown. Uses CRD `card.tsx`, `dropdown-menu.tsx`, `avatar.tsx`. Each kebab entry is a `lucide-react` icon + label that calls the entry's `onClick`. Pure presentational
- [ ] T048 [US3] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/AccountView.tsx` per `AccountViewProps`. Renders the help-text info banner + four sections (Hosted Spaces, Virtual Contributors, Innovation Packs, Innovation Hubs), each with its title, optional Create button (gated by `canCreate`), the `AccountResourceCard` list, and an empty-state line when the list is empty. Depends on T047

### Integration

- [ ] T049 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/account/useAccountActions.ts` — exposes `{ onCreateSpace, onCreateVC, onCreatePack, onCreateHub, onView, onManage, onTransferOut, onDelete }` callbacks. Each one calls `useNavigate()` to the corresponding existing MUI admin route (research §3). The Delete callback opens the existing CRD `ConfirmationDialog` and on confirm fires the corresponding existing delete mutation (located via the existing MUI flows). No new mutations added
- [ ] T050 [P] [US3] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/account/accountMapper.ts` — pure function mapping `useUserAccountQuery` + `useAccountInformationQuery` + the action callbacks into `AccountViewProps`. Reads privilege flags from the same authorization fields the MUI `ContributorAccountView` reads
- [ ] T051 [US3] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/account/CrdAccountPage.tsx` composing the hook + mapper + view. Depends on T048, T049, T050
- [ ] T052 [US3] Wire the `account` route in `CrdUserAdminRoutes.tsx`. Depends on T051

### Tests

- [ ] T053 [P] [US3] Unit-test `accountMapper` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/account/accountMapper.test.ts`: privilege gating (Create button hidden when the corresponding privilege flag is false); empty resource lists; kebab entries match the `AccountKebabAction` discriminated union exactly

### Manual smoke

- [ ] T054 [US3] Run quickstart.md "Account" smoke checklist

**Checkpoint**: User Story 3 complete — the Account tab navigates to existing flows correctly.

---

## Phase 6: User Story 4 — Membership Tab (Priority: P1)

**Goal**: `/user/<self>/settings/membership` renders the Home Space card + paginated My Memberships table (with search + filter + Leave kebab) + read-only Pending Applications table.

**Independent Test**: Per quickstart.md "Membership" — pick a Home Space, tick Auto-redirect, search the memberships table, leave a membership via the Leave dialog, verify pending applications render read-only.

### CRD presentational components

- [ ] T055 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/HomeSpaceCard.tsx` per `HomeSpaceCardProps`. CRD `select.tsx` for the Home Space picker + `checkbox.tsx` for Auto-redirect (disabled when no Home Space, with the explanatory caption). Spinner overlay during the `saving` flag
- [ ] T056 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/MembershipsTable.tsx` per `MembershipsTableProps`. Uses CRD `table.tsx` + `input.tsx` (search) + `select.tsx` (filter dropdown) + `dropdown-menu.tsx` (per-row kebab with a Leave action). Pagination at ~10 rows visible, controlled via `page` / `pageSize` / `onPageChange`. Click on the row name navigates to `spaceUrl` (renders as `<a href>` — never a programmatic `useNavigate` per `src/crd/CLAUDE.md`)
- [ ] T057 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/PendingApplicationsTable.tsx` per `PendingApplicationsTableProps`. Pure read-only — no kebab, no actions. Empty-state line when `rows` is empty
- [ ] T058 [US4] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/MembershipView.tsx` per `MembershipViewProps`. Composes T055 + T056 + T057 inside `UserSettingsCard` containers. Depends on T055, T056, T057

### Integration

- [ ] T059 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/membership/useHomeSpace.ts` — wraps `useUpdateUserSettingsMutation` for both the Home Space picker and the Auto-redirect checkbox. Exposes `{ selectedSpaceId, autoRedirect, saving, onSelectSpace, onToggleAutoRedirect }`. Refetches `useUserSettingsQuery` after each mutation
- [ ] T060 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/membership/useLeaveMembership.ts` — wraps `useContributionProvider.leaveCommunity` (research §9). Opens the CRD `ConfirmationDialog` from `@/crd/components/dialogs/ConfirmationDialog`; on confirm fires the leave action and refetches `useUserContributionsQuery`. On failure surfaces the error inside the open dialog so the user can retry
- [ ] T061 [P] [US4] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/membership/membershipMapper.ts` — pure function. Includes the client-side filter + search logic over the fetched memberships list and the pagination slicing (page/pageSize). Pending applications come from `useUserPendingMembershipsQuery`
- [ ] T062 [US4] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/membership/CrdMembershipPage.tsx`. Depends on T058, T059, T060, T061
- [ ] T063 [US4] Wire the `membership` route in `CrdUserAdminRoutes.tsx`. Depends on T062

### Tests

- [ ] T064 [P] [US4] Unit-test `membershipMapper` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/membership/membershipMapper.test.ts`: search filters by `displayName` substring (case-insensitive); filter dropdown narrows by `Spaces` / `Subspaces` / `Active` / `Archived`; pagination resets to page 1 when search/filter change; the `Auto-redirect disabled when no Home Space` flag is correctly produced

### Manual smoke

- [ ] T065 [US4] Run quickstart.md "Membership" smoke checklist

**Checkpoint**: User Story 4 complete.

---

## Phase 7: User Story 5 — Organizations Tab (Priority: P1)

**Goal**: `/user/<self>/settings/organizations` renders the user's associated organizations with search, optional Create button (privilege-gated), and a Leave kebab.

**Independent Test**: Per quickstart.md "Organizations" — verify the table renders, search filters client-side, Create Organization respects the privilege gate, Leave kebab opens the confirmation dialog and removes the row on Confirm.

### CRD presentational components

- [ ] T066 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/OrganizationsTable.tsx`. CRD `table.tsx`-based; columns: avatar, name, description, location, role, associates count, verified badge, website link. Click on the org name navigates to `url` (`<a href>`). Per-row kebab with a single Leave entry
- [ ] T067 [US5] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/OrganizationsView.tsx` per `OrganizationsViewProps`. Search input + (privilege-gated) Create button + the table. Empty-state line when no organizations. Depends on T066

### Integration

- [ ] T068 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/organizations/useLeaveOrganization.ts` — wraps the existing leave-organization mutation (locate via `grep` in `src/domain/community/organization/`). Opens CRD `ConfirmationDialog`; refetches the organization list after leaving
- [ ] T069 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/organizations/useCreateOrganization.ts` — exposes `{ canCreate, onCreate }`. `canCreate` is true iff the user has the `CreateOrganization` platform privilege (existing predicate). `onCreate` calls `useNavigate()` to the existing organization-creation route
- [ ] T070 [P] [US5] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/organizations/organizationsMapper.ts` — pure function. Implements client-side search by `displayName` substring (case-insensitive)
- [ ] T071 [US5] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/organizations/CrdOrganizationsPage.tsx`. Depends on T067, T068, T069, T070
- [ ] T072 [US5] Wire the `organizations` route in `CrdUserAdminRoutes.tsx`. Depends on T071

### Tests

- [ ] T073 [P] [US5] Unit-test `organizationsMapper` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/organizations/organizationsMapper.test.ts`: search filter logic; `canCreateOrganization` privilege gating; row shape (location resolves from city/country, fallback when one is missing)

### Manual smoke

- [ ] T074 [US5] Run quickstart.md "Organizations" smoke checklist

**Checkpoint**: User Story 5 complete.

---

## Phase 8: User Story 6 — Notifications Tab (Priority: P1)

**Goal**: `/user/<self>/settings/notifications` renders every notification group / property / channel the current MUI exposes, with the optimistic-overrides update pattern, the push master toggle (gated by availability), and the push subscriptions list.

**Independent Test**: Per quickstart.md "Notifications" — flip an email switch (UI updates immediately, persists on reload); flip the push master (browser permission prompt); verify private-window banner replaces master + push columns; verify Space Admin / Platform Admin / Organization sections appear only with the right privileges.

### CRD presentational components

- [ ] T075 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/NotificationRow.tsx` per `NotificationRow` shape in `contracts/tab-notifications.ts`. One row with the property label + three switches (`inApp`, `email`, `push` — push hidden when `null`). Each switch gets `aria-busy` while `saving`
- [ ] T076 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/NotificationGroupCard.tsx` — wraps a `UserSettingsCard` with the group title + list of `NotificationRow`s
- [ ] T077 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/PushAvailabilityBanner.tsx` per `PushAvailability` shape — info banner shown when push is unavailable, with the reason-specific copy
- [ ] T078 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/PushSubscriptionsListCard.tsx` per `PushSubscriptionItem`. CRD `table.tsx`-based: one row per subscription with display name, last-used timestamp, current-device badge, and a remove button. Pure presentational — `onRemove` is a callback prop (research §4)
- [ ] T079 [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/NotificationsView.tsx` per `NotificationsViewProps`. Composes the master toggle / banner + Push Subscriptions card + the visible groups (privilege-gated; hidden groups simply omitted). Depends on T075, T076, T077, T078

### Integration

- [ ] T080 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/notifications/useNotificationToggle.ts` — implements the optimistic-overrides dictionary from research §8. Reads server values from `useUserSettingsQuery`, holds an in-memory override dictionary keyed by `(group, property, channel)`. Each `onToggle` writes the override + fires `useUpdateUserSettingsMutation`; clears the override on success; rolls back the override on failure
- [ ] T081 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/notifications/usePushSubscriptionList.ts` — wraps `usePushNotificationContext` (subscribe/unsubscribe + availability flags) and the existing push subscriptions queries / mutations the MUI component uses (located via `src/domain/community/userAdmin/tabs/components/PushSubscriptionsList.tsx` source). Returns `{ pushAvailability, pushSubscriptions }` shapes for the view
- [ ] T082 [P] [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/notifications/notificationsMapper.ts` — pure function. Reads the source-of-truth notification properties from `src/domain/community/userAdmin/tabs/model/NotificationSettings.model.ts` so the CRD layer stays in sync with the MUI side. Privilege gating reuses the existing `useCurrentUserContext.userWrapper.hasPlatformPrivilege(...)` predicates exactly as `UserAdminNotificationsPage` does (`isPlatformAdmin`, `isSpaceAdmin`, `isSpaceLead`, `isOrgAdmin`). Hidden groups are omitted entirely from `groups`
- [ ] T083 [US6] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/notifications/CrdNotificationsPage.tsx`. Depends on T079, T080, T081, T082
- [ ] T084 [US6] Wire the `notifications` route in `CrdUserAdminRoutes.tsx`. Depends on T083

### Tests

- [ ] T085 [P] [US6] Unit-test `notificationsMapper` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/notifications/notificationsMapper.test.ts`: privilege gating hides Space Admin / Platform Admin / Organization Notifications correctly; the push column on each row is `null` when `pushAvailability.available` is false
- [ ] T086 [P] [US6] Unit-test `useNotificationToggle` at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/notifications/useNotificationToggle.test.ts`: an override is applied immediately on `onToggle`; cleared on mutation success; rolled back on mutation failure
- [ ] T087 [P] [US6] Unit-test the push-availability gating: a small render test on `NotificationsView` (or `PushAvailabilityBanner`) at `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/NotificationsView.test.tsx`: when `available: false`, master toggle replaced by banner; every push column hidden across every group

### Manual smoke

- [ ] T088 [US6] Run quickstart.md "Notifications" smoke checklist

**Checkpoint**: User Story 6 complete.

---

## Phase 9: User Story 7 — Settings Tab (Priority: P1)

**Goal**: `/user/<self>/settings/settings` renders the Communication & Privacy switch + Design System on/off switch with the existing localStorage write + reload semantics.

**Independent Test**: Per quickstart.md "Settings" — flip messages-from-others (persists); flip Design System off (page reloads in MUI); flip back from MUI Settings tab (reloads in CRD).

### CRD presentational components

- [ ] T089 [P] [US7] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/DesignSystemSwitchCard.tsx` per `DesignSystemSwitchCardProps`. `UserSettingsCard` wrapper + CRD `switch.tsx`. Pure presentational — `onToggle` callback owns localStorage + reload
- [ ] T090 [US7] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/SettingsView.tsx` per `SettingsViewProps`. Two cards: Communication & Privacy (single switch for `allowOtherUsersToSendMessages`) + Design System. Depends on T089

### Integration

- [ ] T091 [P] [US7] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/settings/useDesignSystemToggle.ts` — reads `localStorage.getItem('alkemio-crd-enabled')` at mount; on toggle writes `localStorage.setItem('alkemio-crd-enabled', 'true')` or `removeItem` and calls `window.location.reload()`. The toggle is viewer-scoped (FR-083) — never tied to the target user
- [ ] T092 [P] [US7] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/settings/useAllowMessagesToggle.ts` — wraps `useUpdateUserSettingsMutation` for `settings.communication.allowOtherUsersToSendMessages`
- [ ] T093 [P] [US7] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/settings/settingsMapper.ts` — pure function combining the two hooks above into `SettingsViewProps`
- [ ] T094 [US7] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/settings/CrdSettingsPage.tsx`. Depends on T090, T091, T092, T093
- [ ] T095 [US7] Wire the `settings` route in `CrdUserAdminRoutes.tsx`. Depends on T094

### Manual smoke

- [ ] T096 [US7] Run quickstart.md "Settings" smoke checklist; in particular verify that toggling Design System reloads the page into the chosen renderer in both directions

**Checkpoint**: User Story 7 complete.

---

## Phase 10: User Story 8 — Security Tab (Priority: P1)

**Goal**: `/user/<self>/settings/security` mounts the existing Kratos `settings` flow inside a CRD card shell. Owner-only — admins viewing other users get redirected to `/profile`.

**Independent Test**: Per quickstart.md "Security" — render the Kratos passkey form, add a passkey via the existing flow, verify admin-on-other-user redirects to `/profile`, verify the no-WebAuthn info banner.

### CRD presentational components

- [ ] T097 [US8] Create `/home/carlos/DEV/Alkemio/client-web/src/crd/components/user/settings/tabs/SecurityView.tsx` per `SecurityViewProps`. Outer `UserSettingsCard` shell + a body that switches on `state.kind`: `loading` → CRD `skeleton.tsx`; `error` → existing CRD error display equivalent; `noWebauthn` → CRD info banner with the i18n-resolved alert text; `ready` → calls `renderKratos(state.flow)` (the integration layer supplies the actual Kratos render). The view itself never imports the Kratos SDK

### Integration

- [ ] T098 [P] [US8] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/security/useKratosSettingsFlow.ts` — reuses the same Kratos flow loader the existing `UserSecuritySettingsPage` uses (locate via search). Reuses the existing `REMOVED_FIELDS` filter so password / profile / OIDC link controls remain hidden. Returns the `SecurityViewState` shape
- [ ] T099 [US8] Create `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/security/CrdSecurityPage.tsx` — calls `useKratosSettingsFlow`, supplies a `renderKratos` function that wraps the flow in `<KratosForm><KratosUI /></KratosForm>`. Depends on T097, T098
- [ ] T100 [US8] Wire the `security` route in `CrdUserAdminRoutes.tsx` (T010) — already gated to owner-only by the redirect logic at the routing level. Depends on T099

### Manual smoke

- [ ] T101 [US8] Run quickstart.md "Security" smoke checklist

**Checkpoint**: User Story 8 complete — every page in the user vertical is reachable in CRD with parity to MUI for every action.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: i18n completeness, authorization integration tests, lint, bundle delta, end-to-end smoke.

### i18n + accessibility

- [ ] T102 [P] Translate every key in `userPages.en.json` (T003) to Dutch in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.nl.json`
- [ ] T103 [P] Translate to Spanish in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.es.json`
- [ ] T104 [P] Translate to Bulgarian in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.bg.json`
- [ ] T105 [P] Translate to German in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.de.json`
- [ ] T106 [P] Translate to French in `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/userPages.fr.json`
- [ ] T107 Add an i18n key-parity Vitest at `/home/carlos/DEV/Alkemio/client-web/src/crd/i18n/userPages/__tests__/keyParity.test.ts` — asserts every language file has the exact same key shape as the English source. Depends on T102–T106
- [ ] T108 [P] Run an `axe` accessibility scan against each CRD user page on the running dev server (or the prototype preview) and fix any critical / serious violations (SC-005). Document results in the PR description

### Authorization integration tests

- [ ] T109 [P] Add a route-guard integration test at `/home/carlos/DEV/Alkemio/client-web/src/main/crdPages/topLevelPages/userPages/CrdUserAdminRoutes.test.tsx`: a non-owner non-admin viewer hitting `/user/<other>/settings/profile` is redirected to `/user/<other>` within one render cycle (SC-007); an admin viewer hitting the same URL renders the settings shell; an admin hitting `/user/<other>/settings/security` is redirected to `/user/<other>/settings/profile` (FR-093a)

### Cleanup, lint, bundle

- [ ] T110 Run `pnpm lint` from `/home/carlos/DEV/Alkemio/client-web/` and fix all reported issues (Biome / ESLint / TypeScript)
- [ ] T111 Run `pnpm vitest run` and confirm all tests pass (T008, T018, T033, T034, T045, T053, T064, T073, T085, T086, T087, T107, T109)
- [ ] T112 Run `pnpm analyze` and verify the user-pages chunk delta is ≤ +30 KB gzipped over the previous build (SC-006). If not, document any unavoidable budget overrun in the PR description with mitigation plan
- [ ] T113 [P] Sweep every new file under `src/crd/components/user/`, `src/crd/i18n/userPages/`, and `src/main/crdPages/topLevelPages/userPages/` to confirm no `@mui/*`, `@emotion/*`, or generated GraphQL types leak through view imports (FR-005 / FR-006). Use `grep -rln '@mui\|@emotion\|@/core/apollo/generated' src/crd/components/user src/main/crdPages/topLevelPages/userPages`; expected output: only mappers may show `@/core/apollo/generated`
- [ ] T114 [P] Sweep all CRD components for explicit `aria-label` on every icon-only button (Settings, Message, Save, ×, kebabs, trash, file-pick) per FR-110

### Final validation

- [ ] T115 Run the full quickstart.md smoke checklist end-to-end: every user story (US1–US8), every authorization variant (own / admin-other / non-admin-other / anonymous), every CRD-on/off toggle path. Capture any regressions as bugs to fix before merge
- [ ] T116 Confirm Success Criteria SC-001 through SC-008 from spec.md hold and document in PR description (90-s My Profile edit flow; CRD/MUI toggle reload < 3 s; 100% notifications parity; 100% URL parity; zero critical/serious axe issues; ≤ +30 KB bundle delta; non-admin redirect within one render cycle; resource sections render correctly for 0 / 1 / 50+ memberships)

**Checkpoint**: All eight user stories complete, validated, and ready for merge.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T001 must precede T002. T003–T005 are parallel siblings of T002.
- **Foundational (Phase 2)**: Depends on Setup completion. Internally:
  - T006, T007, T009, T010 are parallel (different files).
  - T008 depends on T007.
  - T011 depends on T009.
  - T012, T013, T014, T015, T016 are parallel siblings (different files).
  - T017 must precede T018, T019, T020, T021, T022, T023 (the variants reuse the shell).
- **User Stories (Phases 3–10)**: All depend on Foundational. Once Foundational is complete, the eight stories can be developed in parallel — they touch different files (different tab views, different mappers, different routes).
- **Polish (Phase 11)**: Depends on all eight user stories being complete (translations need final keys; lint/analyze run on the merged surface; final smoke covers everything).

### User Story Dependencies

- **US1 (Public profile)**: independent — no dependency on settings tabs.
- **US2–US8 (Settings tabs)**: independent of each other — each tab has its own view, mapper, and route. They share the same `UserSettingsShell` (T014) which is Foundational.
- All eight stories are independently testable per the spec's "Independent Test" criteria.

### Parallel Opportunities

- **Within Phase 1**: T003, T004, T005 in parallel after T002 lands.
- **Within Phase 2**: T012–T016 (CRD primitives) parallel; T017 then T019–T023 (EditableField variants) parallel; T006, T007, T009, T010 (helpers + route shells) parallel.
- **Across Phases 3–10**: With multiple developers, eight stories run in parallel after Foundational completes.
- **Within each user-story phase**: CRD presentational components and integration hooks are parallel siblings; the per-page page component (`CrdXxxPage.tsx`) and the route wiring are sequential at the end.
- **Within Phase 11**: T102–T106 (translations) all parallel; T108, T109, T113, T114 parallel.

---

## Parallel Example: User Story 2 (My Profile)

```bash
# After Foundational is complete, the following run in parallel:
Task: "Create MyProfileAvatarColumn in src/crd/components/user/settings/tabs/MyProfileAvatarColumn.tsx"
Task: "Create useMyProfileFields in src/main/crdPages/topLevelPages/userPages/myProfile/useMyProfileFields.ts"
Task: "Create useTagsetSave in src/main/crdPages/topLevelPages/userPages/myProfile/useTagsetSave.ts"
Task: "Create useReferenceCrud in src/main/crdPages/topLevelPages/userPages/myProfile/useReferenceCrud.ts"
Task: "Create useAvatarUpload in src/main/crdPages/topLevelPages/userPages/myProfile/useAvatarUpload.ts"

# Then sequentially:
Task: "Create MyProfileView in src/crd/components/user/settings/tabs/MyProfileView.tsx"
Task: "Create myProfileMapper in src/main/crdPages/topLevelPages/userPages/myProfile/myProfileMapper.ts"
Task: "Create CrdMyProfilePage in src/main/crdPages/topLevelPages/userPages/myProfile/CrdMyProfilePage.tsx"
Task: "Wire profile route in CrdUserAdminRoutes.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational — every shared CRD primitive + the route shell + the conditional in `TopLevelRoutes.tsx`.
3. Complete Phase 3: User Story 1 (Public profile).
4. **STOP and VALIDATE**: smoke-test the public profile per quickstart.md US1.
5. Demo the public profile at this point — the eight settings tabs are still routed to MUI through the lazy fallback (well, actually no — once `useCrdEnabled()` flips, all eight settings routes would resolve to the empty `CrdUserAdminRoutes`. So the spec's "ship together" rule means we cannot demo with the toggle on until at least the seven settings tabs route to *something*. **Practical guidance**: keep the localStorage toggle OFF in production until Phase 10 completes; only enable it for developer / QA validation per phase).

### Incremental Delivery (per the spec's "ship together" rule)

The spec explicitly says all eight pages ship together (FR-001 / FR-002). The phases above are organized so each user story is independently testable and demonstrable, but the PR that merges to `develop` should land all eight at once. Use the `alkemio-crd-enabled` localStorage toggle to gate developer / QA testing along the way:

1. Land Phase 1 + Phase 2 in a feature branch — toggle stays OFF for everyone except devs.
2. Land each user-story phase in sequence (or in parallel if multiple devs are working). After each, smoke-test under the toggle locally.
3. Once Phase 10 is complete and Phase 11 polish passes, open the PR for review.
4. Merge with the toggle still default OFF — validation in production is gated to opted-in users until ramp-up.

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together (one or two devs; mostly parallel within Foundational).
2. Once Foundational is done, the eight stories are split among developers (any combination — they're independent):
   - Developer A: US1 + US3 (Public profile + Account)
   - Developer B: US2 (My Profile — the largest tab)
   - Developer C: US4 + US5 (Membership + Organizations)
   - Developer D: US6 (Notifications — the second largest tab)
   - Developer E: US7 + US8 (Settings + Security)
3. Stories complete and integrate independently; final cross-cutting Polish phase runs on the combined surface.

---

## Notes

- **Tests included**: pure mapper unit tests (T033, T045, T053, T064, T073, T085, T086, T087); the `EditableField` state machine (T018); `useCanEditSettings` predicate (T008); `useNotificationToggle` optimistic-overrides (T086); push-availability gating (T087); i18n key parity (T107); authorization route-guard integration test (T109). No per-tab functional UI tests — manual smoke per quickstart.md (precedent from 091/045).
- **[P] tasks** = different files, no dependencies on incomplete tasks.
- **[Story] label** maps each task to a specific user story for traceability — Setup, Foundational, and Polish phases have NO story label.
- Each user story is independently completable and testable.
- Verify lint + tests after each phase; commit after each task or logical group.
- **Avoid**: vague tasks, same-file conflicts within a phase, cross-story dependencies that break independence. CRD components MUST stay free of `@mui/*` / `@emotion/*` / `@/core/apollo/generated` imports; integration mappers are the only place generated GraphQL types may surface.
