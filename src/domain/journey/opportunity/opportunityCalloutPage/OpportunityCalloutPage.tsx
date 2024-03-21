import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import JourneyContributePage from '../../common/JourneyContributePage/JourneyContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import OpportunityDashboardPage from '../pages/OpportunityDashboardPage';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import { useOpportunity } from '../hooks/useOpportunity';

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutGroupName.Home_1:
    case CalloutGroupName.Home_2:
      return <OpportunityDashboardPage />;
    case CalloutGroupName.Contribute_1:
    case CalloutGroupName.Contribute_2:
      return <JourneyContributePage journeyTypeName="opportunity" />;
    default:
      return <JourneyContributePage journeyTypeName="opportunity" />;
  }
};

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutGroupName.Home_1:
    case CalloutGroupName.Home_2:
      return EntityPageSection.Dashboard;
    case CalloutGroupName.Contribute_1:
    case CalloutGroupName.Contribute_2:
      return EntityPageSection.Contribute;
    default:
      return EntityPageSection.Contribute;
  }
};

const OpportunityCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { profile } = useOpportunity();

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${profile.url}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="opportunity" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default OpportunityCalloutPage;
