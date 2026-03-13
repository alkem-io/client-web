import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import SpaceAdminSettingsPage, {
  type SpaceAdminSettingsPageProps,
} from '@/domain/spaceAdmin/SpaceAdminSettings/SpaceAdminSettingsPage';
import SpaceAdminSubspacesPage, {
  type SpaceAdminSubspacesPageProps,
} from '@/domain/spaceAdmin/SpaceAdminSubspaces/SpaceAdminSubspacesPage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useSpace } from '../../space/context/useSpace';
import SpaceAdminAboutPage, { type SpaceAdminAboutPageProps } from '../SpaceAdminAbout/SpaceAdminAboutPage';
import SpaceAdminCommunicationsPage, {
  type SpaceAdminCommunicationsPageProps,
} from '../SpaceAdminCommunication/SpaceAdminCommunicationsPage';
import SpaceAdminCommunityPage, {
  type SpaceAdminCommunityPageProps,
} from '../SpaceAdminCommunity/SpaceAdminCommunityPage';
import SpaceAdminLayoutPage, { type SpaceAdminLayoutPageProps } from '../SpaceAdminLayout/SpaceAdminLayoutPage';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';

export const SpaceAdminL1Route: FC = () => {
  const { space, entitlements } = useSpace();
  const { subspace, loading } = useSubSpace();
  const subspaceId = subspace?.id!;

  const communityPageProps: SpaceAdminCommunityPageProps = {
    about: subspace?.about,
    roleSetId: subspace?.about.membership.roleSetID!,
    spaceId: subspace?.id,
    pendingMembershipsEnabled: true,
    communityGuidelinesEnabled: true,
    communityGuidelinesTemplatesEnabled: false,
    communityGuidelinesId: subspace?.about.guidelines.id,
    virtualContributorsBlockEnabled: false,
    level: subspace?.level,
    useL0Layout: false,
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
    subspacesEnabled: true,
    privateSettingsEnabled: true,
    parentSpaceUrl: space.about.profile?.url,
  };

  const aboutPageProps: SpaceAdminAboutPageProps = {
    useL0Layout: false,
    spaceId: subspaceId,
  };

  const layoutPageProps: SpaceAdminLayoutPageProps = {
    useL0Layout: false,
    spaceId: subspaceId,
  };

  const subspacesPageProps: SpaceAdminSubspacesPageProps = {
    useL0Layout: false,
    spaceId: subspaceId,
    templatesEnabled: false,
  };

  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id}>
      <StorageConfigContextProvider locationType="space" spaceId={subspace?.id}>
        <Routes>
          <Route path={'/'}>
            <Route index={true} element={<Navigate to="about" replace={true} />} />
            <Route path="about" element={<SpaceAdminAboutPage {...aboutPageProps} />} />
            <Route path="layout" element={<SpaceAdminLayoutPage {...layoutPageProps} />} />
            <Route path="communications" element={<SpaceAdminCommunicationsPage {...communicationsPageProps} />} />
            <Route path="opportunities/*" element={<SpaceAdminSubspacesPage {...subspacesPageProps} />} />
            <Route path="community" element={<SpaceAdminCommunityPage {...communityPageProps} />} />
            <Route path="settings" element={<SpaceAdminSettingsPage {...settingsPageProps} />} />
            <Route path="*" element={<Error404 />} />
          </Route>
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};
