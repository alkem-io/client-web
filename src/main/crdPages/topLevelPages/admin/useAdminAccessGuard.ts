import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * Reads the current user's platform-level privileges and reports whether they
 * hold `PlatformAdmin` — the same privilege the MUI admin gates on
 * (`src/main/admin/NonPlatformAdminRedirect.tsx`).
 *
 * The actual route-level redirect for non-admins is performed by reusing the
 * proven `NonPlatformAdminRedirect` component in `CrdAdminRoutes` (exact parity,
 * no reimplementation of the redirect target). This hook exposes the same
 * decision as plain state so section-level UIs and tests can gate per-action
 * affordances without re-querying (Apollo caches the query).
 */
export const useAdminAccessGuard = () => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();
  const privileges = data?.platform.authorization?.myPrivileges;
  const isPlatformAdmin = Boolean(privileges?.includes(AuthorizationPrivilege.PlatformAdmin));

  return { loading, isPlatformAdmin };
};

export default useAdminAccessGuard;
