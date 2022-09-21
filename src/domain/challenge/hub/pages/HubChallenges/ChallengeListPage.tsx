import React, { FC } from 'react';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import ChallengeListView from './ChallengeListView';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettings/types';

const ChallengeListPage: FC<SettingsPageProps> = ({ paths, routePrefix }) => {
  return (
    <HubSettingsLayout currentTab={SettingsSection.Challenges} tabRoutePrefix={routePrefix}>
      <ChallengeListView paths={paths} />
    </HubSettingsLayout>
  );
};

export default ChallengeListPage;
