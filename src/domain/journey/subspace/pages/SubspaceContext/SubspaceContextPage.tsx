import React, { FC } from 'react';

import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import ChallengeContextView from './SubspaceContextView';
import SubspaceSettingsLayout from '@/domain/platform/admin/subspace/SubspaceSettingsLayout';

const SubspaceContextPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <ChallengeContextView />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceContextPage;
