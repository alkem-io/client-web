import React, { FC } from 'react';
import SpaceSettingsView from './SpaceSettingsView';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import { Skeleton } from '@mui/material';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

const SpaceSettingsPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { journeyId, level, loading } = useRouteResolver();

  switch (level) {
    case SpaceLevel.L0:
      return (
        <SpaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
          {!journeyId || loading ? <Skeleton /> : <SpaceSettingsView journeyId={journeyId} level={level} />}
        </SpaceSettingsLayout>
      );
    case SpaceLevel.L1:
      return (
        <SubspaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
          {!journeyId || loading ? <Skeleton /> : <SpaceSettingsView journeyId={journeyId} level={level} />}
        </SubspaceSettingsLayout>
      );
    case SpaceLevel.L2:
      return (
        <SubspaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
          {!journeyId || loading ? <Skeleton /> : <SpaceSettingsView journeyId={journeyId} level={level} />}
        </SubspaceSettingsLayout>
      );
    default:
      return null;
  }
};

export default SpaceSettingsPage;
