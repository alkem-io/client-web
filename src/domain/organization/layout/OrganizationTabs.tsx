import React from 'react';
import { buildAdminOrganizationUrl, buildOrganizationUrl } from '../../../common/utils/urlBuilders';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../hooks';
import HeaderNavigationTabs from '../../shared/components/PageHeader/HeaderNavigationTabs';
import OrganizationPageContainer from '../../../containers/organization/OrganizationPageContainer';
import { EntityTabsProps } from '../../shared/layout/PageLayout/EntityPageLayout';

const routes = {
  profile: 'profile',
  settings: 'settings',
};

const OrganizationTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { organizationNameId } = useOrganization();

  return (
    <OrganizationPageContainer>
      {({ permissions }) => (
        <HeaderNavigationTabs
          value={props.currentTab}
          showSettings={permissions.canEdit}
          settingsUrl={buildAdminOrganizationUrl(organizationNameId)}
        >
          <HeaderNavigationTab
            label={t('common.profile')}
            value={routes.profile}
            to={buildOrganizationUrl(organizationNameId)}
          />
        </HeaderNavigationTabs>
      )}
    </OrganizationPageContainer>
  );
};

export default OrganizationTabs;
