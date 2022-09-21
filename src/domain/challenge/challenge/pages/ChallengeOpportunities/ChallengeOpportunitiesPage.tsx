import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettings/types';
import OpportunityList from '../../../../platform/admin/opportunity/pages/OpportunityList';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ paths, routePrefix }) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Opportunities} tabRoutePrefix={routePrefix}>
      <OpportunityList paths={paths} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
