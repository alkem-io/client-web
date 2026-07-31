import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';
import { getInitials } from '@/crd/lib/getInitials';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { PLATFORM_ADMIN_AREA_PRIVILEGES } from '@/main/admin/NonPlatformAdminRedirect';

export function useCrdUser() {
  const { isAuthenticated, userModel, platformPrivilegeWrapper, platformRoles } = useCurrentUserContext();
  const { t } = useTranslation();

  // spec-clientweb-5 (2026-07-31): the admin NAV entry gated solely on
  // `PLATFORM_ADMIN`, which is granted only to the legacy global-admin /
  // global-support / global-license-manager credentials — none of the
  // thirteen target roles receives it. The seeded break-glass Platform Roles
  // Admin could therefore reach the admin area (995579e71 widened the ROUTE
  // guard) but had no link to it, and no way to discover the page FR-012
  // makes the sole re-grant surface.
  //
  // Deliberately the SAME privilege set as the route guard
  // (`PLATFORM_ADMIN_AREA_PRIVILEGES`, plus the legacy catch-all), imported
  // rather than restated: a nav entry that disagrees with the guard is
  // either a dead link or a hidden page, and both were possible while the
  // two were written independently.
  const isAdmin = [...PLATFORM_ADMIN_AREA_PRIVILEGES, AuthorizationPrivilege.PlatformAdmin].some(privilege =>
    Boolean(platformPrivilegeWrapper?.hasPlatformPrivilege?.(privilege))
  );

  const role = (() => {
    for (const platformRole of platformRoles) {
      switch (platformRole) {
        case RoleName.GlobalAdmin:
          return t('common.roles.GLOBAL_ADMIN');
        case RoleName.GlobalSupport:
          return t('common.roles.GLOBAL_SUPPORT');
        case RoleName.GlobalLicenseManager:
          return t('common.roles.GLOBAL_LICENSE_MANAGER');
        case RoleName.PlatformBetaTester:
          return t('common.roles.PLATFORM_BETA_TESTER');
        case RoleName.PlatformVcCampaign:
          return t('common.roles.PLATFORM_VC_CAMPAIGN');
      }
    }
    return undefined;
  })();

  const user = userModel?.profile
    ? {
        name: userModel.profile.displayName,
        avatarUrl: userModel.profile.avatar?.uri,
        initials: getInitials(userModel.profile.displayName),
        role,
      }
    : undefined;

  return { user, userModel, isAuthenticated, isAdmin };
}
