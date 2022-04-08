import React, { FC } from 'react';
import HubProfile from './HubProfile';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';

const HubProfilePage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'profile' });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <HubProfile />
    </HubSettingsLayout>
  );
};

export default HubProfilePage;
