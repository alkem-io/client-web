import React, { FC } from 'react';
import SpaceLayoutSettingsEdit from './SpaceLayoutSettingsEdit';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';

const SpaceLayoutSettingsPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Layout} tabRoutePrefix={routePrefix}>
      <SpaceLayoutSettingsEdit />
    </SpaceSettingsLayout>
  );
};

export default SpaceLayoutSettingsPage;
