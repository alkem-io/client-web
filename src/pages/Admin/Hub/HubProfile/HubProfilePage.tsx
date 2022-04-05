import React, { FC } from 'react';
import HubProfile from './HubProfile';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { HubSettingsSection } from '../../../../components/composite/layout/HubSettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { HubSettingsPageProps } from '../../../../components/composite/layout/HubSettingsLayout/types';

const HubProfilePage: FC<HubSettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'profile' });

  return (
    <HubSettingsLayout currentTab={HubSettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <HubProfile />
    </HubSettingsLayout>
  );
};

export default HubProfilePage;
