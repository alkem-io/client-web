import OrganizationAdminLayout from '../layout/OrganizationAdminLayout';
import { SettingsSection } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsSection';
import OrganizationAuthorizationRoleAssignementView from '../views/OrganizationAuthorizationRoleAssignementView';
import Gutters from '@/core/ui/grid/Gutters';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

const OrganizationAdminAuthorizationPage = () => (
  <OrganizationAdminLayout currentTab={SettingsSection.Authorization}>
    <Gutters disablePadding>
      <OrganizationAuthorizationRoleAssignementView role={RoleName.Admin} />
      <OrganizationAuthorizationRoleAssignementView role={RoleName.Owner} />
    </Gutters>
  </OrganizationAdminLayout>
);

export default OrganizationAdminAuthorizationPage;
