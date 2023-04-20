import React, { FC } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { buildAdminOpportunityUrl, buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import JourneyPageTabs from '../../common/JourneyPageTabs';

export interface OpportunityTabsProps extends EntityTabsProps {}

const OpportunityTabs: FC<OpportunityTabsProps> = props => {
  const { hubNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();
  const rootUrl = buildOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);
  const settingsUrl = buildAdminOpportunityUrl(hubNameId, challengeNameId, opportunityNameId);

  return (
    <JourneyPageTabs
      {...props}
      entityTypeName="opportunity"
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={settingsUrl}
      rootUrl={rootUrl}
      shareUrl={rootUrl}
      // TODO: Add specific subentity tab for opportunities,
      // and cleanup Agreements code if at the end is not agreements
    />
  );
};

export default OpportunityTabs;
