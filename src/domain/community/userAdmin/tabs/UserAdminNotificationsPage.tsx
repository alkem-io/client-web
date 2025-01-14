import UserNotificationsContainer from '../../user/containers/UserNotificationsContainer';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import UserNotificationsPageView from '../views/UserAdminNotificationsPageView';

const UserAdminNotificationsPage = () => (
  <UserAdminLayout currentTab={SettingsSection.Notifications}>
    <UserNotificationsContainer>
      {(entities, state, actions) => (
        <UserNotificationsPageView entities={entities} actions={actions} state={state} options={{}} />
      )}
    </UserNotificationsContainer>
  </UserAdminLayout>
);

export default UserAdminNotificationsPage;
