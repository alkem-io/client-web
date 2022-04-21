import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath, Navigate } from 'react-router-dom';
import { useChallenge, useHub } from '../../../hooks';
import { Error404, PageProps } from '../../../pages';
import CommunityGroupsRoute from '../../../domain/admin/community/routes/CommunityGroupsAdminRoutes';
import { OpportunitiesRoute } from '../opportunity/OpportunitiesRoute';
import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import ChallengeProfilePage from '../../../pages/Admin/Challenge/ChallengeProfile/ChallengeProfilePage';
import ChallengeContextPage from '../../../pages/Admin/Challenge/ChallengeContext/ChallengeContextPage';
import ChallengeCommunicationsPage from '../../../pages/Admin/Challenge/ChallengeCommunications/ChallengeCommunicationsPage';
import ChallengeCommunityAdminPage from '../../../domain/admin/challenge/ChallengeCommunityAdminPage';
import { ApplicationsAdminRoutes } from '../../../domain/admin/community/routes/ApplicationsAdminRoutes';

export const ChallengeRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const { communityId: hubCommunityId } = useHub();
  const { challenge, displayName, challengeId } = useChallenge();
  const communityId = challenge?.community?.id;

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: displayName || '', real: true }],
    [paths, displayName]
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
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
