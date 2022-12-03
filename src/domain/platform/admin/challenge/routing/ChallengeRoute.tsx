import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath, Navigate } from 'react-router-dom';
import { useHub, useChallenge } from '../../../../../hooks';
import { PageProps } from '../../../../shared/types/PageProps';
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

export const ChallengeRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const { communityId: hubCommunityId } = useHub();
  const { challenge, displayName, challengeId } = useChallenge();
  const communityId = challenge?.community?.id;

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: displayName || '', real: true }],
    [paths, displayName, url]
  );

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ChallengeProfilePage paths={currentPaths} />} />
        <Route path="context" element={<ChallengeContextPage paths={currentPaths} />} />
        <Route
          path="communications"
          element={
            <ChallengeCommunicationsPage
              paths={currentPaths}
              communityId={communityId}
              parentCommunityId={hubCommunityId}
            />
          }
        />
        <Route path="community" element={<ChallengeCommunityAdminPage paths={paths} />} />
        <Route
          path="community/groups/*"
          element={
            <CommunityGroupsRoute
              paths={currentPaths}
              communityId={challenge?.community?.id}
              parentCommunityId={hubCommunityId}
            />
          }
        />
        <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
        <Route path={'opportunities/*'} element={<OpportunitiesRoute paths={currentPaths} />} />
        <Route
          path="authorization/*"
          element={<ChallengeAuthorizationRoute paths={currentPaths} resourceId={challengeId} />}
        />
        <Route path={'innovation-flow/*'} element={<ChallengeInnovationFlowPage paths={currentPaths} />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
