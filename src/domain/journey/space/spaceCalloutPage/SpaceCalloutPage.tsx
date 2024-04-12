import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import SpaceChallengesPage from '../pages/SpaceChallengesPage';
import KnowedgeBasePage from '../../../collaboration/KnowledgeBase/KnowedgeBasePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';
import { useSpace } from '../SpaceContext/useSpace';

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutGroupName.Home_1:
    case CalloutGroupName.Home_2:
      return EntityPageSection.Dashboard;
    case CalloutGroupName.Community_1:
    case CalloutGroupName.Community_2:
      return EntityPageSection.Community;
    case CalloutGroupName.Subspaces_1:
    case CalloutGroupName.Subspaces_2:
      return EntityPageSection.Subspaces;
    default:
      return EntityPageSection.KnowledgeBase;
  }
};

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutGroupName.Home_1:
    case CalloutGroupName.Home_2:
      return <SpaceDashboardPage />;
    case CalloutGroupName.Subspaces_1:
      return <SpaceChallengesPage />;
    case CalloutGroupName.Community_1:
    case CalloutGroupName.Community_2:
      return <SpaceCommunityPage />;
    default:
      return <KnowedgeBasePage journeyTypeName="space" />;
  }
};

const SpaceCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { profile } = useSpace();

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${profile.url}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="space" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SpaceCalloutPage;
