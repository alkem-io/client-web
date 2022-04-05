import React, { FC } from 'react';
import HubContext from './HubContext';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { HubSettingsSection } from '../../../../components/composite/layout/HubSettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { HubSettingsPageProps } from '../../../../components/composite/layout/HubSettingsLayout/types';

const HubContextPage: FC<HubSettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'context' });

  return (
    <HubSettingsLayout currentTab={HubSettingsSection.Context} tabRoutePrefix={routePrefix}>
      <HubContext />
    </HubSettingsLayout>
  );
};

export default HubContextPage;
