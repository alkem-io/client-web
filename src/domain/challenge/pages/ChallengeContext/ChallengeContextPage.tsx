import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../domain/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';
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
