import OrganizationAdminLayout from './OrganizationAdminLayout';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import OrganizationAdminAuthorizationView from './views/OrganizationAdminAuthorizationView';
import OrganizationOwnerAuthorizationView from './views/OrganizationOwnerAuthorizationView';
import OrganizationAuthorizationPreferencesPageView from './views/OrganizationAuthorizationPreferencesPageView';
import { SectionSpacer } from '@/domain/shared/components/Section/Section';

const OrganizationAuthorizationPage = () => (
  <OrganizationAdminLayout currentTab={SettingsSection.Authorization}>
    <OrganizationAdminAuthorizationView />
    <SectionSpacer />
    <OrganizationOwnerAuthorizationView />
    <SectionSpacer />
    <OrganizationAuthorizationPreferencesPageView />
  </OrganizationAdminLayout>
);

export default OrganizationAuthorizationPage;
