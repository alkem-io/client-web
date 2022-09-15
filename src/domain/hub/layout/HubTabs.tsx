import React from 'react';
import { EntityTabsProps } from '../../shared/layout/PageLayout/EntityPageLayout';
import EntityPageTabs from '../../shared/layout/EntityPageTabs';
import { useHub } from '../HubContext/useHub';
import { buildAdminHubUrl, buildHubUrl } from '../../../common/utils/urlBuilders';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { useTranslation } from 'react-i18next';

const HubTabs = (props: EntityTabsProps) => {
  const { t } = useTranslation();

  const { hubNameId, permissions } = useHub();
  const rootUrl = buildHubUrl(hubNameId);
  const settingsUrl = buildAdminHubUrl(hubNameId);

  return (
    <EntityPageTabs
      {...props}
      entityTypeName="hub"
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={settingsUrl}
      rootUrl={rootUrl}
      subEntityTab={
        <HeaderNavigationTab
          disabled={!permissions.canReadChallenges}
          label={t('common.challenges')}
          value={EntityPageSection.Challenges}
          to={`${rootUrl}/${EntityPageSection.Challenges}`}
        />
      }
    />
  );
};

export default HubTabs;
