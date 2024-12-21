import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminSettingsView from '../views/UserAdminSettingsView';

export const UserAdminSettingsPage = () => (
  <UserAdminLayout currentTab={SettingsSection.Settings}>
    <UserAdminSettingsView />
  </UserAdminLayout>
);

export default UserAdminSettingsPage;
