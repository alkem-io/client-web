import React, { FC } from 'react';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../core/routing/usePathUtils';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettings/types';
import { WithCommunity } from '../../../../platform/admin/components/Community/CommunityTypes';
import CommunityUpdatesPage from '../../../../platform/admin/community/CommunityUpdatesPage';

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
