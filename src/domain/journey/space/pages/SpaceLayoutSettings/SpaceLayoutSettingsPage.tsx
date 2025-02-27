import React, { FC } from 'react';
import SpaceLayoutSettingsEdit from './SpaceLayoutSettingsEdit';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import Loading from '@/core/ui/loading/Loading';

const SpaceLayoutSettingsPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading } = useUrlResolver();

  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Layout} tabRoutePrefix={routePrefix}>
      {loading ? <Loading /> : <SpaceLayoutSettingsEdit spaceId={spaceId} />}
    </SpaceSettingsLayout>
  );
};

export default SpaceLayoutSettingsPage;
