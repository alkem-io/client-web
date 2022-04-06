import React, { FC } from 'react';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import ChallengeListView from './ChallengeListView';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';

const ChallengeListPage: FC<SettingsPageProps> = ({ paths, routePrefix }) => {
  return (
    <HubSettingsLayout currentTab={SettingsSection.Challenges} tabRoutePrefix={routePrefix}>
      <ChallengeListView paths={paths} />
    </HubSettingsLayout>
  );
};

export default ChallengeListPage;
