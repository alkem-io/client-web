import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../admin/layout/EntitySettings/constants';
import { SettingsPageProps } from '../../../../admin/layout/EntitySettings/types';
import OpportunityList from '../../../../admin/opportunity/pages/OpportunityList';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ paths, routePrefix }) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Opportunities} tabRoutePrefix={routePrefix}>
      <OpportunityList paths={paths} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
