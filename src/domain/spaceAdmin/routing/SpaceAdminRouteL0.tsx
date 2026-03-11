import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { Error404 } from '@/core/pages/Errors/Error404';
import { useSpace } from '@/domain/space/context/useSpace';
import SpaceAdminAboutPage, {
  type SpaceAdminAboutPageProps,
} from '@/domain/spaceAdmin/SpaceAdminAbout/SpaceAdminAboutPage';
import SpaceAdminCommunityPage, {
  type SpaceAdminCommunityPageProps,
} from '@/domain/spaceAdmin/SpaceAdminCommunity/SpaceAdminCommunityPage';
import SpaceAdminSettingsPage, {
  type SpaceAdminSettingsPageProps,
} from '@/domain/spaceAdmin/SpaceAdminSettings/SpaceAdminSettingsPage';
import SpaceAdminStoragePage, {
  type SpaceAdminStoragePageProps,
} from '@/domain/spaceAdmin/SpaceAdminStorage/SpaceAdminStoragePage';
import SpaceTemplatesAdminRoutes from '@/domain/spaceAdmin/SpaceAdminTemplates/SpaceAdminTemplatesRoutes';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import SpaceAdminAccountPage, { type SpaceAdminAccountPageProps } from '../SpaceAdminAccount/SpaceAdminAccountPage';
import SpaceAdminCommunicationsPage, {
  type SpaceAdminCommunicationsPageProps,
} from '../SpaceAdminCommunication/SpaceAdminCommunicationsPage';
import SpaceAdminLayoutPage, { type SpaceAdminLayoutPageProps } from '../SpaceAdminLayout/SpaceAdminLayoutPage';
import SpaceAdminSubspacesPage, {
  type SpaceAdminSubspacesPageProps,
} from '../SpaceAdminSubspaces/SpaceAdminSubspacesPage';
import NonSpaceAdminRedirect from './NonSpaceAdminRedirect';

const SpaceAdminL0Route: FC = () => {
  useTransactionScope({ type: 'admin' });
  const { space, loading, entitlements } = useSpace();
  const spaceId = space.id;

  const communityPageProps: SpaceAdminCommunityPageProps = {
    about: space?.about,
    roleSetId: space?.about.membership?.roleSetID!,
    spaceId: space?.id,
    pendingMembershipsEnabled: true,
    communityGuidelinesEnabled: true,
    communityGuidelinesTemplatesEnabled: true,
    communityGuidelinesId: space?.about.guidelines?.id,
    virtualContributorsBlockEnabled: true,
    level: space?.level,
    useL0Layout: true,
    spaceEntitlements: entitlements,
    loading,
  };

  const communicationsPageProps: SpaceAdminCommunicationsPageProps = {
    useL0Layout: true,
    communityId: space?.about.membership?.communityID!,
  };

  const settingsPageProps: SpaceAdminSettingsPageProps = {
    useL0Layout: true,
    spaceId: space?.id,
    level: space.level,
    membershipsEnabled: true,
    subspacesEnabled: true,
    privateSettingsEnabled: true,
    parentSpaceUrl: space.about.profile?.url,
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
  };

  return (
    <NonSpaceAdminRedirect spaceId={spaceId}>
      <StorageConfigContextProvider locationType="space" spaceId={spaceId}>
        <Routes>
          <Route index={true} element={<Navigate to="about" replace={true} />} />
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
