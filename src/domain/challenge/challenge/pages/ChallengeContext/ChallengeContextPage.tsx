import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../admin/layout/EntitySettings/types';
import ChallengeContextView from './ChallengeContextView';

const ChallengeContextPage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'context' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <ChallengeContextView />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeContextPage;
