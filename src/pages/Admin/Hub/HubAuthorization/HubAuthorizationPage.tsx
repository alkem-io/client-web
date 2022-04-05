import React, { FC } from 'react';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { HubSettingsSection } from '../../../../components/composite/layout/HubSettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { HubSettingsPageProps } from '../../../../components/composite/layout/HubSettingsLayout/types';
import HubAuthorizationView from './HubAuthorizationView';

interface HubAuthorizationPageProps extends HubSettingsPageProps {
  resourceId: string | undefined;
}

const HubAuthorizationPage: FC<HubAuthorizationPageProps> = ({ paths, resourceId, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'communications' });

  return (
    <HubSettingsLayout currentTab={HubSettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <HubAuthorizationView paths={paths} resourceId={resourceId} />
    </HubSettingsLayout>
  );
};

export default HubAuthorizationPage;
