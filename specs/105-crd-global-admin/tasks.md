---
description: "Task list for Global Administration in the CRD Design System"
---

# Tasks: Global Administration in the CRD Design System

**Input**: Design documents from `/specs/105-crd-global-admin/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: INCLUDED — the spec mandates automated parity coverage for every section, list, form, and dialog (FR-097, SC-008). Test tasks accompany each user story.

**Organization**: Tasks are grouped by user story (US1–US9 from spec.md) for independent implementation and testing. Each story renders a section body inside the shared CRD admin shell, behind the existing design-version toggle.

## Conventions

- **CRD presentation** (pure, no MUI/Apollo, plain-TS props): `src/crd/components/admin/**`, `src/crd/i18n/admin/**`
- **Integration** (Apollo hooks + mappers, no MUI): `src/main/crdPages/topLevelPages/admin/**`
- **Reused unchanged**: `src/domain/platformAdmin/**` (data hooks/mutations), `src/main/admin/NonPlatformAdminRedirect.tsx` (gate reference)
- **Wiring**: `src/main/routing/TopLevelRoutes.tsx`, `src/core/i18n/config.ts`, `@types/i18next.d.ts`
- Tests colocated under `__tests__/` next to the file under test; run with `pnpm vitest run`.
- No new GraphQL operations / no `pnpm codegen` expected (see `contracts/reused-graphql-operations.md`). If a field is genuinely missing, add a fragment + run codegen in the same PR.

---

## Phase 1: Setup (Shared Scaffolding)

**Purpose**: Stand up the `crd-admin` i18n namespace and the section-descriptor config that everything references.

- [X] T001 [P] Create `crd-admin` i18n namespace files `src/crd/i18n/admin/admin.en.json` + `admin.nl.json` + `admin.es.json` + `admin.bg.json` + `admin.de.json` + `admin.fr.json` with initial shell/navigation keys (page title, 10 section labels, common table labels: search placeholder, "showing X of Y", empty-state, delete/confirm/cancel). Apply the do-not-translate glossary for `nl`.
- [X] T002 Register `'crd-admin'` in `crdNamespaceImports` in `src/core/i18n/config.ts` (all 6 languages, lazy-loaded).
- [X] T003 Register `'crd-admin'` resource types in `@types/i18next.d.ts`.
- [X] T004 [P] Create section descriptor list `src/main/crdPages/topLevelPages/admin/adminSections.ts` — the CRD twin of MUI `adminTabs` (`src/domain/platformAdmin/layout/toplevel/constants.ts`): same order and same URL paths (`/admin/spaces`, `/admin/users`, `/admin/organizations`, `/admin/innovation-packs`, `/admin/innovation-hubs`, `/admin/virtual-contributors`, `/admin/authorization`, `/admin/authorization-policies`, `/admin/transfer`, `/admin/layout`), with `lucide-react` icon equivalents and `crd-admin` label keys. **Use URL paths as source of truth** (enum values for VC/policies differ from segments).

**Checkpoint**: Namespace resolves and section descriptors compile.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The CRD admin shell, access gate, route skeleton, toggle wiring, and the shared building blocks reused by every list/settings section.

**⚠️ CRITICAL**: No user-story section can render until the shell + routing + toggle (T005–T011) exist. Shared list/table/license-plan blocks (T012–T015) unblock US2–US6.

### Shell, gate, routing, toggle (blocks ALL stories)

- [X] T005 [P] Implement `AdminShell` in `src/crd/components/admin/AdminShell.tsx` per `contracts/admin-shell.contract.ts` — page-title header + horizontal section nav reusing `SettingsTabStrip` (`src/crd/components/contributor/settings/SettingsTabStrip.tsx`) + body slot. Pure, plain-TS props, WCAG 2.1 AA.
- [X] T006 [P] Implement `useAdminAccessGuard` in `src/main/crdPages/topLevelPages/admin/useAdminAccessGuard.ts` — reuse `usePlatformLevelAuthorizationQuery` + `AuthorizationPrivilege.PlatformAdmin`; deny → `/restricted` (parity with `src/main/admin/NonPlatformAdminRedirect.tsx`).
- [X] T007 Implement `CrdAdminShellPage` in `src/main/crdPages/topLevelPages/admin/CrdAdminShellPage.tsx` — apply access guard, derive `activeSection` from the URL, resolve translated section labels from `adminSections`, render `AdminShell` with an `<Outlet />` body; section change navigates via `@/main/routing/urlBuilders` (add an admin URL builder if none fits).
- [X] T008 Implement `CrdAdminRoutes` skeleton in `src/main/crdPages/topLevelPages/admin/CrdAdminRoutes.tsx` — nested route tree under `CrdAdminShellPage`, one route per section pointing (initially) at a placeholder, plus a default redirect to `/admin/spaces` matching MUI's index behavior.
- [X] T009 Wire the toggle in `src/main/routing/TopLevelRoutes.tsx` at the `/admin/*` route: `crdEnabled ? <CrdAdminRoutes/> : <PlatformAdminRoute/>`, CRD branch wrapped in `CrdLayoutWrapper` (CRD shell). Lazy-load `CrdAdminRoutes`. Leave the MUI `PlatformAdminRoute` branch untouched.
- [X] T010 [P] Add `lazyWithGlobalErrorHandler` import for `CrdAdminRoutes` alongside the existing `PlatformAdminRoute` import in `src/main/routing/TopLevelRoutes.tsx`.
- [X] T011 [P] Foundational tests in `src/crd/components/admin/__tests__/AdminShell.test.tsx` and `src/main/crdPages/topLevelPages/admin/__tests__/useAdminAccessGuard.test.ts` — shell renders all sections in MUI order, fires `onSectionChange`, a11y `role="tablist"`; guard denies non-admins, allows admins.

### Shared list/table/license-plan blocks (block US2–US6)

- [X] T012 [P] Implement generic `AdminSearchableTable` in `src/crd/components/admin/AdminSearchableTable.tsx` per `contracts/admin-searchable-table.contract.ts` — Name+link column, custom columns, row actions, `client`/`server` pagination modes, search field, empty state, and delete-via-`ConfirmationDialog` (`variant="destructive"`, `canDelete` gate). Pure CRD.
- [X] T013 [P] Implement reusable cell renderers in `src/crd/components/admin/columns/` (`ListedInStoreCell.tsx`, `SearchVisibilityCell.tsx`, `AccountOwnerCell.tsx`, `VisibilityChipCell.tsx`) using `Badge`/lucide icons — CRD twins of `AdminListItemLayout.tsx` columns.
- [X] T014 [P] Implement shared `ManageLicensePlans` view in `src/crd/components/admin/licensePlans/ManageLicensePlans.tsx` per `section-contracts.md` (available plans, active-plan table, assign/revoke callbacks, confirm on revoke). Pure CRD.
- [X] T015 [P] Tests for shared blocks: `src/crd/components/admin/__tests__/AdminSearchableTable.test.tsx` (search filters, client+server pagination boundaries, row action callbacks, delete shows confirm and only mutates on confirm, empty state) and `__tests__/ManageLicensePlans.test.tsx` (assign/revoke + confirm-on-revoke).

**Checkpoint**: CRD admin loads behind the toggle with a working section nav and gate; shared table/license-plan blocks ready.

---

## Phase 3: User Story 1 — Navigate the global admin in CRD (Priority: P1) 🎯 MVP

**Goal**: A platform admin on the CRD design version sees the entire admin in CRD with working section navigation, gating, and deep-linkable URLs; placeholders render for sections not yet filled.

**Independent Test**: On CRD design version, open `/admin` → CRD shell + all 10 section tabs; switch sections (URL updates, body changes); deep-link to `/admin/users` (section active on reload); non-admin denied; MUI-version user sees unchanged MUI admin.

### Implementation for User Story 1

- [X] T016 [P] [US1] Create a reusable `AdminSectionPlaceholder` in `src/crd/components/admin/AdminSectionPlaceholder.tsx` (translated "coming soon" body) and wire it as the body for every not-yet-migrated section route in `CrdAdminRoutes.tsx`.
- [X] T017 [US1] Finalize section-change navigation + active-section derivation in `CrdAdminShellPage.tsx` so each `adminSections` entry maps URL ↔ active tab exactly (including the VC/policies path quirk), and the default `/admin` redirect matches MUI.
- [X] T018 [P] [US1] Add all US1 i18n keys (page title, 10 section labels, placeholder copy) to the 6 `src/crd/i18n/admin/admin.<lang>.json` files.

### Tests for User Story 1

- [X] T019 [P] [US1] Navigation/gate parity tests in `src/main/crdPages/topLevelPages/admin/__tests__/CrdAdminShellPage.test.tsx` — renders inside CRD shell; section tabs list matches MUI order/paths; selecting a tab updates the URL; deep-link renders correct active section; non-admin redirected; (toggle-off path renders MUI admin, asserted at the `TopLevelRoutes` dispatch level).

**Checkpoint**: US1 fully functional — CRD admin shell navigable and gated; MVP shippable behind the toggle.

---

## Phase 4: User Story 2 — Administer Users (Priority: P1)

**Goal**: Searchable, server-paginated users list with open/edit, delete, change-email (global-admin only), email-change history + drift resolution, and account license-plan management — parity with MUI.

**Independent Test**: `/admin/users` — search, page, open/edit a user, change email, view history/resolve drift, manage license plans, delete — each matches MUI server outcome and gating.

### Implementation for User Story 2

- [X] T020 [P] [US2] Create `users/userListMapper.ts` in `src/main/crdPages/topLevelPages/admin/users/` → `AdminUserRow[]` (incl. `canChangeEmail` from authorization), per data-model.md. No GraphQL types leak.
- [ ] T021 [P] [US2] Create `users/userDetailMapper.ts` + `users/emailHistoryMapper.ts` → `AdminUserDetail`, `EmailChangeHistoryItem[]`.
- [ ] T022 [P] [US2] Build CRD presentational `UserEditForm` in `src/crd/components/admin/users/UserEditForm.tsx` (all fields per `data-model.md` `AdminUserDetail`: displayName/firstName/lastName/email, phone, city/country, tagline, linkedin/bsky/github, tags, references, avatar via FloatingField/tags-input/avatar), `ChangeEmailDialog` (`useDialogCloseGuard`), and `EmailChangeHistoryView` per `section-contracts.md`.
- [ ] T022a [P] [US2] Render the user `bio` field via the CRD **markdown editor** in `UserEditForm.tsx` (markdown, 2000-char limit) — parity with MUI `FormikMarkdownField`; CRD CLAUDE.md rule #10.
- [X] T023 [US2] Implement `users/CrdAdminUsersPage.tsx` — reuse `usePlatformAdminUsersListQuery` (server mode), map, render `AdminSearchableTable<AdminUserRow>` with Email column + row actions (change-email when allowed, license-plans settings via `ManageLicensePlans`, open-detail link); delete via `useDeleteUserMutation` + `refetchPlatformAdminUsersListQuery`.
- [ ] T024 [US2] Implement `users/CrdAdminUserPage.tsx` (detail/edit) — `useUserQuery` + `useUpdateUserMutation`, render `UserEditForm`; change-email via `useChangeUserEmailMutation`.
- [ ] T024a [US2] Add a page-level unsaved-edits guard to `CrdAdminUserPage.tsx` (prompt on route navigation away with a dirty form) — reuse the dirty-guard pattern from space settings (`DirtyTabGuardContext`) or a React Router blocker; `DiscardChangesDialog` on confirm.
- [ ] T025 [US2] Implement `users/CrdAdminUserEmailHistoryPage.tsx` — render `EmailChangeHistoryView`; resolve drift via `useResolveUserEmailDriftMutation`.
- [ ] T026 [US2] Wire Users routes in `CrdAdminRoutes.tsx` (`/admin/users`, `/admin/users/:userName`, `/admin/users/:userName/edit`, `/admin/users/:userId/email-history`), replacing the placeholder; confirm deep-link/refresh parity.
- [ ] T027 [P] [US2] Add Users i18n keys to the 6 `admin.<lang>.json` files (columns, actions, dialogs, history).

### Tests for User Story 2

- [X] T028 [P] [US2] Page/parity tests in `users/__tests__/CrdAdminUsersPage.test.tsx` — list columns/search/server-pagination; delete confirm + refetch; change-email hidden for non-global-admin.
- [ ] T029 [P] [US2] Component tests in `src/crd/components/admin/users/__tests__/` — `UserEditForm` validation/submit; `ChangeEmailDialog` unsaved-guard; `EmailChangeHistoryView` outcome badges + resolve-drift callback.

**Checkpoint**: Users section at full parity.

---

## Phase 5: User Story 3 — Administer Organizations (Priority: P1)

**Goal**: Searchable, server-paginated orgs list with create, open/edit, verification toggle, account license plans, and delete — parity with MUI.

**Independent Test**: `/admin/organizations` — create, search/list, open/edit, toggle verification, manage license plans, delete — each matches MUI.

### Implementation for User Story 3

- [X] T030 [P] [US3] Create `organizations/orgListMapper.ts` → `AdminOrganizationRow[]` and `organizations/orgFormMapper.ts` → `AdminOrganizationForm` / `OrganizationVerification`, per data-model.md.
- [ ] T031 [P] [US3] Build CRD `OrganizationForm` in `src/crd/components/admin/organizations/OrganizationForm.tsx` (all fields per `data-model.md` `AdminOrganizationForm`: nameID/displayName [create-only required], contactEmail/domain/legal/website, tagline, city/country, linkedin/bsky/github, references, tags; `mode: 'create' | 'edit'`) — render `description` through the CRD **markdown editor** (`MarkdownEditor`/`MarkdownContent`, per CRD CLAUDE.md rule #10 and `docs/crd/markdown-editor.md`), never a plain textarea — and `VerificationToggle.tsx` (exposes only `availableEvents`), per `section-contracts.md`.
- [X] T032 [US3] Implement `organizations/CrdAdminOrganizationsPage.tsx` — `usePlatformAdminOrganizationsListQuery` (server mode), `AdminSearchableTable<AdminOrganizationRow>` with row actions (license-plans settings, verification toggle via `useAdminOrganizationVerifyMutation`, open-edit link); delete via `useDeleteOrganizationMutation` + refetch.
- [ ] T033 [US3] Implement `organizations/CrdAdminOrganizationFormPage.tsx` (create + edit) — `useOrganizationProfileInfoQuery`, `useCreateOrganizationMutation` / `useUpdateOrganizationMutation`, `useCreateTagsetOnProfileMutation`; render `OrganizationForm`.
- [ ] T033a [US3] Add the same page-level unsaved-edits guard (as T024a) to `CrdAdminOrganizationFormPage.tsx` — prompt on route navigation away with a dirty form; `DiscardChangesDialog` on confirm.
- [ ] T034 [US3] Wire Organizations routes in `CrdAdminRoutes.tsx` (`/admin/organizations`, `/admin/organizations/new`, edit route), replacing the placeholder.
- [ ] T035 [P] [US3] Add Organizations i18n keys to the 6 `admin.<lang>.json` files.

### Tests for User Story 3

- [X] T036 [P] [US3] Page/parity tests in `organizations/__tests__/CrdAdminOrganizationsPage.test.tsx` — list/search/pagination; verification toggle transitions; delete confirm + refetch.
- [ ] T037 [P] [US3] Component tests in `src/crd/components/admin/organizations/__tests__/` — `OrganizationForm` create + edit validation/submit; `VerificationToggle` event gating.

**Checkpoint**: Organizations section at full parity.

---

## Phase 6: User Story 4 — Administer Spaces (Priority: P1)

**Goal**: Searchable spaces list (visibility/privacy/owner columns), space license-plan management, and delete (gated by `canUpdate`) — parity with MUI.

**Independent Test**: `/admin/spaces` — search/page, verify columns, open space settings to manage license plans, delete a space — each matches MUI.

### Implementation for User Story 4

- [X] T038 [P] [US4] Create `spaces/spaceListMapper.ts` → `AdminSpaceRow[]` (visibility, privacyMode, accountOwner, canUpdate), per data-model.md.
- [X] T039 [US4] Implement `spaces/CrdAdminSpacesPage.tsx` — `usePlatformAdminSpacesListQuery` (client "show more" mode), `AdminSearchableTable<AdminSpaceRow>` with `VisibilityChipCell` columns; Settings row action opens `ManageLicensePlans` (`usePlatformLicensingPlansQuery` + assign/revoke); delete via `useDeleteSpaceMutation` + `refetchPlatformAdminSpacesListQuery`, gated by `canDelete = row.canUpdate`.
- [X] T040 [US4] Wire Spaces route in `CrdAdminRoutes.tsx` (`/admin/spaces`), replacing the placeholder; confirm it is the default `/admin` index.
- [X] T041 [P] [US4] Add Spaces i18n keys to the 6 `admin.<lang>.json` files.

### Tests for User Story 4

- [X] T042 [P] [US4] Page/parity tests in `spaces/__tests__/CrdAdminSpacesPage.test.tsx` — columns/search/show-more pagination; license-plan assign/revoke; delete gated by `canUpdate` + confirm + refetch.

**Checkpoint**: All P1 sections (Users, Organizations, Spaces) complete — primary admin value delivered.

---

## Phase 7: User Story 5 — Manage Global Roles (Priority: P2)

**Goal**: Select any of the 9 global roles, view members, search available users, add/remove members — parity with MUI.

**Independent Test**: `/admin/authorization` — switch roles, add a user, remove a member — each matches MUI.

### Implementation for User Story 5

- [X] T043 [P] [US5] Create `authorization/roleMembersMapper.ts` → `RoleMembersViewModel` (members + available users), per data-model.md.
- [X] T044 [P] [US5] Build CRD `RoleMembersEditor` in `src/crd/components/admin/roles/RoleMembersEditor.tsx` (reuse `UserSelector`; remove via `ConfirmationDialog`) and `GlobalRolesNav.tsx` (role selector), per `section-contracts.md`.
- [X] T045 [US5] Implement `authorization/CrdAdminGlobalRolesPage.tsx` — `usePlatformRoleSetQuery` + `useRoleSetManager` + `useRoleSetAvailableUsers`; render `GlobalRolesNav` + `RoleMembersEditor`; add/remove via role-set manager.
- [X] T046 [US5] Wire Global Authorization routes in `CrdAdminRoutes.tsx` (`/admin/authorization`, `/admin/authorization/roles/:roleName`), replacing the placeholder.
- [X] T047 [P] [US5] Add Global Roles i18n keys (9 role labels + member-management copy) to the 6 `admin.<lang>.json` files.

### Tests for User Story 5

- [X] T048 [P] [US5] Tests in `authorization/__tests__/CrdAdminGlobalRolesPage.test.tsx` + `src/crd/components/admin/roles/__tests__/RoleMembersEditor.test.tsx` — all 9 roles selectable; members listed; add/remove fires with confirm-on-remove.

**Checkpoint**: Global Roles section at full parity.

---

## Phase 8: User Story 6 — Innovation Packs / Hubs / Virtual Contributors (Priority: P2)

**Goal**: Three searchable list sections sharing the store-entity shape (Name/Listed in Store/Search Visibility/Account Owner); Packs+Hubs deletable, VCs read-only — parity with MUI.

**Independent Test**: Open each section — search/page, verify 4 columns, follow a row link, delete (Packs/Hubs only) — each matches MUI.

### Implementation for User Story 6

- [X] T049 [P] [US6] Create shared `_shared/storeEntityMapper.ts` → `AdminStoreEntityRow[]` (listedInStore, searchVisibility, accountOwner) under `src/main/crdPages/topLevelPages/admin/`.
- [X] T050 [P] [US6] Implement `innovationPacks/CrdAdminInnovationPacksPage.tsx` — `usePlatformAdminInnovationPacksQuery` (client mode), `AdminSearchableTable<AdminStoreEntityRow>` with `ListedInStoreCell`/`SearchVisibilityCell`/`AccountOwnerCell`; delete via `useDeleteInnovationPackMutation` + refetch.
- [X] T051 [P] [US6] Implement `innovationHubs/CrdAdminInnovationHubsPage.tsx` — `usePlatformAdminInnovationHubsQuery`, same table; delete via `useDeleteInnovationHubMutation` + refetch.
- [X] T052 [P] [US6] Implement `virtualContributors/CrdAdminVirtualContributorsPage.tsx` — `usePlatformAdminVirtualContributorsListQuery`, same table, **no `onDelete`** (read-only).
- [X] T053 [US6] Wire the three routes in `CrdAdminRoutes.tsx` (`/admin/innovation-packs`, `/admin/innovation-hubs`, `/admin/virtual-contributors`), replacing placeholders.
- [X] T054 [P] [US6] Add Packs/Hubs/VCs i18n keys to the 6 `admin.<lang>.json` files.

### Tests for User Story 6

- [X] T055 [P] [US6] Tests in `innovationPacks/__tests__/`, `innovationHubs/__tests__/`, `virtualContributors/__tests__/` — columns/search/show-more; row links; Packs/Hubs delete-with-confirm; VCs have no delete action.

**Checkpoint**: All P2 sections complete.

---

## Phase 9: User Story 7 — Inspect Authorization Policies (Priority: P3)

**Goal**: Look up a policy by ID; display type + credential rules + privilege rules; look up a user's privileges within the policy — parity with MUI.

**Independent Test**: `/admin/authorization-policies` — enter a valid ID (rules render), look up a user's privileges, enter an invalid ID (not-found feedback) — each matches MUI.

### Implementation for User Story 7

- [X] T056 [P] [US7] Create `authorizationPolicies/policyMapper.ts` → `AuthorizationPolicyView` / `UserPrivilegesLookup`, per data-model.md.
- [X] T057 [P] [US7] Build CRD `AuthorizationPolicyLookup`, `AuthorizationPolicyRules`, `UserPrivilegesLookupView` in `src/crd/components/admin/authorizationPolicies/`, per `section-contracts.md`.
- [X] T058 [US7] Implement `authorizationPolicies/CrdAdminAuthorizationPoliciesPage.tsx` — `useAuthorizationPolicyQuery` (lookup by ID) + per-user privileges logic (parity with `AuthorizationPrivilegesForUser`); not-found feedback (FR-062).
- [X] T059 [US7] Wire route in `CrdAdminRoutes.tsx` (`/admin/authorization-policies`), replacing the placeholder.
- [X] T060 [P] [US7] Add Authorization Policies i18n keys to the 6 `admin.<lang>.json` files.

### Tests for User Story 7

- [X] T061 [P] [US7] Tests in `authorizationPolicies/__tests__/CrdAdminAuthorizationPoliciesPage.test.tsx` — valid ID renders rules; user lookup shows privileges; invalid ID shows not-found.

**Checkpoint**: Authorization Policies section at full parity.

---

## Phase 10: User Story 8 — Transfers & Conversions (Priority: P3)

**Goal**: Destructive-warning banner; space & VC conversion; transfer of space/innovation-hub/innovation-pack/VC/callout via account picker — each gated by confirmation — parity with MUI.

**Independent Test**: `/admin/transfer` — exercise each conversion + each transfer using the account picker — each matches MUI with confirmation.

### Implementation for User Story 8

- [X] T062 [P] [US8] Build CRD `TransferSectionLayout` (warning banner) and `AccountPicker` (reuse `ContributorSelector`) in `src/crd/components/admin/transfer/`, per `section-contracts.md`.
- [ ] T063 [P] [US8] Build CRD sub-form components for the 5 transfers + 2 conversions in `src/crd/components/admin/transfer/` per `section-contracts.md` §Transfer (conversions: single source `url`; Space/Callout transfers: source `url` + **target `url` text field**; Hub/Pack/VC transfers: source `url` + `AccountPicker`). Each: inputs + submit, all destructive → consumer wires `ConfirmationDialog`.
- [ ] T064 [US8] Implement conversion connectors in `transfer/` — space conversion (`useSpaceConversion` → L1→L0 / L1→L2 [needs parent] / L2→L1) and VC conversion (`useVcConversion`), each behind `ConfirmationDialog`.
- [ ] T065 [US8] Implement transfer connectors in `transfer/` — Hub/Pack/VC use `AccountPicker` + `useAccountSearch` + use{TransferInnovationHub,TransferInnovationPack,TransferVirtualContributor}ToAccountMutation; **Space and Callout use a target URL text field** (not the picker) + `useTransferSpaceToAccountMutation` / `useTransferCalloutMutation`. Each behind `ConfirmationDialog` (Callout shows the same 4 warnings as MUI).
- [X] T066 [US8] Implement `transfer/CrdAdminTransferPage.tsx` composing the warning banner + conversions area + transfers area (parity layout with MUI `TransferPage`).
- [X] T067 [US8] Wire route in `CrdAdminRoutes.tsx` (`/admin/transfer`), replacing the placeholder.
- [X] T068 [P] [US8] Add Transfer/Conversion i18n keys (incl. the warning copy) to the 6 `admin.<lang>.json` files.

### Tests for User Story 8

- [X] T069 [P] [US8] Tests in `transfer/__tests__/CrdAdminTransferPage.test.tsx` — warning present; each conversion + transfer requires confirm and only mutates on confirm; account picker behavior.

**Checkpoint**: Transfer & Conversions section at full parity.

---

## Phase 11: User Story 9 — Layout section parity (Priority: P3)

**Goal**: The Layout section present in nav (same position) renders the CRD equivalent of the MUI placeholder.

**Independent Test**: `/admin/layout` renders without error; section present in nav.

### Implementation for User Story 9

- [X] T070 [P] [US9] Build CRD `AdminLayoutPlaceholder` in `src/crd/components/admin/AdminLayoutPlaceholder.tsx` (CRD twin of MUI `AdminLayoutPage` empty body).
- [X] T071 [US9] Implement `layout/CrdAdminLayoutPage.tsx` and wire the `/admin/layout` route in `CrdAdminRoutes.tsx`, replacing the generic placeholder; add any i18n key to the 6 `admin.<lang>.json` files.

### Tests for User Story 9

- [X] T072 [P] [US9] Test in `layout/__tests__/CrdAdminLayoutPage.test.tsx` — renders without error; route resolves.

**Checkpoint**: All 10 sections present — CRD admin is a one-to-one replacement of MUI admin.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final parity verification, a11y, i18n completeness, and lint/test gates.

- [X] T073 [P] Audit all 6 `src/crd/i18n/admin/admin.<lang>.json` files for key parity (no missing keys, no hardcoded strings in any admin component) — SC-007.
- [X] T074 [P] Accessibility pass across all admin CRD components (icon-button `aria-label`, `focus-visible:ring`, semantic table/list markup, `role="tablist"`) — WCAG 2.1 AA.
- [X] T075 [P] Verify zero `@mui/*` / `@emotion/*` imports in `src/crd/components/admin/**` and `src/main/crdPages/topLevelPages/admin/**` — SC-008.
- [X] T076 Verify post-mutation refetch parity for every section (lists refresh after create/delete/assign/revoke/verify/transfer/convert) — FR-094 / SC-009.
- [X] T077 Confirm the MUI admin still renders unchanged for MUI-design-version users across all `/admin/*` routes (no regression) — SC-010.
- [X] T078 Run `pnpm lint` and `pnpm vitest run` (full suite green); then run `specs/105-crd-global-admin/quickstart.md` validation end-to-end on the CRD design version.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Setup.
  - T005–T011 (shell/gate/routing/toggle) **block all** user stories.
  - T012–T015 (shared table/cells/license-plans) **block US2, US3, US4, US6**.
- **US1 (Phase 3)**: depends only on T005–T011.
- **US2/US3/US4 (Phases 4–6, P1)**: depend on T005–T011 + T012–T015.
- **US5 (Phase 7)**: depends on T005–T011 (uses `UserSelector`, not the table).
- **US6 (Phase 8)**: depends on T005–T011 + T012–T013.
- **US7/US8/US9 (Phases 9–11, P3)**: depend on T005–T011.
- **Polish (Phase 12)**: depends on all desired stories.

### Story Independence

Every section is a nested route that replaces its own placeholder + adds its own mapper/page/tests + appends its own i18n keys. Stories touch disjoint files except `CrdAdminRoutes.tsx` (route registration) and the shared `admin.<lang>.json` files — serialize edits to those two, or merge carefully.

### Parallel Opportunities

- Setup: T001 ‖ T004.
- Foundational: T005 ‖ T006 ‖ T012 ‖ T013 ‖ T014 (distinct files); T007→T008→T009 sequential (routing chain).
- After Foundational, the P1 stories (US2/US3/US4) can proceed in parallel by different developers; P2 (US5/US6) and P3 (US7/US8/US9) likewise.
- Within a story, mappers ‖ CRD components (distinct files), then the page wires them, then tests.

### Parallel Example: User Story 2

```bash
# Mappers + CRD components in parallel:
Task: "T020 userListMapper.ts"
Task: "T021 userDetailMapper.ts + emailHistoryMapper.ts"
Task: "T022 UserEditForm + ChangeEmailDialog + EmailChangeHistoryView"
# Then sequential page wiring (T023–T026), then parallel tests (T028 ‖ T029).
```

---

## Implementation Strategy

### MVP First

1. Phase 1 Setup → Phase 2 Foundational (T005–T011) → Phase 3 US1.
2. **STOP & VALIDATE**: CRD admin navigable + gated behind the toggle (US1 independent test).
3. Demo MVP.

### Incremental Delivery (recommended order)

1. Foundation + US1 → CRD admin shell live (toggle-gated).
2. Add shared blocks (T012–T015) + US2 → US3 → US4 → **all P1 sections** (Users, Orgs, Spaces) shipped.
3. Add US5 + US6 → P2 sections shipped.
4. Add US7 + US8 + US9 → full parity; CRD admin is the complete replacement.
5. Phase 12 polish → flip confidence high; toggle removal handled in a later, separate feature.

### Notes

- [P] = different files, no incomplete-task dependency.
- Reuse `src/domain/platformAdmin/**` hooks verbatim; never re-implement the data layer.
- Every destructive action confirms via `ConfirmationDialog` before mutating (FR-090); cancel = no mutation.
- MUI admin files stay untouched (FR-096) — they remain the default for MUI-version users.
- Commit after each task or logical group; keep `CrdAdminRoutes.tsx` and the `admin.<lang>.json` edits conflict-free across parallel stories.
