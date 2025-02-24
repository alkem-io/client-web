import React, { FC } from 'react';

import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import SubspaceProfileView from './SubspaceProfileView';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import ChallengeContextView from '@/domain/journey/subspace/pages/SubspaceContext/SubspaceContextView';

const SubspaceProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  const { spaceId } = useUrlResolver();

  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.About} tabRoutePrefix={routePrefix}>
      <SubspaceProfileView subspaceId={spaceId} />
      <ChallengeContextView />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceProfilePage;
