import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import ChallengeProfileView from './ChallengeProfileView';
import FormMode from '../../../../platform/admin/components/FormMode';

const ChallengeProfilePage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <ChallengeProfileView mode={FormMode.update} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeProfilePage;
