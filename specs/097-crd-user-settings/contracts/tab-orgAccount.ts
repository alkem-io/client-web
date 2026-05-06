/**
 * Org Account tab — view contract.
 * Reuses `ContributorAccountViewProps` from `tab-userAccount.ts` — the view itself is shared.
 * The Org Account integration produces the same shape as User Account, just sourced from
 * `useOrganizationAccountQuery` + `useAccountInformationQuery({ accountId: org.account.id })`.
 *
 * See data-model.md "User Story 9" for details.
 */

export type { ContributorAccountViewProps as OrgAccountViewProps } from './tab-userAccount';
