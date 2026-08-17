import type { FC, PropsWithChildren } from 'react';
import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { canUseAdminArea } from '@/main/crdPages/topLevelPages/admin/adminSectionAccess';
import NonAdminRedirect from './NonAdminRedirect';

/**
 * Who may enter the platform admin area.
 *
 * FR-012 (027-platform-role-redesign): the target roles are granted manually
 * through the platform's own admin UI after deploy, and that UI "MUST be able to
 * grant every role in the target model from the first slice that introduces it".
 * Gating solely on `PlatformAdmin` made that impossible — `PLATFORM_ADMIN` is
 * granted only to the legacy global-admin / global-support / global-license-manager
 * credentials, so the seeded break-glass Platform Roles Admin (the only assigner
 * FR-013 guarantees exists after deploy) was redirected away from the very page
 * it has to use.
 *
 * The admission is now DERIVED, not restated: a viewer is admitted exactly when
 * `adminSectionAccess` gives them at least one usable section. Keeping a second,
 * independently-edited list here is what produced the drift this feature kept
 * paying for in both directions — a role admitted to the shell with nothing in
 * it (Platform Roles Admin, shown all nine sections it cannot operate), and a
 * role given a section the guard then redirected it away from (Platform Resource
 * Admin on `/admin/transfer`, finding F1).
 *
 * Still an affordance, never an authorization: the server remains the sole
 * authority for every query and mutation inside the area.
 *
 * NOTE ON WHERE THE PRIVILEGES LIVE — verified against a running server, not
 * assumed. `GRANT_GLOBAL_ADMINS` / `FEATURE_ROLE_ASSIGN` / the two holder-read
 * privileges are granted on the platform **role set's** authorization, while
 * `PLATFORM_ADMIN`, `PLATFORM_USERS_ADMIN` and `PLATFORM_CONTENT_FULL_ACCESS`
 * live on the platform authorization. Both sets must be unioned; checking only
 * `platform.authorization` silently denies half the model.
 */
const NonPlatformAdminRedirect: FC<PropsWithChildren> = ({ children }) => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();

  const privileges = [
    ...(data?.platform.authorization?.myPrivileges ?? []),
    ...(data?.platform.roleSet.authorization?.myPrivileges ?? []),
  ];

  return (
    <NonAdminRedirect
      privileges={privileges}
      loading={loading}
      // `PlatformAdmin` is the legacy short-circuit `NonAdminRedirect` applies
      // on its own; the real decision arrives through `admitted`, which already
      // accounts for it.
      adminPrivilege={AuthorizationPrivilege.PlatformAdmin}
      admitted={canUseAdminArea({ privileges, roles: data?.platform.roleSet.myRoles })}
    >
      {children}
    </NonAdminRedirect>
  );
};

export default NonPlatformAdminRedirect;
