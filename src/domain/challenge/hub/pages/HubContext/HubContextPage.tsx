import React, { FC } from 'react';
import HubContext from './HubContext';
import HubSettingsLayout from '../../../../admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../admin/layout/EntitySettings/types';

const HubContextPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'context' });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <HubContext />
    </HubSettingsLayout>
  );
};

export default HubContextPage;
