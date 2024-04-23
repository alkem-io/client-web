import React, { FC } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { EntityTabsProps } from '../../common/EntityPageLayout';
import JourneyPageTabs from '../../common/JourneyPageTabs';
import { buildJourneyAdminUrl } from '../../../../main/routing/urlBuilders';

export interface OpportunityTabsProps extends EntityTabsProps {}

const OpportunityTabs: FC<OpportunityTabsProps> = props => {
  const { permissions, profile } = useOpportunity();

  return (
    <JourneyPageTabs
      {...props}
      entityTypeName="opportunity"
      showSettings={permissions.viewerCanUpdate}
      settingsUrl={buildJourneyAdminUrl(profile.url)}
      rootUrl={profile.url}
      shareUrl={profile.url}
      // TODO: Add specific subentity tab for opportunities,
      // and cleanup Agreements code if at the end is not agreements
    />
  );
};

export default OpportunityTabs;
