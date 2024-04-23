import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import ChallengeContextView from './ChallengeContextView';

const ChallengeContextPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <ChallengeContextView />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeContextPage;
