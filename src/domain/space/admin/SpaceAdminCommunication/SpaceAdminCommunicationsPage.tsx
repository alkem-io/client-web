import React, { FC } from 'react';
import SpaceSettingsLayout from '@/domain/space/admin/layout/SpaceAdminLayoutSpace';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SpaceAdminCommunityUpdatesPage from './SpaceAdminCommunityUpdatesPage';

interface SpaceAdminCommunicationsPageProps extends SettingsPageProps {
  communityId: string;
}

const SpaceCommunicationsPage: FC<SpaceAdminCommunicationsPageProps> = ({ communityId, routePrefix = '../' }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <SpaceAdminCommunityUpdatesPage communityId={communityId} />
    </SpaceSettingsLayout>
  );
};

export default SpaceCommunicationsPage;
