import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import SpaceChallengesPage from '../pages/SpaceChallengesPage';
import KnowedgeBasePage from '../../../collaboration/knowledge-base/KnowedgeBasePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildSpaceUrl } from '../../../../common/utils/urlBuilders';
import { CollaborationPageProps } from '../../common/CollaborationPage/CollaborationPage';

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutsGroup.HomeLeft:
    case CalloutsGroup.HomeRight:
      return EntityPageSection.Dashboard;
    case CalloutsGroup.CommunityLeft:
    case CalloutsGroup.CommunityRight:
      return EntityPageSection.Community;
    case CalloutsGroup.ChallengesLeft:
    case CalloutsGroup.ChallengesRight:
      return EntityPageSection.Challenges;
    default:
      return EntityPageSection.KnowledgeBase;
  }
};

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutsGroup.HomeLeft:
    case CalloutsGroup.HomeRight:
      return <SpaceDashboardPage />;
    case CalloutsGroup.ChallengesLeft:
      return <SpaceChallengesPage />;
    default:
      return <KnowedgeBasePage journeyTypeName="space" />;
  }
};

const SpaceCollaborationPage = (props: CollaborationPageProps) => {
  const { spaceNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${buildSpaceUrl(spaceNameId)}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="space" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default SpaceCollaborationPage;
