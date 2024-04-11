import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';
import { useSubSpace } from '../../../../journey/subspace/hooks/useChallenge';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import SubspaceCommunicationsPage from '../../../../journey/subspace/pages/SubspaceCommunications/SubspaceCommunicationsPage';
import ChallengeProfilePage from '../../../../journey/subspace/pages/SubspaceProfile/SubspaceProfilePage';
import { ApplicationsAdminRoutes } from '../../community/routes/ApplicationsAdminRoutes';
import { OpportunitiesRoute } from '../../opportunity/routing/OpportunitiesRoute';

import ChallengeAuthorizationRoute from './ChallengeAuthorizationRoute';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';
import SubspaceContextPage from '../../../../journey/subspace/pages/SubspaceContext/SubspaceContextPage';
import { StorageConfigContextProvider } from '../../../../storage/StorageBucket/StorageConfigContext';
import AdminChallengeCommunityPage from '../../../../journey/subspace/pages/AdminSubspaceCommunityPage';
import SpaceSettingsPage from '../../../../journey/space/pages/SpaceSettings/SpaceSettingsPage';

export const ChallengeRoute: FC = () => {
  const { communityId: spaceCommunityId } = useSpace();
  const { subspace: challenge } = useSubSpace();
  const communityId = challenge?.community?.id;

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={challenge?.id}>
      <Routes>
        <Route path={'/'}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ChallengeProfilePage />} />
          <Route path="context" element={<SubspaceContextPage />} />
          <Route
            path="communications"
            element={<SubspaceCommunicationsPage communityId={communityId} parentCommunityId={spaceCommunityId} />}
          />
          <Route
            path="community/groups/*"
            element={
              <CommunityGroupsRoute communityId={challenge?.community?.id} parentCommunityId={spaceCommunityId} />
            }
          />
          <Route path="subsubspaces/*" element={<OpportunitiesRoute />} />
          <Route path="community" element={<AdminChallengeCommunityPage />} />
          <Route path="settings" element={<SpaceSettingsPage />} />
          <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
          <Route path="authorization/*" element={<ChallengeAuthorizationRoute />} />
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </StorageConfigContextProvider>
  );
};
