import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import SubspaceCommunicationsPage from '@/domain/journey/subspace/pages/SubspaceCommunications/SubspaceCommunicationsPage';
import SubspaceAboutPage from '@/domain/journey/subspace/pages/SubspaceAboutPage';

import ChallengeAuthorizationRoute from '@/domain/platform/admin/subspace/routing/ChallengeAuthorizationRoute';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import AdminSubspaceCommunityPage from '@/domain/journey/subspace/pages/AdminSubspaceCommunityPage';
import SpaceSettingsPage from '@/domain/journey/space/pages/SpaceSettings/SpaceSettingsPage';
import ChallengeOpportunitiesPage from '@/domain/journey/subspace/pages/SubspaceSubspaces/SubspaceSubspacesPage';
import NonSpaceAdminRedirect from '../nonSpaceAdminRedirect/NonSpaceAdminRedirect';

export const ChallengeRoute: FC = () => {
  const { subspace } = useSubSpace();
  const communityId = subspace?.about.membership.communityID;

  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id}>
      <StorageConfigContextProvider locationType="journey" spaceId={subspace?.id}>
        <Routes>
          <Route path={'/'}>
            <Route index element={<Navigate to="about" replace />} />
            <Route path="about" element={<SubspaceAboutPage />} />
            <Route path="communications" element={<SubspaceCommunicationsPage communityId={communityId} />} />
            <Route path="opportunities/*" element={<ChallengeOpportunitiesPage />} />
            <Route path="community" element={<AdminSubspaceCommunityPage />} />
            <Route path="settings" element={<SpaceSettingsPage />} />
            <Route path="authorization/*" element={<ChallengeAuthorizationRoute />} />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
