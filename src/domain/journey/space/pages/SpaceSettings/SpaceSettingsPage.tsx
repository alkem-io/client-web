import React, { FC } from 'react';
import SpaceSettingsView from './SpaceSettingsView';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import { Skeleton } from '@mui/material';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';

const SpaceSettingsPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { journeyId, journeyTypeName, loading } = useRouteResolver();

  switch (journeyTypeName) {
    case 'space':
      return (
        <SpaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
          {!journeyId || loading ? (
            <Skeleton />
          ) : (
            <SpaceSettingsView journeyId={journeyId} journeyTypeName={journeyTypeName} />
          )}
        </SpaceSettingsLayout>
      );
    case 'subspace':
      return (
        <SubspaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
          {!journeyId || loading ? (
            <Skeleton />
          ) : (
            <SpaceSettingsView journeyId={journeyId} journeyTypeName={journeyTypeName} />
          )}
        </SubspaceSettingsLayout>
      );
    case 'subsubspace':
      return (
        <SubspaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
          {!journeyId || loading ? (
            <Skeleton />
          ) : (
            <SpaceSettingsView journeyId={journeyId} journeyTypeName={journeyTypeName} />
          )}
        </SubspaceSettingsLayout>
      );
  }
};

export default SpaceSettingsPage;
