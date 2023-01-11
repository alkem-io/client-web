import React, { FC } from 'react';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import ChallengeListView from './ChallengeListView';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';

const ChallengeListPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <HubSettingsLayout currentTab={SettingsSection.Challenges} tabRoutePrefix={routePrefix}>
      <ChallengeListView />
    </HubSettingsLayout>
  );
};

export default ChallengeListPage;
