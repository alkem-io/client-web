import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import ChallengeInnovationFlowView from './ChallengeInnovationFlowView';

/**
 * @deprecated This file is going to be removed in very soon
 */
const ChallengeInnovationFlowPage: FC<SettingsPageProps> = ({ routePrefix = '../' }) => {
  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.InnovationFlow} tabRoutePrefix={routePrefix}>
      <ChallengeInnovationFlowView />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeInnovationFlowPage;
