import React, { FC } from 'react';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import OpportunityList from '@/domain/space/admin/SpaceSubspaces/OpportunityList';
import SubspaceSettingsLayout from '@/domain/space/admin/layout/SubspaceSettingsLayout';

const ChallengeOpportunitiesPage: FC<SettingsPageProps> = ({ routePrefix }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Subsubspaces} tabRoutePrefix={routePrefix}>
      <OpportunityList />
    </SubspaceSettingsLayout>
  );
};

export default ChallengeOpportunitiesPage;
