import React, { FC } from 'react';
import FormMode from '../../../components/FormMode';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';
import OpportunityProfileView from './OpportunityProfileView';

const OpportunityProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <OpportunityProfileView mode={FormMode.update} />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityProfilePage;
