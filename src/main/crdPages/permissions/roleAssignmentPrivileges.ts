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
 * The `assignRoleToUser` branch of `RoleSetResolverMutations` that enforces this token:
 *
 *   case RoleSetType.SPACE:
 *     privilegeRequired = AuthorizationPrivilege.GRANT;
 *     if (roleData.role === RoleName.MEMBER) {
 *       privilegeRequired = AuthorizationPrivilege.ROLESET_ENTRY_ROLE_ASSIGN;
 *     }
 *
 * The backend grants `ROLESET_ENTRY_ROLE_ASSIGN` only on SUBSPACE role sets — to the admins
 * of that subspace or an ancestor, and to platform roles holding GRANT there — and never on
 * a top-level (L0) role set. Applying it to any other action gates that action shut for
 * every space admin; use `ROLE_SET_GRANT_PRIVILEGES` for those. There is no direct
 * add-member control on the Community settings surface (invitation only,
 * alkem-io/server#6623); the remaining consumer is the virtual-contributor fallback in
 * `useCommunityActionPermissions` (`assignRoleToVirtualContributor` asks for this token
 * when the VC belongs to a different account than the Space).
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
 * Inviting an actor (user, organization or by email) to a role set —
 * `inviteForEntryRoleOnRoleSet`.
 *
 * A distinct token from the assign privilege above, and the one space admins hold:
 * invitation is the only way a user or organization joins a Space from the Community
 * settings surface (alkem-io/server#6623). Mirrors `useCommunityAdmin.ts`'s `canInvite` /
 * `canInviteOrganizations`.
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
export const PLATFORM_ROLE_ASSIGN_PRIVILEGES = [AuthorizationPrivilege.PlatformRolesAssign];

/**
 * Platform role set, the 4 `Feature …` roles — `assignPlatformRoleToUser` /
 * `assignPlatformRoleToOrganization` and their removals for `FEATURE_BETA_TESTER`,
 * `FEATURE_VIRTUAL_ASSISTANT`, `FEATURE_ORGANIZATION_CREATOR` and `FEATURE_VC_CAMPAIGN`.
 *
 * The server's `assignerPrivilegeFor` (platform.role.assignment.rules.service.ts) gates the
 * two role families on DISJOINT tokens: the 10 `Platform …` roles on `GRANT_GLOBAL_ADMINS`
 * above, the 4 `Feature …` roles on `FEATURE_ROLE_ASSIGN` (held by a Platform Users Admin,
 * NOT by a legacy global-admin). Gating a Feature role on `PLATFORM_ROLE_ASSIGN_PRIVILEGES`
 * would lock its rightful assigner out; see `getOfferedPlatformRoles` in
 * `useRoleSetManager.ts` for the matching offer-side split (workspace#027, corr-client-web-8).
 */
export const FEATURE_ROLE_ASSIGN_PRIVILEGES = [AuthorizationPrivilege.FeatureRoleAssign];

/**
 * Managing an organization's own Associates tab — `assignRoleToUser` /
 * `removeRoleFromUser` on the organization's role set (Associate, Admin, Owner).
 *
 * Server-side, organization role assignment resolves through the ORGANIZATION branch
 * of `authorizeAssignActorToRole`, which requires GRANT on the role set — held by
 * ORGANIZATION_ADMIN and ORGANIZATION_OWNER (062, `role.set.resolver.mutations.ts`).
 * Deliberately NOT `ROLE_SET_ASSIGN_PRIVILEGES` (`RolesetEntryRoleAssign`), which gates
 * the Space-side entry-role assignment token only.
 */
export const ORG_ROLE_SET_MANAGE_PRIVILEGES = [AuthorizationPrivilege.Grant];

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
