import { useTranslation } from 'react-i18next';
import { useUserContext } from '@domain/community/user';
import { AuthorizationPrivilege } from '@core/apollo/generated/graphql-schema';
import { TopLevelRoutePath } from '../../../routing/TopLevelRoutePath';
import { useMemo } from 'react';

export const useCreateSpaceLink = () => {
  const { t } = useTranslation();
  const { accountPrivileges, loading } = useUserContext();

  const STATIC_PAGE_LINK = t('pages.home.sections.startingSpace.url');

  const link = useMemo(() => {
    if (loading) {
      return STATIC_PAGE_LINK;
    }

    if (accountPrivileges.includes(AuthorizationPrivilege.CreateSpace)) {
      return `/${TopLevelRoutePath.CreateSpace}`;
    }

    return STATIC_PAGE_LINK;
  }, [accountPrivileges, loading, t]);

  return { loading, link };
};
