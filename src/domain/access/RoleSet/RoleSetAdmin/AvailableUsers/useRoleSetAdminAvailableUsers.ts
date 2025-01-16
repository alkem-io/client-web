import { useAvailableUsersForElevatedRoleQuery } from '@/core/apollo/generated/apollo-hooks';
import { AVAILABLE_USERS_PAGE_SIZE, AvailableUsersResponse } from './common';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { useMemo } from 'react';
import { Identifiable } from '@/core/utils/Identifiable';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

type useRoleSetAdminAvailableUsersParams = {
  roleSetId: string | undefined;
  role: RoleName | undefined;
  usersAlreadyInRole?: Identifiable[]
  filter?: string;
  skip?: boolean;
};

interface useRoleSetAdminAvailableUsersProvided extends AvailableUsersResponse { }

/**
 * Do not use this hook directly, normally you should use useRoleSetAdmin instead
 */
const useRoleSetAdminAvailableUsers = ({
  roleSetId,
  role,
  usersAlreadyInRole,
  filter,
  skip,
}: useRoleSetAdminAvailableUsersParams): useRoleSetAdminAvailableUsersProvided => {

  const { data, loading, fetchMore, hasMore } = usePaginatedQuery({
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
      filter: { displayName: filter }
    },
    getPageInfo: data => data?.lookup.roleSet?.availableUsersForElevatedRole.pageInfo,
  });

  const firstPage = data?.lookup.roleSet?.availableUsersForElevatedRole;
  /*
  // In theory server takes care of this?
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
    users: firstPage?.users ?? [],
    hasMore: hasMore ?? false,
    fetchMore,
    loading,
  };
};

export default useRoleSetAdminAvailableUsers;
