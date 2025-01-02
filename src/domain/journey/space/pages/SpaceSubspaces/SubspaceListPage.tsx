import React, { FC } from 'react';
import SpaceSettingsLayout from '@/domain/platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import SubspaceListView from './SubspaceListView';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';

const SubspaceListPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Subspaces} tabRoutePrefix={routePrefix}>
      <SubspaceListView />
    </SpaceSettingsLayout>
  );
};

export default SubspaceListPage;
