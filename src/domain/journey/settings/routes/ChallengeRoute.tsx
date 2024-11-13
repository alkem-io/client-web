import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { useSubSpace } from '../../subspace/hooks/useSubSpace';
import { Error404 } from '@core/pages/Errors/Error404';
import SubspaceCommunicationsPage from '../../subspace/pages/SubspaceCommunications/SubspaceCommunicationsPage';
import ChallengeProfilePage from '../../subspace/pages/SubspaceProfile/SubspaceProfilePage';
import { ApplicationsAdminRoutes } from '../../../platform/admin/community/routes/ApplicationsAdminRoutes';

import ChallengeAuthorizationRoute from '../../../platform/admin/subspace/routing/ChallengeAuthorizationRoute';
import CommunityGroupsRoute from '../../../platform/admin/community/routes/CommunityGroupsAdminRoutes';
import SubspaceContextPage from '../../subspace/pages/SubspaceContext/SubspaceContextPage';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import AdminSubspaceCommunityPage from '../../subspace/pages/AdminSubspaceCommunityPage';
import SpaceSettingsPage from '../../space/pages/SpaceSettings/SpaceSettingsPage';
import ChallengeOpportunitiesPage from '../../subspace/pages/SubspaceSubspaces/SubspaceSubspacesPage';
import NonSpaceAdminRedirect from '../nonSpaceAdminRedirect/NonSpaceAdminRedirect';

export const ChallengeRoute: FC = () => {
  const { communityId: spaceCommunityId } = useSpace();
  const { subspace: challenge } = useSubSpace();
  const communityId = challenge?.community?.id;

  return (
    <NonSpaceAdminRedirect spaceId={challenge?.id}>
      <StorageConfigContextProvider locationType="journey" spaceId={challenge?.id}>
        <Routes>
          <Route path={'/'}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ChallengeProfilePage />} />
            <Route path="context" element={<SubspaceContextPage />} />
            <Route path="communications" element={<SubspaceCommunicationsPage communityId={communityId} />} />
            <Route
              path="community/groups/*"
              element={
                <CommunityGroupsRoute communityId={challenge?.community?.id} parentCommunityId={spaceCommunityId} />
              }
            />
            <Route path="opportunities/*" element={<ChallengeOpportunitiesPage />} />
            <Route path="community" element={<AdminSubspaceCommunityPage />} />
            <Route path="settings" element={<SpaceSettingsPage />} />
            <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
            <Route path="authorization/*" element={<ChallengeAuthorizationRoute />} />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
