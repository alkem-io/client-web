import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import OpportunityCommunicationsPage from '@/domain/space/admin/SpaceCommunication/OpportunityCommunicationsPage';
import OpportunityAboutPage from '@/domain/space/pages/OpportunityAboutPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import NonSpaceAdminRedirect from './nonSpaceAdminRedirect/NonSpaceAdminRedirect';
import OpportunitySettingsPage from '../../admin/SpaceSubspaces/OpportunitySettingsPage';
import AdminSubspaceCommunityPage from '../../admin/SpaceCommunity/AdminSubspaceCommunityPage';
import { AdminSpaceCommunityPageProps } from '../../admin/SpaceCommunity/AdminSpaceCommunityPage';

export const OpportunityRoute = () => {
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
          <Route path="community" element={<AdminSubspaceCommunityPage {...communityPageProps} />} />
          <Route path="settings" element={<OpportunitySettingsPage />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
