import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '../../../../../core/analytics/useSentry';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import HubCommunicationsPage from '../../../../challenge/hub/pages/HubCommunication/HubCommunicationsPage';
import HubProfilePage from '../../../../challenge/hub/pages/HubProfile/HubProfilePage';
import HubSettingsPage from '../../../../challenge/hub/pages/HubSettings/HubSettingsPage';
import { ChallengesRoute } from '../../challenge/routing/ChallengesRoute';
import { ApplicationsAdminRoutes } from '../../community/routes/ApplicationsAdminRoutes';
import HubCommunityAdminPage from '../HubCommunityAdminPage';
import HubTemplatesAdminRoutes from '../HubTemplatesAdminRoutes';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';
import HubContextPage from '../../../../challenge/hub/pages/HubContext/HubContextPage';
import HubStorageAdminPage from '../storage/HubStorageAdminPage';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import HubCommunityPage from '../../../../challenge/hub/pages/HubCommunity/HubCommunityPage';

export const HubRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { hubId, communityId } = useHub();

  return (
    <StorageConfigContextProvider locationType="journey" journeyTypeName="hub" hubNameId={hubId}>
      <Routes>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<HubProfilePage />} />
        <Route path="settings" element={<HubSettingsPage />} />
        <Route path="context" element={<HubContextPage />} />
        <Route path="communityOld" element={<HubCommunityAdminPage />} />
        <Route path="community" element={<HubCommunityPage />} />
        <Route path="communications" element={<HubCommunicationsPage communityId={communityId} />} />
        <Route path="templates/*" element={<HubTemplatesAdminRoutes hubId={hubId} />} />
        <Route path="storage" element={<HubStorageAdminPage hubId={hubId} />} />
        <Route path="community/groups/*" element={<CommunityGroupsRoute communityId={communityId} />} />
        <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
        <Route path="challenges/*" element={<ChallengesRoute />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};
