import React, { FC } from 'react';
import HubSettingsLayout from '../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { HubSettingsSection } from '../../../components/composite/layout/HubSettingsLayout/constants';
import ChallengeListView from './ChallengeListView';
import { HubSettingsPageProps } from '../../../components/composite/layout/HubSettingsLayout/types';

const ChallengeListPage: FC<HubSettingsPageProps> = ({ paths, routePrefix }) => {
  return (
    <HubSettingsLayout currentTab={HubSettingsSection.Challenges} tabRoutePrefix={routePrefix}>
      <ChallengeListView paths={paths} />
    </HubSettingsLayout>
  );
};

export default ChallengeListPage;
