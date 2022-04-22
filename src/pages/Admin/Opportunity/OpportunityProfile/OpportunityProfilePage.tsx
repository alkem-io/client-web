import React, { FC } from 'react';
import OpportunitySettingsLayout from '../../../../domain/admin/opportunity/OpportunitySettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';
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
