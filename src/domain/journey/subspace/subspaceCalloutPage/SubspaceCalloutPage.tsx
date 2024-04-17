import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import JourneyContributePage from '../../common/JourneyContributePage/JourneyContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import ChallengeDashboardPage from '../pages/SubspaceDashboardPage';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import ChallengeOpportunitiesPage from '../pages/SubspaceOpportunitiesPage';
import { useSubSpace } from '../hooks/useChallenge';

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutGroupName.Home:
      return <ChallengeDashboardPage />;
    case CalloutGroupName.Contribute:
      return <JourneyContributePage journeyTypeName="subspace" />;
    case CalloutGroupName.Subspaces:
      return <ChallengeOpportunitiesPage />;
    default:
      return <JourneyContributePage journeyTypeName="subspace" />;
  }
};

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutGroupName.Home:
      return EntityPageSection.Dashboard;
    case CalloutGroupName.Contribute:
      return EntityPageSection.Contribute;
    case CalloutGroupName.Subspaces:
      return EntityPageSection.Subsubspaces;
    default:
      return EntityPageSection.Contribute;
  }
};

const ChallengeCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { profile } = useSubSpace();

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${profile.url}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="subspace" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default ChallengeCalloutPage;
