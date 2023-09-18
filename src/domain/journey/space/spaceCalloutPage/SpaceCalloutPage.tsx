import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import SpaceChallengesPage from '../pages/SpaceChallengesPage';
import KnowedgeBasePage from '../../../collaboration/KnowledgeBase/KnowedgeBasePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildSpaceUrl } from '../../../../main/routing/urlBuilders';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutDisplayLocation.HomeLeft:
    case CalloutDisplayLocation.HomeRight:
      return EntityPageSection.Dashboard;
    case CalloutDisplayLocation.CommunityLeft:
    case CalloutDisplayLocation.CommunityRight:
      return EntityPageSection.Community;
    case CalloutDisplayLocation.ChallengesLeft:
    case CalloutDisplayLocation.ChallengesRight:
      return EntityPageSection.Challenges;
    default:
      return EntityPageSection.KnowledgeBase;
  }
};

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutDisplayLocation.HomeLeft:
    case CalloutDisplayLocation.HomeRight:
      return <SpaceDashboardPage />;
    case CalloutDisplayLocation.ChallengesLeft:
      return <SpaceChallengesPage />;
    case CalloutDisplayLocation.CommunityLeft:
    case CalloutDisplayLocation.CommunityRight:
      return <SpaceCommunityPage />;
    default:
      return <KnowedgeBasePage journeyTypeName="space" />;
  }
};

const SpaceCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { spaceNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${buildSpaceUrl(spaceNameId)}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="space" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SpaceCalloutPage;
