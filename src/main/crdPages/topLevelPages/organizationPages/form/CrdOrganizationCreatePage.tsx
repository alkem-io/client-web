import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import NonAdminRedirect from '@/main/admin/NonAdminRedirect';
import CrdOrganizationFormPage from './CrdOrganizationFormPage';

/**
 * Standalone organization-creation route (`/organization/new`), reachable by any
 * user holding the `CreateOrganization` platform privilege — the same privilege
 * that reveals the "Create organisation" button on the user settings
 * Organizations tab. The admin copy of this form lives behind
 * `/admin/organizations/new` and additionally requires `PlatformAdmin`, which is
 * why non-admin creators need this route.
 */
const CrdOrganizationCreatePage = () => {
  const { data, loading } = usePlatformLevelAuthorizationQuery();

  return (
    <NonAdminRedirect
      privileges={data?.platform.authorization?.myPrivileges}
      loading={loading}
      adminPrivilege={AuthorizationPrivilege.CreateOrganization}
    >
      <CrdOrganizationFormPage />
    </NonAdminRedirect>
  );
};

export default CrdOrganizationCreatePage;
