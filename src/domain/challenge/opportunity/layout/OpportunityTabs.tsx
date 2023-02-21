import React, { FC } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { buildAdminOpportunityUrl, buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import EntityPageTabs from '../../../shared/layout/EntityPageTabs';

export interface OpportunityTabsProps extends EntityTabsProps {}

const OpportunityTabs: FC<OpportunityTabsProps> = props => {
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
      shareUrl={rootUrl}
      // TODO: Add specific subentity tab for opportunities
    />
  );
};

export default OpportunityTabs;
