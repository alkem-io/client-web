import React, { FC } from 'react';
import SubspaceSettingsLayout from '../../../../platform/admin/challenge/SubspaceSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import ChallengeProfileView from './ChallengeProfileView';
import FormMode from '../../../../platform/admin/components/FormMode';

const ChallengeProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <SubspaceSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <ChallengeProfileView mode={FormMode.update} />
    </SubspaceSettingsLayout>
  );
};

export default ChallengeProfilePage;
