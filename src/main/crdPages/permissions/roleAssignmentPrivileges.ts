import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * The privilege each role-assignment surface's backend enforces.
 *
 * These are deliberately per-surface rather than one platform-wide constant: the backend
 * resolvers enforce different tokens for what looks like the same action (spec FR-012).
 * Changing a surface's gate is a one-line change here.
 */

/**
 * Inviting an actor (user, organization or by email) to a role set —
 * `inviteForEntryRoleOnRoleSet`. Used by the organization Associates tab; the space Community
 * tab gates on the native `SpaceCan.invite` verdict instead (`useCommunityActionPermissions`).
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
 * This is a different mutation pair from role-set assignment, which is why the
 * `ROLESET_ENTRY_ROLE_ASSIGN` token does not apply.
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
 * Deliberately NOT `RolesetEntryRoleAssign`, the Space-side entry-role assignment token.
 */
export const ORG_ROLE_SET_MANAGE_PRIVILEGES = [AuthorizationPrivilege.Grant];

/**
 * Platform Support's path to the same Associates-tab management actions — promote,
 * demote, remove, approve/reject applications and read them — on any organization's
 * role set, without GRANT.
 *
 * An alternative to `ORG_ROLE_SET_MANAGE_PRIVILEGES`, not an addition to it: the caller
 * evaluates the two separately and ORs the results, because `useActionPermission`
 * requires every listed privilege. The server never lets this path add someone who is
 * not already an Associate, so it unlocks no direct-add control.
 */
export const ORG_ROLE_SET_SUPPORT_MANAGE_PRIVILEGES = [AuthorizationPrivilege.PlatformSupportOrgMembership];
