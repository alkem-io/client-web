import type { FC, PropsWithChildren } from 'react';
import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import NonAdminRedirect from './NonAdminRedirect';

/**
 * Privileges that admit an operator to the platform admin area.
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
 * Scope is deliberately narrow — only the two assignment capabilities FR-012
 * names. `PlatformAdmin` still admits, because Slice A is strictly additive and
 * no legacy holder may lose access here. Whether the other decomposed roles
 * (Settings / Operations / Users Admin, Audit Reader, ...) should reach their own
 * admin sections is a question this feature's spec never answers, so it is
 * deliberately NOT widened here: admitting more operators to the admin shell is a
 * security-relevant change that belongs in a spec, not in a guard fix.
 *
 * NOTE ON WHERE THESE LIVE — verified against a running server, not assumed.
 * `GRANT_GLOBAL_ADMINS` and `FEATURE_ROLE_ASSIGN` are granted on the platform
 * **role set's** authorization, NOT on the platform authorization:
 *   GRANT_GLOBAL_ADMINS <- global-admin, platform-roles-admin
 *   FEATURE_ROLE_ASSIGN <- platform-roles-admin, platform-users-admin
 * `PLATFORM_ADMIN` conversely lives on the platform authorization. The two sets
 * must therefore both be read and unioned; checking only `platform.authorization`
 * silently denies every new role, which is the very bug this fixes.
 */
const PLATFORM_ADMIN_AREA_PRIVILEGES = [
  // Platform Roles Admin — assigns the ten `Platform ...` roles (FR-003).
  AuthorizationPrivilege.GrantGlobalAdmins,
  // Platform Users Admin — assigns the three `Feature ...` roles (FR-003).
  AuthorizationPrivilege.FeatureRoleAssign,
];

const NonPlatformAdminRedirect: FC<PropsWithChildren> = ({ children }) => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();

  const privileges = [
    ...(data?.platform.authorization?.myPrivileges ?? []),
    ...(data?.platform.roleSet.authorization?.myPrivileges ?? []),
  ];

  return (
    <NonAdminRedirect privileges={privileges} loading={loading} adminPrivilege={PLATFORM_ADMIN_AREA_PRIVILEGES}>
      {children}
    </NonAdminRedirect>
  );
};

export { PLATFORM_ADMIN_AREA_PRIVILEGES };
export default NonPlatformAdminRedirect;
