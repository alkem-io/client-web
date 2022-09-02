import React, { FC } from 'react';
import HubContext from './HubContext';
import HubSettingsLayout from '../../../../domain/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';

const HubContextPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'context' });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <HubContext />
    </HubSettingsLayout>
  );
};

export default HubContextPage;
