import React, { FC } from 'react';
import HubContextView from './HubContextView';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';

const HubContextPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <HubSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <HubContextView />
    </HubSettingsLayout>
  );
};

export default HubContextPage;
