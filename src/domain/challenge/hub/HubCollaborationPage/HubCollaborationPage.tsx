import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import HubDashboardPage from '../pages/HubDashboardPage';
import HubChallengesPage from '../pages/HubChallengesPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

const getPageRoute = (calloutGroup: string | undefined): EntityPageSection => {
  switch (calloutGroup) {
    case CalloutsGroup.HomeLeft:
    case CalloutsGroup.HomeRight:
      return EntityPageSection.Dashboard;
    case CalloutsGroup.ChallengesLeft:
      return EntityPageSection.Challenges;
    default:
      return EntityPageSection.Contribute;
  }
};

const HubCollaborationPage = () => {
  return (
    <CalloutPage journeyTypeName="hub" parentRoute={getPageRoute}>
      {calloutGroup => {
        switch (calloutGroup) {
          case CalloutsGroup.HomeLeft:
          case CalloutsGroup.HomeRight:
            return <HubDashboardPage />;
          case CalloutsGroup.ChallengesLeft:
            return <HubChallengesPage />;
          default:
            return <ContributePage journeyTypeName="hub" />;
        }
      }}
    </CalloutPage>
  );
};

export default HubCollaborationPage;
