import React from 'react';
import CalloutPage from '../../../collaboration/CalloutPage/CalloutPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { buildChallengeUrl } from '../../../../common/utils/urlBuilders';

const ChallengeCollaborationPage = () => {
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

  return (
    <CalloutPage journeyTypeName="challenge" parentRoute={getPageRoute}>
      {calloutGroup => {
        switch (calloutGroup) {
          // Add handling for groups here
          default:
            return <ContributePage journeyTypeName="hub" />;
        }
      }}
    </CalloutPage>
  );
};

export default ChallengeCollaborationPage;
