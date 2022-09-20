import React, { FC } from 'react';
import HubSettingsLayout from '../../../../admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../admin/layout/EntitySettings/types';
import { WithCommunity } from '../../../../admin/components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../../../pages/Admin/Community/CommunityUpdatesPage';

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
