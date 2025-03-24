import React, { FC } from 'react';
import SpaceSettingsLayout from '@/domain/space/admin/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import CommunityUpdatesPage from '@/domain/space/pages/CommunityUpdatesPage';

interface SpaceCommunicationsPageProps extends SettingsPageProps {
  communityId: string;
}

const SpaceCommunicationsPage: FC<SpaceCommunicationsPageProps> = ({ communityId, routePrefix = '../' }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} />
    </SpaceSettingsLayout>
  );
};

export default SpaceCommunicationsPage;
