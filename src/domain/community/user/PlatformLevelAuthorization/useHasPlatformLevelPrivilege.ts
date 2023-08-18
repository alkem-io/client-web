import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { usePlatformLevelAuthorizationQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ApolloError } from '@apollo/client';

interface State {
  loading: boolean;
  error?: ApolloError;
}

type UseHasPlatformLevelPrivilegeProvided = [hasPrivilege: boolean | undefined, state: State];

const useHasPlatformLevelPrivilege = (privilege: AuthorizationPrivilege): UseHasPlatformLevelPrivilegeProvided => {
  const { data, loading, error } = usePlatformLevelAuthorizationQuery();
  const myPrivileges = data?.platform.authorization?.myPrivileges;
  const hasPrivilege = myPrivileges?.includes(privilege);
  return [hasPrivilege, { loading, error }];
};

export default useHasPlatformLevelPrivilege;
