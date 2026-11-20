import { usePlatformLicensingPlansQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * May the viewer assign / revoke license plans on accounts?
 *
 * `cache-first`: the admin users/organizations/spaces lists already query
 * `platformLicensingPlans` for the plan catalogue itself, so this reuses that
 * cache entry rather than firing a second network request just to read the
 * authorization alongside it.
 */
const useCanManageLicensePlans = (): boolean => {
  const { data } = usePlatformLicensingPlansQuery({ fetchPolicy: 'cache-first' });

  return (data?.platform.licensingFramework.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Grant);
};

export default useCanManageLicensePlans;
