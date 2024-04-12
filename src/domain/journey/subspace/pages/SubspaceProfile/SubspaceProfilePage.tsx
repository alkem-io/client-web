import React, { FC } from 'react';

import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import SubspaceProfileView from './SubspaceProfileView';
import FormMode from '../../../../platform/admin/components/FormMode';
import SubspaceSettingsLayout from '../../../../platform/admin/subspace/SubspaceSettingsLayout';

const ChallengeProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <SubspaceProfileView mode={FormMode.update} />
    </SubspaceSettingsLayout>
  );
};

export default ChallengeProfilePage;
