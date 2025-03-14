import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import SpaceCommunicationsPage from '@/domain/journey/space/pages/SpaceCommunication/SpaceCommunicationsPage';
import SpaceAboutPage from '@/domain/journey/space/pages/SpaceAboutSettings/SpaceAboutPage';
import SpaceSettingsPage from '@/domain/journey/space/pages/SpaceSettings/SpaceSettingsPage';
import SpaceTemplatesAdminRoutes from '@/domain/platform/admin/space/SpaceTemplatesAdminRoutes';
import SpaceStorageAdminPage from '@/domain/platform/admin/space/storage/SpaceStorageAdminPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import AdminSpaceCommunityPage from '@/domain/journey/space/pages/AdminSpaceCommunityPage';
import SpaceAccountPage from '@/domain/journey/space/pages/SpaceAccount/SpaceAccountPage';
import ChallengesRoute from '@/domain/platform/admin/subspace/routing/ChallengesRoute';
import NonSpaceAdminRedirect from '../nonSpaceAdminRedirect/NonSpaceAdminRedirect';

const SpaceSettingsRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { spaceId, communityId } = useSpace();

  return (
    <NonSpaceAdminRedirect spaceId={spaceId}>
      <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<SpaceAboutPage />} />
          <Route path="settings" element={<SpaceSettingsPage />} />
          <Route path="account" element={<SpaceAccountPage />} />
          <Route path="community" element={<AdminSpaceCommunityPage />} />
          <Route path="communications" element={<SpaceCommunicationsPage communityId={communityId} />} />
          <Route path="templates/*" element={<SpaceTemplatesAdminRoutes spaceId={spaceId} />} />
          <Route path="storage" element={<SpaceStorageAdminPage spaceId={spaceId} />} />
          <Route path="challenges/*" element={<ChallengesRoute />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};

export default SpaceSettingsRoute;
