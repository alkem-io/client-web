import React, { FC } from 'react';
import ChallengeSettingsLayout from '../../../admin/challenge/ChallengeSettingsLayout';
import { SettingsSection } from '../../../admin/layout/EntitySettings/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../admin/layout/EntitySettings/types';
import ChallengeAuthorizationView from './ChallengeAuthorizationView';
import { AuthorizationCredential } from '../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';

const authorizationCredential = AuthorizationCredential.ChallengeAdmin;

interface ChallengeAuthorizationPageProps extends SettingsPageProps {
  resourceId: string | undefined;
}

const ChallengeAuthorizationPage: FC<ChallengeAuthorizationPageProps> = ({
  paths,
  resourceId,
  routePrefix = '../',
}) => {
  const { t } = useTranslation();

  useAppendBreadcrumb(paths, {
    name: t(`common.enums.authorization-credentials.${authorizationCredential}.name` as const),
  });

  return (
    <ChallengeSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <ChallengeAuthorizationView credential={authorizationCredential} resourceId={resourceId} />
    </ChallengeSettingsLayout>
  );
};

export default ChallengeAuthorizationPage;
