import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../domain/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../domain/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../domain/admin/layout/EntitySettings/types';
import ChallengeProfileView from './ChallengeProfileView';
import FormMode from '../../../admin/components/FormMode';

const ChallengeProfilePage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'profile' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <ChallengeProfileView mode={FormMode.update} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeProfilePage;
