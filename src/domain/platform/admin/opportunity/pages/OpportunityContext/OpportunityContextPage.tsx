import React, { FC } from 'react';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '../../../subspace/SubspaceSettingsLayout';
import OpportunityContextView from './OpportunityContextView';

const OpportunityContextPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <OpportunityContextView />
    </SubspaceSettingsLayout>
  );
};

export default OpportunityContextPage;
