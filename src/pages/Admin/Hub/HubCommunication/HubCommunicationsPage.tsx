import React, { FC } from 'react';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { HubSettingsSection } from '../../../../components/composite/layout/HubSettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { HubSettingsPageProps } from '../../../../components/composite/layout/HubSettingsLayout/types';
import CommunityUpdatesPage from '../../Community/CommunityUpdatesPage';
import { WithCommunity } from '../../../../components/Admin/Community/CommunityTypes';

interface HubCommunicationsPageProps extends HubSettingsPageProps {
  communityId: WithCommunity['communityId'];
}

const HubCommunicationsPage: FC<HubCommunicationsPageProps> = ({ paths, communityId, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'communications' });

  return (
    <HubSettingsLayout currentTab={HubSettingsSection.Communications} tabRoutePrefix={routePrefix}>
      <CommunityUpdatesPage paths={paths} communityId={communityId} />
    </HubSettingsLayout>
  );
};

export default HubCommunicationsPage;
