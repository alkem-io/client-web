# Component Prop Contracts per Admin Section

All CRD components below are **pure presentational** (no MUI, no Apollo, plain-TS props, all `on*` are callbacks, all strings translated by the consumer or via `useTranslation('crd-admin')`). View-model types are defined in [data-model.md](../data-model.md). Reused primitives are referenced, not re-specified.

## Shell & shared (US1)

- `AdminShell` — see [admin-shell.contract.ts](./admin-shell.contract.ts).
- `AdminSearchableTable` — see [admin-searchable-table.contract.ts](./admin-searchable-table.contract.ts).
- **Cell renderers** (`src/crd/components/admin/columns/`): `ListedInStoreCell({ listed })`, `SearchVisibilityCell({ visibility })`, `AccountOwnerCell({ owner })`, `VisibilityChipCell({ label, tone })` — each renders a `Badge`/icon; no behavior.

## Spaces (US4)

- Uses `AdminSearchableTable<AdminSpaceRow>` with columns Visibility / Privacy Mode / Account Owner.
- `rowActions`: a Settings button → opens `ManageLicensePlans`. Delete gated by `canDelete = row.canUpdate`.
- `ManageLicensePlans` props: `{ available: LicensePlan[]; activePlanIds: string[]; onAssign(planId): void; onRevoke(planId): void; loading: boolean }`.

## Users (US2)

- Uses `AdminSearchableTable<AdminUserRow>` (server mode); Email column; `rowActions`: change-email (only when `row.canChangeEmail`), settings (license plans), open-detail link.
- `UserEditForm` props: `{ value: AdminUserDetail; onChange(patch): void; onSubmit(): void; errors: Record<string,string>; submitting: boolean }` — built from `FloatingField` / `tags-input` / avatar upload.
- `ChangeEmailDialog` props: `{ open; onOpenChange; currentEmail; onSubmit(newEmail): void; submitting; error? }` — guard unsaved input via `useDialogCloseGuard`.
- `EmailChangeHistoryView` props: `{ items: EmailChangeHistoryItem[]; loading; onResolveDrift?(id): void }` — outcome via `Badge`.

## Organizations (US3)

- Uses `AdminSearchableTable<AdminOrganizationRow>` (server mode); `rowActions`: settings (license plans), verification toggle, open-edit link.
- `OrganizationForm` props: `{ value: AdminOrganizationForm; onChange(patch): void; onSubmit(): void; errors; submitting; mode: 'create' | 'edit' }`.
- `VerificationToggle` props: `{ verification: OrganizationVerification; onEvent(event): void; busy: boolean }` — exposes only `availableEvents`.

## Innovation Packs / Hubs / Virtual Contributors (US6)

- All three use `AdminSearchableTable<AdminStoreEntityRow>` (client mode) with columns Listed in Store / Search Visibility / Account Owner.
- Packs & Hubs: `onDelete` provided (confirm). VCs: `onDelete` omitted (read-only).

## Global Roles (US5)

- `GlobalRolesNav` props: `{ roles: GlobalRoleId[]; activeRole: GlobalRoleId; onRoleChange(role): void }` (reuse `SettingsTabStrip` or a select).
- `RoleMembersEditor` props: `{ members: RoleMember[]; availableUsers: RoleMember[]; loadingAvailable; search; onSearchChange; onAdd(userId): void; onRemove(userId): void }` — reuses `UserSelector`. Remove is destructive → `ConfirmationDialog`.

## Authorization Policies (US7)

- `AuthorizationPolicyLookup` props: `{ policyId; onPolicyIdChange; onLookup(): void; policy?: AuthorizationPolicyView; loading; notFound: boolean }`.
- `AuthorizationPolicyRules` props: `{ policy: AuthorizationPolicyView }` — renders type + credential rules + privilege rules.
- `UserPrivilegesLookupView` props: `{ onLookup(userId): void; result?: UserPrivilegesLookup; loading }`.

## Transfer & Conversions (US8)

- `TransferSectionLayout` props: `{ warning: string; children }` — renders the destructive warning banner.
- `AccountPicker` props: `{ search; onSearchChange; options: AccountOption[]; loading; value?: AccountOption; onSelect(opt): void }` — reuses `ContributorSelector`.
- Each transfer/conversion sub-form props: `{ ...inputs; onSubmit(): void; submitting; disabled }`. Every submit gated by `ConfirmationDialog` (destructive).

## Layout (US9)

- `AdminLayoutPlaceholder` — no props (or `{ className? }`); renders the CRD equivalent of the MUI empty placeholder.

---

**Contract invariants (apply to every component above):**
1. No GraphQL types in any prop (mappers convert at the integration seam).
2. No navigation/Apollo/MUI inside components — `on*` callbacks only; links via `href`/builder from the consumer.
3. Every destructive action confirms via `ConfirmationDialog` before its callback proceeds.
4. All text via `t('crd-admin'…)` / props; icon-only buttons have `aria-label`; tables use semantic markup; WCAG 2.1 AA.
