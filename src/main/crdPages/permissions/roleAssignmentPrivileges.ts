import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * The privilege each role-assignment surface's backend enforces.
 *
 * These are deliberately per-surface rather than one platform-wide constant: the backend
 * resolvers enforce different tokens for what looks like the same action (spec FR-012).
 * Changing a surface's gate is a one-line change here.
 */

/**
 * Adding a USER to the member role of a SPACE role set — `assignRoleToUser`.
 *
 * This is the ONLY branch of `RoleSetResolverMutations` that enforces this token:
 *
 *   case RoleSetType.SPACE:
 *     privilegeRequired = AuthorizationPrivilege.GRANT;
 *     if (roleData.role === RoleName.MEMBER) {
 *       privilegeRequired = AuthorizationPrivilege.ROLESET_ENTRY_ROLE_ASSIGN;
 *     }
 *
 * The backend grants `ROLESET_ENTRY_ROLE_ASSIGN` on a role set to global admins and
 * global support only, so it is the direct-add token reserved for platform admins — an
 * ordinary space admin never holds it. Applying it to any other action gates that action
 * shut for every space admin. Use `ROLE_SET_GRANT_PRIVILEGES` for those; mirrors
 * `useCommunityAdmin.ts`'s `canAddUsers`, which gates only the direct-add path on it.
 */
export const ROLE_SET_ASSIGN_PRIVILEGES = [AuthorizationPrivilege.RolesetEntryRoleAssign];

/**
 * Every other user role change on a SPACE or ORGANIZATION role set — assigning the lead
 * or admin role, and removing any user role — plus removing an organization from a space
 * role set.
 *
 * `assignRoleToUser` defaults to `GRANT` for both role-set types and only swaps to
 * `ROLESET_ENTRY_ROLE_ASSIGN` for a space MEMBER; `removeRoleFromUser` requires `GRANT`
 * for every role (member self-removal merely extends the policy so the subject also holds
 * it); `removeRoleFromOrganization` requires `GRANT` alone. Space admins and organization
 * admins hold `GRANT` on their role set, which is what makes these actions theirs.
 */
export const ROLE_SET_GRANT_PRIVILEGES = [AuthorizationPrivilege.Grant];

/**
 * Adding an organization to a role set — `assignRoleToOrganization`.
 *
 * Both tokens are required; mirrors `useCommunityAdmin.ts`'s `canAddOrganizations`. The
 * matching removal is NOT gated on this pair — `removeRoleFromOrganization` asks for
 * `GRANT` only, so it uses `ROLE_SET_GRANT_PRIVILEGES`.
 */
export const ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES = [
  AuthorizationPrivilege.RolesetEntryRoleAssignOrganization,
  AuthorizationPrivilege.Grant,
];

/**
 * Inviting an actor (user, organization or by email) to a role set —
 * `inviteForEntryRoleOnRoleSet`.
 *
 * A distinct token from the assign privileges above: space admins hold the invite
 * privilege while the direct-add privileges are reserved for platform admins, which is
 * exactly why the invite and add controls beside each other can be gated differently.
 * Mirrors `useCommunityAdmin.ts`'s `canInvite` / `canInviteOrganizations`.
 */
export const ROLE_SET_INVITE_PRIVILEGES = [AuthorizationPrivilege.RolesetEntryRoleInvite];

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
