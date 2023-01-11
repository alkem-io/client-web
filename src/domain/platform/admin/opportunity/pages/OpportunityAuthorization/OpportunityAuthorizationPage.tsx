import React, { FC } from 'react';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import OpportunityAuthorizationView from './OpportunityAdminAuthorizationView';

const OpportunityAuthorizationPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <OpportunityAuthorizationView />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityAuthorizationPage;
