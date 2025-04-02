import React, { FC } from 'react';
import SpaceSettingsView from './SpaceSettingsView';
import SpaceSettingsLayout from '@/domain/space/admin/layout/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { Skeleton } from '@mui/material';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SubspaceSettingsLayout';

const SpaceSettingsPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceLevel, loading } = useUrlResolver();

  switch (spaceLevel) {
    case SpaceLevel.L0:
      return (
        <SpaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
          {loading ? <Skeleton /> : <SpaceSettingsView spaceLevel={spaceLevel} />}
        </SpaceSettingsLayout>
      );
    case SpaceLevel.L1:
    case SpaceLevel.L2:
      return (
        <SubspaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
          {loading ? <Skeleton /> : <SpaceSettingsView spaceLevel={spaceLevel} />}
        </SubspaceSettingsLayout>
      );
    default:
      return null;
  }
};

export default SpaceSettingsPage;
