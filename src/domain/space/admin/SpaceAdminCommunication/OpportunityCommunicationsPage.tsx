import { PropsWithChildren } from 'react';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SubspaceSettingsLayout';
import CommunityUpdatesPage, { CommunityUpdatesPageProps } from './CommunityUpdatesPage';

interface OpportunityCommunicationsPageProps extends SettingsPageProps, CommunityUpdatesPageProps {}

const OpportunityCommunicationsPage = ({
  communityId,
  routePrefix = '../',
}: PropsWithChildren<OpportunityCommunicationsPageProps>) => (
  <SubspaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
    <CommunityUpdatesPage communityId={communityId} />
  </SubspaceSettingsLayout>
);

export default OpportunityCommunicationsPage;
