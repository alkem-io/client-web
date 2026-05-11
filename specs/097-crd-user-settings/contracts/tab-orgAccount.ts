/**
 * Org Account tab — view contract.
 * Reuses `ContributorAccountViewProps` from `tab-userAccount.ts` — the view itself is shared.
 * The Org Account integration produces the same shape as User Account, just sourced from
 * `useOrganizationAccountQuery` + `useAccountInformationQuery({ accountId: org.account.id })`.
 *
 * The four "Create" affordances open the SAME four CRD creation dialogs as User Account
 * (FR-034 — contracts in `./account-create-dialogs.ts`); `CrdOrgAccountTab` mounts them via the
 * shared `useCrdCreate*` integration hooks, passing `organization.account.id` as the creation target.
 *
 * See data-model.md "User Story 9" for details.
 */

export type { ContributorAccountViewProps as OrgAccountViewProps } from './tab-userAccount';
