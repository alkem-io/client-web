import React, { FC } from 'react';
import SpaceSettingsLayout from '../../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import CommunityUpdatesPage from '../../../../platform/admin/community/CommunityUpdatesPage';

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
