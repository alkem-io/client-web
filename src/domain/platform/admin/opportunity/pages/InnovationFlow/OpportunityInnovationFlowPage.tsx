import React, { FC } from 'react';
import { useAppendBreadcrumb } from '../../../../../../core/routing/usePathUtils';
import { SettingsSection } from '../../../layout/EntitySettings/constants';
import { SettingsPageProps } from '../../../layout/EntitySettings/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';
import OpportunityInnovationFlowView from './OpportunityInnovationFlowView';

const OpportunityInnovationFlowPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'innovation-flow' });

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.InnovationFlow} tabRoutePrefix={routePrefix}>
      <OpportunityInnovationFlowView />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityInnovationFlowPage;
