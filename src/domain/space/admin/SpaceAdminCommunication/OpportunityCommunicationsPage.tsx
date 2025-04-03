import { PropsWithChildren } from 'react';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SpaceAdminLayoutSubspace';
import SpaceAdminCommunityUpdatesPage, { SpaceAdminCommunityUpdatesPageProps } from './SpaceAdminCommunityUpdatesPage';

interface OpportunityCommunicationsPageProps extends SettingsPageProps, SpaceAdminCommunityUpdatesPageProps {}

const OpportunityCommunicationsPage = ({
  communityId,
  routePrefix = '../',
}: PropsWithChildren<OpportunityCommunicationsPageProps>) => (
  <SubspaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
    <SpaceAdminCommunityUpdatesPage communityId={communityId} />
  </SubspaceSettingsLayout>
);

export default OpportunityCommunicationsPage;
