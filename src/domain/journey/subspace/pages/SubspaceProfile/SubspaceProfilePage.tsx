import React, { FC } from 'react';

import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceProfileView from './SubspaceProfileView';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';

const SubspaceProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { journeyPath } = useRouteResolver();
  const subspaceId = journeyPath[journeyPath.length - 1];

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <SubspaceProfileView subspaceId={subspaceId} />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceProfilePage;
