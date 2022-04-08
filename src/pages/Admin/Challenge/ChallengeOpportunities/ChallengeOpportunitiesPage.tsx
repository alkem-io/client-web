import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../components/composite/layout/ChallengeSettingsLayout/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import OpportunityList from '../../Opportunity/OpportunityList';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ paths, routePrefix }) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Opportunities} tabRoutePrefix={routePrefix}>
      <OpportunityList paths={paths} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
