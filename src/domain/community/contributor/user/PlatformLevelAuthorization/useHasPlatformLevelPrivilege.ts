import { AuthorizationPrivilege } from '../../../../../core/apollo/generated/graphql-schema';
import { usePlatformLevelAuthorizationQuery } from '../../../../../core/apollo/generated/apollo-hooks';

const useHasPlatformLevelPrivilege = (privilege: AuthorizationPrivilege): boolean | undefined => {
  const { data } = usePlatformLevelAuthorizationQuery();
  const myPrivileges = data?.authorization.myPrivileges;
  return myPrivileges?.includes(privilege);
};

export default useHasPlatformLevelPrivilege;
