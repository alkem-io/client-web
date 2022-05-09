import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { useOpportunity } from '../../../hooks';
import { buildAdminOpportunityUrl, buildOpportunityUrl } from '../../../common/utils/urlBuilders';
import { EntityTabsProps } from '../../shared/layout/PageLayout/EntityPageLayout';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import EntityPageTabs from '../../shared/layout/EntityPageTabs';

export interface OpportunityTabsProps extends EntityTabsProps {}

const OpportunityTabs: FC<OpportunityTabsProps> = props => {
  const { t } = useTranslation();

  const { hubNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();
  const rootUrl = buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);
  const settingsUrl = buildAdminOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);

  return (
    <EntityPageTabs
      {...props}
      entityTypeName="opportunity"
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={settingsUrl}
      rootUrl={rootUrl}
      subEntityTab={
        <HeaderNavigationTab
          label={t('common.agreements')}
          value={EntityPageSection.Agreements}
          to={`${rootUrl}/${EntityPageSection.Agreements}`}
        />
      }
    />
  );
};

export default OpportunityTabs;
