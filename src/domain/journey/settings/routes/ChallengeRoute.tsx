import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import SubspaceCommunicationsPage from '@/domain/journey/subspace/pages/SubspaceCommunications/SubspaceCommunicationsPage';
import SubspaceProfilePage from '@/domain/journey/subspace/pages/SubspaceProfile/SubspaceProfilePage';
import { ApplicationsAdminRoutes } from '@/domain/platform/admin/community/routes/ApplicationsAdminRoutes';

import ChallengeAuthorizationRoute from '@/domain/platform/admin/subspace/routing/ChallengeAuthorizationRoute';
import SubspaceContextPage from '@/domain/journey/subspace/pages/SubspaceContext/SubspaceContextPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import AdminSubspaceCommunityPage from '@/domain/journey/subspace/pages/AdminSubspaceCommunityPage';
import SpaceSettingsPage from '@/domain/journey/space/pages/SpaceSettings/SpaceSettingsPage';
import ChallengeOpportunitiesPage from '@/domain/journey/subspace/pages/SubspaceSubspaces/SubspaceSubspacesPage';
import NonSpaceAdminRedirect from '../nonSpaceAdminRedirect/NonSpaceAdminRedirect';

export const ChallengeRoute: FC = () => {
  const { subspace: challenge } = useSubSpace();
  const communityId = challenge?.community?.id;

  return (
    <NonSpaceAdminRedirect spaceId={challenge?.id}>
      <StorageConfigContextProvider locationType="journey" spaceId={challenge?.id}>
        <Routes>
          <Route path={'/'}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<SubspaceProfilePage />} />
            <Route path="context" element={<SubspaceContextPage />} />
            <Route path="communications" element={<SubspaceCommunicationsPage communityId={communityId} />} />
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
