import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../platform/admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../../core/routing/usePathUtils';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettings/types';
import ChallengeProfileView from './ChallengeProfileView';
import FormMode from '../../../../platform/admin/components/FormMode';

const ChallengeProfilePage: FC<SettingsPageProps> = ({ paths, routePrefix = '../' }) => {
  useAppendBreadcrumb(paths, { name: 'profile' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Profile} tabRoutePrefix={routePrefix}>
      <ChallengeProfileView mode={FormMode.update} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeProfilePage;
