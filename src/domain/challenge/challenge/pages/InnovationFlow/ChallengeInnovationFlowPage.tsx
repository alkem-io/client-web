import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettings/types';
import ChallengeInnovationFlowView from './ChallengeInnovationFlowView';

const ChallengeInnovationFlowPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'innovation-flow' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.InnovationFlow} tabRoutePrefix={routePrefix}>
      <ChallengeInnovationFlowView />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeInnovationFlowPage;
