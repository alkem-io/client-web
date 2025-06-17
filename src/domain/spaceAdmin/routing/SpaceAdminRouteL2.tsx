import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';
import SpaceAdminCommunityPage, { SpaceAdminCommunityPageProps } from '../SpaceAdminCommunity/SpaceAdminCommunityPage';

import SpaceAdminCommunicationsPage, {
  SpaceAdminCommunicationsPageProps,
} from '../SpaceAdminCommunication/SpaceAdminCommunicationsPage';
import SpaceAdminSettingsPage, { SpaceAdminSettingsPageProps } from '../SpaceAdminSettings/SpaceAdminSettingsPage';
import { useSpace } from '../../space/context/useSpace';
import SpaceAdminAboutPage, { SpaceAdminAboutPageProps } from '../SpaceAdminAbout/SpaceAdminAboutPage';

export const SpaceAdminL2Route = () => {
  const { space, entitlements } = useSpace();
  const { subspace, loading } = useSubSpace();
  const subspaceId = subspace?.id!;

  const communityPageProps: SpaceAdminCommunityPageProps = {
    about: subspace?.about,
    roleSetId: subspace?.about.membership.roleSetID!,
    spaceId: subspace?.id,
    pendingMembershipsEnabled: false,
    communityGuidelinesEnabled: false,
    communityGuidelinesTemplatesEnabled: false,
    communityGuidelinesId: subspace?.about.guidelines.id,
    useL0Layout: false,
    level: subspace?.level,
    spaceEntitlements: entitlements,
    loading,
  };

  const communicationsPageProps: SpaceAdminCommunicationsPageProps = {
    useL0Layout: false,
    communityId: subspace?.about.membership?.communityID!,
  };

  const settingsPageProps: SpaceAdminSettingsPageProps = {
    useL0Layout: false,
    spaceId: subspace?.id,
    level: subspace?.level,
    membershipsEnabled: true,
    subspacesEnabled: false,
    privateSettingsEnabled: true,
    parentSpaceUrl: space.about.profile?.url, // Should be L1
  };

  const aboutPageProps: SpaceAdminAboutPageProps = {
    useL0Layout: false,
    spaceId: subspaceId,
  };

  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id}>
      <StorageConfigContextProvider locationType="space" spaceId={subspace?.id}>
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<SpaceAdminAboutPage {...aboutPageProps} />} />
          <Route path="communications" element={<SpaceAdminCommunicationsPage {...communicationsPageProps} />} />
          <Route path="community" element={<SpaceAdminCommunityPage {...communityPageProps} />} />
          <Route path="settings" element={<SpaceAdminSettingsPage {...settingsPageProps} />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
