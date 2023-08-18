import React, { FC } from 'react';
import SpaceContextView from './SpaceContextView';
import SpaceSettingsLayout from '../../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';

const SpaceContextPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <SpaceContextView />
    </SpaceSettingsLayout>
  );
};

export default SpaceContextPage;
