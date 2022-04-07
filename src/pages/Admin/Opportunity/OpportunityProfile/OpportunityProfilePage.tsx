import React, { FC } from 'react';
import OpportunitySettingsLayout from '../../../../components/composite/layout/OpportunitySettingsLayout/OpportunitySettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import FormMode from '../../../../components/Admin/FormMode';
import OpportunityProfileView from './OpportunityProfileView';

const OpportunityProfilePage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'profile' });

  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <OpportunityProfileView mode={FormMode.update} />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityProfilePage;
