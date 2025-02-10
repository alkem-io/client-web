import React, { FC } from 'react';
import { Skeleton } from '@mui/material';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SpaceAccountView from './SpaceAccountView';

const SpaceAccountPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId, loading } = useUrlResolver();
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Account} tabRoutePrefix={routePrefix}>
      {!spaceId || loading ? <Skeleton /> : <SpaceAccountView spaceId={spaceId} />}
    </SpaceSettingsLayout>
  );
};

export default SpaceAccountPage;
