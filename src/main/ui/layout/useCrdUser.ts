import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';
import { getInitials } from '@/crd/lib/getInitials';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

export function useCrdUser() {
  const { isAuthenticated, userModel, platformPrivilegeWrapper, platformRoles } = useCurrentUserContext();
  const { t } = useTranslation();

  const isAdmin = platformPrivilegeWrapper?.hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);

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
