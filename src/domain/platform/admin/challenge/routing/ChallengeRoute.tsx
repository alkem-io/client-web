import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';
import { useChallenge } from '../../../../challenge/challenge/hooks/useChallenge';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import ChallengeCommunicationsPage from '../../../../challenge/challenge/pages/ChallengeCommunications/ChallengeCommunicationsPage';
import ChallengeProfilePage from '../../../../challenge/challenge/pages/ChallengeProfile/ChallengeProfilePage';
import { ApplicationsAdminRoutes } from '../../community/routes/ApplicationsAdminRoutes';
import { OpportunitiesRoute } from '../../opportunity/routing/OpportunitiesRoute';
import ChallengeCommunityAdminPage from '../ChallengeCommunityAdminPage';
import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';
import ChallengeContextPage from '../../../../challenge/challenge/pages/ChallengeContext/ChallengeContextPage';
import ChallengeInnovationFlowPage from '../../../../challenge/challenge/pages/InnovationFlow/ChallengeInnovationFlowPage';

export const ChallengeRoute: FC = () => {
  const { communityId: hubCommunityId } = useHub();
  const { challenge, challengeId } = useChallenge();
  const communityId = challenge?.community?.id;

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ChallengeProfilePage />} />
        <Route path="context" element={<ChallengeContextPage />} />
        <Route
          path="communications"
          element={<ChallengeCommunicationsPage communityId={communityId} parentCommunityId={hubCommunityId} />}
        />
        <Route path="community" element={<ChallengeCommunityAdminPage />} />
        <Route
          path="community/groups/*"
          element={<CommunityGroupsRoute communityId={challenge?.community?.id} parentCommunityId={hubCommunityId} />}
        />
        <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
        <Route path="opportunities/*" element={<OpportunitiesRoute />} />
        <Route path="authorization/*" element={<ChallengeAuthorizationRoute resourceId={challengeId} />} />
        <Route path="innovation-flow/*" element={<ChallengeInnovationFlowPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
