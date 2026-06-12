# Reused GraphQL Operations (no new operations expected)

This feature reuses the **existing** generated hooks from `src/core/apollo/generated/apollo-hooks.ts`. No new `.graphql` documents and **no `pnpm codegen` run is anticipated**. If, during implementation, a CRD view needs a field absent from a current query, add a fragment + run codegen in the same PR (constitution III) — contingency, not a planned task.

| Section | Queries | Mutations |
|---|---|---|
| **Access gate** | `usePlatformLevelAuthorizationQuery` | — |
| **Spaces** | `usePlatformAdminSpacesListQuery` | `useDeleteSpaceMutation` |
| **Users** | `usePlatformAdminUsersListQuery`, `useUserQuery` | `useUpdateUserMutation`, `useDeleteUserMutation`, `useChangeUserEmailMutation`, `useResolveUserEmailDriftMutation` |
| **Organizations** | `usePlatformAdminOrganizationsListQuery`, `useOrganizationProfileInfoQuery` | `useCreateOrganizationMutation`, `useUpdateOrganizationMutation`, `useDeleteOrganizationMutation`, `useAdminOrganizationVerifyMutation`, `useCreateTagsetOnProfileMutation` |
| **Innovation Packs** | `usePlatformAdminInnovationPacksQuery` | `useDeleteInnovationPackMutation` |
| **Innovation Hubs** | `usePlatformAdminInnovationHubsQuery` | `useDeleteInnovationHubMutation` |
| **Virtual Contributors** | `usePlatformAdminVirtualContributorsListQuery` | — (read-only) |
| **Global Roles** | `usePlatformRoleSetQuery`, `useRoleSetAvailableUsers` (via `useRoleSetManager`) | role assign/remove via `useRoleSetManager` |
| **License plans (Spaces/Users/Orgs)** | `usePlatformLicensingPlansQuery` | `useAssignLicensePlanToAccountMutation`, `useRevokeLicensePlanFromAccountMutation` |
| **Authorization Policies** | `useAuthorizationPolicyQuery` | — |
| **Transfer & Conversions** | account search (`useAccountSearch`) | `useTransferSpace`, `useTransferInnovationHub`, `useTransferInnovationPack`, `useTransferVirtualContributor`, `useTransferCallout`, `useSpaceConversion`, `useVcConversion` |

**Refetch parity (FR-094)**: reuse the same refetch queries the MUI admin uses after each mutation (e.g. `refetchPlatformAdminSpacesListQuery`, `refetchPlatformAdminUsersListQuery`, `refetchPlatformAdminOrganizationsListQuery`, …) so lists refresh identically.

**Authorization parity (FR-095)**: per-row capability flags (`canUpdate`, global-admin-only email change) come from the same authorization fields the MUI admin reads; the integration layer maps them to `canDelete`/`canChangeEmail` view-model flags.
