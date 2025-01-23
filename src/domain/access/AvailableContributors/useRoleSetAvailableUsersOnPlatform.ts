import { usePlatformRoleAvailableUsersQuery } from '@/core/apollo/generated/apollo-hooks';
import { AVAILABLE_USERS_PAGE_SIZE, AvailableUsersResponse } from './common';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import { useMemo } from 'react';
import { Identifiable } from '@/core/utils/Identifiable';

type useRoleSetAvailableUsersOnPlatformParams = {
  usersAlreadyInRole?: Identifiable[];
  filter?: string;
  skip?: boolean;
};

interface useRoleSetAvailableUsersOnPlatformProvided extends AvailableUsersResponse {}

/**
 * Do not use this hook directly, normally you should use useRoleSetAvailableUsers instead
 */
const useRoleSetAvailableUsersOnPlatform = ({
  usersAlreadyInRole,
  filter,
  skip,
}: useRoleSetAvailableUsersOnPlatformParams): useRoleSetAvailableUsersOnPlatformProvided => {
  const { data, loading, fetchMore, refetch, hasMore } = usePaginatedQuery({
    useQuery: usePlatformRoleAvailableUsersQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip,
    },
    pageSize: AVAILABLE_USERS_PAGE_SIZE,
    variables: { filter: { displayName: filter } },
    getPageInfo: data => data?.usersPaginated.pageInfo,
  });

  const firstPage = data?.usersPaginated;
  const users = useMemo(() => {
    if (!firstPage?.users) {
      return [];
    }
    if (!usersAlreadyInRole) {
      return firstPage.users;
    }
    return firstPage.users.filter(user => !usersAlreadyInRole?.find(current => current.id === user.id));
  }, [firstPage, loading, usersAlreadyInRole, filter, skip]);

  return {
    users,
    hasMore: hasMore ?? false,
    fetchMore,
    refetch,
    loading,
  };
};

export default useRoleSetAvailableUsersOnPlatform;
