import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import SpaceCommunicationsPage from '../../space/pages/SpaceCommunication/SpaceCommunicationsPage';
import SpaceProfilePage from '../../space/pages/SpaceProfile/SpaceProfilePage';
import SpaceSettingsPage from '../../space/pages/SpaceSettings/SpaceSettingsPage';
import { ApplicationsAdminRoutes } from '../../../platform/admin/community/routes/ApplicationsAdminRoutes';
import SpaceTemplatesAdminRoutes from '../../../platform/admin/space/SpaceTemplatesAdminRoutes';
import CommunityGroupsRoute from '../../../platform/admin/community/routes/CommunityGroupsAdminRoutes';
import SpaceContextPage from '../../space/pages/SpaceContext/SpaceContextPage';
import SpaceStorageAdminPage from '../../../platform/admin/space/storage/SpaceStorageAdminPage';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import AdminSpaceCommunityPage from '../../space/pages/AdminSpaceCommunityPage';
import SpaceAccountPage from '../../space/pages/SpaceAccount/SpaceAccountPage';
import { ChallengesRoute } from '../../../platform/admin/subspace/routing/ChallengesRoute';
import NonSpaceAdminRedirect from '../nonSpaceAdminRedirect/NonSpaceAdminRedirect';

export const SpaceRoute: FC = () => {
  useTransactionScope({ type: 'admin' });

  const { spaceId, communityId } = useSpace();

  return (
    <NonSpaceAdminRedirect spaceId={spaceId}>
      <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<SpaceProfilePage />} />
          <Route path="settings" element={<SpaceSettingsPage />} />
          <Route path="account" element={<SpaceAccountPage />} />
          <Route path="context" element={<SpaceContextPage />} />
          <Route path="community" element={<AdminSpaceCommunityPage />} />
          <Route path="communications" element={<SpaceCommunicationsPage communityId={communityId} />} />
          <Route path="templates/*" element={<SpaceTemplatesAdminRoutes spaceId={spaceId} />} />
          <Route path="storage" element={<SpaceStorageAdminPage spaceId={spaceId} />} />
          <Route path="community/groups/*" element={<CommunityGroupsRoute communityId={communityId} />} />
          <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
          <Route path="challenges/*" element={<ChallengesRoute />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
