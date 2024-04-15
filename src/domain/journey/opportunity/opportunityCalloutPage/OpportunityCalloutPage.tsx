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
    case CalloutGroupName.Home:
      return <OpportunityDashboardPage />;
    case CalloutGroupName.Contribute:
      return <JourneyContributePage journeyTypeName="subsubspace" />;
    default:
      return <JourneyContributePage journeyTypeName="subsubspace" />;
  }
};

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutGroupName.Home:
      return EntityPageSection.Dashboard;
    case CalloutGroupName.Contribute:
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

  return <CalloutPage journeyTypeName="subsubspace" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default OpportunityCalloutPage;
