import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import SpaceAdminSettingsPage, {
  SpaceAdminSettingsPageProps,
} from '@/domain/spaceAdmin/SpaceAdminSettings/SpaceAdminSettingsPage';
import SpaceAdminSubspacesPage, {
  SpaceAdminSubspacesPageProps,
} from '@/domain/spaceAdmin/SpaceAdminSubspaces/SpaceAdminSubspacesPage';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';
import SpaceAdminCommunityPage, { SpaceAdminCommunityPageProps } from '../SpaceAdminCommunity/SpaceAdminCommunityPage';
import SpaceAdminCommunicationsPage, {
  SpaceAdminCommunicationsPageProps,
} from '../SpaceAdminCommunication/SpaceAdminCommunicationsPage';
import { useSpace } from '../../space/context/useSpace';
import SpaceAdminAboutPage, { SpaceAdminAboutPageProps } from '../SpaceAdminAbout/SpaceAdminAboutPage';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

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

  const subspacesPageProps: SpaceAdminSubspacesPageProps = {
    useL0Layout: false,
    spaceId: subspaceId,
    templatesEnabled: false,
    level: SpaceLevel.L1,
  };

  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id}>
      <StorageConfigContextProvider locationType="space" spaceId={subspace?.id}>
        <Routes>
          <Route path={'/'}>
            <Route index element={<Navigate to="about" replace />} />
            <Route path="about" element={<SpaceAdminAboutPage {...aboutPageProps} />} />
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
