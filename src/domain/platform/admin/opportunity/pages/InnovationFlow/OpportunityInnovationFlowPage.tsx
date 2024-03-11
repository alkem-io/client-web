import React, { FC } from 'react';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';
import OpportunityInnovationFlowView from './OpportunityInnovationFlowView';

/**
 * @deprecated This file is going to be removed in very soon
 */
const OpportunityInnovationFlowPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.InnovationFlow} tabRoutePrefix={routePrefix}>
      <OpportunityInnovationFlowView />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityInnovationFlowPage;
