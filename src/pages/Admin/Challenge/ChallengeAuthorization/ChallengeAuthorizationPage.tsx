import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../../components/composite/layout/ChallengeSettingsLayout/ChallengeSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import ChallengeAuthorizationView from './ChallengeAuthorizationView';

interface ChallengeAuthorizationPageProps extends SettingsPageProps {
  resourceId: string | undefined;
}

const ChallengeAuthorizationPage: FC<ChallengeAuthorizationPageProps> = ({
  paths,
  resourceId,
  routePrefix = '../',
}) => {
  useAppendBreadcrumb(paths, { name: 'authorization' });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <ChallengeAuthorizationView paths={paths} resourceId={resourceId} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeAuthorizationPage;
