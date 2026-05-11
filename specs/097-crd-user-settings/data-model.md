# Phase 1 Data Model: CRD Contributor Settings

**Feature**: 097-crd-user-settings | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Purpose

Document the entities the spec touches and how each one maps from generated GraphQL types into plain CRD prop types. Every CRD view consumes plain TypeScript shapes; the GraphQL → plain-shape mapping is performed exclusively by per-tab data mappers in the integration layer (FR-006).

This document is **specification-side**: it lists field names, validation rules, and the source-of-truth for each piece of data. The exact TypeScript interface shapes for CRD components live in `contracts/`.

---

## Entity Overview

| Entity | Source (GraphQL) | Used by tab(s) | Owner spec |
|---|---|---|---|
| User | `useUserQuery`, `useUserAccountQuery`, `useCurrentUserContext` | User: My Profile, Account, Membership, Organizations, Notifications, Settings, Security | this spec + 096 |
| Organization | `useOrganizationProvider`, `useOrganizationAccountQuery`, `useOrganizationSettingsQuery` | Org: Profile, Account, Community, Authorization, Settings | this spec + 096 |
| Reference | `User.profile.references[]` / `Organization.profile.references[]` | User My Profile, Org Profile | this spec |
| Tagset | `User.profile.tagsets[]` / `Organization.profile.tagsets[]` | User My Profile, Org Profile | this spec |
| Membership | `useUserContributionsQuery` | User Membership | this spec |
| Pending Application | `useUserPendingMembershipsQuery` | User Membership | this spec |
| AssociatedOrganization | `useUserOrganizationIds` + lazy fetch | User Organizations | this spec + 096 |
| NotificationSettings | `User.settings.notification` (via `useUserSettingsQuery`) | User Notifications | this spec |
| HomeSpace | `User.settings.homeSpace` | User Membership | this spec |
| AccountResource (Space / VC / Innovation Pack / Innovation Hub) | `useUserAccountQuery` / `useOrganizationAccountQuery` + `useAccountInformationQuery` | User Account, Org Account | this spec |
| AccountCreateRequest (the four Account-tab creation dialogs' payloads — `CrdCreateSpaceDialog` / `CrdCreateVirtualContributorWizard` / `CrdCreateInnovationPackDialog` / `CrdCreateInnovationHubDialog`) | maps onto the existing create mutations: `useCreateSpaceMutation` / `useCreateVirtualContributorOnAccountMutation` (+ `useUploadVisualMutation`, `useRefreshBodyOfKnowledgeMutation`, `useCreateLinkOnCalloutMutation`, `useCreateSpaceMutation`, `useAssignRoleToVirtualContributorMutation`) / `useCreateInnovationPackMutation` / `useCreateInnovationHubMutation` | User Account, Org Account | this spec |
| Associate (member of an org in `Associate` role) | `useRoleSetManager(roleSet, [Associate])` | Org Community | this spec |
| RoleAssignment (Admin / Owner) | `useRoleSetManager(roleSet, [Admin])` / `(roleSet, [Owner])` | Org Authorization | this spec |
| OrganizationSettings | `useOrganizationSettingsQuery` | Org Settings | this spec |
| Verification | `Organization.verification.status` | Org Profile (read-only) | this spec |

---

## User Story 1 — User Profile

**Save model**: per-section explicit-save (matches 045 About). Each row below maps to a section unit; sections marked "compound" group multiple fields under one Save button. See [research.md Decision #2](research.md) for the full state shape.

### Entity: User (subset consumed by this tab)

| Field | GraphQL path | CRD prop | Required | Validation | Section unit | Notes |
|---|---|---|---|---|---|---|
| Display Name | `user.profile.displayName` | `displayName` | yes | `displayNameValidator` (existing); empty-check fires on Save click | `displayName` | One-field section saved via `updateUser` |
| First Name | `user.firstName` | `firstName` | yes | `nameValidator` (existing); empty-check on Save | `firstName` | One-field section saved via `updateUser` |
| Last Name | `user.lastName` | `lastName` | yes | `nameValidator` (existing); empty-check on Save | `lastName` | One-field section saved via `updateUser` |
| Email | `user.email` | `email` | n/a (read-only) | — | — (not a section) | "Contact support to change email" caption; not editable |
| Phone | `user.phone` | `phone` | no | Phone-format regex runs live; Save disabled while invalid | `phone` | One-field section saved via `updateUser` |
| Tagline | `user.profile.tagline` | `tagline` | no | `textLengthValidator({ maxLength: ALT_TEXT_LENGTH })` | `tagline` | One-field section saved via `updateUser` |
| City + Country | `user.profile.location.{city, country}` | `location: { city, country }` | no | `textLengthValidator()` (city); single-select against `COUNTRIES` (country) | `location` (compound) | Both fields share one Save button; one mutation patches both |
| Bio | `user.profile.description` | `bio` | no | `MarkdownValidator(MARKDOWN_TEXT_LENGTH)` | `bio` | One-field section; `MarkdownEditor` is the input; Enter inserts newline (no Enter-to-Save semantics — section Save is the only commit) |
| Skills | `user.profile.tagsets[name='Skills'].tags[]` (case-insensitive lookup) | `skills: { id?: string; tags: string[] }` | no | — | `skills` (list) | Independent per-section save. `updateUser` patches `profileData.tagsets: [{ ID: <skills-id>, tags }]`. If the user has no `Skills` tagset yet, the first save fires `createTagsetOnProfile({ profileID, name: 'Skills', tags })` and adopts the returned id into the buffer. Mirrors the existing `UserProfileView` reader (`name.toLowerCase() === TagsetReservedName.Skills.toLowerCase()`). |
| Keywords | `user.profile.tagsets[name='Keywords'].tags[]` (case-insensitive lookup) | `keywords: { id?: string; tags: string[] }` | no | — | `keywords` (list) | Independent per-section save (separate from Skills). Same `updateUser` patch shape; same lazy-create-on-first-save semantics if the `Keywords` tagset doesn't yet exist. |
| Avatar | `user.profile.avatar.uri` | `avatarUrl` | no | `image/jpeg` `image/png` `image/gif` | — (immediate commit) | File picker IS the commit; no Save click; no debounce. On success the avatar slot's status flashes "Saved!" for 1800 ms (FR-024). |

### Entity: Reference (User social links + arbitrary references)

Recognized social references resolve by name (case-insensitive): `linkedin`, `bsky`, `github`. Anything else is an arbitrary reference with editable name + URL + description.

The entire References list is **one section unit** (`references`) — Add / Edit / Delete operate on the local section buffer until the section's Save button fires the mutation batch (parity with 045's references handling).

| Field | GraphQL path | CRD prop | Required | Validation |
|---|---|---|---|---|
| Reference id | `user.profile.references[i].id` | `id` | yes | — |
| Reference name | `user.profile.references[i].name` | `name` | yes (read-only on recognized; editable on arbitrary) | `textLengthValidator` |
| Reference URI | `user.profile.references[i].uri` | `uri` | yes | `urlValidator({ maxLength: SMALL_TEXT_LENGTH })` runs live; Save disabled while any URL row is invalid |
| Reference description | `user.profile.references[i].description` | `description` | no | `textLengthValidator` |

Section-buffer states (parallel to 045's `pendingReferenceDelete` pattern):
- New row → temp-id (e.g. `temp-<uuid>`); not yet on the server.
- Edited row → patched in-place in the buffer.
- Pending-delete → row queued for deletion in the buffer (`pendingReferenceDeleteId` state).

Confirmation flow (Rule #9 per FR-025):
- Trash icon click → opens `ConfirmationDialog` (CRD `AlertDialog`, `variant="destructive"`).
- Confirm → row queued for deletion in the section buffer.
- Cancel → dialog dismisses; row stays as-is.

CRUD mutations (existing — fired in one batch on References-section Save):
- Create (for each temp-id row): `createReferenceOnProfile`.
- Update (for each modified existing row): `updateReference`.
- Delete (for each pending-delete row): `deleteReference`.

---

## User Story 2 — User Account

Renders four card groups. The CRD view is the **shared** `ContributorAccountView` (Decision #3 in research.md).

**Empty-state UX per sub-section** (FR-033, ports `prototype/src/app/pages/UserAccountPage.tsx` verbatim):

| Sub-section | Empty-state |
|---|---|
| Hosted Spaces | Always renders a dashed-border "Create New Space" card at the end of the grid alongside any existing space cards. Copy: *"Launch a new collaborative environment for your team."* When 0 spaces, only the dashed card shows. |
| Virtual Contributors | Always renders a dashed-border "Create New Contributor" card at the end of the grid. |
| Template Packs | Renders existing pack cards followed by up to 3 dashed "Empty Slot" placeholders (`Math.max(0, 3 − packs.length)`), each with a `+` icon. |
| Custom Homepages | When ≥1 page → renders cards. When 0 pages → centered full empty-state with a circular icon tile + *"No Custom Homepages"* heading + *"Create a personalized landing page for your account."* descriptive copy + a **Create Homepage** CTA + a *"Capacity: 0/1 Used"* indicator below the CTA. |

Every "Create" / "+" affordance on this tab opens a CRD creation dialog/wizard (FR-034 / Decision #3) — none navigates to a route. The "Create New Space" / "Create New Contributor" dashed cards and the "Empty Slot" `+` tiles and the "Create Homepage" empty-state CTA all map onto the four `onCreate*` callbacks the `ContributorAccountView` exposes; the integration page (`CrdUserAccountTab`) mounts the dialogs and owns their Apollo wiring. See "Account-tab creation dialogs" below.

### Entity: AccountResource (Space / VC / Innovation Pack / Innovation Hub)

Each card group's row shape:

| Field | GraphQL path | CRD prop | Notes |
|---|---|---|---|
| Resource id | `account.<group>[i].id` | `id` | |
| Display name | `account.<group>[i].profile.displayName` | `displayName` | |
| Description | `account.<group>[i].profile.tagline ?? account.<group>[i].profile.description` | `description` | Tagline preferred for brevity |
| Avatar URL | `account.<group>[i].profile.avatar?.uri` | `avatarUrl` | Falls back to `pickColorFromId` deterministic color (per migration-guide.md) |
| Resource URL | `account.<group>[i].profile.url` | `href` | Used by the row name link. The kebab **Manage** action navigates here (`<resource>/settings`); the **Delete** action opens a CRD `ConfirmationDialog` then fires the existing delete mutation |
| Kebab actions | derived from privileges + group type | `actions: KebabAction[]` | View / Manage / Transfer / Delete per existing MUI behavior |

Source query: `useUserAccountQuery` → `account.id` → `useAccountInformationQuery({ accountId })`.

### Account-tab creation dialogs (shared by User Story 2 and User Story 9)

Each of the four "Create" affordances opens a CRD (shadcn) dialog/wizard that is a **parity port of the corresponding current-MUI dialog** (FR-034 / research Decision #3). The presentational components live under `src/crd/components/contributor/settings/create/` (single-step) and `src/crd/components/contributor/settings/createVc/` (the VC wizard shell + step components); the Apollo wiring lives in shared per-flow integration hooks under `src/main/crdPages/topLevelPages/account/` (`useCrdCreateSpace`, `useCrdCreateVirtualContributorWizard`, `useCrdCreateInnovationPack`, `useCrdCreateInnovationHub`). Both `CrdUserAccountTab` and `CrdOrgAccountTab` mount the same dialogs, passing the actor's `account.id` as the creation target. No new GraphQL types or mutations are introduced — only the existing ones below.

#### Create Space → `CrdCreateSpaceDialog` (← MUI `CreateSpace` / `CreateSpaceForm` / `useSpaceCreation`)

| Field | Required | Validation | Maps to mutation variable |
|---|---|---|---|
| `displayName` | yes | min 3, max `SMALL_TEXT_LENGTH` | `spaceData.about.profileData.displayName` |
| `nameID` | yes | auto-generated from `displayName`; editable; alphanumeric + hyphens; unique within the account | `spaceData.nameID` |
| `tagline` | no | min 3, max `SMALL_TEXT_LENGTH` | `spaceData.about.profileData.tagline` |
| `description` | no | markdown, max `MARKDOWN_TEXT_LENGTH` | `spaceData.about.profileData.description` |
| `tags` | no | per-tag min 2, max `SMALL_TEXT_LENGTH` | `spaceData.about.profileData.tags` |
| `spaceTemplateId` | no | UUID; template must have exactly 4 innovation-flow states (parity with MUI) | `spaceData.spaceTemplateID` |
| `addTutorialCallouts` | no | — | `spaceData.collaborationData.addTutorialCallouts` |
| `banner` (visual upload) | no | `Visual.Banner` constraints (allowedTypes/min/max/aspectRatio from the `Visual` type) | uploaded after the mutation via `useUploadVisualMutation` |
| `cardBanner` (visual upload) | no | `Visual.Card` constraints | uploaded after the mutation via `useUploadVisualMutation` |
| `acceptedTerms` | yes | must be `true`; checkbox with a link to the terms dialog | gates submit (not sent to the server) |

- Mutation: `useCreateSpaceMutation` (via the existing `useSpaceCreation` hook). `spaceData.accountID` = the actor's account id; `spaceData.licensePlanID` = the account's first available plan (auto-picked, parity with MUI); `includeVisuals` = true when a banner or cardBanner file is present.
- Refetches: `AccountInformation` (+ dashboard spaces, parity with MUI). On success closes the dialog and the new space appears in the Hosted Spaces group.

#### Create Virtual Contributor → `CrdCreateVirtualContributorWizard` (← MUI `useVirtualContributorWizard`) — full parity port

The multi-step wizard. `startWizard` input ≈ `{ accountId, accountHostName? }`. Steps and per-step fields:

| Step | Fields | What it does |
|---|---|---|
| 1. Initial profile | `name` (req, min 3), `tagline` (opt, max `MID_TEXT_LENGTH`), `description` (opt, markdown), `avatar` (opt visual upload, `Visual.Avatar`), `engine` (req — `AiPersonaEngine.Expert` default), `bodyOfKnowledgeType` (req — `AlkemioKnowledgeBase` default), **source selector** (req — `createSpace` → step 2 / `existingSpace` → step 4 / `external` → step 5) | Captures profile + routes to the chosen knowledge source |
| 2. Add knowledge content | `posts[]` (req, 1–25; each `title` req min 3 max `SMALL_TEXT_LENGTH`, `description` opt markdown max `LONG_MARKDOWN_TEXT_LENGTH`), `documents[]` (opt; each `name` req min 3 max `SMALL_TEXT_LENGTH`, `url` req max `MID_TEXT_LENGTH`) | Builds the `knowledgeBaseData.calloutsSetData.calloutsData` (posts → Post callouts, documents → a Link callout collection); after the create mutation, uploads avatar, adds document links via `useCreateLinkOnCalloutMutation`, refreshes the BoK |
| 3. Choose community | `spaceId` (opt — pick an existing space; if none, a new space is created for the VC) | Adds the VC to the chosen space's community (`useAssignRoleToVirtualContributorMutation`, `RoleName.Member`) or creates a space via `useCreateSpaceMutation` then adds the VC; then navigates to the space or VC profile |
| 4. Use existing space | `subspaceId` (req — pick a space/subspace) | Creates the VC with `bodyOfKnowledgeType = AlkemioSpace` and `bodyOfKnowledgeID = subspaceId`; uploads avatar; refreshes BoK; → step 3 or step 6 |
| 5. External AI | `engine` (req — `GenericOpenai` default / `OpenaiAssistant`), `apiKey` (req), `assistantId` (req only when `engine === OpenaiAssistant`) | Creates the VC with `bodyOfKnowledgeType = None` and `aiPersona.externalConfig = { apiKey, assistantId? }`; uploads avatar; navigates straight to the VC profile (bypasses community selection) |
| 6. Try-VC info | — (display only: `vcName`, `url`) | Success screen |

- Mutations (same as MUI, same order): `useCreateVirtualContributorOnAccountMutation` (main create — `virtualContributorData.{accountID, bodyOfKnowledgeType, bodyOfKnowledgeID?, profileData, aiPersona.{engine, externalConfig?}, knowledgeBaseData}`), `useUploadVisualMutation` (avatar), `useRefreshBodyOfKnowledgeMutation` (`refreshData.virtualContributorID`), `useCreateLinkOnCalloutMutation` (per document), `useCreateSpaceMutation` (when a space is created for the VC), `useAssignRoleToVirtualContributorMutation` (`{roleSetId, contributorId, role: RoleName.Member}`).
- Refetches: `MyAccount`, `AccountInformation`, the account-resources query, `LatestContributionsSpacesFlat`.

#### Create Innovation Pack → `CrdCreateInnovationPackDialog` (← MUI `CreateInnovationPackDialog` / `InnovationPackForm` create variant)

| Field | Required | Validation | Maps to mutation variable |
|---|---|---|---|
| `profile.displayName` | yes | `displayNameValidator` | `packData.profileData.displayName` |
| `profile.description` | yes | markdown, max `MARKDOWN_TEXT_LENGTH` | `packData.profileData.description` |

- Mutation: `useCreateInnovationPackMutation`; `packData.accountID` = the actor's account id. Refetches: `AdminInnovationPacksList`, `AccountInformation`, `InnovationLibrary`. On success: success toast + close dialog.

#### Create Innovation Hub (Custom Homepage) → `CrdCreateInnovationHubDialog` (← MUI `CreateInnovationHubDialog` / `InnovationHubForm` create variant)

| Field | Required | Validation | Maps to mutation variable |
|---|---|---|---|
| `subdomain` | yes | `subdomainValidator`; alphanumeric + hyphens; unique | `hubData.subdomain` |
| `profile.displayName` | yes | `displayNameValidator` | `hubData.profileData.displayName` |
| `profile.tagline` | no | max `MID_TEXT_LENGTH` | `hubData.profileData.tagline` |
| `profile.description` | yes | markdown, max `MARKDOWN_TEXT_LENGTH` | `hubData.profileData.description` |

- Mutation: `useCreateInnovationHubMutation`; `hubData.accountID` = the actor's account id; `hubData.type = InnovationHubType.List` (fixed); `hubData.spaceListFilter = []` (fixed on create). Refetches: `AdminInnovationHubsList`, `AccountInformation`. On success: success toast + close dialog.

#### Failure / cancel semantics (all four)

- Cancel / Escape / backdrop → dialog closes, no mutation, no navigation.
- Mutation hard-failure → dialog stays open, input preserved, inline error toast, submit re-enables. (For the VC wizard, a partial create that already succeeded before a later step's failure leaves whatever was created — same as MUI; the wizard does not roll back.)

---

## User Story 3 — User Membership

### Entity: HomeSpace

| Field | GraphQL path | CRD prop | Notes |
|---|---|---|---|
| Selected Home Space ID | `user.settings.homeSpace.spaceID` | `selectedSpaceId` | Single-select |
| Auto-redirect flag | `user.settings.homeSpace.autoRedirect` | `autoRedirect` | Disabled until a Home Space is selected |

Mutation: `useUpdateUserSettingsMutation` (existing).

### Entity: Membership

Cards in the My Memberships grid. Each row blends two query sources: `useUserContributionsQuery` (provides id/displayName/role from `rolesUser.spaces[]`, plus the L0/subspace flattening) and per-row `useSpaceContributionDetailsQuery({spaceId})` (provides the rich profile data — banner, tagline, leadUsers, roleSetID). The latter is fanned out by `useMembershipEnrichment` from the integration layer (mirrors the MUI `ContributionCard` pattern; Apollo dedupes / caches).

| Field | GraphQL path | CRD prop | Notes |
|---|---|---|---|
| Membership id | `rolesUser.spaces[i].id` (or nested subspace id) | `id` | |
| Space id (for Leave) | same as `id` for L0; subspace id for subspaces (NOT the L0 parent) | `spaceId` | Each subspace has its own role-set; Leave is scoped to the subspace itself |
| Display name | `useSpaceContributionDetailsQuery.lookup.space.about.profile.displayName` (preferred) ?? `rolesUser.spaces[i].displayName` (fallback) | `displayName` | Subspaces only have `id` in `rolesUser`; the rich query supplies their displayName |
| Tagline | `useSpaceContributionDetailsQuery.lookup.space.about.profile.tagline` | `tagline` | Rendered as `line-clamp-2` body text in the card |
| Banner URL | `useSpaceContributionDetailsQuery.lookup.space.about.profile.cardBanner?.uri` | `bannerUrl` | When absent, the card renders a deterministic gradient from `pickColorFromId(id)` |
| Color | derived from `pickColorFromId(id)` | `color` | Banner gradient + avatar fallback bg |
| Type | derived from `level` (L0 → Space; L1/L2 → Subspace) | `type` | Drives the badge label and the View / Leave menu copy ("View Space" vs "View Subspace") |
| Role | derived from `roles[]` precedence (Admin > Lead > Member) | `role` | Renders as a primary-tinted badge under the title |
| Lead users | `useSpaceContributionDetailsQuery.lookup.space.about.membership.leadUsers[]` | `leadUsers: Array<{id, displayName, avatarUrl, profileUrl}>` | Card footer "Led by:" + avatar stack (up to 3 avatars + `+N` overflow). Hidden when empty |
| Role-set id | `useSpaceContributionDetailsQuery.lookup.space.about.membership.roleSetID` | (not on the row directly; consumed by `useUserMembershipTabData.onConfirmLeave`) | Lazy-fetched when the user confirms Leave — used by `removeRoleFromUser` |
| Space URL | `useSpaceContributionDetailsQuery.lookup.space.about.profile.url` | `spaceUrl` | "View Space" / "View Subspace" menu item navigates here. When absent (enrichment not yet resolved), the View entry is hidden |

Filters (client-side):
- Search input → filters by `displayName` substring (case-insensitive)
- Segmented filter `All / Spaces / Subspaces` — type axis only. Status (`Active / Archived`) is intentionally NOT exposed (see FR-043 rationale).

Pagination: none. The grid renders every filtered row. A "Load More" cursor pattern can be added later when the backing query supports paginated cursors.

Leave action: confirmation dialog → `useSpaceContributionDetailsLazyQuery({spaceId})` to fetch `roleSetID` → `removeRoleFromUser({contributorId, roleSetId, role: Member})`.

### Entity: Pending Application

| Field | GraphQL path | CRD prop | Notes |
|---|---|---|---|
| Application id | `me.communityApplications[i].id` | `id` | |
| Space display name | `me.communityApplications[i].spacePendingMembershipInfo.about.profile.displayName` | `displayName` | |
| Space URL | `me.communityApplications[i].spacePendingMembershipInfo.about.profile.url` | `spaceUrl` | Click on the row name navigates here |

Status renders as a static "Pending" badge. The entity is read-only (no actions, no kebab). `createdDate` is not surfaced — `UserPendingMembershipsQuery` does not currently return it; if future iterations add the field, it can be displayed alongside the Pending badge.

Read-only: no kebab, no actions.

---

## User Story 4 — User Organizations

### Entity: AssociatedOrganization

| Field | GraphQL path | CRD prop | Notes |
|---|---|---|---|
| Organization id | (lazy-fetched) `organization.id` | `id` | |
| Avatar URL | `organization.profile.avatar?.uri` | `avatarUrl` | Falls back to `pickColorFromId` |
| Display name | `organization.profile.displayName` | `displayName` | |
| Description | `organization.profile.description` (truncated) | `description` | |
| Location | `organization.profile.location.{city, country}` | `location` | Concatenated |
| Role | derived from user's role on the org | `role` | `'Admin'` or `'Associate'` |
| Associates count | `organization.metrics[Associate].value` | `associatesCount` | |
| Verified | `organization.verification.status === VerifiedManualAttestation` | `verified` | Boolean |
| Website | `organization.profile.url` | `url` | |

Source: `useUserOrganizationIds()` → ids → lazy `useOrganizationsQuery({ ids: [...] })` (existing path used by MUI today).

Search input → filters by `displayName` substring (client-side).
Create button → gated by `currentUser.hasPlatformPrivilege(CreateOrganization)`. Calls existing org-creation flow.
Leave kebab → confirmation dialog → existing leave-organization mutation.

---

## User Story 5 — User Notifications

### Entity: NotificationSettings

A nested settings tree on `user.settings.notification`. Source-of-truth definition in `src/domain/community/userAdmin/tabs/model/NotificationSettings.model.ts` — the CRD mapper imports this file to keep the row list in sync with MUI.

Top-level groups (each is a card on the page):
- `space` (always visible)
- `space.admin` (privilege-gated: `ReceiveNotificationsSpaceAdmin` OR `ReceiveNotificationsSpaceLead` OR Platform Admin)
- `user`
- `user.membership` (rendered as part of `user`)
- `platform`
- `platform.admin` (privilege-gated: Platform Admin)
- `organization` (privilege-gated: `ReceiveNotificationsOrganizationAdmin` OR Platform Admin)
- `virtualContributor`

Each leaf property is an object `{ inApp: boolean, email: boolean, push: boolean }`.

| Row attribute | CRD prop |
|---|---|
| Group label (i18n) | `groupLabel` |
| Property label (i18n) | `propertyLabel` |
| Channel switches | `{ inApp, email, push }` (each is `{ value: boolean, saving: boolean }` or `null` for hidden push) |
| Toggle handler | `(channel: 'inApp' | 'email' | 'push', next: boolean) => void` |

Mutation: `useUpdateUserSettingsMutation` (existing). Optimistic-overrides pattern (Decision #4 in research.md).

Failure handling (FR-064 — clarification Q5):
- **Divergence** (server returns a value different from the optimistic one) → optimistic override clears after the refetch; UI re-renders to authoritative server value.
- **Hard failure** (network error / 5xx / mutation throws) → the toggle reverts to its prior state and an inline toast surfaces the error message. Same revert-and-toast pattern as FR-133 / Org Settings; consistent across every settings toggle in the contributor vertical.

### Entity: PushAvailability

| Field | Source | CRD prop | Notes |
|---|---|---|---|
| Available | `pushNotificationContext.{isSupported, isServerEnabled, !requiresPWAMode, !isPrivateBrowsing}` (all true) | `available` | When false, info banner replaces the master toggle and every push column |
| Reason | derived from above flags | `reasonI18nKey` | E.g., `'push.unavailable.privateBrowsing'` |
| Subscribe handler | `pushNotificationContext.subscribe` | `onSubscribe` | |
| Unsubscribe handler | `pushNotificationContext.unsubscribe` | `onUnsubscribe` | |

### Entity: PushSubscription

Rendered in the Push Subscriptions List card (parity port of MUI `PushSubscriptionsList`).

| Field | CRD prop | Notes |
|---|---|---|
| Subscription id | `id` | |
| Display name (browser/device) | `displayName` | |
| Last used timestamp | `lastUsedAt` | Formatted timestamp |
| Is current device | `isCurrentDevice` | Adds a "Current device" badge |
| Remove handler | `onRemove` | |

---

## User Story 6 — User Settings

### Entity: Communication settings

| Field | GraphQL path | CRD prop | Notes |
|---|---|---|---|
| Allow other users to send me messages | `user.settings.communication.allowOtherUsersToSendMessages` | `allowOtherUsersToSendMessages` | Switch; commits via `updateUserSettings` |

### Entity: Design System toggle (viewer-scoped, browser-only)

| Field | Source | CRD prop | Notes |
|---|---|---|---|
| CRD enabled | `localStorage.getItem('alkemio-crd-enabled') === 'true'` | `crdEnabled` | Switch; commits via `localStorage.setItem` + page reload |

This is **not** a server-stored attribute — it is a viewer-scoped browser preference (FR-073).

---

## User Story 7 — User Security

### Entity: Identity-provider settings flow

The integration hook `useIdentityProviderSettingsFlow` returns a discriminated state:

```typescript
type SecurityViewState =
  | { kind: 'loading' }
  | { kind: 'error'; error: Error }
  | { kind: 'noWebauthn' }
  | { kind: 'ready'; flow: KratosSettingsFlow };
```

The view never imports the identity-provider SDK directly — it receives a `renderKratos(flow)` callback prop that the integration layer fills in by mounting `<KratosForm><KratosUI flow={flow} /></KratosForm>` with the existing `REMOVED_FIELDS` filter.

Visible only to the profile owner (FR-083 — even platform admins on other users' profiles see Security hidden).

---

## User Story 8 — Org Profile

### Entity: Organization (subset consumed by this tab)

| Field | GraphQL path | CRD prop | Required | Validation |
|---|---|---|---|---|
| Display Name | `organization.profile.displayName` | `displayName` | yes | `displayNameValidator` |
| Name ID | `organization.nameID` | `nameID` | n/a (read-only after creation) | — |
| Tagline | `organization.profile.tagline` | `tagline` | no | `textLengthValidator` |
| Description | `organization.profile.description` | `description` | no | `MarkdownValidator(MARKDOWN_TEXT_LENGTH)` |
| City | `organization.profile.location.city` | `city` | no | `textLengthValidator` |
| Country | `organization.profile.location.country` | `country` | no | Single-select against `COUNTRIES` |
| Keywords | `organization.profile.tagsets[name='Keywords'].tags[]` (case-insensitive lookup) | `keywords: { id?: string; tags: string[] }` | no | — |
| Capabilities | `organization.profile.tagsets[name='Capabilities'].tags[]` (case-insensitive lookup) | `capabilities: { id?: string; tags: string[] }` | no | — |
| Contact Email | `organization.contactEmail` | `contactEmail` | no | `emailValidator({ maxLength: SMALL_TEXT_LENGTH })` |
| Domain | `organization.domain` | `domain` | no | `textLengthValidator({ maxLength: SMALL_TEXT_LENGTH })` |
| Legal Entity Name | `organization.legalEntityName` | `legalEntityName` | no | `textLengthValidator({ maxLength: SMALL_TEXT_LENGTH })` |
| Website | `organization.website` | `website` | no | `urlValidator({ maxLength: SMALL_TEXT_LENGTH })` |
| Avatar/logo | `organization.profile.avatar.uri` | `avatarUrl` | no | `image/jpeg` `image/png` `image/gif` |
| Verification status | `organization.verification.status` | `verifiedStatus` | n/a (read-only) | — |

Mutation: `updateOrganization` (existing) for every editable field except references / tagsets / avatar (which use their own existing mutations).

### Entity: Reference (Org social links + arbitrary references)

Same shape as User references (`linkedin`, `bsky`, `github` recognized). Same CRUD mutations — references on `organization.profile.references[]`.

### Entity: Tagset (Org)

Two reserved tagsets: **Keywords** and **Capabilities** — each surfaced as its own per-section editor with its own Save button (parity with the existing MUI `OrganizationForm` / `TagsetSegment`, which renders one labeled input per profile tagset). There is NO single "Tags" field on Org Profile. Each section's Save fires one `updateOrganization` mutation that patches **only that tagset's** entry in `profileData.tagsets`. Lazy-create on first save: if the Org has no `Keywords` (or `Capabilities`) tagset yet, the section's first Save fires `createTagsetOnProfile({ profileID, name: '<Keywords|Capabilities>', tags })` and adopts the returned id into the buffer. Tagset name lookup is case-insensitive (parity with `useOrganization.ts`).

---

## User Story 9 — Org Account

Same entity (`AccountResource`) as User Account. Shared CRD view. Per-actor mapper feeds the org's `account.id` instead of the user's. **Empty-state UX is identical to User Account** (FR-103) — the same `ContributorAccountView` renders the prototype-faithful per-sub-section affordances; the per-actor mapper supplies the labels and `onCreate*` callbacks. The four "Create" affordances open the **same** four CRD creation dialogs documented under User Story 2 → "Account-tab creation dialogs" (FR-034); `CrdOrgAccountTab` mounts them via the shared `useCrdCreate*` integration hooks, passing `organization.account.id` as the creation target. **Manage** navigates to the resource's existing settings URL; **Delete** uses a CRD `ConfirmationDialog` + the existing delete mutation.

Source: `useOrganizationAccountQuery` → `account.id` → `useAccountInformationQuery({ accountId })`.

---

## User Story 10 — Org Community (Associates)

### Entity: Associate

A user with the `Associate` role on the org's role set.

| Field | Source | CRD prop |
|---|---|---|
| User id | `usersByRole[Associate][i].id` | `id` |
| Display name | `usersByRole[Associate][i].profile.displayName` | `displayName` |
| Avatar URL | `usersByRole[Associate][i].profile.avatar?.uri` | `avatarUrl` |

Source hook: `useRoleSetManager({ roleSetId, relevantRoles: [Associate], contributorTypes: [User], fetchContributors: true })`.

Available users (right-side list): `useRoleSetAvailableUsers({ roleSetId, mode: 'platform', role: Associate, filter: searchTerm, usersAlreadyInRole: usersByRole[Associate] })`.

Add (+): `assignRoleToUser(userId, Associate)` — fires immediately on click (no dialog; not destructive).

Remove (×): opens a `ConfirmationDialog` (CRD `AlertDialog`, `variant="destructive"`) with the role-aware label *"Remove {{name}} as Associate"* per Rule #9 (FR-112). Only the dialog's Confirm fires `removeRoleFromUser(userId, Associate)`; Cancel dismisses the dialog with no mutation. The integration hook (`useOrgAssociates`) tracks a `pendingRemoveId: string | null` state to drive the dialog.

Empty-state: when current Associates list or available Users list is empty, render a single muted caption line per FR-018.

---

## User Story 11 — Org Authorization

### Entity: RoleAssignment (Admin / Owner)

Same shape as Associate (Story 10), but parameterized by role. Two sub-tabs in the Authorization tab body, each with its own `useOrgRoleAssignment(roleName)` hook instance:

- Admin sub-tab → `useRoleSetManager({ roleSetId, relevantRoles: [Admin], contributorTypes: [User], fetchContributors: true })`
- Owner sub-tab → `useRoleSetManager({ roleSetId, relevantRoles: [Owner], contributorTypes: [User], fetchContributors: true })`

Active sub-tab held in local React state (no URL sync, parity with current MUI).

Add (+): fires immediately on click. Remove (×): opens a `ConfirmationDialog` (CRD `AlertDialog`, `variant="destructive"`) with role-aware copy (*"Remove {{name}} as Admin"* on the Admin sub-tab; *"Remove {{name}} as Owner"* on the Owner sub-tab) per Rule #9 (FR-121). Only Confirm fires `removeRoleFromUser`; Cancel dismisses with no mutation. The `useOrgRoleAssignment(role)` hook tracks per-role `pendingRemoveId: string | null` state.

Empty-state: when an Admin / Owner list is empty, render a single muted caption line per FR-018.

---

## User Story 12 — Org Settings

### Entity: OrganizationSettings

| Field | GraphQL path | CRD prop | Notes |
|---|---|---|---|
| Allow users matching domain to join | `organization.settings.membership.allowUsersMatchingDomainToJoin` | `allowUsersMatchingDomainToJoin` | Switch |
| Contribution roles publicly visible | `organization.settings.privacy.contributionRolesPubliclyVisible` | `contributionRolesPubliclyVisible` | Switch |

Mutation: `useUpdateOrganizationSettingsMutation` (existing).

**There is no Design System switch on this tab** (FR-132).

---

## Cross-Cutting Concerns

### Loading / error states per region

Each `*ViewProps` carries a `loading: boolean` flag (or a more granular shape per region for tabs that fetch from multiple queries). The mapper produces it from the underlying Apollo `loading` flags. Skeletons are rendered inline via the existing `Skeleton` primitive in `src/crd/primitives/skeleton`.

### Save state per section (Profile tabs)

Per-section state lives in the per-tab integration hook (`useUserProfileTabData` / `useOrgProfileTabData`). The hook holds a values buffer (the user's draft per section) and a saved buffer (the last server-known shape) and derives `dirtyByField` + `saveStatusByField` from those:

```typescript
type SectionSaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }    // transient — auto-transitions to idle after SAVED_FLASH_MS = 1800
  | { kind: 'error'; message: string };

type ProfileTabState = {
  values: Record<SectionKey, FieldValueShape>;
  saved:  Record<SectionKey, FieldValueShape>;
  dirtyByField:    Partial<Record<SectionKey, boolean>>;
  saveStatusByField: Partial<Record<SectionKey, SectionSaveStatus>>;
  pendingReferenceDeleteId: string | null;  // for Rule #9 confirmation flow on the references section
};
```

`onSaveSection(section)` patches ONLY that section's fields via the corresponding mutation (e.g., `updateUser` for User Profile sections; `updateOrganization` for Org Profile sections; `createReferenceOnProfile` / `updateReference` / `deleteReference` batched for the references section).

State transition details and the references-section batch shape: see [research.md Decision #2](research.md).

### i18n key reuse

Where current MUI uses keys already present in `src/core/i18n/en/translation.en.json` (e.g., `forms.validations.elementMustBeValidUrl`, `components.profileSegment.socialLinks.linkedin`, `pages.user-profile.communities.noMembership`), the CRD mapper reuses those existing keys via the `translation` namespace rather than duplicating under `crd-contributorSettings` (FR-142). Per-tab mappers note which keys are reused.

### Authorization predicates

- User shell: `useCanEditUserSettings(profileUserId)` → `{ canEditSettings, isOwner, isPlatformAdmin }`
- Org shell: `useCanEditOrganizationSettings(organizationId)` → `{ canEditSettings, hasUpdatePrivilege }`

Sources documented in [research.md Decision #7](research.md).
