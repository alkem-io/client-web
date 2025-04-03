import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { useSpace } from '@/domain/space/context/useSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import SpaceCommunicationsPage from '@/domain/space/admin/SpaceCommunication/SpaceCommunicationsPage';
import SpaceSettingsAboutPage from '@/domain/space/admin/SpaceAboutSettings/SpaceAboutPage';
import SpaceSettingsPage from '@/domain/space/admin/SpaceSettings/SpaceSettingsPage';
import SpaceTemplatesAdminRoutes from '@/domain/space/admin/SpaceTemplatesAdminRoutes';
import SpaceStorageAdminPage from '@/domain/space/admin/storage/SpaceStorageAdminPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import AdminSpaceCommunityPage, {
  AdminSpaceCommunityPageProps,
} from '@/domain/space/admin/SpaceCommunity/AdminSpaceCommunityPage';
import ChallengesRoute from '@/domain/space/routing/toReviewAdmin/ChallengesRoute';
import NonSpaceAdminRedirect from '../../admin/routing/NonSpaceAdminRedirect';
import SpaceLayoutSettingsPage from '../../admin/SpaceLayoutSettings/SpaceLayoutSettingsPage';
import SpaceAccountPage from '../../admin/SpaceAccount/SpaceAccountPage';

const SpaceSettingsRoute: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { space, loading } = useSpace();
  const spaceId = space.id!;
  const communityId = space.about.membership?.communityID!;

  const communityPageProps: AdminSpaceCommunityPageProps = {
    about: space?.about,
    roleSetId: space?.about.membership!.roleSetID!,
    spaceId: space?.id,
    pendingMembershipsEnabled: true,
    communityGuidelinesEnabled: true,
    communityGuidelinesTemplatesEnabled: false,
    communityGuidelinesId: space?.about.guidelines!.id,
    level: space?.level,
    addVirtualContributorsEnabled: false,
    loading,
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
