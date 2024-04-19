import React, { FC } from 'react';
import FormMode from '../../../components/FormMode';
import { SettingsSection } from '../../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../layout/EntitySettingsLayout/types';
import SubspaceSettingsLayout from '../../../subspace/SubspaceSettingsLayout';
import OpportunityProfileView from './OpportunityProfileView';

const OpportunityProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <OpportunityProfileView mode={FormMode.update} />
    </SubspaceSettingsLayout>
  );
};

export default OpportunityProfilePage;
