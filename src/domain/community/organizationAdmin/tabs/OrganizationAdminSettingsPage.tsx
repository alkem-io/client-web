import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import OrganizationAdminSettingsView from '../views/OrganizationAdminSettingsView';

const OrganizationAdminSettingsPage = () => (
  <OrganizationAdminLayout currentTab={SettingsSection.Settings}>
    <OrganizationAdminSettingsView />
  </OrganizationAdminLayout>
);

export default OrganizationAdminSettingsPage;
