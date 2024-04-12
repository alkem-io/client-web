import React, { FC } from 'react';
import SpaceSettingsLayout from '../../../../platform/admin/space/SpaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import ChallengeListView from './ChallengeListView';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';

const ChallengeListPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Subspaces} tabRoutePrefix={routePrefix}>
      <ChallengeListView />
    </SpaceSettingsLayout>
  );
};

export default ChallengeListPage;
