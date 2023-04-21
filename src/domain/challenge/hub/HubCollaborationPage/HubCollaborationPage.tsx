import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import HubDashboardPage from '../pages/HubDashboardPage';
import HubChallengesPage from '../pages/HubChallengesPage';
import KnowedgeBasePage from '../../../collaboration/knowledge-base/KnowedgeBasePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildHubUrl } from '../../../../common/utils/urlBuilders';
import { CollaborationPageProps } from '../../common/CollaborationPage/CollaborationPage';

const getPageSection = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutsGroup.HomeLeft:
    case CalloutsGroup.HomeRight:
      return EntityPageSection.Dashboard;
    case CalloutsGroup.ChallengesLeft:
      return EntityPageSection.Challenges;
    default:
      return EntityPageSection.KnowledgeBase;
  }
};

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutsGroup.HomeLeft:
    case CalloutsGroup.HomeRight:
      return <HubDashboardPage />;
    case CalloutsGroup.ChallengesLeft:
      return <HubChallengesPage />;
    default:
      return <KnowedgeBasePage journeyTypeName="hub" />;
  }
};

const HubCollaborationPage = (props: CollaborationPageProps) => {
  const { hubNameId } = useUrlParams();

  if (!hubNameId) {
    throw new Error('Must be within a Hub');
  }

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${buildHubUrl(hubNameId)}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="hub" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default HubCollaborationPage;
