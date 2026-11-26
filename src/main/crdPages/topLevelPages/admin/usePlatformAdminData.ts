import { usePlatformLevelAuthorizationQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

const knownPrivilege = (name: string): name is AuthorizationPrivilege =>
  Object.values(AuthorizationPrivilege).some(value => value === name);

// The existing guard and navigation still share adminSectionAccess. Only their
// source changes; never reconstruct platform privileges from a held role.
export function usePlatformAdminData() {
  const current = useCurrentUserContext();
  const native = current.nativePlatformPrivileges;
  const query = usePlatformLevelAuthorizationQuery({ skip: native !== undefined });
  return native !== undefined
    ? { privileges: native.filter(knownPrivilege), roles: current.platformRoles, loading: current.loading }
    : {
        privileges: [
          ...(query.data?.platform.authorization?.myPrivileges ?? []),
          ...(query.data?.platform.roleSet.authorization?.myPrivileges ?? []),
        ],
        roles: query.data?.platform.roleSet.myRoles ?? [],
        loading: query.loading,
      };
}
