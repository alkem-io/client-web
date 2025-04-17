import { useTranslation } from 'react-i18next';
import { useCurrentUserContext } from '@/domain/community/user';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { useMemo } from 'react';

export const useCreateSpaceLink = () => {
  const { t } = useTranslation();
  const { accountPrivileges, loading, accountEntitlements } = useCurrentUserContext();

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
      return `/${TopLevelRoutePath.CreateSpace}`;
    }

    return STATIC_PAGE_LINK;
  }, [accountPrivileges, accountEntitlements, loading, t]);

  return { loading, link };
};
