import UserNotificationsContainer from '../containers/UserNotificationsContainer';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import UserSettingsLayout from '@/domain/platform/admin/user/layout/UserSettingsLayout';
import UserNotificationsPageView from '../views/UserNotificationsPageView';

const UserNotificationsPage = () => (
  <UserSettingsLayout currentTab={SettingsSection.Notifications}>
    <UserNotificationsContainer>
      {(entities, state, actions) => (
        <UserNotificationsPageView entities={entities} actions={actions} state={state} options={{}} />
      )}
    </UserNotificationsContainer>
  </UserSettingsLayout>
);

export default UserNotificationsPage;
