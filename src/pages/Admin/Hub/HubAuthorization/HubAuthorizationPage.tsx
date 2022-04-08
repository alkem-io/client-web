import React, { FC } from 'react';
import HubSettingsLayout from '../../../../components/composite/layout/HubSettingsLayout/HubSettingsLayout';
import { SettingsSection } from '../../../../components/composite/layout/EntitySettingsLayout/constants';
import { useAppendBreadcrumb } from '../../../../hooks/usePathUtils';
import { SettingsPageProps } from '../../../../components/composite/layout/EntitySettingsLayout/types';
import HubAuthorizationView from './HubAuthorizationView';
import { AuthorizationCredential } from '../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';

interface HubAuthorizationPageProps extends SettingsPageProps {
  resourceId: string | undefined;
}

const authorizationCredential = AuthorizationCredential.HubAdmin;

const HubAuthorizationPage: FC<HubAuthorizationPageProps> = ({ paths, resourceId, routePrefix = '../' }) => {
  const { t } = useTranslation();

  useAppendBreadcrumb(paths, {
    name: t(`common.enums.authorization-credentials.${authorizationCredential}.name` as const),
  });

  return (
    <HubSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <HubAuthorizationView credential={authorizationCredential} resourceId={resourceId} />
    </HubSettingsLayout>
  );
};

export default HubAuthorizationPage;
