import React, { FC } from 'react';
import SpaceSettingsLayout from '../../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import SubspaceListView from './SubspaceListView';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';

const SubspaceListPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Subspaces} tabRoutePrefix={routePrefix}>
      <SubspaceListView />
    </SpaceSettingsLayout>
  );
};

export default SubspaceListPage;
