---
description: "Task list for CRD Contributor Settings (User + Organization)"
---

# Tasks: CRD Contributor Settings (User + Organization)

**Input**: Design documents from `/specs/097-crd-user-settings/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Vitest unit tests are included for the per-tab data hooks (Profile per-section save state, Notifications optimistic-overrides + hard-failure revert, Membership filter / search, Role assignment add/remove with confirmation), the four Account-tab creation hooks (`useCrdCreateSpace` / `useCrdCreateVirtualContributorWizard` / `useCrdCreateInnovationPack` / `useCrdCreateInnovationHub` — mutation-variables shape + refetch list + validation gating + cancel/failure behavior, incl. each VC-wizard branch, per SC-011), the two authorization-predicate hooks (`useCanEditUserSettings`, `useCanEditOrganizationSettings`), and i18n key parity across the six languages. Visual / interaction validation is manual via the per-tab smoke checklist in `quickstart.md`.

**Organization**: Tasks are grouped by user story (US1 = User Profile, …, US12 = Org Settings) so each story can be implemented and verified independently. All 12 stories are P1 and ship together as one contributor-vertical CRD release with sibling spec `096-crd-user-pages` (the public-profile views).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks).
- **[Story]**: Which user story the task belongs to (US1 = User Profile, US2 = User Account, US3 = User Membership, US4 = User Organizations, US5 = User Notifications, US6 = User Settings, US7 = User Security, US8 = Org Profile, US9 = Org Account, US10 = Org Community, US11 = Org Authorization, US12 = Org Settings).
- File paths are absolute from the repository root (`src/...`).

## Path Conventions

This is a single Vite SPA. Source paths begin at `src/`. Two settings integration verticals live under `src/main/crdPages/topLevelPages/{userPages,organizationPages}/settings/`. Presentational CRD components live under `src/crd/components/{contributor,user,organization}/settings/`. Shared helper components live under `src/crd/components/common/`. The shared i18n namespace lives at `src/crd/i18n/contributorSettings/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repo-wide setup — confirm prerequisites, no new tooling needed.

- [ ] T001 Verify dev server runs and CRD toggle is functional: `pnpm install`, `pnpm start`, then in the browser console set `localStorage.setItem('alkemio-crd-enabled', 'true')` and reload `/user/<self>/settings/profile`. Confirm the existing MUI page renders with the toggle off and the existing CRD pages (Spaces / Dashboard / Profile from 096) render with the toggle on. Document any environment issues in this task's notes — no code change.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-cutting infrastructure that ALL twelve user stories depend on. Must complete before any user-story phase can finish.

**⚠️ CRITICAL**: User-story implementation cannot ship until this phase is complete.

### i18n namespace

- [X] T002 Create the shared CRD i18n namespace skeleton at `src/crd/i18n/contributorSettings/contributorSettings.en.json` with the top-level scoping per research §8 — `shell.tabs.{user, org}`, `user.{profile, account, membership, organizations, notifications, settings, security}`, `org.{profile, account, community, authorization, settings}`, `shared.{saved, saveFailed, addAnotherReference, ...}`. Empty placeholder values for now; per-tab i18n tasks fill them.
- [X] T003 [P] Create empty placeholder files for the other five languages: `src/crd/i18n/contributorSettings/contributorSettings.nl.json`, `contributorSettings.es.json`, `contributorSettings.bg.json`, `contributorSettings.de.json`, `contributorSettings.fr.json` — each mirroring the `en` key shape.
- [X] T004 Register the `crd-contributorSettings` namespace in `src/core/i18n/config.ts` (lazy-loaded, matching the existing `crd-exploreSpaces` registration pattern) and in `@types/i18next.d.ts`.
- [X] T005 [P] Add a Vitest assertion at `src/crd/i18n/contributorSettings/__tests__/keyParity.test.ts` that all six language files have identical key shapes.

### Shared routing helper

