import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../components/composite/layout/ChallengeSettingsLayout/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import ChallengeContextView from './ChallengeContextView';

const ChallengeProfilePage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'context' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Context} tabRoutePrefix={routePrefix}>
      <ChallengeContextView paths={paths} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeProfilePage;
