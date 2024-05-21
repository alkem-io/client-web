import React, { FC } from 'react';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '../../../subspace/SubspaceSettingsLayout';
import OpportunitySettingsView from './OpportunitySettingsView';

const OpportunitySettingsPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.SpaceSettings} tabRoutePrefix={routePrefix}>
      <OpportunitySettingsView />
    </SubspaceSettingsLayout>
  );
};

export default OpportunitySettingsPage;