- [X] T005a Add `buildSettingsTabUrl(profileUrl: string | undefined, tabId: string)` to `src/main/routing/urlBuilders.ts`. Composes on top of the existing `buildSettingsUrl(entityUrl)` — returns `${buildSettingsUrl(profileUrl)}/${tabId}` when `profileUrl` is non-empty, otherwise the empty string (parity with `buildUserAccountUrl` / `buildMembershipSettingsUrl`'s defensive empty-on-undefined behaviour). Used by both the User and Org settings shells' `useUserSettingsTab` / `useOrgSettingsTab` hooks. **Spec rule:** this spec follows the new "URL Construction" rule in `docs/crd/migration-guide.md` — CRD pages and integration hooks MUST NOT inline-template URLs (`` `/user/${slug}/settings/${id}` ``); they go through `@/main/routing/urlBuilders`. New URL shapes earn a new builder rather than a hand-rolled template.

### Shared CRD presentational primitives

- [X] T006 [P] Implement `SettingsShell` at `src/crd/components/contributor/settings/SettingsShell.tsx` per `contracts/shell.ts`. Sticky header (avatar + display name) + body slot for the active tab. Pure presentational; receives `tabs`, `activeTabId`, `onTabSelect`, `header`, `children` as props (research §9).
- [X] T007 [P] Implement `SettingsTabStrip` at `src/crd/components/contributor/settings/SettingsTabStrip.tsx` per `contracts/shell.ts`. Horizontal tab strip; below `md` breakpoint use `overflow-x-auto no-scrollbar`; auto-scroll the active tab into view on mount and on every tab change (FR-014). Keyboard navigation per FR-151 — Tab into strip, Left/Right arrows, Enter to activate.
- [X] T008 [P] Implement `SettingsCard` at `src/crd/components/contributor/settings/SettingsCard.tsx` — wrapper card primitive used by every per-tab content block (icon + heading + bottom border + body slot).
- [X] T009 [P] Extract `FieldFooter` from 045's `SpaceSettingsAboutView.tsx` into a shared primitive at `src/crd/components/common/FieldFooter.tsx`. Props per `contracts/tab-userProfile.ts` `EditableSectionProps`: `hint`, `dirty`, `status: SectionSaveStatus`, `onSave`. Renders the dirty indicator + Save button + per-render status (idle / saving / saved / error). On `status.kind === 'saved'` the "Saved!" indicator displays for `SAVED_FLASH_MS = 1800` ms (matches 045). Save button exposes `aria-busy` while saving and `disabled` while saving (FR-150). Update 045's `SpaceSettingsAboutView.tsx` to import from the new shared location.
- [X] T010 [P] Implement `ContributorAccountView` at `src/crd/components/contributor/settings/ContributorAccountView.tsx`. Renders the four card groups (Hosted Spaces, Virtual Contributors, Template Packs, Custom Homepages) per the prototype-faithful empty-state patterns (FR-033 / FR-103). Hosted Spaces and Virtual Contributors render existing items + an inline dashed "Create New" card (always present). Template Packs render existing items + up to 3 dashed "Empty Slot" placeholders. Custom Homepages render cards when non-empty OR a centered full empty-state with icon + heading + descriptive copy + CTA + capacity indicator when empty. All `onCreate*`, `onManage`, `onDelete` are received as callback props; the view never imports `react-router-dom` (FR-007).
- [X] T011 [P] Implement `RoleAssignmentView` at `src/crd/components/contributor/settings/RoleAssignmentView.tsx`. Two-column layout — current members (with × per row) and available users (search input above + + per row + load-more pagination). All actions are callback props. **Remove (×) calls `onRequestRemove(id)` — the parent integration page owns the destructive `ConfirmationDialog`** (Rule #9 / FR-112 / FR-121). All i18n strings (`currentTitle`, `availableTitle`, `searchPlaceholder`, `addAriaLabel`, `removeAriaLabel`, `loadMoreLabel`, `emptyCurrentLabel`, `emptyAvailableLabel`) come in via a `labels` prop so the component stays namespace-agnostic and can be shared by both Org Community (US10 — Associate role) and Org Authorization (US11 — Admin / Owner sub-tabs).
- [X] T012 [P] Implement `OrgVerifiedBadge` at `src/crd/components/contributor/settings/OrgVerifiedBadge.tsx` per Decision #12. Three states based on `status` prop (`'verified' | 'pending' | 'notVerified'`); read-only (no edit affordance per FR-094).

### Per-actor authorization predicate hooks

- [X] T013 [P] Implement `useCanEditUserSettings` at `src/main/crdPages/topLevelPages/userPages/useCanEditUserSettings.ts` per Decision #7. Returns `{ canEditSettings, isOwner, isPlatformAdmin }`. Uses `useCurrentUserContext().hasPlatformPrivilege(PlatformAdmin)` and `currentUser.id === profileUserId`. **Note**: 096 already added `useCanEditSettings.ts` in this folder; either rename / extend that file or re-export under both names. Document the alias in the file header.
- [X] T014 [P] Implement `useCanEditOrganizationSettings` at `src/main/crdPages/topLevelPages/organizationPages/useCanEditOrganizationSettings.ts` per Decision #7. Returns `{ canEditSettings, hasUpdatePrivilege }` from `useOrganizationProvider().permissions.canEdit`.
- [X] T015 [P] Add Vitest unit tests at `src/main/crdPages/topLevelPages/__tests__/canEditPredicates.test.ts` covering both predicate hooks: User (owner / platform admin / non-admin / anonymous → 4 viewer categories per FR-010 / SC-008); Org (Update privilege true / false → FR-011 / SC-009).

### Route shells + access guards + tab-state hooks

- [X] T016 [P] Implement `useUserSettingsAccessGuard` at `src/main/crdPages/topLevelPages/userPages/settings/useUserSettingsAccessGuard.ts`. Wraps `useCanEditUserSettings`; on `canEditSettings === false` calls `navigate(profileUrl, { replace: true })` (FR-010) where `profileUrl` is the user's `profile.url` from `useUserPageRouteContext` (no hand-built `/user/<slug>` template). Returns the predicate result so consumers can also branch on it (Security tab visibility per FR-012 / FR-083 / FR-084).
- [X] T017 [P] Implement `useOrgSettingsAccessGuard` at `src/main/crdPages/topLevelPages/organizationPages/settings/useOrgSettingsAccessGuard.ts`. Wraps `useCanEditOrganizationSettings`; on `canEditSettings === false` calls `navigate(profileUrl, { replace: true })` (FR-011) where `profileUrl` is `organization.profile.url`.
- [X] T018 [P] Implement `useUserSettingsTab` at `src/main/crdPages/topLevelPages/userPages/settings/useUserSettingsTab.ts`. Resolves `activeTabId` from the URL (`useLocation` → segment scan); exposes `onTabSelect(id)` that pushes `buildSettingsTabUrl(profileUrl, id)` from `@/main/routing/urlBuilders` (T005a) — never an inline `/user/...` template per the migration-guide URL Construction rule. Receives `profileUrl` from the integration page (sourced from `useUserPageRouteContext().profileUrl`). Maps tab id → URL segment (`'profile' | 'account' | 'membership' | 'organizations' | 'notifications' | 'settings' | 'security'`).
- [X] T019 [P] Implement `useOrgSettingsTab` at `src/main/crdPages/topLevelPages/organizationPages/settings/useOrgSettingsTab.ts`. Same pattern as T018; tab ids `'profile' | 'account' | 'community' | 'authorization' | 'settings'`. Receives `profileUrl` from the integration page (sourced from `organization.profile.url`); navigation routes through `buildSettingsTabUrl` (T005a).
- [X] T020 [P] Implement `CrdUserSettingsRoutes` at `src/main/crdPages/topLevelPages/userPages/settings/CrdUserSettingsRoutes.tsx`. Routes matching `/user/:userSlug/settings/*` to `CrdUserSettingsPage`; runs `useUserSettingsAccessGuard` at the top to redirect on access denied. Each tab id resolves to the corresponding `Crd<Tab>Tab` lazy import (placeholder until per-tab phases land).
- [X] T021 [P] Implement `CrdOrgSettingsRoutes` at `src/main/crdPages/topLevelPages/organizationPages/settings/CrdOrgSettingsRoutes.tsx`. Same pattern; access guard via `useOrgSettingsAccessGuard`.
- [X] T022 Implement `CrdUserSettingsPage` at `src/main/crdPages/topLevelPages/userPages/settings/CrdUserSettingsPage.tsx`. Hosts `SettingsShell` with the User 7-tab list (resolved labels from i18n + lucide-react icons). Pulls `userId`, `userModel`, `profileUrl` from `useUserPageRouteContext` — **never** a `userSlug` (the prior 097 draft accidentally inherited that name from the prototype; the canonical handle is `profileUrl`). Passes `profileUrl` into `useUserSettingsAccessGuard` and `useUserSettingsTab` so navigation/redirects route through `buildSettingsTabUrl` per the URL Construction rule. Receives `activeTabId` from `useUserSettingsTab`; renders the active tab's component as a child slot. Hides the Security tab (`tabs[6].hidden = true`) for non-owner viewers per FR-012 / FR-083.
- [X] T023 Implement `CrdOrgSettingsPage` at `src/main/crdPages/topLevelPages/organizationPages/settings/CrdOrgSettingsPage.tsx`. Same pattern with the Org 5-tab list. Pulls `organizationId`, `organization` from `useOrganizationContext` and reads `profileUrl = organization.profile.url`; passes `profileUrl` into `useOrgSettingsAccessGuard` and `useOrgSettingsTab` (no locally-derived `organizationSlug`).
- [X] T024 Modify `src/main/routing/TopLevelRoutes.tsx` — wire the User-shell dispatch under the existing `/user/*` block: when `useCrdEnabled()` is true, lazy-load `CrdUserSettingsRoutes` for the `settings/*` subtree (preserving 096's existing `/user/:userSlug` public-profile route + `<NoIdentityRedirect>` and `<WithApmTransaction>` wrappers).
- [X] T025 Modify `src/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes.tsx` — at the existing `settings/*` route (currently hard-coded to `<MuiOrganizationAdminRoutes />`), gate via `useCrdEnabled() ? <CrdOrgSettingsRoutes /> : <MuiOrganizationAdminRoutes />` per research §1. The 096 public-profile route in this file is unchanged.

**Checkpoint**: Both shells render placeholder tab bodies; all 12 tabs reachable by URL with correct active highlight; CRD-off renders existing MUI shells unchanged. Ready to land per-tab phases in any order.

**MVP-first deferred (carried into per-story phases):**
- **T010 / T011 / T012** — `ContributorAccountView`, `RoleAssignmentView`, `OrgVerifiedBadge` are unblockers for US2 / US8–US12 only. They are NOT consumed by US1 (User Profile MVP) and are deferred to their owning story phases.
- **T033a–T033f (Account-tab CRD creation dialogs/wizard + Apollo hooks + tests)** — the four CRD ports of the MUI create dialogs (FR-034 / research §3) and their shared integration hooks live in Phase 4 (US2 owns them) but are CONSUMED by both US2 and US9. They are not on the US1 (MVP) critical path. The shared hooks land under `src/main/crdPages/topLevelPages/account/` once; `CrdOrgAccountTab` (T068) just reuses them with `organization.account.id`.
- **T024 (note)** — in this codebase the User-shell dispatch was already extracted to `CrdUserRoutes.tsx` by 096; the MVP wires the `useCrdEnabled() ? CrdUserSettingsRoutes : MuiUserAdminRoute` toggle there rather than in `TopLevelRoutes.tsx`. Functionally equivalent.

---

## Phase 3: User Story 1 — User Profile (Priority: P1) 🎯 MVP

**Goal**: Migrate the User Profile tab (`/user/:userSlug/settings/profile`) from MUI to CRD with the per-section explicit-save model (matches 045 About), per-section "Saved!" flash, inline-error-until-next-edit, references list with confirmation-gated delete, immediate avatar upload commit.

**Independent Test**: With CRD on, open `/user/<self>/settings/profile`. Edit Display Name in the section's input, click the section's Save — value persists, "Saved!" flashes for ~1.8 s. Add a LinkedIn reference, click References-section Save — created. Click trash on a saved reference — confirmation dialog appears; Confirm + click Save — deleted. Upload avatar — commits immediately. As a platform admin viewer on `/user/<otherUser>/settings/profile`: page is fully editable, saves persist against the target. As non-admin on someone else's: redirected to `/user/<otherUser>`.

### Mapper + per-tab data hook

- [X] T026 [P] [US1] Implement `userProfileMapper.ts` at `src/main/crdPages/topLevelPages/userPages/settings/profile/userProfileMapper.ts`. Pure function mapping `User` GraphQL data + recognized-references partition (`linkedin` / `bsky` / `github` case-insensitive) + arbitrary references list to `UserProfileViewProps` per `contracts/tab-userProfile.ts`. Extracts `Skills` and `Keywords` tagsets from `user.profile.tagsets[]` by case-insensitive name match (mirroring `UserProfileView.tsx`'s reader) into `{ id?: string; tags: string[] }` shapes — `id` is undefined when the tagset doesn't yet exist on the profile. Includes the `mapUserToFormValues` analog of 045's `mapSpaceToAboutFormValues` — produces the section values buffer the per-tab hook consumes. Validation rules per data-model.md (URL live, phone live, required-field on Save). **Note (post-clarification): the prior single `tags: string[]` + `tagsetId: string | null` shape is replaced by separate `skills` and `keywords` slots; the implementation must be revisited to match this contract.**
- [X] T027 [US1] Implement `useUserProfileTabData` at `src/main/crdPages/topLevelPages/userPages/settings/profile/useUserProfileTabData.ts` — the per-section save hook, parallel to 045's `useAboutTabData`. Holds `values` + `saved` + `dirtyByField` + `saveStatusByField` + `pendingReferenceDeleteId`. Exposes `onChange(patch)`, `onAddReference()`, `onUpdateReference(id, patch)`, `onRequestRemoveReference(id)`, `onConfirmRemoveReference()`, `onCancelRemoveReference()`, `onSaveSection(section)`, and `onAvatarFilePicked(file)`. `onSaveSection` fires the targeted mutation: `updateUser` (single sections), `updateUser` with `profile.location` patch (compound `location` section), per-tagset save for `skills` / `keywords` (each section patches ONLY its own tagset entry in `profileData.tagsets`; on first save when the tagset doesn't yet exist, fires `createTagsetOnProfile({ profileID, name: '<Skills|Keywords>', tags })` and adopts the returned id into the buffer), references batch (`createReferenceOnProfile` x N + `updateReference` x M + `deleteReference` x P) on `references`. On success, runs `flashSaved(section)` with `SAVED_FLASH_MS = 1800` and merges fresh server values into `saved`. On failure sets `saveStatusByField[section] = { kind: 'error', message }` and leaves `values[section]` untouched. **Note (post-clarification): replaces the prior single `tags` section with two independent `skills` and `keywords` sections per the renamed contract `tab-userProfile.ts`. Saving Skills MUST NOT touch Keywords and vice versa.**
- [X] T028 [P] [US1] Add Vitest unit tests at `src/main/crdPages/topLevelPages/userPages/settings/profile/__tests__/useUserProfileTabData.test.ts` covering: per-section idle → saving → saved → idle (with the 1800 ms timer); per-section saving → error; error → idle on next edit; references batch (add + edit + delete in one save click); pendingReferenceDeleteId state machine (request → confirm fires deleteReference, request → cancel does not); URL-format live validation (Save disabled while invalid); required-field empty check on Save click for Display Name / First Name / Last Name; avatar upload immediate commit (no Save click).

### Presentational view

- [X] T029 [US1] Implement `UserProfileTabView` at `src/crd/components/user/settings/UserProfileTabView.tsx` per `contracts/tab-userProfile.ts`. Two-column layout on `lg+` (form left, avatar column right); single column below `lg`. Form sections in order: Identity (Display Name solo row; First Name + Last Name in a 2-col `FieldPairRow` on `md+`; Email read-only + Phone in a 2-col `FieldPairRow` on `md+`), About You (Tagline; Location compound; Bio; **Skills** — own labeled tagset editor + own Save; **Keywords** — own labeled tagset editor + own Save), Social Links / References. Each section composes one of `InlineEditText` / `MarkdownEditor` / `CountryCombobox` / `TagsField` plus `FieldFooter`. References section uses an `EditableReferenceRow` sub-component that renders the recognized-tile or arbitrary-row variants. **No per-field pencil / check / × icons. No single unified "Tags" input.** The `pendingReferenceDelete` `ConfirmationDialog` is rendered at the view level; props come from the integration hook.

### Integration page

- [X] T030 [US1] Implement `CrdUserProfileTab` at `src/main/crdPages/topLevelPages/userPages/settings/profile/CrdUserProfileTab.tsx`. Wires `useUserPageRouteContext` (096) → `useUserQuery` → `useUserProfileTabData` (T027) → `userProfileMapper` (T026). Renders `UserProfileTabView` with the produced props. Wraps `onSaveSection` calls in `useTransition` (Constitution Principle II). Handles the loading state via skeleton placeholders sized to the eventual content.

### i18n keys (User Profile)

- [X] T031 [US1] Add User Profile keys to `src/crd/i18n/contributorSettings/contributorSettings.en.json` under `user.profile.*` and shared edit-pattern strings under `shared.*`. Keys: section labels (`displayName.label`, `firstName.label`, ..., `references.title`, `references.addAnother`), section hints, the recognized tiles' brand labels (`socialLinks.linkedin`, `socialLinks.bsky`, `socialLinks.github` — verify if `translation` namespace already has these per FR-142), the avatar column copy (`avatar.changeButton`, `avatar.helperText`), the references confirmation copy (`references.deleteDialogTitle`, `references.deleteDialogBody`, `references.deleteConfirm`). **Skills / Keywords keys (post-clarification):** drop any `aboutYou.tags.*` keys. Add `aboutYou.skills.{label, hint, placeholder}` and `aboutYou.keywords.{label, hint, placeholder}` instead — one block per profile tagset. **Parity reuses (FR-142)**: `forms.validations.elementMustBeValidUrl` (URL invalid), email read-only caption. Document each reuse in `userProfileMapper.ts`.
- [X] T032 [P] [US1] Translate all User Profile keys added in T031 into `nl.json`, `es.json`, `bg.json`, `de.json`, `fr.json` (manual AI-assisted per `src/crd/CLAUDE.md`).
- [X] T032a [US1] **Realign User Profile implementation with the post-clarification Skills/Keywords contract.** T026 / T027 / T029 / T031 / T032 were originally implemented against a single `tags: string[]` + `tagsetId: string | null` shape; the contract has since been tightened (this file plus `contracts/tab-userProfile.ts`, `data-model.md` row "User Story 1 — Tagsets", `research.md` per-section table). Apply the following code edits in one PR: (1) `UserProfileTabView.types.ts` — replace `tagsetId: string | null` and `tags: string[]` on `UserProfileFormValues` with `skills: { id?: string; tags: string[] }` and `keywords: { id?: string; tags: string[] }`; replace the `UserProfileSectionKey` literal `'tags'` with `'skills' | 'keywords'`. (2) `userProfileMapper.ts` — extract Skills + Keywords tagsets via case-insensitive `tagset.name` lookup (mirrors `UserProfileView.tsx`), `id` undefined when the tagset doesn't exist; drop the legacy `tagsetId` field. (3) `useUserProfileTabData.ts` — split the prior `tags` save path into independent `skills` and `keywords` sections; each section's `onSaveSection` patches ONLY its own tagset entry in `profileData.tagsets`, falling back to `createTagsetOnProfile({ profileID, name: 'Skills' | 'Keywords', tags })` on first save when `id` is undefined, then adopts the returned id into the buffer. (4) `UserProfileTabView.tsx` — render two `TagsSection` instances ("Skills", "Keywords") with their own `FieldFooter` + Save buttons; remove the unified "Tags" section. (5) `contributorSettings.{en,nl,es,bg,de,fr}.json` — drop `user.profile.aboutYou.tags.*`; add `aboutYou.skills.*` + `aboutYou.keywords.*`; key-parity test (T005) MUST pass. (6) `useUserProfileTabData.test.ts` — split the `tags` test cases into `skills` and `keywords` cases; assert independence (saving Skills does NOT touch Keywords).

---

## Phase 4: User Story 2 — User Account (Priority: P1)

**Goal**: Migrate the User Account tab (`/user/:userSlug/settings/account`) — four card groups via the shared `ContributorAccountView` (T010) with prototype-faithful empty states (FR-033). Each "Create" affordance opens a CRD (shadcn) creation dialog — a parity port of the corresponding MUI dialog (FR-034 / research §3); `Manage` navigates to the resource's existing settings URL; `Delete` uses a CRD `ConfirmationDialog` + the existing delete mutation. The four CRD creation dialogs/wizard built here are SHARED with US9 (Org Account).

**Independent Test**: With CRD on, open `/user/<self>/settings/account`. Help banner + four card groups visible with the user's actual resources. With 0 hosted spaces — only the dashed "Create New Space" inline card shows; click it — the CRD `CrdCreateSpaceDialog` opens (no route navigation); complete it and the new space appears in the Hosted Spaces grid (and is reachable on reload). Click "Create Virtual Contributor" — the CRD VC wizard opens at its first step; walk the *create-knowledge* branch (add a post + a document, pick/create a community space) and the VC appears in the Virtual Contributors group. With 0 custom homepages — full empty-state with CTA + "Capacity: 0/1 Used" indicator; click it — `CrdCreateInnovationHubDialog` opens. Click a hosted resource's kebab → Manage — the app navigates to that resource's settings URL. Click a resource's kebab → Delete — `ConfirmationDialog` opens; Confirm fires the existing delete mutation and the card disappears.

### Mapper + integration page

- [X] T033 [P] [US2] Implement `userAccountMapper.ts` at `src/main/crdPages/topLevelPages/userPages/settings/account/userAccountMapper.ts`. Pure function mapping `useUserAccountQuery` + `useAccountInformationQuery({accountId})` data to the props the shared `ContributorAccountView` expects. Each row mapped per data-model.md (id, displayName, description from tagline ?? description, avatarUrl, href, kebab actions derived from privileges — `manage` → resource settings URL, `delete` → opens the CRD `ConfirmationDialog`). Resolves the `onCreate*` / `onManage` / `onDelete` callbacks at the integration page level (T034).

### Account-tab creation dialogs (CRD presentational — shared with US9)

- [ ] T033a [P] [US2] Implement `CrdCreateSpaceDialog` at `src/crd/components/contributor/settings/create/CrdCreateSpaceDialog.tsx` per `contracts/account-create-dialogs.ts` — **parity port of MUI `src/domain/space/components/CreateSpace/createSpace/CreateSpace.tsx` + `CreateSpaceForm`**. Single-step `Dialog`: `displayName`, `nameID` (auto-derived from `displayName`, editable), `tagline`, `description` (`MarkdownEditor`), `tags` (`TagsInput`), `spaceTemplateId` (`Select` over `templates` — only templates with exactly 4 innovation-flow states are passed in), `addTutorialCallouts` (`Checkbox`), `bannerFile` + `cardBannerFile` (file inputs with constraint hints — same pattern as `CreateSubspaceDialog`), `acceptedTerms` (`Checkbox` whose label links `termsHref`). Pure presentational — all values/errors/status come via props; `onChange`/`onSubmit`/`onOpenChange` are callbacks. No `@mui/*`, no GraphQL types.
- [ ] T033b [P] [US2] Implement `CrdCreateInnovationPackDialog` at `src/crd/components/contributor/settings/create/CrdCreateInnovationPackDialog.tsx` and `CrdCreateInnovationHubDialog` at `src/crd/components/contributor/settings/create/CrdCreateInnovationHubDialog.tsx` per `contracts/account-create-dialogs.ts` — parity ports of MUI `CreateInnovationPackDialog`/`InnovationPackForm` (create variant: `displayName` + `description` markdown) and MUI `CreateInnovationHubDialog`/`InnovationHubForm` (create variant: `subdomain` + `displayName` + `tagline` + `description` markdown). Single-step `Dialog`s; presentational only.
- [ ] T033c [US2] Implement `CrdCreateVirtualContributorWizard` at `src/crd/components/contributor/settings/createVc/CrdCreateVirtualContributorWizard.tsx` (multi-step `Dialog` shell — step state via props) plus the six step components in the same folder per `contracts/account-create-dialogs.ts`: `InitialProfileStep.tsx` (`name`, `tagline`, `description` markdown, `avatarFile`, `engine`, `bodyOfKnowledgeType`, source selector — *createSpace* / *existingSpace* / *external*), `AddKnowledgeStep.tsx` (`posts[]` 1–25 + `documents[]`), `ChooseCommunityStep.tsx` (pick `spaceId` from `availableSpaces`, or '' = create a new space), `UseExistingSpaceStep.tsx` (`subspaceId`), `ExternalAiStep.tsx` (`engine`, `apiKey`, conditional `assistantId`), `TryVcInfoStep.tsx` (success screen — `createdVcName`, `createdVcUrl`). **Full parity port of the MUI `useVirtualContributorWizard` markup** — same steps, same per-step fields. Presentational only — every step's values + change handlers + the step state + `onSubmitStep`/`onBack` are props. No `@mui/*`, no GraphQL types, no Apollo.

### Account-tab creation hooks (Apollo wiring — shared with US9)

- [ ] T033d [P] [US2] Implement the single-step create hooks under `src/main/crdPages/topLevelPages/account/`: `useCrdCreateSpace.ts` (wraps the existing `useSpaceCreation` / `useCreateSpaceMutation` — `spaceData.accountID` from a `{ accountId }` arg, `licensePlanID` auto-picked from the account's first available plan, `includeVisuals` when a banner/cardBanner file is present, visuals uploaded after the mutation via `useUploadVisualMutation`, refetch `AccountInformation` + dashboard spaces; surfaces `templates` from the existing space-templates query; manages form values + live validation + status), `useCrdCreateInnovationPack.ts` (wraps `useCreateInnovationPackMutation` — `packData.accountID`; refetch `AdminInnovationPacksList`, `AccountInformation`, `InnovationLibrary`; success toast), `useCrdCreateInnovationHub.ts` (wraps `useCreateInnovationHubMutation` — `hubData.accountID`, fixed `type: List` + empty `spaceListFilter`; refetch `AdminInnovationHubsList`, `AccountInformation`; success toast). Each returns the `Crd*DialogProps` shape (open/onOpenChange/values/errors/status/canSubmit/onChange/onSubmit) keyed off an `accountId` parameter so both `CrdUserAccountTab` and `CrdOrgAccountTab` reuse it.
- [ ] T033e [US2] Implement `useCrdCreateVirtualContributorWizard.ts` at `src/main/crdPages/topLevelPages/account/useCrdCreateVirtualContributorWizard.ts` — **full Apollo wiring port of MUI `useVirtualContributorWizard`** (`src/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard.tsx`). Holds step state + all step value slices; on each step's submit fires the corresponding mutation(s) in the same order as MUI: `useCreateVirtualContributorOnAccountMutation` (main create — assembles `virtualContributorData.{accountID, bodyOfKnowledgeType, bodyOfKnowledgeID?, profileData, aiPersona.{engine, externalConfig?}, knowledgeBaseData.calloutsSetData.calloutsData}` from posts → Post callouts + documents → a Link callout collection), `useUploadVisualMutation` (avatar), `useRefreshBodyOfKnowledgeMutation`, `useCreateLinkOnCalloutMutation` (per document), `useCreateSpaceMutation` (when a space is created for the VC in `chooseCommunity`), `useAssignRoleToVirtualContributorMutation` (community assignment, `RoleName.Member`). Refetches: `MyAccount`, `AccountInformation`, the account-resources query, `LatestContributionsSpacesFlat`. Returns the `CrdCreateVirtualContributorWizardProps` shape keyed off an `{ accountId, accountHostName? }` arg.
- [ ] T033f [P] [US2] Add Vitest unit tests at `src/main/crdPages/topLevelPages/account/__tests__/accountCreateHooks.test.ts` covering, for each of the four flows (SC-011): the mutation is called with the expected variables shape (per data-model.md "Account-tab creation dialogs"); the expected refetch-queries list is passed; live validation gates `canSubmit` (e.g. invalid `nameID`/`subdomain`, empty required fields, `acceptedTerms` unchecked → cannot submit); cancel fires no mutation; mutation hard-failure leaves `status: error` with values preserved. For the VC wizard, exercise each of the three knowledge-source branches (createSpace / existingSpace / external) and assert the per-branch mutation order.

### Integration page + i18n

- [ ] T034 [US2] Implement `CrdUserAccountTab` at `src/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountTab.tsx`. Wires data → mapper → `ContributorAccountView`. Resolves `accountId` from `useUserAccountQuery`. Instantiates the four shared create hooks (`useCrdCreateSpace({accountId})` / `useCrdCreateVirtualContributorWizard({accountId, accountHostName})` / `useCrdCreateInnovationPack({accountId})` / `useCrdCreateInnovationHub({accountId})`), wires `onCreateSpace`/`onCreateVc`/`onCreateInnovationPack`/`onCreateInnovationHub` to open the respective dialog (sets the dialog's `open` to true), and renders `<CrdCreateSpaceDialog>` / `<CrdCreateVirtualContributorWizard>` / `<CrdCreateInnovationPackDialog>` / `<CrdCreateInnovationHubDialog>` at the page level. `onManage(kind, id, href)` → `navigate(href)` (the resource's settings URL); `onDelete(kind, id, name)` → `setPendingDelete(...)` and renders the delete `ConfirmationDialog` at the page level using the existing 045-style `pendingDeleteId` pattern. **No `navigate('/admin/...')` calls.**
- [ ] T035 [US2] Add User Account + creation-dialog keys to `src/crd/i18n/contributorSettings/contributorSettings.en.json`: under `user.account.*` (Help banner copy, four sub-section headings, "Create New Space" / "Create New Contributor" / "Empty Slot" / "No Custom Homepages" + descriptive copy / "Capacity: 0/1 Used" indicator copy + "Create Homepage" CTA label); and under `shared.accountCreate.*` (titles + field labels + hints + submit/cancel labels + error/success toasts for `CrdCreateSpaceDialog` — incl. the space-template picker and the terms checkbox — `CrdCreateInnovationPackDialog`, `CrdCreateInnovationHubDialog`, and every step of `CrdCreateVirtualContributorWizard` — step titles, the source-selector options, the posts/documents editors, the choose-community / use-existing-space pickers, the external-AI fields, the try-VC success copy). Reuse existing `translation`-namespace validation keys where they already exist (FR-142 — e.g. `forms.validations.*`, terms-dialog copy). Translate every new key to nl/es/bg/de/fr in the same task (key-parity test T005 covers all six).

**Checkpoint**: User Account renders under CRD-on with parity behavior. Empty states match prototype exactly. The four "Create" affordances open CRD dialogs (never navigate); each fires the same mutation(s) + refetches as the MUI dialog (SC-011).

---

## Phase 5: User Story 3 — User Membership (Priority: P1)

**Goal**: Migrate User Membership (`/user/:userSlug/settings/membership`) — Home Space card + **Memberships card grid** (search/filter/leave; matches `prototype/src/app/pages/UserMembershipPage.tsx`) + Pending Applications compact list.

**Independent Test**: With CRD on, open `/user/<self>/settings/membership`. Pick a Home Space — dropdown + mutation fires. Tick Auto-redirect — persists. Search "Garden" — grid filters client-side. Leave a membership via the card's kebab ("Leave Space" / "Leave Subspace") → `ConfirmationDialog` → Confirm — card removed. Cards show banner image + tagline + role badge + "Led by:" avatar footer (sourced from per-row `useSpaceContributionDetailsQuery` enrichment, mirroring MUI's `ContributionCard`).

- [X] T036 [P] [US3] Implement `userMembershipMapper.ts` at `src/main/crdPages/topLevelPages/userPages/settings/membership/userMembershipMapper.ts`. Maps `useUserSettingsQuery` (HomeSpace), `useUserContributionsQuery` (id/displayName/role per L0 + flattened subspaces), `useUserPendingMembershipsQuery` (pending applications), AND a `Map<spaceId, MembershipEnrichment>` from `useMembershipEnrichment` (per-row banner/tagline/spaceUrl/leadUsers/roleSetID) to the view props per data-model.md. Also exports `filterMemberships(rows, search, filter)` and `collectMembershipSpaceIds(contributions)` (the integration page uses the latter to drive the enrichment hook). Subspaces' `spaceId` is the subspace's own id (NOT the L0 parent's) — each subspace has its own role-set, so Leave is scoped to the subspace itself.
- [X] T037 [US3] Implement `useUserMembershipTabData` at `src/main/crdPages/topLevelPages/userPages/settings/membership/useUserMembershipTabData.ts`. Holds search + filter state (client-side; **no pagination cursor** — the grid renders all filtered rows); exposes `onSelectHomeSpace`, `onToggleAutoRedirect`, `onSearchChange`, `onFilterChange`, `onClearFilters` (resets both search and filter — wired to the empty-state CTA), `onRequestLeave(row)`, `onConfirmLeave` (lazy-fetches the row's role-set via `useSpaceContributionDetailsLazyQuery({spaceId})`, then fires `removeRoleFromUser`), `onCancelLeave`. The Auto-redirect checkbox is disabled until a Home Space is selected (FR-042). Pending Applications has no actions. **Note (post-implementation):** the per-row enrichment (banner / tagline / leadUsers / roleSetID) lives in a separate `useMembershipEnrichment(spaceIds)` hook (research §13) so this data hook stays focused on UI state; the integration page combines them.
- [X] T038 [P] [US3] Add Vitest unit tests at `src/main/crdPages/topLevelPages/userPages/settings/membership/__tests__/useUserMembershipTabData.test.ts` covering: mapper flattening + role precedence (Admin > Lead > Member); enrichment-map lookup populates banner/tagline/leadUsers/spaceUrl; fallback to contribution-only data when enrichment map is empty; search (case-insensitive substring); type filter (`All / Spaces / Subspaces` only — no status axis); `onClearFilters` resets both search and filter; Home Space mutations (set / clear-with-disable / autoRedirect-only); Leave confirmation flow (cancel does NOT fire mutation; confirm lazy-fetches role-set then fires `removeRoleFromUser`).
- [X] T039a [US3] **Generalize `PollVoterAvatars` → `StackedPersonAvatars`.** Move `src/crd/components/common/PollVoterAvatars.tsx` to a reusable `src/crd/components/common/StackedPersonAvatars.tsx` that takes plain `{id, name, avatarUrl}[]` plus pre-localized `groupAriaLabel` / `overflowTooltipLabel` / `sizeClass` props (no internal `useTranslation` — consumer namespaces vary). Update `CalloutPoll` to consume the new component with `crd-space`-namespaced labels passed in, and delete the deprecated `PollVoterAvatars.tsx`. Used by T039 below for the Membership card "Led by:" footer.

- [X] T039 [US3] Implement `UserMembershipTabView` at `src/crd/components/user/settings/UserMembershipTabView.tsx`. Three sections: **(1) Home Space card** (single-select dropdown + Auto-redirect checkbox + spinner during mutation). **(2) My Memberships card grid** matching the prototype: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`; each card has aspect-video banner (cardBanner with deterministic-gradient fallback), Type badge bottom-left of banner, kebab top-right with two items only — "View Space" / "View Subspace" + "Leave Space" / "Leave Subspace" (no Options label, no separator), title + role badge, tagline body (`line-clamp-2`), and a "Led by:" footer rendered via the **shared** `@/crd/components/common/StackedPersonAvatars` primitive (also used by `CalloutPoll`; max 3 visible + `+N` overflow). Above the grid: search input + segmented `All / Spaces / Subspaces` filter (no status axis — see FR-043) + "Showing X of Y memberships" caption. Filtered-empty state = centered dashed-border block with `Folder` icon + "Clear Filters" CTA. Untouched-empty state = muted caption per FR-018. **(3) Pending Applications compact list** (display name + Pending badge per row, read-only); muted caption when empty.
- [X] T040 [US3] Implement `CrdUserMembershipTab` at `src/main/crdPages/topLevelPages/userPages/settings/membership/CrdUserMembershipTab.tsx`. Wires four Apollo queries → enrichment hook → mapper → state hook → view. Specifically: `useUserContributionsQuery` (basic rows) + `useUserSettingsQuery` (home space) + `useUserPendingMembershipsQuery` (pending apps) + **`useMembershipEnrichment(collectMembershipSpaceIds(contributions))`** (per-row banner/tagline/leadUsers/roleSetID — research §13). The destructive `ConfirmationDialog` for Leave is rendered at the page level using `useUserMembershipTabData`'s pending-leave state. **Implementation note**: `useMembershipEnrichment` lives in its own file (`useMembershipEnrichment.ts`) and uses `useApolloClient.query()` to fan out N parallel `useSpaceContributionDetailsQuery` calls — same source MUI's `ContributionCard` reads.
- [X] T041 [US3] Add User Membership keys to `src/crd/i18n/contributorSettings/contributorSettings.en.json` under `user.membership.*`. Final shape (post-implementation): `homeSpace.{title, description, selectLabel, noSelection, autoRedirectLabel, autoRedirectDisabledHint}`; `myMemberships.{title, searchPlaceholder, empty, summary, filteredEmptyTitle, filteredEmptyDescription, clearFilters}`; `filter.{all, spaces, subspaces}` (no `active` / `archived` — see FR-043); `type.{space, subspace}`; `role.{admin, lead, member}`; `menu.viewByType` (e.g., "View {{type}}"); `leave.{menuItem, menuItemLabeled, dialogTitle, dialogDescription, dialogConfirm, success, error}`; `pendingApplications.{title, empty, statusPending}`; `subspaceFallbackL1` / `subspaceFallbackL2` (used only when the enrichment query hasn't resolved); **`ledBy`** ("Led by:" caption for the card footer); **`ledByAria`** ("{{count}} community leads" — passed to `StackedPersonAvatars.groupAriaLabel`); **`leadsMore`** ("and {{count}} more" — passed to `StackedPersonAvatars.overflowTooltipLabel`). Translate to nl/es/bg/de/fr — key-parity test (T005) covers all six languages.

**Checkpoint**: User Membership tab fully functional with both tables and the Home Space card. All actions commit per-control immediately.

---

## Phase 6: User Story 4 — User Organizations (Priority: P1)

**Goal**: Migrate User Organizations (`/user/:userSlug/settings/organizations`) — associated organizations table with search + Create button (privilege-gated) + per-row Leave with confirmation dialog.

**Independent Test**: With CRD on, open `/user/<self>/settings/organizations`. Search "Alkemio" — list filters. Privileged user sees Create Organization button — click → existing creation flow. Click row name → navigates to `/organization/<orgSlug>` (096). Leave via kebab → Confirm dialog → row removed.

- [X] T042 [P] [US4] Implement `userOrganizationsMapper.ts` at `src/main/crdPages/topLevelPages/userPages/settings/organizations/userOrganizationsMapper.ts`. Maps `useUserOrganizationIds` + lazy `useOrganizationsQuery({ids})` to the view's row props per data-model.md.
- [X] T043 [US4] Implement `UserOrganizationsTabView` at `src/crd/components/user/settings/UserOrganizationsTabView.tsx`. Search input + Create Organization button (gated by `showCreateButton` prop) above the table. Table rows: avatar + name + description + location + role + associates count + verified badge + website link. Per-row kebab → Leave. Empty-state: muted caption per FR-018.
- [X] T044 [US4] Implement `CrdUserOrganizationsTab` at `src/main/crdPages/topLevelPages/userPages/settings/organizations/CrdUserOrganizationsTab.tsx`. Wires data + mapper + view; resolves `showCreateButton` from `currentUser.hasPlatformPrivilege(CreateOrganization)`; `onCreateOrganization` navigates to existing org-creation flow; Leave confirmation dialog at page level.
- [X] T045 [US4] Add User Organizations keys: `user.organizations.{title, searchPlaceholder, createButton, leaveDialogTitle, leaveDialogBody, leaveConfirm, noOrgsCaption}` + role labels (`role.admin`, `role.associate`) + verified badge label. Translate.

**Checkpoint**: User Organizations tab functional; Leave / Create gated correctly.

---

## Phase 7: User Story 5 — User Notifications (Priority: P1)

**Goal**: Migrate User Notifications (`/user/:userSlug/settings/notifications`) — every group / property / channel from current MUI restyled with CRD `Switch` primitives. Optimistic-overrides on toggle. Hard-failure revert + toast (Q5 / FR-064).

**Independent Test**: With CRD on, open `/user/<self>/settings/notifications`. Flip an email toggle — UI updates immediately, persists on reload. Push master ON — browser permission prompt; subscription appears. Private window: push hidden. Hard-failure smoke (DevTools Offline + flip a toggle): toggle reverts to prior state + inline toast.

- [X] T046 [P] [US5] Implement `userNotificationsMapper.ts` at `src/main/crdPages/topLevelPages/userPages/settings/notifications/userNotificationsMapper.ts`. Maps `useUserSettingsQuery().settings.notification` + `pushNotificationContext` + privilege flags to the row list per data-model.md. Imports the row schema from `src/domain/community/userAdmin/tabs/model/NotificationSettings.model.ts` to keep parity with MUI.
- [X] T047 [US5] Implement `useUserNotificationsTabData` at `src/main/crdPages/topLevelPages/userPages/settings/notifications/useUserNotificationsTabData.ts`. Holds the optimistic-override dictionary keyed by `(group, property, channel)`. `onToggle(key, next)` writes the override → fires `useUpdateUserSettingsMutation` → on success clears the override after refetch resolves; **on hard failure rolls back the override and surfaces an inline toast** (FR-064 / Q5). Push master toggle wraps `pushNotificationContext.subscribe` / `unsubscribe`.
- [X] T048 [P] [US5] Add Vitest unit tests at `src/main/crdPages/topLevelPages/userPages/settings/notifications/__tests__/useUserNotificationsTabData.test.ts` covering: optimistic flip + success refetch (override clears); divergence (server returns different value — UI re-renders to authoritative); **hard-failure revert + toast (Q5)**; push master subscribe + unsubscribe; push unavailable info-banner branch.
- [X] T049 [US5] Implement `UserNotificationsTabView` at `src/crd/components/user/settings/UserNotificationsTabView.tsx`. Push master toggle card (or info banner when unavailable per FR-061) + Push Subscriptions List card (FR-062). Then per-group cards rendered conditionally on privilege gating: Space (always), Space Admin (gated), User, Platform, Platform Admin (gated), Organization (gated), Virtual Contributor. Each row: property label + three `Switch`es (inApp / email / push — push hidden when unavailable).
- [X] T050 [US5] Implement `CrdUserNotificationsTab` at `src/main/crdPages/topLevelPages/userPages/settings/notifications/CrdUserNotificationsTab.tsx`. Wires data + push context + privilege flags → mapper → hook → view.
- [X] T051 [US5] Add User Notifications keys: every group title, property label, channel label (`inApp`, `email`, `push`), the push availability banner copy, the toast error copy. Translate.

**Checkpoint**: User Notifications tab functional with parity row coverage. Hard-failure UX consistent with FR-133.

---

## Phase 8: User Story 6 — User Settings (Priority: P1)

**Goal**: Migrate User Settings (`/user/:userSlug/settings/settings`) — Communication & Privacy switch + Design System toggle (writes localStorage and reloads).

**Independent Test**: With CRD on, open `/user/<self>/settings/settings`. Flip messages-from-others switch — persists. Flip Design System OFF — page reloads in MUI mode. Flip ON from MUI side — page reloads back into CRD.

- [X] T052 [P] [US6] Implement `userSettingsMapper.ts` at `src/main/crdPages/topLevelPages/userPages/settings/settings/userSettingsMapper.ts`. Maps `useUserSettingsQuery().settings.communication.allowOtherUsersToSendMessages` to the view props.
- [X] T053 [US6] Implement `UserSettingsTabView` at `src/crd/components/user/settings/UserSettingsTabView.tsx`. Two cards: Communication & Privacy (single switch) + Design System (single switch with caption "The page will reload after the change."). Both commits via callback props.
- [X] T054 [US6] Implement `CrdUserSettingsTab` at `src/main/crdPages/topLevelPages/userPages/settings/settings/CrdUserSettingsTab.tsx`. Communication switch wraps `useUpdateUserSettingsMutation`. Design System toggle wraps `localStorage.setItem('alkemio-crd-enabled', 'true' | removed) + location.reload()` per FR-071. **Always reads/writes the viewer's own browser localStorage**, never a server-stored attribute (FR-073). Hard-failure on the communication mutation reverts + toasts (parity with Q5 / FR-133).
- [X] T055 [US6] Add User Settings keys: `user.settings.{communicationTitle, communicationLabel, designSystemTitle, designSystemLabel, designSystemCaption}`. Translate.

**Checkpoint**: User Settings tab functional. Design System toggle reload reliably under 3 s (SC-003).

---

## Phase 9: User Story 7 — User Security (Priority: P1)

**Goal**: Migrate User Security (`/user/:userSlug/settings/security`) — identity-provider passkey/WebAuthn flow with the existing `REMOVED_FIELDS` filter. Owner-only (Security tab hidden for admins on other users' profiles).

**Independent Test**: With CRD on, open `/user/<self>/settings/security`. Passkey form renders; can add a passkey via existing flow. As platform admin on `/user/<otherUser>/settings/security` — redirect to `/user/<otherUser>/settings/profile` (FR-084).

- [X] T056 [P] [US7] Implement `useIdentityProviderSettingsFlow` at `src/main/crdPages/topLevelPages/userPages/settings/security/useIdentityProviderSettingsFlow.ts` per Decision #6. Reuses the existing flow loader from MUI `UserSecuritySettingsPage`. Returns `{ kind: 'loading' | 'error' | 'noWebauthn' | 'ready', flow?, error? }`.
- [X] T057 [US7] Implement `userSecurityMapper.ts` at `src/main/crdPages/topLevelPages/userPages/settings/security/userSecurityMapper.ts`. Maps the flow result + the `renderKratos` callback to the view props.
- [X] T058 [US7] Implement `UserSecurityTabView` at `src/crd/components/user/settings/UserSecurityTabView.tsx`. Renders one of: loading skeleton, error display (existing copy), info alert ("WebAuthn / Passkey is not enabled on this account" — FR-081), or the Kratos form via the `renderKratos(flow)` callback prop wrapped in a `SettingsCard`. **Does NOT restyle the rendered Kratos fields** (FR-080 / out of scope).
- [X] T059 [US7] Implement `CrdUserSecurityTab` at `src/main/crdPages/topLevelPages/userPages/settings/security/CrdUserSecurityTab.tsx`. Top-level redirect: when the viewer is not the owner (even with PlatformAdmin), navigate to `/user/<slug>/settings/profile` per FR-084. Wires `useIdentityProviderSettingsFlow` + provides the `renderKratos(flow)` callback that mounts `<KratosForm><KratosUI flow={flow} /></KratosForm>` with the existing `REMOVED_FIELDS` filter.
- [X] T060 [US7] Add User Security keys: `user.security.{title, noWebauthnInfoAlert, errorTitle}`. Translate.

**Checkpoint**: User Security tab functional. Tab is hidden in the strip for non-owners; URL-direct redirect runs.

---

## Phase 10: User Story 8 — Org Profile (Priority: P1)

**Goal**: Migrate Org Profile (`/organization/:orgSlug/settings/profile`) — same per-section save model as User Profile (FR-090); read-only Verified badge; Org-specific fields (Name ID read-only, Contact Email validated, Domain, Legal Entity Name, Website validated).

**Independent Test**: With CRD on, open `/organization/<orgSlug>/settings/profile` as org admin. Edit Display Name section, click Save — value persists, "Saved!" flashes. Edit Domain to invalid → Save disabled. Edit Description (markdown), navigate away mid-edit — silently dropped. Verified badge renders correctly per `verification.status`. As non-admin: redirect to `/organization/<orgSlug>`.

- [X] T061 [P] [US8] Implement `orgProfileMapper.ts` at `src/main/crdPages/topLevelPages/organizationPages/settings/profile/orgProfileMapper.ts`. Same shape as User Profile mapper but for Organization fields (data-model.md User Story 8). Includes the Verified badge state derivation (`'verified' | 'pending' | 'notVerified'`).
- [X] T062 [US8] Implement `useOrgProfileTabData` at `src/main/crdPages/topLevelPages/organizationPages/settings/profile/useOrgProfileTabData.ts` — parallel to `useUserProfileTabData` but for Org. Sections: displayName, tagline, description (markdown), location (compound), **`keywords`** (own per-section save against `tagsets[name='Keywords']`), **`capabilities`** (own per-section save against `tagsets[name='Capabilities']`), contactEmail, domain, legalEntityName, website, references. Each tagset section follows the same lazy-create-on-first-save flow as the User-side `skills` / `keywords` sections. Avatar/logo upload immediate-commit. References gate delete via `ConfirmationDialog` per FR-025.
- [X] T063 [P] [US8] Add Vitest unit tests at `src/main/crdPages/topLevelPages/organizationPages/settings/profile/__tests__/useOrgProfileTabData.test.ts` mirroring the User Profile hook tests for the Org-specific field set. Includes Email format live validation and required-field empty checks (Display Name + Description). **Result**: 28 tests across 9 `describe` blocks — initial state seeding (incl. Keywords/Capabilities case-insensitive tagset lookup); onChange dirty tracking for Identity / Contact & Legal; per-section state machine (idle → saving → saved → idle with `SAVED_FLASH_MS`); saving → error preserves typed values; error → idle on next edit; Keywords / Capabilities independence + lazy-create on first save; references batch (patch + create + delete); pendingReferenceDelete cancel / URI-fallback name; logo upload immediate-commit (FR-093); EMAIL_REGEX + isValidUrlOrEmpty live-validation helpers. The Display-Name / Description required-field empty check is enforced at the view level (the hook itself doesn't gate Save on emptiness — it lets the view disable Save), so the test exercises preservation-on-rejection rather than a hook-level guard.
- [X] T064 [US8] Implement `OrgProfileTabView` at `src/crd/components/organization/settings/OrgProfileTabView.tsx`. Same two-column layout as User Profile. Sections in order: Identity (Display Name, Name ID read-only, Tagline), About (Description, City+Country, **Keywords** as its own labeled tagset editor + own Save, **Capabilities** as its own labeled tagset editor + own Save — never a single unified "Tags" input), Contact & Legal (Contact Email, Domain, Legal Entity Name, Website), Social Links / References. Avatar column on the right with logo + Change Logo button. Verified badge rendered alongside the avatar via `OrgVerifiedBadge` (T012).
- [X] T065 [US8] Implement `CrdOrgProfileTab` at `src/main/crdPages/topLevelPages/organizationPages/settings/profile/CrdOrgProfileTab.tsx`. Wires `useOrganizationProvider` + `useUpdateOrganizationMutation` → mapper → hook → view. `useTransition` wraps `onSaveSection`.
- [X] T066 [US8] Add Org Profile keys: `org.profile.*` mirroring `user.profile.*` plus Org-specific fields (`nameID.label` + caption "Cannot be changed after creation"; `contactEmail.label`; `domain.label`; `legalEntityName.label`; `website.label`; `verification.{verified, pending, notVerified}`). **Tagset keys (post-clarification):** add `about.keywords.{label, hint, placeholder}` and `about.capabilities.{label, hint, placeholder}` — one block per profile tagset; do NOT add a single `about.tags.*` block. Translate.
- [X] T066a [P] [US8] Update `contracts/tab-orgProfile.ts` to mirror the new per-section shape from `tab-userProfile.ts` (sections + EditableSectionProps + ReferencesSectionProps + PendingReferenceDeleteProps + the Org-specific Identity / About / Contact & Legal section keys + the read-only Verified badge slot). Drop any pre-clarification per-field types.

**Checkpoint**: Org Profile tab fully functional with the same per-section save UX as User Profile. Verification badge renders read-only.

---

## Phase 11: User Story 9 — Org Account (Priority: P1)

**Goal**: Migrate Org Account (`/organization/:orgSlug/settings/account`) — same shared `ContributorAccountView` (T010) consumed with org-specific data and labels (FR-100 / FR-103). The four "Create" affordances open the **same** CRD creation dialogs/wizard built in Phase 4 (T033a–T033f / FR-034), mounted by `CrdOrgAccountTab` with `organization.account.id` as the creation target.

**Independent Test**: With CRD on, open `/organization/<orgSlug>/settings/account`. Same four card groups as User Account, populated with the org's resources. Empty-states identical to User Account. Click Create Innovation Pack — `CrdCreateInnovationPackDialog` opens; submit it and the new pack appears in the Innovation Packs group. Click Create Virtual Contributor — the CRD VC wizard opens; the create mutation runs against `organization.account.id`.

- [X] T067 [P] [US9] Implement `orgAccountMapper.ts` at `src/main/crdPages/topLevelPages/organizationPages/settings/account/orgAccountMapper.ts`. **Post-implementation refactor**: extracted the actor-agnostic mapping logic into a shared `src/main/crdPages/topLevelPages/contributorAccountMapper.ts` (`mapAccountToViewProps`); both `userAccountMapper` and `orgAccountMapper` now resolve their own i18n keys (`user.account.*` vs `org.account.*`) into a `ContributorAccountLabels` struct and delegate to the shared function — privilege gating, group shape, and `Innovation Hubs`-only Manage entry stay identical across actors. Org reads from `useOrganizationAccountQuery` → `account.id` → `useAccountInformationQuery({accountId})`. Kebab actions: `manage` → resource settings URL; `delete` → opens the CRD `ConfirmationDialog`.
- [ ] T068 [US9] Implement `CrdOrgAccountTab` at `src/main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountTab.tsx`. Same wiring as `CrdUserAccountTab` (T034): reads `organization` / `account.id` from `useOrganizationContext` + `useOrganizationAccountQuery`; instantiates the four **shared** create hooks (`useCrdCreateSpace` / `useCrdCreateVirtualContributorWizard` / `useCrdCreateInnovationPack` / `useCrdCreateInnovationHub` from `src/main/crdPages/topLevelPages/account/`, passing `organization.account.id`); wires the four `onCreate*` callbacks to open the respective CRD dialog and renders the dialogs at the page level. `onManage` → `navigate(href)` (resource settings URL). `onDelete` → owns the destructive `ConfirmationDialog` for Delete (Rule #9); refetches `AccountInformation` after each delete mutation. **No `navigate('/admin/...')` calls.**
- [X] T069 [US9] Add Org Account keys: `org.account.*` mirroring `user.account.*` (helpBanner, four group titles + createButton labels, `actions.{view, manage, transfer, delete}`, `deleteDialog.{title, description, confirm}`). The shared empty-state strings live under `shared.account.*` and are reused across both actors. Translate to nl/es/bg/de/fr.

**Checkpoint**: Org Account tab functional with the shared view. Per-actor mappers verified to feed correct data.

---

## Phase 12: User Story 10 — Org Community (Priority: P1)

**Goal**: Migrate Org Community (`/organization/:orgSlug/settings/community`) — Associates list with Add (+) immediate, Remove (×) gated by `ConfirmationDialog` per Rule #9 (Q2 / FR-112).

**Independent Test**: With CRD on, open `/organization/<orgSlug>/settings/community`. Search "Maria" → available filters. Click + on a user → moves immediately (no dialog). Click × on an associate → confirmation dialog with "Remove {{name}} as Associate" → Confirm → removed.

- [X] T070 [P] [US10] Implement `orgCommunityMapper.ts` at `src/main/crdPages/topLevelPages/organizationPages/settings/community/orgCommunityMapper.ts`. Two pure helpers — `mapCurrentMemberToPerson` (consumes the `RoleSetMemberUserFragmentWithRoles` from `useRoleSetManager`) and `mapAvailableUserToPerson` (consumes the `AvailableUsersResponse.users[]` from `useRoleSetAvailableUsers`) — produce `RoleAssignmentPerson` rows with deterministic `pickColorFromId` accent + a subtitle composed from location-or-email fallback.
- [X] T071 [US10] Implement `useOrgAssociates` at `src/main/crdPages/topLevelPages/organizationPages/settings/community/useOrgAssociates.ts`. Wraps `useRoleSetManager({roleSetId, relevantRoles: [Associate], contributorTypes: [User], fetchContributors: true})` + `useRoleSetAvailableUsers({mode: 'platform', role: Associate, ...})`. Exposes `onAdd(userId)` (immediate), `onRequestRemove(id, displayName)` / `onConfirmRemove` / `onCancelRemove` (Q2 / Rule #9 — confirm fires `removeRoleFromUser`), `onSearchChange`, `onLoadMore`, plus `pendingRemove: { contributorId, displayName } | null` state for the parent's `ConfirmationDialog`.
- [X] T072 [P] [US10] Add Vitest unit tests at `src/main/crdPages/topLevelPages/organizationPages/settings/community/__tests__/useOrgAssociates.test.ts` covering: add fires immediately; remove → request → confirm fires `removeRoleFromUser`; remove → request → cancel does NOT fire; search filtering pass-through; load-more pagination.
- [X] T073 [US10] Implement `OrgCommunityTabView` at `src/crd/components/organization/settings/OrgCommunityTabView.tsx`. Composes `RoleAssignmentView` (T011) with the Associate role label and the role-aware confirm copy ("Remove {{name}} as Associate"). Empty-state per FR-018 (muted caption when current Associates list or available list is empty).
- [X] T074 [US10] Implement `CrdOrgCommunityTab` at `src/main/crdPages/topLevelPages/organizationPages/settings/community/CrdOrgCommunityTab.tsx`. Wires data + hook + view; the destructive `ConfirmationDialog` is rendered at the page level using `useOrgAssociates`'s `pendingRemove` state, with role-aware confirm copy "Remove {{name}} as Associate" and success/error toasts.
- [X] T075 [US10] Add Org Community keys: `org.community.{title, description, currentAssociatesTitle, availableUsersTitle, searchPlaceholder, addAriaLabel, removeAriaLabel, loadMore, emptyCurrent, emptyAvailable, removeDialogTitle, removeDialogDescription, removeConfirmAssociate, removeSuccess, removeError}`. Translate to nl/es/bg/de/fr.
- [X] T075a [P] [US10] Update `contracts/tab-orgCommunity.ts` to add the `pendingRemoveId` state field + `onConfirmRemove` / `onCancelRemove` / `onRequestRemove` callback triple per Q2 / Rule #9.

**Checkpoint**: Org Community tab functional. Add / Remove parity with current MUI behavior (now with destructive confirm dialog on Remove).

---

## Phase 13: User Story 11 — Org Authorization (Priority: P1)

**Goal**: Migrate Org Authorization (`/organization/:orgSlug/settings/authorization`) — two sub-tabs (Admin / Owner) in local React state, each sharing the same `RoleAssignmentView` with role-aware destructive confirmation copy.

**Independent Test**: With CRD on, open `/organization/<orgSlug>/settings/authorization`. Default sub-tab Admin. Switch to Owner — shows Owner list. Click + on Admin sub-tab — immediate add. Click × on an Owner — confirmation dialog with "Remove {{name}} as Owner" → Confirm → removed.

- [X] T076 [P] [US11] Implement `orgAuthorizationMapper.ts` at `src/main/crdPages/topLevelPages/organizationPages/settings/authorization/orgAuthorizationMapper.ts`. Maps role-set data for both Admin and Owner sub-tabs to two `RoleAssignmentView`-shaped prop sets.
- [X] T077 [US11] Implement `useOrgRoleAssignment` at `src/main/crdPages/topLevelPages/organizationPages/settings/authorization/useOrgRoleAssignment.ts`. Parameterized by `role: 'Admin' | 'Owner'`. Same shape as `useOrgAssociates` (Q2 / Rule #9 confirmation flow per role).
- [X] T078 [P] [US11] Add Vitest unit tests at `src/main/crdPages/topLevelPages/organizationPages/settings/authorization/__tests__/useOrgRoleAssignment.test.ts` covering both roles' add/remove flows including the role-specific confirmation copy.
- [X] T079 [US11] Implement `OrgAuthorizationTabView` at `src/crd/components/organization/settings/OrgAuthorizationTabView.tsx`. Sub-tab strip (`useState<'Admin' | 'Owner'>('Admin')`, no URL sync per FR-120). Each sub-tab body composes `RoleAssignmentView` with the role-aware confirm label. Sub-tab strip keyboard-navigable per FR-152.
- [X] T080 [US11] Implement `CrdOrgAuthorizationTab` at `src/main/crdPages/topLevelPages/organizationPages/settings/authorization/CrdOrgAuthorizationTab.tsx`. Two `useOrgRoleAssignment` hook instances (one per role); their dialogs render at the page level.
- [X] T081 [US11] Add Org Authorization keys: `org.authorization.{title, adminTabLabel, ownerTabLabel, removeConfirmAdmin, removeConfirmOwner}`. Translate.
- [X] T081a [P] [US11] Update `contracts/tab-orgAuthorization.ts` to add per-role `pendingRemoveId` state + the confirm/cancel callback triple per Q2 / Rule #9.

**Checkpoint**: Org Authorization tab functional with two sub-tabs and role-aware Remove confirmations per Rule #9.

---

## Phase 14: User Story 12 — Org Settings (Priority: P1)

**Goal**: Migrate Org Settings (`/organization/:orgSlug/settings/settings`) — two switches (`allowUsersMatchingDomainToJoin`, `contributionRolesPubliclyVisible`) committed via `updateOrganizationSettings`. NO Design System toggle on this tab (FR-132).

**Independent Test**: With CRD on, open `/organization/<orgSlug>/settings/settings`. Flip both switches — each persists. Hard-failure on either: switch reverts + toast (FR-133).

- [X] T082 [P] [US12] Implement `orgSettingsMapper.ts` at `src/main/crdPages/topLevelPages/organizationPages/settings/settings/orgSettingsMapper.ts`. Maps `useOrganizationSettingsQuery` data to the view's two switch values.
- [X] T083 [US12] Implement `OrgSettingsTabView` at `src/crd/components/organization/settings/OrgSettingsTabView.tsx`. Single card containing the two `Switch`es + descriptive copy for each. NO Design System toggle (FR-132).
- [X] T084 [US12] Implement `CrdOrgSettingsTab` at `src/main/crdPages/topLevelPages/organizationPages/settings/settings/CrdOrgSettingsTab.tsx`. `onToggle` wraps `useUpdateOrganizationSettingsMutation`. On hard failure: switch reverts + inline toast (FR-133).
- [X] T085 [US12] Add Org Settings keys: `org.settings.{title, allowDomainLabel, allowDomainCaption, contributionRolesLabel, contributionRolesCaption, errorToast}`. Translate.

**Checkpoint**: Org Settings tab functional. Both switches commit immediately with revert-on-failure UX.

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, bundle-size verification, lint/test gates, accessibility audit, route smoke tests, and the per-tab smoke checklist from `quickstart.md`.

- [ ] T086 [P] Run `pnpm lint` at the repo root and resolve any TypeScript / Biome / ESLint errors in the new files. *(Prior run on the pre-create-dialog tree was clean — re-run after the Phase 4 dialog/wizard tasks T033a–T033f land.)* **Result (2026-05-08, pre-rework)**: `pnpm tsc --noEmit` clean; `pnpm biome check` clean on all spec-owned files; full repo lint exits 0 (490 pre-existing warnings repo-wide, none in spec-owned files).
- [ ] T087 [P] Run `pnpm vitest run` and ensure all new tests pass alongside the existing suite (target completion ~9 s per CLAUDE.md). *(Re-run after Phase 4 dialog/wizard tasks + the new T033f account-create-hook tests.)* **Result (2026-05-08, pre-rework)**: 99 test files / 1009 passing tests + 3 skipped (pre-existing); duration 13.4 s. New T078 (`useOrgRoleAssignment`, 8 tests) and T072 (`useOrgAssociates`, 6 tests) all green.
- [ ] T088 Run `pnpm analyze` and verify (a) the combined gzipped bundle delta across the two new per-tab lazy-loaded settings chunks (User Settings + Org Settings) does NOT exceed +50 KB over the prior build, and (b) the separate Account-tab creation-dialogs lazy chunk (`CrdCreateSpaceDialog` / `CrdCreateVirtualContributorWizard` + steps / `CrdCreateInnovationPackDialog` / `CrdCreateInnovationHubDialog`) stays under +120 KB gzipped (SC-007). Log all chunk sizes in this task's notes for the PR description. **Deferred to user**: requires a full production build (~20 s) + interactive `build/stats.html` review. Per the user's "I'll do the manual testing ones when you're done" directive.
- [X] T089 [P] Add an automated cross-actor route smoke test at `src/main/routing/__tests__/crdContributorSettingsRoutes.test.tsx` per SC-005: with the CRD toggle ON, mount each of the 12 settings URLs against a `MockedProvider` (Apollo) feeding minimal seeded fixtures, and assert each tab's `Crd<Actor><Tab>Tab` chunk loads without throwing. Reuse fixtures from the per-tab unit-test files. **Note (scope reduction)**: implemented as a *module-load* smoke (asynchronous `import()` of each lazy chunk + `expect(mod.default).toBe('function')`) rather than a full `MockedProvider` mount. Rationale documented in the test file header: a full mount would duplicate per-hook unit-test coverage at the cost of order-of-magnitude scaffolding. The module-load smoke catches the residual failure mode at this layer (import-time crashes — broken paths, circular deps, typos). Full route × Apollo × auth integration smoke is captured by T092 (manual against `localhost:3001`).
- [X] T090 [P] Add an automated CRD-off route smoke test at `src/main/routing/__tests__/crdContributorSettingsToggleOff.test.tsx`: with `localStorage` unset, the same 12 URLs MUST resolve to the existing MUI `UserAdminRoute` / `OrganizationAdminRoutes` modules. **Note**: collapsed into the same file as T089 (`crdContributorSettingsRoutes.test.ts`) — the CRD-off side runs as the third `describe` block (`UserAdminRoute` / `OrganizationAdminRoutes` module-load), with the same scope-reduction rationale. Full toggle-off route resolution is captured by T092 manual smoke.
- [ ] T091 Run an axe / Lighthouse accessibility pass on each of the 12 CRD settings tabs. Fix any critical or serious violations (SC-006; FR-150 / FR-151 / FR-152 / FR-153). Verify keyboard navigation across both tab strips and the Authorization sub-tab strip. **Deferred to user (manual)**.
- [ ] T092 Execute the manual smoke checklist in `specs/097-crd-user-settings/quickstart.md` end-to-end (all 12 tabs × authorization variants × CRD-on / CRD-off) against `localhost:3001`. Record any deviations as bug tasks before merge. **Note**: quickstart.md still contains pre-clarification language (per-field pencil/check/× references; "User My Profile" name); update it as part of T096 below. **Deferred to user (manual)**.
- [ ] T093 [P] Verify the parity matrix per actor (SC-008 / SC-009 / SC-010): User — 4 viewer categories × every tab; Org — Update vs. no-Update × every tab. Capture network logs on Community + Authorization parity test cases (SC-010). **Deferred to user (manual)**.
- [ ] T093a [P] Verify the Account-tab creation parity (SC-011): for each of the four flows (Space / VC / Innovation Pack / Innovation Hub) and — for VC — each of the three knowledge-source branches (create-knowledge / use-existing-space / external-AI), open the CRD dialog/wizard and the corresponding MUI dialog, complete an equivalent submission, and confirm the same mutation(s) fire with the same variables shape and the same refetch-queries list (capture network logs). Also confirm: no `/admin/...new` navigation occurs from any CRD Account-tab "Create" affordance; cancel fires nothing; a forced mutation failure (DevTools Offline) leaves the dialog open with an inline error toast. **Deferred to user (manual)**.
- [ ] T094 [P] Verify SC-001 (User Profile full-edit flow under 90 s) and SC-002 (Org Profile under 90 s) with a stopwatch. SC-003 (Design System toggle reload under 3 s) on each supported browser. **Deferred to user (manual)**.
- [ ] T095 [P] Verify SC-004 (Notifications row-by-row checklist comparison MUI vs CRD — every group/property/channel present and functionally identical). **Deferred to user (manual)**.
- [X] T096 Update `quickstart.md` to reflect the post-clarification model: rename "User My Profile" → "User Profile"; replace per-field pencil/check/× language with per-section Save button + "Saved!" flash; add a confirmation-dialog smoke step for reference deletion (User Profile + Org Profile) and role removal (Org Community + Org Authorization); add a hard-failure smoke step for Notifications + Org Settings revert + toast. **Result**: pre-existing quickstart already had per-section save + reference-confirmation language. Added Confirmation-dialog steps for US10 (Associate Remove) and US11 (Admin/Owner Remove); added Hard-failure revert step for US12.
- [X] T096a Update `quickstart.md` to add the Account-tab CRD-creation-dialog smoke steps (US2 + US9): each "Create" affordance opens a CRD dialog/wizard (not a route), the VC wizard's three knowledge-source branches, submit → resource appears in its card group, cancel → nothing, forced-failure → dialog stays open with inline error toast. Add a check that `Manage` navigates to the resource's settings URL and `Delete` opens the CRD `ConfirmationDialog`. **Result**: US2 and US9 sections in `quickstart.md` rewritten — `CrdCreateSpaceDialog` / VC wizard (3 branches) / `CrdCreateInnovationPackDialog` / `CrdCreateInnovationHubDialog` open as dialogs (no route nav); cancel/offline-failure checks added; Manage→settings-URL and Delete→`ConfirmationDialog` checks added; US9 notes the same shared dialogs target `organization.account.id`.
- [X] T097 Delete the stale `contracts/editable-field.ts` once `tab-orgProfile.ts` has been rewritten (T066a) and no consumer imports from it. Verify with `grep -rn "EditableFieldShellProps\|EditableFieldStatus" src/` returns no results. **Result**: grep clean across `src/` and `specs/`; file deleted.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 only — environment sanity check.
- **Foundational (Phase 2)**: T002–T025 — i18n namespace, all shared CRD primitives (SettingsShell, SettingsTabStrip, SettingsCard, FieldFooter, ContributorAccountView, RoleAssignmentView, OrgVerifiedBadge), per-actor predicate hooks, route shells + access guards + tab-state hooks, both Settings pages, both `TopLevelRoutes.tsx` / `CrdOrganizationRoutes.tsx` dispatch wirings. **MUST complete before any user-story phase can finish**.
- **User Stories (Phases 3–14)**: All depend on Foundational. Once Foundational is done, all twelve stories can proceed in parallel by 12 separate engineers.
- **Polish (Phase 15)**: Depends on all twelve user stories completing.

### Critical path within Foundational

- T002, T004 (i18n namespace anchors) — must land first; T003 / T005 are [P] after them.
- T006 (`SettingsShell`) and T007 (`SettingsTabStrip`) — no inter-dependency; both [P].
- T009 (`FieldFooter` extracted from 045) — affects 045's `SpaceSettingsAboutView.tsx`; coordinate with 045 maintainer if active dev.
- T010 (`ContributorAccountView`) and T011 (`RoleAssignmentView`) — independent; both [P].
- T013–T015 (predicates + tests) — [P] after the User vertical predicate file from 096 is verified to exist.
- T016–T019 (access guards + tab-state hooks) — [P] after T013 / T014.
- T020 / T021 (route shells) — depend on T016 / T017 / T018 / T019 + T022 / T023.
- T022 / T023 (settings pages) — depend on T006 + T020 / T021.
- T024 / T025 (route dispatch) — depend on T020 / T021 + T022 / T023.

### User Story Dependencies

- **US1 (User Profile)**: Foundational only.
- **US2 (User Account)**: Foundational + T010 (`ContributorAccountView`) + the four CRD creation dialogs/wizard (T033a–T033c) + their Apollo hooks (T033d–T033e) — all built within Phase 4.
- **US3, US4, US5, US6**: Foundational only.
- **US7 (User Security)**: Foundational only — requires the existing `KratosForm` / `KratosUI` from MUI.
- **US8 (Org Profile)**: Foundational + T009 (`FieldFooter`) + T012 (`OrgVerifiedBadge`).
- **US9 (Org Account)**: Foundational + T010 (`ContributorAccountView`) + the four CRD creation dialogs/wizard + shared Apollo hooks built in Phase 4 (T033a–T033e). T068 must land after Phase 4's T033c / T033e (the VC wizard + hook) — coordinate Phase 4 and Phase 11 so the shared `src/main/crdPages/topLevelPages/account/` hooks land once.
- **US10 (Org Community)** / **US11 (Org Authorization)**: Foundational + T011 (`RoleAssignmentView`).
- **US12 (Org Settings)**: Foundational only.

### Within Each User Story

- Mapper (and unit test where present) before the integration page.
- Per-tab data hook before the integration page.
- Presentational view is independent (different file) and can be built in parallel.
- Integration page depends on mapper + hook + view.
- i18n keys can land in parallel with view (different files) but should land before the integration page that consumes them.

### Within US2 / US9 (Account tabs)

- The four CRD creation dialogs (T033a presentational `CrdCreateSpaceDialog`; T033b `CrdCreateInnovationPackDialog` + `CrdCreateInnovationHubDialog`; T033c `CrdCreateVirtualContributorWizard` + 6 step components) are independent of each other and of the mapper — all [P].
- The four Apollo hooks (T033d single-step trio; T033e VC wizard hook) depend on the matching presentational dialog's prop contract (`contracts/account-create-dialogs.ts`) but not on each other — T033d is [P]; T033e is the largest and should be sequenced first if one engineer owns the VC flow end-to-end (T033c + T033e together).
- T033f (hook tests) depends on T033d + T033e.
- T034 (CrdUserAccountTab) depends on T033 + T033a–T033e + T035 (i18n).
- T068 (CrdOrgAccountTab) depends on T033a–T033e + T069 (org i18n) — it reuses the same dialogs/hooks, only the `accountId` differs.

---

## Parallel Opportunities

**Foundational (Phase 2)**:

- T003, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016, T017, T018, T019 — all [P] after T002 / T004 anchor i18n namespace.
- T020 / T021 (route shells) [P] with each other after their dependencies.

**Within US1 (User Profile)**:

- T026 (mapper), T028 (mapper test), T032 (translations) — independent files.
- T029 (view), T031 (i18n keys) — different files.

**Within US2 (User Account)**:

- T033 (mapper), T033a (`CrdCreateSpaceDialog`), T033b (`CrdCreateInnovationPackDialog` + `CrdCreateInnovationHubDialog`), T033c (`CrdCreateVirtualContributorWizard` + steps), T035 (i18n) — independent files, all [P].
- T033d (single-step Apollo hooks) [P]; T033e (VC wizard Apollo hook) — pair with T033c if one engineer owns the VC flow.
- T034 (integration page) depends on all the above; T033f (hook tests) depends on T033d + T033e.

**Across user stories (after Foundational)**:

- US1 / US2 / US3 / US4 / US5 / US6 / US7 / US8 / US9 / US10 / US11 / US12 — twelve engineers, one per story. US2 and US9 share the four CRD creation dialogs/hooks (built in Phase 4) — assign them to the same engineer or coordinate the merge of `src/main/crdPages/topLevelPages/account/`.

**Polish**:

- T086 (lint), T087 (tests), T089 (route on smoke), T090 (route off smoke), T093 (parity), T093a (Account-tab create parity / SC-011), T094 (SC-001..003 timing), T095 (notifications parity) — all [P].

---

## Parallel Example: Foundational Phase

```bash
# Once T002 + T004 are done, the rest of Phase 2 can run in parallel:
Task: "T003 [P] Create five non-English language file placeholders"
Task: "T005 [P] Add Vitest key-parity assertion"
Task: "T006 [P] Implement SettingsShell"
Task: "T007 [P] Implement SettingsTabStrip"
Task: "T008 [P] Implement SettingsCard"
Task: "T009 [P] Extract FieldFooter to common"
Task: "T010 [P] Implement ContributorAccountView"
Task: "T011 [P] Implement RoleAssignmentView"
Task: "T012 [P] Implement OrgVerifiedBadge"
Task: "T013 [P] Implement useCanEditUserSettings"
Task: "T014 [P] Implement useCanEditOrganizationSettings"
Task: "T015 [P] Add canEditPredicates Vitest tests"
Task: "T016..T019 [P] Implement access guards + tab-state hooks"
```

## Parallel Example: Twelve User Stories at Once

```bash
# Once Foundational is done, twelve engineers can pick up one story each:
Engineer A:  T026..T032   (Phase 3 — User Story 1: User Profile)  🎯 MVP
Engineer B:  T033..T035 + T033a..T033f  (Phase 4 — User Story 2: User Account + the 4 shared CRD creation dialogs/wizard; coordinates the Account-tab create surface with Engineer I / US9)
Engineer C:  T036..T041   (Phase 5 — User Story 3: User Membership)
Engineer D:  T042..T045   (Phase 6 — User Story 4: User Organizations)
Engineer E:  T046..T051   (Phase 7 — User Story 5: User Notifications)
Engineer F:  T052..T055   (Phase 8 — User Story 6: User Settings)
Engineer G:  T056..T060   (Phase 9 — User Story 7: User Security)
Engineer H:  T061..T066a  (Phase 10 — User Story 8: Org Profile)
Engineer I:  T067..T069   (Phase 11 — User Story 9: Org Account; reuses Phase 4's 4 CRD creation dialogs/wizard + shared account-create hooks, only the accountId differs — T068 depends on T033a..T033e)
Engineer J:  T070..T075a  (Phase 12 — User Story 10: Org Community)
Engineer K:  T076..T081a  (Phase 13 — User Story 11: Org Authorization)
Engineer L:  T082..T085   (Phase 14 — User Story 12: Org Settings)
# All twelve merge into a shared integration branch; T024 / T025 (TopLevelRoutes / CrdOrganizationRoutes dispatch) coordinated as a single merge.
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002–T025). **CRITICAL — blocks all stories**.
3. Complete Phase 3: User Story 1 — User Profile (T026–T032).
4. **STOP and VALIDATE**: Run the User Profile portion of the smoke checklist; confirm spec.md User Story 1 acceptance scenarios 1–8 pass; confirm CRD-off renders the existing MUI page unchanged.
5. Demo the User Profile in CRD. Hold the remaining 11 stories for the next iteration if scope pressure mounts.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add US1 (User Profile) → smoke pass → demo (MVP).
3. Add the remaining User-side tabs (US2 → US7) → smoke pass at each step.
4. Add the Org-side tabs (US8 → US12).
5. Polish (Phase 15).

### Parallel Team Strategy

With 4–12 developers:

1. Team completes Setup + Foundational together (or one developer leads it while others read the spec).
2. Once Foundational is done, parallelize per the "Parallel Example: Twelve User Stories at Once" block above.
3. Coordinate `TopLevelRoutes.tsx` (T024) and `CrdOrganizationRoutes.tsx` (T025) edits — assign a merge order or merge into a shared integration branch.
4. Polish phase runs after all stories merge.

### Ship Coupling (with sibling spec 096-crd-user-pages)

- This spec ships together with sibling spec `096-crd-user-pages` as one contributor-vertical CRD release.
- 096 already added `useUserPageRouteContext`, `useCanEditSettings` (User-side predicate base), `CrdUserRoutes.tsx`, and `CrdOrganizationRoutes.tsx`. This spec extends those: T013 renames / aliases the User-vertical predicate as `useCanEditUserSettings`; T024 adds the User Settings dispatch into `TopLevelRoutes.tsx`; T025 extends `CrdOrganizationRoutes.tsx`'s existing `settings/*` route to gate via `useCrdEnabled()`.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps each user-story task to its phase for traceability.
- All twelve user stories are P1 and ship together. The MVP-first strategy above is a fallback if scope pressure forces a partial release; the spec's stated intent is to ship all twelve plus sibling spec 096.
- Tests included: per-tab integration hook unit tests where the hook's logic is non-trivial (Profile per-section save state, Notifications optimistic-overrides + hard-failure revert, Membership filter / search, Role assignment confirmation flow), authorization-predicate tests, i18n key-parity test, route smoke tests.
- No new Apollo queries / mutations / GraphQL types — every data hook in `data-model.md` already exists and is reused unchanged (FR-006). The four Account-tab creation flows (FR-034) reuse the existing create mutation hooks (`useCreateSpaceMutation` / `useSpaceCreation`, `useCreateVirtualContributorOnAccountMutation` + `useUploadVisualMutation` + `useRefreshBodyOfKnowledgeMutation` + `useCreateLinkOnCalloutMutation` + `useCreateSpaceMutation` + `useAssignRoleToVirtualContributorMutation`, `useCreateInnovationPackMutation`, `useCreateInnovationHubMutation`) and the existing delete mutations — nothing new on the GraphQL side.
- The Account-tab "Create" affordances open CRD (shadcn) dialogs that are parity ports of the MUI dialogs (FR-034) — they MUST NOT navigate to a route. The earlier `navigate('/admin/spaces/new')`-style wiring (and the `/admin/...new` routes the prior research referenced) was a bug; those routes don't exist. `Manage` still navigates to the resource's existing settings URL; `Delete` uses a CRD `ConfirmationDialog` + the existing delete mutation.
- The existing MUI files under `src/domain/community/{user,organization}Admin/` MUST stay in place per FR-003 / FR-005 — no deletion until the global CRD toggle is removed in a future spec. Likewise the existing MUI create dialogs (`CreateSpace`, `useVirtualContributorWizard`, `CreateInnovationPackDialog`, `CreateInnovationHubDialog`) stay in place — they still back the MUI Account page when CRD is off, and the CRD ports reuse their mutation hooks (not their MUI markup).
- Commit boundaries: one commit per task (or one commit per logical group within a story). Per CLAUDE.md, all commits must be signed.
- Avoid: adding `useMemo` / `useCallback` / `React.memo` (React Compiler handles memoization); adding `@mui/*` or `@emotion/*` imports under `src/crd/` OR `src/main/crdPages/`; importing generated GraphQL types into views; firing role-removal or reference-delete mutations without `ConfirmationDialog` first (Rule #9 / Q2 / FR-025 / FR-112 / FR-121); navigating to a `/admin/...new` route from an Account-tab "Create" affordance (FR-032 / FR-034 — open the CRD dialog instead).
