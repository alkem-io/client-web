import { FC } from 'react';
import { AuthorizationCredential } from '../../../../../core/apollo/generated/graphql-schema';
import HubSettingsLayout from '../../../../platform/admin/hub/HubSettingsLayout';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../../../platform/admin/layout/EntitySettingsLayout/types';
import HubAuthorizationView from './HubAuthorizationView';

interface HubAuthorizationPageProps extends SettingsPageProps {
  resourceId: string | undefined;
}

const authorizationCredential = AuthorizationCredential.HubAdmin;

const HubAuthorizationPage: FC<HubAuthorizationPageProps> = ({ resourceId, routePrefix = '../' }) => {
  return (
    <HubSettingsLayout currentTab={SettingsSection.Authorization} tabRoutePrefix={routePrefix}>
      <HubAuthorizationView credential={authorizationCredential} resourceId={resourceId} />
    </HubSettingsLayout>
  );
};

export default HubAuthorizationPage;
