import React, { FC } from 'react';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';
import OpportunityInnovationFlowView from './OpportunityInnovationFlowView';

const OpportunityInnovationFlowPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.InnovationFlow} tabRoutePrefix={routePrefix}>
      <OpportunityInnovationFlowView />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityInnovationFlowPage;
