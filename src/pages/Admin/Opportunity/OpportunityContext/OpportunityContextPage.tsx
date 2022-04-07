import React, { FC } from 'react';
import OpportunitySettingsLayout from '../../../../components/composite/layout/OpportunitySettingsLayout/OpportunitySettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
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
