import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import OpportunityAboutPage from '@/domain/space/pages/OpportunityAboutPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';
import AdminSpaceCommunityPage, { AdminSpaceCommunityPageProps } from '../SpaceAdminCommunity/AdminSpaceCommunityPage';

import SpaceAdminCommunicationsPage, {
  SpaceAdminCommunicationsPageProps,
} from '../SpaceAdminCommunication/SpaceAdminCommunicationsPage';
import SpaceAdminSettingsPage, { SpaceAdminSettingsPageProps } from '../SpaceAdminSettings/SpaceAdminSettingsPage';
import { useSpace } from '../../context/useSpace';

export const SpaceAdminL2Route = () => {
  const { space } = useSpace();
  const { subspace, loading } = useSubSpace();

  const communityPageProps: AdminSpaceCommunityPageProps = {
    about: subspace?.about,
    roleSetId: subspace?.about.membership.roleSetID!,
    spaceId: subspace?.id,
    pendingMembershipsEnabled: false,
    communityGuidelinesEnabled: false,
    communityGuidelinesTemplatesEnabled: false,
    communityGuidelinesId: subspace?.about.guidelines.id,
    useL0Layout: false,
    level: subspace?.level,
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
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<OpportunityAboutPage />} />
          <Route path="communications" element={<SpaceAdminCommunicationsPage {...communicationsPageProps} />} />
          <Route path="community" element={<AdminSpaceCommunityPage {...communityPageProps} />} />
          <Route path="settings" element={<SpaceAdminSettingsPage {...settingsPageProps} />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
