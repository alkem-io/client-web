import React, { FC } from 'react';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import { WithCommunity } from '../../../../platform/admin/components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../../platform/admin/community/CommunityUpdatesPage';

interface HubCommunicationsPageProps extends SettingsPageProps {
  communityId: WithCommunity['communityId'];
}

const HubCommunicationsPage: FC<HubCommunicationsPageProps> = ({ communityId, routePrefix = '../' }) => {
  return (
    <HubSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} />
    </HubSettingsLayout>
  );
};

export default HubCommunicationsPage;
