import React, { FC } from 'react';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import SpaceAdminCommunityUpdatesPage from './SpaceAdminCommunityUpdatesPage';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';

export interface SpaceAdminCommunicationsPageProps extends SettingsPageProps {
  communityId: string;
  useL0Layout: boolean;
}

const SpaceAdminCommunicationsPage: FC<SpaceAdminCommunicationsPageProps> = ({
  useL0Layout,
  communityId,
  routePrefix = '../',
}) => {
  return (
    <LayoutSwitcher currentTab={SettingsSection.Communications} tabRoutePrefix={routePrefix} useL0Layout={useL0Layout}>
      <SpaceAdminCommunityUpdatesPage communityId={communityId} />
    </LayoutSwitcher>
  );
};

export default SpaceAdminCommunicationsPage;
