import React, { FC } from 'react';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import OpportunityList from '@/domain/platform/admin/opportunity/pages/OpportunityList';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Subsubspaces} tabRoutePrefix={routePrefix}>
      <OpportunityList />
    </SubspaceSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
