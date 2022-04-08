import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../components/composite/layout/ChallengeSettingsLayout/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import ChallengeProfileView from './ChallengeProfileView';
import FormMode from '../../../../components/Admin/FormMode';

const ChallengeProfilePage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'profile' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <ChallengeProfileView mode={FormMode.update} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeProfilePage;
