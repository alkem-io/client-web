import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import OpportunityDashboardPage from '../pages/OpportunityDashboardPage';
import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutDisplayLocation.HomeTop:
    case CalloutDisplayLocation.HomeLeft:
    case CalloutDisplayLocation.HomeRight:
      return <OpportunityDashboardPage />;
    case CalloutDisplayLocation.ContributeLeft:
    case CalloutDisplayLocation.ContributeRight:
      return <ContributePage journeyTypeName="opportunity" />;
    default:
      return <ContributePage journeyTypeName="opportunity" />;
  }
};

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutDisplayLocation.HomeTop:
    case CalloutDisplayLocation.HomeLeft:
    case CalloutDisplayLocation.HomeRight:
      return EntityPageSection.Dashboard;
    case CalloutDisplayLocation.ContributeLeft:
    case CalloutDisplayLocation.ContributeRight:
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
