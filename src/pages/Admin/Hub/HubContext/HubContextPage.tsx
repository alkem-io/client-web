import React, { FC } from 'react';
import HubContext from './HubContext';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';

const HubContextPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'context' });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <HubContext />
    </HubSettingsLayout>
  );
};

export default HubContextPage;
