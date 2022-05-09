import React, { FC } from 'react';
import FormMode from '../../../components/FormMode';
import { useAppendBreadcrumb } from '../../../../../hooks/usePathUtils';
import { SettingsSection } from '../../../layout/EntitySettings/constants';
import { SettingsPageProps } from '../../../layout/EntitySettings/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';
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
