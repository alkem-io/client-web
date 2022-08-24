import React from 'react';
import { buildAdminOrganizationUrl, buildOrganizationUrl } from '../../../utils/urlBuilders';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../hooks';
import HeaderNavigationTabs from '../../shared/components/PageHeader/HeaderNavigationTabs';
import OrganizationPageContainer from '../../../containers/organization/OrganizationPageContainer';
import { EntityTabsProps } from '../../shared/layout/PageLayout/EntityPageLayout';

const routes = {
  dashboard: 'dashboard',
  settings: 'settings',
};

const OrganizationTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { organizationNameId } = useOrganization();

  return (
    <OrganizationPageContainer>
      {entities => (
        <HeaderNavigationTabs value={props.currentTab}>
          <HeaderNavigationTab
            label={t('common.dashboard')}
            value={routes.dashboard}
            to={buildOrganizationUrl(organizationNameId)}
          />
          {entities.permissions.canEdit && (
            <HeaderNavigationTab
              label={t('common.settings')}
              value={routes.settings}
              to={buildAdminOrganizationUrl(organizationNameId)}
            />
          )}
        </HeaderNavigationTabs>
      )}
    </OrganizationPageContainer>
  );
};

export default OrganizationTabs;
