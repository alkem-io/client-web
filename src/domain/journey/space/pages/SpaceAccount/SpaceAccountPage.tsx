import React, { FC } from 'react';
import { Skeleton } from '@mui/material';
import { useRouteResolver } from '../../../../../main/routing/resolvers/RouteResolver';
import SpaceSettingsLayout from '../../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import SpaceAccountView from './SpaceAccountView';

const SpaceAccountPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { journeyId, loading } = useRouteResolver();
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Account} tabRoutePrefix={routePrefix}>
      {!journeyId || loading ? <Skeleton /> : <SpaceAccountView journeyId={journeyId} />}
    </SpaceSettingsLayout>
  );
};

export default SpaceAccountPage;
