import React, { FC } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { buildAdminOpportunityUrl, buildOpportunityUrl } from '../../../../main/routing/urlBuilders';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import JourneyPageTabs from '../../common/JourneyPageTabs';

export interface OpportunityTabsProps extends EntityTabsProps {}

const OpportunityTabs: FC<OpportunityTabsProps> = props => {
  const { spaceNameId, challengeNameId, opportunityNameId, permissions } = useOpportunity();
  const rootUrl = buildOpportunityUrl(spaceNameId, challengeNameId, opportunityNameId);
  const settingsUrl = buildAdminOpportunityUrl(spaceNameId, challengeNameId, opportunityNameId);

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
