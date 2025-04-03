import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { useSpace } from '@/domain/space/context/useSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import SpaceSettingsAboutPage from '@/domain/space/admin/SpaceAdminAbout/SpaceAboutPage';
import SpaceSettingsPage from '@/domain/space/admin/SpaceAdminSettings/SpaceSettingsPage';
import SpaceTemplatesAdminRoutes from '@/domain/space/admin/SpaceAdminTemplates/SpaceAdminTemplatesRoutes';
import SpaceStorageAdminPage from '@/domain/space/admin/SpaceAdminStorage/SpaceStorageAdminPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import AdminSpaceCommunityPage, {
  AdminSpaceCommunityPageProps,
} from '@/domain/space/admin/SpaceAdminCommunity/AdminSpaceCommunityPage';
import ChallengesRoute from '@/domain/space/routing/ChallengesRoute';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';
import SpaceLayoutSettingsPage from '../SpaceAdminLayout/SpaceLayoutSettingsPage';
import SpaceAccountPage from '../SpaceAdminAccount/SpaceAccountPage';
import SpaceAdminCommunicationsPage, {
  SpaceAdminCommunicationsPageProps,
} from '../SpaceAdminCommunication/SpaceAdminCommunicationsPage';

const SpaceAdminL0Route: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { space, loading } = useSpace();
  const spaceId = space.id!;

  const communityPageProps: AdminSpaceCommunityPageProps = {
    about: space?.about,
    roleSetId: space?.about.membership!.roleSetID!,
    spaceId: space?.id,
    pendingMembershipsEnabled: true,
    communityGuidelinesEnabled: true,
    communityGuidelinesTemplatesEnabled: false,
    communityGuidelinesId: space?.about.guidelines!.id,
    level: space?.level,
    useL0Layout: true,
    addVirtualContributorsEnabled: false,
    loading,
  };

  const communicationsPageProps: SpaceAdminCommunicationsPageProps = {
    useL0Layout: true,
    communityId: space?.about.membership?.communityID!,
  };

  return (
    <NonSpaceAdminRedirect spaceId={spaceId}>
      <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<SpaceSettingsAboutPage />} />
          <Route path="layout" element={<SpaceLayoutSettingsPage />} />
          <Route path="settings" element={<SpaceSettingsPage />} />
          <Route path="account" element={<SpaceAccountPage />} />
          <Route path="community" element={<AdminSpaceCommunityPage {...communityPageProps} />} />
          <Route path="communications" element={<SpaceAdminCommunicationsPage {...communicationsPageProps} />} />
          <Route path="templates/*" element={<SpaceTemplatesAdminRoutes spaceId={spaceId} />} />
          <Route path="storage" element={<SpaceStorageAdminPage spaceId={spaceId} />} />
          <Route path="challenges/*" element={<ChallengesRoute />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};

export default SpaceAdminL0Route;
