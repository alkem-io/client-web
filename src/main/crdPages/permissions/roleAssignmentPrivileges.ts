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
 * These are a different mutation pair from the role-set assignment above, so the token
 * used elsewhere does not carry over. `GRANT` is the value recorded during specification
 * clarification and has NOT yet been confirmed against the backend resolver — see Open
 * Risk R1 in specs/085-authz-admin-guard/research.md. If it proves wrong, the symptom is
 * a control disabled for someone who is in fact permitted; correct it here.
 */
export const PLATFORM_ROLE_ASSIGN_PRIVILEGES = [AuthorizationPrivilege.Grant];
