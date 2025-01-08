import React, { FC } from 'react';
import SpaceProfile from './SpaceProfile';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';

const SpaceProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <SpaceProfile />
    </SpaceSettingsLayout>
  );
};

export default SpaceProfilePage;
