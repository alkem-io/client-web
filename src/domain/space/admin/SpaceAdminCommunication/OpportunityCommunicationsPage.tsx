import { PropsWithChildren } from 'react';
import CommunityUpdatesPage, {
  CommunityUpdatesPageProps,
} from '@/domain/space/admin/SpaceCommunication/CommunityUpdatesPage';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SubspaceSettingsLayout';

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
