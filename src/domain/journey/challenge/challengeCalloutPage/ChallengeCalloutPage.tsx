import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import JourneyContributePage from '../../common/JourneyContributePage/JourneyContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildChallengeUrl } from '../../../../main/routing/urlBuilders';
import { JourneyCalloutDialogProps } from '../../common/JourneyCalloutDialog/JourneyCalloutDialog';
import ChallengeDashboardPage from '../pages/ChallengeDashboardPage';
import { CalloutGroupName } from '../../../../core/apollo/generated/graphql-schema';
import ChallengeOpportunitiesPage from '../pages/ChallengeOpportunitiesPage';

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutGroupName.HomeLeft:
    case CalloutGroupName.HomeRight:
      return <ChallengeDashboardPage />;
    case CalloutGroupName.ContributeLeft:
    case CalloutGroupName.ContributeRight:
      return <JourneyContributePage journeyTypeName="challenge" />;
    case CalloutGroupName.SubspacesLeft:
    case CalloutGroupName.SubspacesRight:
      return <ChallengeOpportunitiesPage />;
    default:
      return <JourneyContributePage journeyTypeName="challenge" />;
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
    case CalloutGroupName.SubspacesLeft:
    case CalloutGroupName.SubspacesRight:
      return EntityPageSection.Opportunities;
    default:
      return EntityPageSection.Contribute;
  }
};

const ChallengeCalloutPage = (props: JourneyCalloutDialogProps) => {
  const { spaceNameId, challengeNameId } = useUrlParams();

  if (!spaceNameId || !challengeNameId) {
    throw new Error('Must be within a Challenge');
  }

  const getPageRoute = (calloutGroup: string | undefined) => {
    return `${buildChallengeUrl(spaceNameId, challengeNameId)}/${getPageSection(calloutGroup)}`;
  };

  return <CalloutPage journeyTypeName="challenge" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default ChallengeCalloutPage;
