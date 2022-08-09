import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { useOpportunity } from '../../../hooks';
import { buildAdminOpportunityUrl, buildOpportunityUrl } from '../../../utils/urlBuilders';
import { EntityTabsProps } from '../../shared/layout/PageLayout/EntityPageLayout';
import { routes } from '../routes/opportunityRoutes';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import EntityPageTabs from '../../shared/layout/EntityPageTabs';

export interface OpportunityTabsProps extends EntityTabsProps {}

const OpportunityTabs: FC<OpportunityTabsProps> = props => {
  const { t } = useTranslation();

  const { hubNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();

  return (
    <EntityPageTabs
      {...props}
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={buildAdminOpportunityUrl(hubNameId, challengeNameId, opportunityNameId)}
      entityTypeName="opportunity"
      subEntityTab={
        <HeaderNavigationTab
          label={t('common.agreements')}
          value={EntityPageSection.Agreements}
          to={buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId) + '/' + routes.Agreements}
        />
      }
    />
  );
};

export default OpportunityTabs;
