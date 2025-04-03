import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import OpportunityAboutPage from '@/domain/space/pages/OpportunityAboutPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';
import OpportunitySettingsPage from '../SpaceAdminSubspaces/OpportunitySettingsPage';
import AdminSpaceCommunityPage, { AdminSpaceCommunityPageProps } from '../SpaceAdminCommunity/AdminSpaceCommunityPage';
import OpportunityCommunicationsPage from '../SpaceAdminCommunication/OpportunityCommunicationsPage';

export const SpaceAdminL2Route = () => {
  const { subspace, loading } = useSubSpace();
  const communityId = subspace.about.membership.communityID;

  const communityPageProps: AdminSpaceCommunityPageProps = {
    about: subspace?.about,
    roleSetId: subspace?.about.membership.roleSetID!,
    spaceId: subspace?.id,
    pendingMembershipsEnabled: false,
    communityGuidelinesEnabled: false,
    communityGuidelinesTemplatesEnabled: false,
    communityGuidelinesId: subspace?.about.guidelines.id,
    level: subspace?.level,
    addVirtualContributorsEnabled: false,
    loading,
  };

  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id}>
      <StorageConfigContextProvider locationType="journey" spaceId={subspace?.id}>
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<OpportunityAboutPage />} />
          <Route path="communications" element={<OpportunityCommunicationsPage communityId={communityId} />} />
          <Route path="community" element={<AdminSpaceCommunityPage {...communityPageProps} />} />
          <Route path="settings" element={<OpportunitySettingsPage />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
