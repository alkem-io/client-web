import React, { FC } from 'react';
import HubCommunityView from './HubCommunityView';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import { useHub } from '../../HubContext/useHub';

const HubCommunityPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { hubId, loading } = useHub();
  if (!hubId || loading) {
    return null;
  }

  return (
    <HubSettingsLayout currentTab={SettingsSection.Community} tabRoutePrefix={routePrefix}>
      <HubCommunityView hubId={hubId} />
    </HubSettingsLayout>
  );
};

export default HubCommunityPage;
