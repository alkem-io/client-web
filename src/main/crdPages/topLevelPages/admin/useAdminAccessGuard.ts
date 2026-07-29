import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { PLATFORM_ADMIN_AREA_PRIVILEGES } from '@/main/admin/NonPlatformAdminRedirect';

/**
 * Reads the current user's platform-level privileges and reports whether they may
 * enter the platform admin area.
 *
 * The actual route-level redirect for non-admins is performed by reusing the
 * proven `NonPlatformAdminRedirect` component in `CrdAdminRoutes` (exact parity,
 * no reimplementation of the redirect target). This hook exposes the same
 * decision as plain state so section-level UIs and tests can gate per-action
 * affordances without re-querying (Apollo caches the query).
 *
 * Parity is enforced by importing the admitting set from that component rather
 * than restating it: FR-012 requires the seeded Platform Roles Admin to reach the
 * admin UI, and a guard that admits at the route but denies in-page (or the
 * reverse) is exactly the drift this shared constant prevents.
 */
export const useAdminAccessGuard = () => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();

  // The admitting privileges are split across two policies: PLATFORM_ADMIN sits on
  // the platform authorization, while GRANT_GLOBAL_ADMINS / FEATURE_ROLE_ASSIGN sit
  // on the platform role set's. Union both — reading only the platform policy denies
  // every role this feature introduces.
  const privileges = [
    ...(data?.platform.authorization?.myPrivileges ?? []),
    ...(data?.platform.roleSet.authorization?.myPrivileges ?? []),
  ];

  const isPlatformAdmin = privileges.some(
    privilege =>
      PLATFORM_ADMIN_AREA_PRIVILEGES.includes(privilege) || privilege === AuthorizationPrivilege.PlatformAdmin
  );

  return { loading, isPlatformAdmin };
};
