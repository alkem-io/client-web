import React, { FC } from 'react';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import OpportunityList from '@/domain/journey/opportunity/pages/OpportunityList';
import SubspaceSettingsLayout from '@/domain/space/routing/toReviewAdmin/SubspaceSettingsLayout';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Subsubspaces} tabRoutePrefix={routePrefix}>
      <OpportunityList />
    </SubspaceSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
