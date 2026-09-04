import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * The privilege each role-assignment surface's backend enforces.
 *
 * These are deliberately per-surface rather than one platform-wide constant: the backend
 * resolvers enforce different tokens for what looks like the same action (spec FR-012).
 * Changing a surface's gate is a one-line change here.
 */

/**
 * Space and organization role sets — `assignRoleToUser` / `removeRoleFromUser`.
 *
 * Established in production by `useCommunityAdmin.ts`, which gates the space-community
 * add path on this token. The organization surfaces call the same two mutations, so they
 * resolve through the same backend policy.
 */
export const ROLE_SET_ASSIGN_PRIVILEGES = [AuthorizationPrivilege.RolesetEntryRoleAssign];

/**
 * Organization rows on a role set — `assignRoleToOrganization` / `removeRoleFromOrganization`.
 *
 * Both tokens are required; mirrors `useCommunityAdmin.ts`'s `canAddOrganizations`.
 */
export const ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES = [
  AuthorizationPrivilege.RolesetEntryRoleAssignOrganization,
  AuthorizationPrivilege.Grant,
];

/**
 * Platform role set — `assignPlatformRoleToUser` / `removePlatformRoleFromUser`.
 *
 * Confirmed against the running backend (2026-09-03). `PlatformRoleResolverMutations
 * .assignPlatformRoleToUser` calls `grantAccessOrFail` with `grant-global-admins`, so the
 * plain `GRANT` privilege is NOT sufficient here — an admin holding only `GRANT` was shown
 * an enabled control and then refused by the server:
 *
 *   ForbiddenAuthorizationPolicyException: Authorization: unable to grant
 *   'grant-global-admins' privilege: assign role to User ... on roleSet of type: platform
 *
 * This is a different mutation pair from the role-set assignment above, which is why the
 * `ROLESET_ENTRY_ROLE_ASSIGN` token used elsewhere does not apply.
 */
export const PLATFORM_ROLE_ASSIGN_PRIVILEGES = [AuthorizationPrivilege.GrantGlobalAdmins];

/**
 * Adding a virtual contributor from the account, an alternative to
 * `ROLE_SET_ASSIGN_PRIVILEGES` rather than an addition to it.
 *
 * Space admins may hold this without holding the role-set assign privilege, so the VC add
 * control is permitted when EITHER is present — see `useCommunityAdmin.ts`, which unions
 * the two for the same reason. Evaluate the two separately and combine; do not pass both
 * to one `useActionPermission` call, which requires every listed privilege.
 */
export const VC_FROM_ACCOUNT_PRIVILEGES = [AuthorizationPrivilege.CommunityAssignVcFromAccount];
