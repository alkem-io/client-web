import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildChallengeUrl } from '../../../../common/utils/urlBuilders';
import { CollaborationPageProps } from '../../common/CollaborationPage/CollaborationPage';
import { CalloutsGroup } from '../../../collaboration/callout/CalloutsInContext/CalloutsGroup';
import ChallengeDashboardPage from '../pages/ChallengeDashboardPage';

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutsGroup.HomeTop:
      return <ChallengeDashboardPage />;
    default:
      return <ContributePage journeyTypeName="challenge" />;
  }
};

const ChallengeCollaborationPage = (props: CollaborationPageProps) => {
  const { hubNameId, challengeNameId } = useUrlParams();

  if (!hubNameId || !challengeNameId) {
    throw new Error('Must be within a Challenge');
  }

  const getPageRoute = (calloutGroup: string | undefined) => {
    switch (calloutGroup) {
      default:
        return `${buildChallengeUrl(hubNameId, challengeNameId)}/${EntityPageSection.Contribute}`;
    }
  };

  return <CalloutPage journeyTypeName="challenge" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default ChallengeCollaborationPage;
