import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';
import { useChallenge } from '../../../../journey/challenge/hooks/useChallenge';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import ChallengeCommunicationsPage from '../../../../journey/challenge/pages/ChallengeCommunications/ChallengeCommunicationsPage';
import ChallengeProfilePage from '../../../../journey/challenge/pages/ChallengeProfile/ChallengeProfilePage';
import { ApplicationsAdminRoutes } from '../../community/routes/ApplicationsAdminRoutes';
import { OpportunitiesRoute } from '../../opportunity/routing/OpportunitiesRoute';

import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';
import ChallengeContextPage from '../../../../journey/challenge/pages/ChallengeContext/ChallengeContextPage';
import ChallengeInnovationFlowPage from '../../../../journey/challenge/pages/InnovationFlow/ChallengeInnovationFlowPage';
import { StorageConfigContextProvider } from '../../../../storage/StorageBucket/StorageConfigContext';
import AdminChallengeCommunityPage from '../../../../journey/challenge/pages/AdminChallengeCommunityPage';

export const ChallengeRoute: FC = () => {
  const { spaceId, communityId: spaceCommunityId } = useSpace();
  const { challenge, challengeNameId } = useChallenge();
  const communityId = challenge?.community?.id;

  return (
    <StorageConfigContextProvider
      locationType="journey"
      journeyTypeName="challenge"
      spaceNameId={spaceId}
      challengeNameId={challengeNameId}
    >
      <Routes>
        <Route path={'/'}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ChallengeProfilePage />} />
          <Route path="context" element={<ChallengeContextPage />} />
          <Route
            path="communications"
            element={<ChallengeCommunicationsPage communityId={communityId} parentCommunityId={spaceCommunityId} />}
          />
          <Route path="community" element={<AdminChallengeCommunityPage />} />
          <Route
            path="community/groups/*"
            element={
              <CommunityGroupsRoute communityId={challenge?.community?.id} parentCommunityId={spaceCommunityId} />
            }
          />
          <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
          <Route path="opportunities/*" element={<OpportunitiesRoute />} />
          <Route path="authorization/*" element={<ChallengeAuthorizationRoute />} />
          <Route path="innovation-flow/*" element={<ChallengeInnovationFlowPage />} />
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </StorageConfigContextProvider>
  );
};
