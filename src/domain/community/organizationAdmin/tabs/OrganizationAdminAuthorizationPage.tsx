import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import OrganizationAdminAuthorizationView from '../views/OrganizationAdminAuthorizationView';
import OrganizationOwnerAuthorizationView from '../views/OrganizationOwnerAuthorizationView';
import { SectionSpacer } from '@/domain/shared/components/Section/Section';

/**
 *
 * //!! Change this entirely
 */
const OrganizationAdminAuthorizationPage = () => (
  <OrganizationAdminLayout currentTab={SettingsSection.Authorization}>
    <OrganizationAdminAuthorizationView />
    <SectionSpacer />
    <OrganizationOwnerAuthorizationView />
  </OrganizationAdminLayout>
);

export default OrganizationAdminAuthorizationPage;
