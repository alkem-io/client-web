import React, { FC } from 'react';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import HubAuthorizationView from './HubAuthorizationView';

interface HubAuthorizationPageProps extends SettingsPageProps {
  resourceId: string | undefined;
}

const HubAuthorizationPage: FC<HubAuthorizationPageProps> = ({ paths, resourceId, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'authorization' });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <HubAuthorizationView paths={paths} resourceId={resourceId} />
    </HubSettingsLayout>
  );
};

export default HubAuthorizationPage;
