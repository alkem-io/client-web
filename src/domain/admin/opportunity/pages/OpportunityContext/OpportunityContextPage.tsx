import React, { FC } from 'react';
import { useAppendBreadcrumb } from '../../../../../hooks/usePathUtils';
import { SettingsSection } from '../../../layout/EntitySettings/constants';
import { SettingsPageProps } from '../../../layout/EntitySettings/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';
import OpportunityContextView from './OpportunityContextView';

const OpportunityContextPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'context' });

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <OpportunityContextView />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityContextPage;
