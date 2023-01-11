import React, { FC } from 'react';
import HubProfile from './HubProfile';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';

const HubProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <HubSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <HubProfile />
    </HubSettingsLayout>
  );
};

export default HubProfilePage;
