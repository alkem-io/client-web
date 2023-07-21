import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildChallengeUrl } from '../../../../common/utils/urlBuilders';
import { CollaborationPageProps } from '../../common/CollaborationPage/CollaborationPage';
import ChallengeDashboardPage from '../pages/ChallengeDashboardPage';
import { CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';

const renderPage = (calloutGroup: string | undefined) => {
  switch (calloutGroup) {
    case CalloutDisplayLocation.CommonHomeTop:
      return <ChallengeDashboardPage />;
    default:
      return <ContributePage journeyTypeName="challenge" />;
  }
};

const ChallengeCollaborationPage = (props: CollaborationPageProps) => {
  const { spaceNameId, challengeNameId } = useUrlParams();

  if (!spaceNameId || !challengeNameId) {
    throw new Error('Must be within a Challenge');
  }

  const getPageRoute = (calloutGroup: string | undefined) => {
    switch (calloutGroup) {
      default:
        return `${buildChallengeUrl(spaceNameId, challengeNameId)}/${EntityPageSection.Contribute}`;
    }
  };

  return <CalloutPage journeyTypeName="challenge" parentRoute={getPageRoute} renderPage={renderPage} {...props} />;
};

export default ChallengeCollaborationPage;
