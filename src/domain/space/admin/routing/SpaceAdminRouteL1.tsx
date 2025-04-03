import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import SubspaceAboutPage from '@/domain/space/admin/SpaceAdminAbout/SubspaceAboutPage';
import ChallengeAuthorizationRoute from '@/domain/space/admin/toReview/ChallengeAuthorizationRoute';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import SpaceAdminSettingsPage, {
  SpaceAdminSettingsPageProps,
} from '@/domain/space/admin/SpaceAdminSettings/SpaceAdminSettingsPage';
import ChallengeOpportunitiesPage from '@/domain/space/admin/SpaceAdminSubspaces/SubspaceSubspacesPage';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';
import AdminSpaceCommunityPage, { AdminSpaceCommunityPageProps } from '../SpaceAdminCommunity/AdminSpaceCommunityPage';
import SpaceAdminCommunicationsPage, {
  SpaceAdminCommunicationsPageProps,
} from '../SpaceAdminCommunication/SpaceAdminCommunicationsPage';
import { useSpace } from '../../context/useSpace';

export const SpaceAdminL1Route: FC = () => {
  const { space } = useSpace();
  const { subspace, loading } = useSubSpace();

  const communityPageProps: AdminSpaceCommunityPageProps = {
    about: subspace?.about,
    roleSetId: subspace?.about.membership.roleSetID!,
    spaceId: subspace?.id,
    pendingMembershipsEnabled: true,
    communityGuidelinesEnabled: true,
    communityGuidelinesTemplatesEnabled: false,
    communityGuidelinesId: subspace?.about.guidelines.id,
    level: subspace?.level,
    useL0Layout: false,
    addVirtualContributorsEnabled: false,
    loading,
  };

  const communicationsPageProps: SpaceAdminCommunicationsPageProps = {
    useL0Layout: false,
    communityId: subspace?.about.membership?.communityID!,
  };

  const settingsPageProps: SpaceAdminSettingsPageProps = {
    useL0Layout: false,
    spaceId: subspace?.id,
    isSubspace: false,
    levelZeroSpaceUrl: space.about.profile?.url, // Needs to be L0
  };

  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id}>
      <StorageConfigContextProvider locationType="journey" spaceId={subspace?.id}>
        <Routes>
          <Route path={'/'}>
            <Route index element={<Navigate to="about" replace />} />
            <Route path="about" element={<SubspaceAboutPage />} />
            <Route path="communications" element={<SpaceAdminCommunicationsPage {...communicationsPageProps} />} />
            <Route path="opportunities/*" element={<ChallengeOpportunitiesPage />} />
            <Route path="community" element={<AdminSpaceCommunityPage {...communityPageProps} />} />
            <Route path="settings" element={<SpaceAdminSettingsPage {...settingsPageProps} />} />
            <Route path="authorization/*" element={<ChallengeAuthorizationRoute />} />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
