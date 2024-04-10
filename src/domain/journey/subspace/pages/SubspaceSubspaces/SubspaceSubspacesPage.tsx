import React, { FC } from 'react';
import SubspaceSettingsLayout from '../../../../platform/admin/subspace/SubspaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import OpportunityList from '../../../../platform/admin/opportunity/pages/OpportunityList';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Subsubspaces} tabRoutePrefix={routePrefix}>
      <OpportunityList />
    </SubspaceSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
