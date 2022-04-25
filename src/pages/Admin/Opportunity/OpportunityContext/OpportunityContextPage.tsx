import React, { FC } from 'react';
import OpportunitySettingsLayout from '../../../../domain/admin/opportunity/OpportunitySettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';
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
