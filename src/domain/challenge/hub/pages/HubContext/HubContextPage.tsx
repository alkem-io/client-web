import React, { FC } from 'react';
import HubContext from './HubContext';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettings/types';

const HubContextPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'context' });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <HubContext />
    </HubSettingsLayout>
  );
};

export default HubContextPage;
