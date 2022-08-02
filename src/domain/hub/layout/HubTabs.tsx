import React from 'react';
import { EntityTabsProps } from '../../shared/layout/PageLayout/EntityPageLayout';
import EntityPageTabs from '../../shared/layout/EntityPageTabs';
import { useHub } from '../HubContext/useHub';
import { buildAdminHubUrl } from '../../../utils/urlBuilders';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { useTranslation } from 'react-i18next';

const HubTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { hubNameId, permissions } = useHub();

  return (
    <EntityPageTabs
      {...props}
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={buildAdminHubUrl(hubNameId)}
      entityTypeName="hub"
      subEntityTab={
        <HeaderNavigationTab
          disabled={!permissions.canReadChallenges}
          label={t('common.challenges')}
          value={EntityPageSection.Challenges}
          to={EntityPageSection.Challenges}
        />
      }
    />
  );
};

export default HubTabs;
