import React, { FC } from 'react';
import HubSettingsView from './HubSettingsView';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';

const HubSettingsPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <HubSettingsLayout currentTab={SettingsSection.HubSettings} tabRoutePrefix={routePrefix}>
      <HubSettingsView />
    </HubSettingsLayout>
  );
};

export default HubSettingsPage;
