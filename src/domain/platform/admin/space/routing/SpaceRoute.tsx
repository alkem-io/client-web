import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '../../../../../core/analytics/SentryTransactionScopeContext';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import SpaceCommunicationsPage from '../../../../journey/space/pages/SpaceCommunication/SpaceCommunicationsPage';
import SpaceProfilePage from '../../../../journey/space/pages/SpaceProfile/SpaceProfilePage';
import SpaceSettingsPage from '../../../../journey/space/pages/SpaceSettings/SpaceSettingsPage';
import { ApplicationsAdminRoutes } from '../../community/routes/ApplicationsAdminRoutes';
import SpaceTemplatesAdminRoutes from '../SpaceTemplatesAdminRoutes';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';
import SpaceContextPage from '../../../../journey/space/pages/SpaceContext/SpaceContextPage';
import SpaceStorageAdminPage from '../storage/SpaceStorageAdminPage';
import { StorageConfigContextProvider } from '../../../../storage/StorageBucket/StorageConfigContext';
import AdminSpaceCommunityPage from '../../../../journey/space/pages/AdminSpaceCommunityPage';
import { ChallengesRoute } from '../../subspace/routing/ChallengesRoute';

export const SpaceRoute: FC = () => {
  useTransactionScope({ type: 'admin' });

  const { spaceId, communityId } = useSpace();

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<SpaceProfilePage />} />
        <Route path="settings" element={<SpaceSettingsPage />} />
        <Route path="context" element={<SpaceContextPage />} />
        <Route path="community" element={<AdminSpaceCommunityPage />} />
        <Route path="communications" element={<SpaceCommunicationsPage communityId={communityId} />} />
        <Route path="templates/*" element={<SpaceTemplatesAdminRoutes spaceId={spaceId} />} />
        <Route path="storage" element={<SpaceStorageAdminPage spaceId={spaceId} />} />
        <Route path="community/groups/*" element={<CommunityGroupsRoute communityId={communityId} />} />
        <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
        <Route path="subspaces/*" element={<ChallengesRoute />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};
