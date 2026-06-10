# Phase 1 Data Model: CRD Global Admin View Models

In CRD the "data model" is the set of **plain-TypeScript view models** (component prop shapes) that mappers produce from GraphQL results. CRD components never receive GraphQL types (constitution III, CRD rule #4). Server entities are unchanged; this document defines the seam between them and the presentation layer.

## Section descriptor (shell navigation)

```ts
type AdminSectionId =
  | 'spaces' | 'users' | 'organizations'
  | 'innovation-packs' | 'innovation-hubs' | 'virtual-contributors'
  | 'authorization' | 'authorization-policies' | 'transfer' | 'layout';

type AdminSectionDescriptor = {
  id: AdminSectionId;
  path: string;          // e.g. '/admin/users' — twin of MUI adminTabs[].route
  labelKey: string;      // crd-admin i18n key
  icon: LucideIcon;      // lucide-react equivalent of the MUI icon
};
```
Order is fixed to match MUI `adminTabs` exactly (FR-002).

## Base list row

```ts
type AdminListRow = {
  id: string;
  name: string;          // display name (MUI `value`)
  url: string;           // Name-column link target (from entity profile.url / builder)
};
```

## Spaces

```ts
type AdminSpaceRow = AdminListRow & {
  visibility: 'active' | 'archived';
  privacyMode: 'public' | 'private' | undefined;
  accountOwner: string;
  canUpdate: boolean;    // gates Settings/Delete row actions (parity with SpaceTableItem.canUpdate)
};
```
- Source: `usePlatformAdminSpacesListQuery`. Delete: `useDeleteSpaceMutation` (+ refetch). License plans via `ManageLicensePlansViewModel`.
- Pagination: client-side "show more" (first 10, +10).

## Users

```ts
type AdminUserRow = AdminListRow & {
  email: string;
  canChangeEmail: boolean;   // global-admin only (FR-023)
};

type AdminUserDetail = {            // detail/edit view — mirrors MUI UserForm.tsx
  id: string;
  profileId: string;               // internal, not user-editable
  displayName: string;             // required — displayNameValidator
  firstName: string;               // required — nameValidator
  lastName: string;                // required — nameValidator
  email: string;                   // required — emailValidator
  phone?: string;                  // optional — phone regex
  city?: string;                   // optional — length-validated
  country?: string;                // optional — COUNTRIES enum (country code)
  tagline?: string;                // optional — max 100 (ALT_TEXT_LENGTH)
  bio?: string;                    // optional — MARKDOWN, max 2000 (MarkdownValidator)
  linkedin?: string;               // optional — URL
  bsky?: string;                   // optional — URL
  github?: string;                 // optional — URL
  tags: string[];                  // tagsets — tagsetsSegmentSchema
  references: { id?: string; name: string; uri: string; description?: string }[]; // referenceSegmentWithSocialSchema
  avatarUrl?: string;              // uploaded separately via VisualUpload, not a form field
};

type EmailChangeHistoryItem = {
  id: string;
  fromEmail: string;
  toEmail: string;
  requestedAt: string;       // ISO
  outcome: 'success' | 'failed' | 'pending';
};
```
- Sources: `usePlatformAdminUsersListQuery` (server pagination, search by first/last/email), `useUserQuery`, `useUpdateUserMutation`, `useDeleteUserMutation`, `useChangeUserEmailMutation`, `useResolveUserEmailDriftMutation`. License plans via shared view model.
- **Validation/rendering parity**: `bio` renders through the CRD markdown editor (not a plain textarea); social links (`linkedin`/`bsky`/`github`) are URL-validated; `references` exclude social-network names (parity with MUI `referenceSegmentWithSocialSchema`).

## Organizations

```ts
type AdminOrganizationRow = AdminListRow & {
  verified: boolean;
};

type AdminOrganizationForm = {   // create + edit; mirrors MUI OrganizationForm.tsx
  nameID?: string;               // required in CREATE mode only (read-only on edit) — nameSegmentSchema
  displayName: string;           // required in CREATE mode only — displayNameValidator
  contactEmail?: string;         // optional — emailValidator, max 50 (SMALL_TEXT_LENGTH)
  domain?: string;               // optional — max 50
  legalEntityName?: string;      // optional — max 50
  website?: string;              // optional — urlValidator, max 50
  description?: string;          // optional — MARKDOWN, max 2000 (FormikMarkdownField, rows=10)
  tagline?: string;              // optional — max 100 (ALT_TEXT_LENGTH)
  city?: string;                 // optional — LocationSegment
  country?: string;              // optional — COUNTRIES enum (country code)
  linkedin?: string;             // optional — URL
  bsky?: string;                 // optional — URL
  github?: string;               // optional — URL
  references: { id?: string; name: string; uri: string; description?: string }[]; // referenceSegmentValidationObject
  avatarUrl?: string;            // uploaded separately, not a form field
  tags: string[];                // tagsets — tagsetsSegmentSchema
};

type OrganizationVerification = {
  state: string;                 // OrgVerificationLifecycleStates (e.g. manuallyVerified)
  availableEvents: ('VERIFICATION_REQUEST' | 'MANUALLY_VERIFY' | 'RESET')[];
};
```
- Sources: `usePlatformAdminOrganizationsListQuery`, `useOrganizationProfileInfoQuery`, `useCreateOrganizationMutation`, `useUpdateOrganizationMutation`, `useDeleteOrganizationMutation`, `useAdminOrganizationVerifyMutation`, `useCreateTagsetOnProfileMutation`.

## Innovation Packs / Hubs / Virtual Contributors (shared shape)

```ts
type AdminStoreEntityRow = AdminListRow & {
  listedInStore: boolean;
  searchVisibility: 'public' | 'internal';
  accountOwner: string;
};
```
- Packs: `usePlatformAdminInnovationPacksQuery` + `useDeleteInnovationPackMutation`.
- Hubs: `usePlatformAdminInnovationHubsQuery` + `useDeleteInnovationHubMutation`.
- VCs: `usePlatformAdminVirtualContributorsListQuery` (read-only, **no delete**).
- All client-side "show more".

## Global Roles (authorization)

```ts
type GlobalRoleId =
  | 'GlobalAdmin' | 'GlobalSupport' | 'GlobalLicenseManager'
  | 'GlobalCommunityReader' | 'GlobalSpacesReader' | 'GlobalPlatformManager'
  | 'GlobalSupportManager' | 'PlatformBetaTester' | 'PlatformVcCampaign';

type RoleMember = { id: string; displayName: string; email?: string; avatarUrl?: string; avatarColor?: string };

type RoleMembersViewModel = {
  role: GlobalRoleId;
  members: RoleMember[];
  availableUsers: RoleMember[];   // search results for adding
  loadingAvailable: boolean;
};
```
- Sources: `usePlatformRoleSetQuery`, `useRoleSetManager` (add/remove), `useRoleSetAvailableUsers`.

## License plans (shared by Spaces / Users / Orgs)

```ts
type LicensePlan = { id: string; name: string };
type ManageLicensePlansViewModel = {
  accountId: string;
  available: LicensePlan[];        // usePlatformLicensingPlansQuery
  activePlanIds: string[];
};
```
- Mutations: `useAssignLicensePlanToAccountMutation`, `useRevokeLicensePlanFromAccountMutation`.

## Authorization Policies

```ts
type CredentialRule = { name?: string; cascade: boolean; grantedPrivileges: string[]; criterias: { type: string; resourceID?: string }[] };
type PrivilegeRule = { name?: string; sourcePrivilege: string; grantedPrivileges: string[] };
type AuthorizationPolicyView = {
  id: string;
  type?: string;
  credentialRules: CredentialRule[];
  privilegeRules: PrivilegeRule[];
};
type UserPrivilegesLookup = { userId: string; privileges: string[] };
```
- Source: `useAuthorizationPolicyQuery` (lookup by ID); per-user privileges via the existing `AuthorizationPrivilegesForUser` logic.

## Transfer & Conversions

```ts
type TransferKind = 'space' | 'innovationHub' | 'innovationPack' | 'virtualContributor' | 'callout';
type ConversionKind = 'space' | 'virtualContributor';
// AccountPicker returns an account id (resolved from account.id), not an object:
type OnAccountSelect = (accountId: string | undefined) => void;
```
- Per-operation inputs and hooks are specified in `contracts/section-contracts.md` §Transfer & Conversions. Key parity notes:
  - **Conversions have no target account.** Space conversion + VC conversion take a single source `url`.
  - **Transfer target inputs are NOT uniform.** **Space and Callout transfers take a target *URL text field*** (account URL / target space URL), while **Innovation Hub / Pack / Virtual Contributor transfers use the account picker** (`AccountPicker` via `useAccountSearch`, min 2 chars, searches Users + Organizations holding `TransferResourceAccept`).
  - Every operation is destructive → `ConfirmationDialog` (Callout transfer shows the same 4 warnings as MUI).

## Validation rules (carried over from MUI, unchanged)

- Organization form: same required/format validation as MUI `OrganizationForm` (email format, website URL, required display name).
- User edit: same validation as MUI `UserForm`.
- Email change: same constraints/flow as MUI `ChangeUserEmailDialog`.
- Policy lookup: ID must resolve; unknown ID surfaces MUI-equivalent not-found feedback (FR-062).

## State transitions

- **Organization verification**: state machine `OrgVerificationLifecycleStates` with events `VERIFICATION_REQUEST` / `MANUALLY_VERIFY` / `RESET` — preserved exactly (FR-033); the CRD toggle/control exposes the same available events.
- **Email change**: request → outcome (success/failed) + drift-resolution path — preserved (FR-024).
