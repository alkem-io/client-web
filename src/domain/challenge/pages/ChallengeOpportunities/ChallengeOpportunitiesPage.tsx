import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../domain/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';
import OpportunityList from '../../../../pages/Admin/Opportunity/OpportunityList';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ paths, routePrefix }) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Opportunities} tabRoutePrefix={routePrefix}>
      <OpportunityList paths={paths} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
