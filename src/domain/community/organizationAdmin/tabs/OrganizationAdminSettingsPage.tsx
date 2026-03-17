import { SettingsSection } from '../../../platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import OrganizationAdminSettingsView from '../views/OrganizationAdminSettingsView';

const OrganizationAdminSettingsPage = () => (
  <OrganizationAdminLayout currentTab={SettingsSection.Settings}>
    <OrganizationAdminSettingsView />
  </OrganizationAdminLayout>
);

export default OrganizationAdminSettingsPage;
