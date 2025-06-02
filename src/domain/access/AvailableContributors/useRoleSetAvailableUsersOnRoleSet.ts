import { useAvailableUsersForElevatedRoleQuery } from '@/core/apollo/generated/apollo-hooks';
import { AVAILABLE_USERS_PAGE_SIZE, AvailableUsersResponse } from './common';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { Identifiable } from '@/core/utils/Identifiable';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';

type useRoleSetAvailableUsersParams = {
  roleSetId: string | undefined;
  role: RoleName | undefined;
  usersAlreadyInRole?: Identifiable[];
  filter?: string;
  skip?: boolean;
};

interface useRoleSetAvailableUsersOnRoleSetProvided extends AvailableUsersResponse {}

/**
 * Do not use this hook directly, normally you should use useRoleSetAvailableUsers instead
 */
const useRoleSetAvailableUsersOnRoleSet = ({
  roleSetId,
  role,
  filter,
  skip,
}: useRoleSetAvailableUsersParams): useRoleSetAvailableUsersOnRoleSetProvided => {
  const { data, loading, fetchMore, hasMore, refetch } = usePaginatedQuery({
    useQuery: useAvailableUsersForElevatedRoleQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip: skip || !roleSetId || !role,
    },
    pageSize: AVAILABLE_USERS_PAGE_SIZE,
    variables: {
      roleSetId: roleSetId!,
      role: role!,
      filter: { displayName: filter },
    },
    getPageInfo: data => data?.lookup.roleSet?.availableUsersForElevatedRole.pageInfo,
  });

  const users = useMemo(
    () => data?.lookup.roleSet?.availableUsersForElevatedRole.users ?? [],
    [data?.lookup.roleSet?.availableUsersForElevatedRole.users]
  );

  /*
  In theory this is done on the server
  const firstPage = data?.lookup.roleSet?.availableUsersForElevatedRole;
  const users = useMemo(() => {
    if (!firstPage?.users) {
      return [];
    }
    if (!usersAlreadyInRole) {
      return firstPage.users;
    }
    return firstPage.users.filter(user => !usersAlreadyInRole?.find(current => current.id === user.id));
  }, [firstPage, loading, usersAlreadyInRole, filter, skip]);
*/
  return {
    users,
    hasMore: hasMore ?? false,
    fetchMore,
    refetch,
    loading,
  };
};

export default useRoleSetAvailableUsersOnRoleSet;
