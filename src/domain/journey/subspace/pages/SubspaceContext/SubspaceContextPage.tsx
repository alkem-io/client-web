import React, { FC } from 'react';

import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import ChallengeContextView from './SubspaceContextView';
import SubspaceSettingsLayout from '../../../../platform/admin/subspace/SubspaceSettingsLayout';

const SubspaceContextPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <ChallengeContextView />
    </SubspaceSettingsLayout>
  );
};

export default SubspaceContextPage;
