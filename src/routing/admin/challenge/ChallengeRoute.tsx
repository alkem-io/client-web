import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath, Navigate } from 'react-router-dom';
import { useChallenge, useHub } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Error404, PageProps } from '../../../pages';
import { CommunityRoute } from '../community';
import { OpportunitiesRoute } from '../opportunity/OpportunitiesRoute';
import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import ChallengeProfilePage from '../../../pages/Admin/Challenge/ChallengeProfile/ChallengeProfilePage';
import ChallengeContextPage from '../../../pages/Admin/Challenge/ChallengeContext/ChallengeContextPage';
import ChallengeCommunicationsPage from '../../../pages/Admin/Challenge/ChallengeCommunications/ChallengeCommunicationsPage';
import ChallengeCommunityPage from '../../../pages/Admin/Challenge/ChallengeCommunity/ChallengeCommunityPage';

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
        <Route path="community" element={<ChallengeCommunityPage paths={paths} />} />
        <Route
          path="community/*"
          element={
            <CommunityRoute
              paths={currentPaths}
              communityId={challenge?.community?.id}
              parentCommunityId={hubCommunityId}
              credential={AuthorizationCredential.ChallengeMember}
              resourceId={challengeId}
              accessedFrom="challenge"
            />
          }
        />
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
