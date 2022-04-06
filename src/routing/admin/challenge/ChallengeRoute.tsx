import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { managementData } from '../../../components/Admin/managementData';
import { useChallenge, useHub } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Error404, PageProps } from '../../../pages';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { buildChallengeUrl } from '../../../utils/urlBuilders';
import { CommunityRoute } from '../community';
import { OpportunitiesRoute } from '../opportunity/OpportunitiesRoute';
import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import ChallengeProfilePage from '../../../pages/Admin/Challenge/ChallengeProfile/ChallengeProfilePage';
import ChallengeContextPage from '../../../pages/Admin/Challenge/ChallengeContext/ChallengeContextPage';
import ChallengeCommunicationsPage from '../../../pages/Admin/Challenge/ChallengeCommunications/ChallengeCommunicationsPage';

export const ChallengeRoute: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const { communityId: parentCommunityId, loading: loadingHub } = useHub();
  const { challenge, displayName, hubNameId, challengeId, challengeNameId, loading: loadingChallenge } = useChallenge();
  const communityId = challenge?.community?.id;
  const loading = loadingHub || loadingChallenge;

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: displayName || '', real: true }],
    [paths, displayName]
  );

  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <ManagementPageTemplatePage
              data={managementData.challengeLvl}
              paths={currentPaths}
              title={displayName}
              entityUrl={buildChallengeUrl(hubNameId, challengeNameId)}
              loading={loading}
            />
          }
        />
        <Route path="profile" element={<ChallengeProfilePage paths={currentPaths} />} />
        <Route path="context" element={<ChallengeContextPage paths={currentPaths} />} />
        <Route
          path="communications"
          element={
            <ChallengeCommunicationsPage
              paths={currentPaths}
              communityId={communityId}
              parentCommunityId={parentCommunityId}
            />
          }
        />
        <Route
          path="community/*"
          element={
            <CommunityRoute
              paths={currentPaths}
              communityId={challenge?.community?.id}
              parentCommunityId={parentCommunityId}
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
