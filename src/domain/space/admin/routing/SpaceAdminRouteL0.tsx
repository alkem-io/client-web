import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { useSpace } from '@/domain/space/context/useSpace';
import { Error404 } from '@/core/pages/Errors/Error404';
import SpaceAdminAboutPage, {
  SpaceAdminAboutPageProps,
} from '@/domain/space/admin/SpaceAdminAbout/SpaceAdminAboutPage';
import SpaceAdminSettingsPage, {
  SpaceAdminSettingsPageProps,
} from '@/domain/space/admin/SpaceAdminSettings/SpaceAdminSettingsPage';
import SpaceTemplatesAdminRoutes from '@/domain/space/admin/SpaceAdminTemplates/SpaceAdminTemplatesRoutes';
import SpaceAdminStoragePage, {
  SpaceAdminStoragePageProps,
} from '@/domain/space/admin/SpaceAdminStorage/SpaceAdminStoragePage';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import SpaceAdminCommunityPage, {
  SpaceAdminCommunityPageProps,
} from '@/domain/space/admin/SpaceAdminCommunity/SpaceAdminCommunityPage';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';
import SpaceAdminLayoutPage, { SpaceAdminLayoutPageProps } from '../SpaceAdminLayout/SpaceAdminLayoutPage';
import SpaceAdminAccountPage, { SpaceAdminAccountPageProps } from '../SpaceAdminAccount/SpaceAdminAccountPage';
import SpaceAdminCommunicationsPage, {
  SpaceAdminCommunicationsPageProps,
} from '../SpaceAdminCommunication/SpaceAdminCommunicationsPage';
import SpaceAdminSubspacesPage, { SpaceAdminSubspacesPageProps } from '../SpaceAdminSubspaces/SpaceAdminSubspacesPage';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

const SpaceAdminL0Route: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { space, loading } = useSpace();
  const spaceId = space.id!;

  const communityPageProps: SpaceAdminCommunityPageProps = {
    about: space?.about,
    roleSetId: space?.about.membership!.roleSetID!,
    spaceId: space?.id,
    pendingMembershipsEnabled: true,
    communityGuidelinesEnabled: true,
    communityGuidelinesTemplatesEnabled: true,
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

  const settingsPageProps: SpaceAdminSettingsPageProps = {
    useL0Layout: true,
    spaceId: space?.id,
    isSubspace: false,
    levelZeroSpaceUrl: space.about.profile?.url, // ToDO: should this become parent URL to redirect to after deletion?
  };

  const layoutPageProps: SpaceAdminLayoutPageProps = {
    useL0Layout: true,
  };

  const storagePageProps: SpaceAdminStoragePageProps = {
    useL0Layout: true,
    spaceId: spaceId,
  };

  const aboutPageProps: SpaceAdminAboutPageProps = {
    useL0Layout: true,
    spaceId: spaceId,
  };

  const accountPageProps: SpaceAdminAccountPageProps = {
    useL0Layout: true,
    spaceId: spaceId,
  };

  const subspacesPageProps: SpaceAdminSubspacesPageProps = {
    useL0Layout: true,
    spaceId: spaceId,
    templatesEnabled: true,
    level: SpaceLevel.L0,
  };

  return (
    <NonSpaceAdminRedirect spaceId={spaceId}>
      <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path="about" element={<SpaceAdminAboutPage {...aboutPageProps} />} />
          <Route path="layout" element={<SpaceAdminLayoutPage {...layoutPageProps} />} />
          <Route path="settings" element={<SpaceAdminSettingsPage {...settingsPageProps} />} />
          <Route path="account" element={<SpaceAdminAccountPage {...accountPageProps} />} />
          <Route path="community" element={<SpaceAdminCommunityPage {...communityPageProps} />} />
          <Route path="communications" element={<SpaceAdminCommunicationsPage {...communicationsPageProps} />} />
          <Route path="templates/*" element={<SpaceTemplatesAdminRoutes spaceId={spaceId} />} />
          <Route path="storage" element={<SpaceAdminStoragePage {...storagePageProps} />} />
          <Route path="challenges/*" element={<SpaceAdminSubspacesPage {...subspacesPageProps} />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </StorageConfigContextProvider>
    </NonSpaceAdminRedirect>
  );
};

export default SpaceAdminL0Route;
