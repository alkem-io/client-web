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
 * Managing an organization that is ALREADY in the role set — changing its role
 * between Member and Lead, or removing it from the Space.
 *
 * Deliberately NOT `ROLE_SET_ASSIGN_ORGANIZATION_PRIVILEGES`. That pair gates
 * bringing a *new* organization in, which is global-admin-only because a direct
 * add never asks the organization. Once an organization is in the role set the
 * server gates both mutations on GRANT alone —
 * `removeRoleFromOrganization` always has, and `assignRoleToOrganization` does
 * too for an organization that already holds the entry role (server R32,
 * `role.set.resolver.mutations.ts` `authorizeAssignOrganization`). Gating these
 * two controls on the assign-organization pair disabled them for every Space
 * admin, so an organization that accepted an invitation could not be given
 * Lead, demoted, or removed.
 */
export const ROLE_SET_MANAGE_ORGANIZATION_PRIVILEGES = [AuthorizationPrivilege.Grant];

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
