import React, { useMemo } from 'react';
import { buildUserProfileSettingsUrl, buildUserProfileUrl } from '../../../../../common/utils/urlBuilders';
import HeaderNavigationTab from '../../../../shared/components/PageHeader/HeaderNavigationTab';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTabs from '../../../../shared/components/PageHeader/HeaderNavigationTabs';
import { EntityTabsProps } from '../../../../shared/layout/PageLayout/EntityPageLayout';
import { useUserContext } from '../hooks/useUserContext';
import { useUserMetadata } from '../hooks/useUserMetadata';
import { useUrlParams } from '../../../../../hooks';

const routes = {
  profile: 'profile',
  settings: 'settings',
};

const UserTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const { userNameId = '' } = useUrlParams();
  const { user: userMetadata } = useUserMetadata(userNameId);

  const isCurrentUser = useMemo(() => user?.user.id === userMetadata?.user.id, [user, userMetadata]);

  return (
    <HeaderNavigationTabs
      value={props.currentTab}
      defaultTab={routes.profile}
      showSettings={isCurrentUser}
      settingsUrl={buildUserProfileSettingsUrl(userNameId)}
    >
      <HeaderNavigationTab
        label={t('common.profile')}
        value={routes.profile}
        to={buildUserProfileUrl(userNameId)}
        className={'singleCenteredTab'}
      />
    </HeaderNavigationTabs>
  );
};

export default UserTabs;
