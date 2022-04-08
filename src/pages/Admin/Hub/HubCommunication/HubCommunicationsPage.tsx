import React, { FC } from 'react';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import CommunityUpdatesPage from '../../Community/CommunityUpdatesPage';
import { WithCommunity } from '../../../../components/Admin/Community/CommunityTypes';

interface HubCommunicationsPageProps extends SettingsPageProps {
  communityId: WithCommunity['communityId'];
}

const HubCommunicationsPage: FC<HubCommunicationsPageProps> = ({ paths, communityId, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'communications' });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage communityId={communityId} />
    </HubSettingsLayout>
  );
};

export default HubCommunicationsPage;
