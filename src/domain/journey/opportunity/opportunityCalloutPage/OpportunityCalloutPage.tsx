import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import JourneyContributePage from '../../common/JourneyContributePage/JourneyContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildOpportunityUrl } from '../../../../main/routing/urlBuilders';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import OpportunityDashboardPage from '../pages/OpportunityDashboardPage';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutGroupName.HomeLeft:
    case CalloutGroupName.HomeRight:
      return <OpportunityDashboardPage />;
    case CalloutGroupName.ContributeLeft:
    case CalloutGroupName.ContributeRight:
      return <JourneyContributePage journeyTypeName="opportunity" />;
    default:
      return <JourneyContributePage journeyTypeName="opportunity" />;
  }
};

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutGroupName.HomeLeft:
    case CalloutGroupName.HomeRight:
      return EntityPageSection.Dashboard;
    case CalloutGroupName.ContributeLeft:
    case CalloutGroupName.ContributeRight:
      return EntityPageSection.Contribute;
    default:
      return EntityPageSection.Contribute;
  }
};

const OpportunityCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!spaceNameId || !challengeNameId || !opportunityNameId) {
    throw new Error('Must be within an Opportunity');
  }

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${buildOpportunityUrl(spaceNameId, challengeNameId, opportunityNameId)}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="opportunity" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default OpportunityCalloutPage;
