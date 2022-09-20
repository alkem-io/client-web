import React, { FC } from 'react';
import HubProfile from './HubProfile';
import HubSettingsLayout from '../../../../admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../admin/layout/EntitySettings/types';

const HubProfilePage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'profile' });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <HubProfile />
    </HubSettingsLayout>
  );
};

export default HubProfilePage;
