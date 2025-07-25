import { useTranslation } from 'react-i18next';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';
import { buildUserAccountUrl } from '@/main/routing/urlBuilders';

export const useCreateSpaceLink = () => {
  const { t } = useTranslation();
  const { userModel, accountPrivileges, loading, accountEntitlements } = useCurrentUserContext();

  const STATIC_PAGE_LINK = t('pages.home.sections.startingSpace.url');

  const link = useMemo(() => {
    if (loading) {
      return STATIC_PAGE_LINK;
    }

    const isEntitledToCreateSpace = [
      LicenseEntitlementType.AccountSpaceFree,
      LicenseEntitlementType.AccountSpacePlus,
      LicenseEntitlementType.AccountSpacePremium,
    ].some(entitlement => accountEntitlements.includes(entitlement));

    if (accountPrivileges.includes(AuthorizationPrivilege.CreateSpace) && isEntitledToCreateSpace) {
      return buildUserAccountUrl(userModel?.profile.url);
    }

    return STATIC_PAGE_LINK;
  }, [accountPrivileges, accountEntitlements, loading, t]);

  return { loading, link };
};
