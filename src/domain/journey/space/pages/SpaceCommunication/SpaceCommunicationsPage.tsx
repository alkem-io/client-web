import React, { FC } from 'react';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import CommunityUpdatesPage from '@/domain/platform/admin/community/CommunityUpdatesPage';

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
