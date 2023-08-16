import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import OpportunityList from '../../../../platform/admin/opportunity/pages/OpportunityList';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Opportunities} tabRoutePrefix={routePrefix}>
      <OpportunityList />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
