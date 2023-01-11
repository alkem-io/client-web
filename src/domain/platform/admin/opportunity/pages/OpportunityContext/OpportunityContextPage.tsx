import React, { FC } from 'react';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import OpportunitySettingsLayout from '../../OpportunitySettingsLayout';
import OpportunityContextView from './OpportunityContextView';

const OpportunityContextPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <OpportunitySettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <OpportunityContextView />
    </OpportunitySettingsLayout>
  );
};

export default OpportunityContextPage;
