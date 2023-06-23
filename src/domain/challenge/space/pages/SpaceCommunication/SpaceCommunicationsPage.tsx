import React, { FC } from 'react';
import SpaceSettingsLayout from '../../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import { WithCommunity } from '../../../../platform/admin/components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../../platform/admin/community/CommunityUpdatesPage';

interface SpaceCommunicationsPageProps extends SettingsPageProps {
  communityId: WithCommunity['communityId'];
}

const SpaceCommunicationsPage: FC<SpaceCommunicationsPageProps> = ({ communityId, routePrefix = '../' }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} />
    </SpaceSettingsLayout>
  );
};

export default SpaceCommunicationsPage;
