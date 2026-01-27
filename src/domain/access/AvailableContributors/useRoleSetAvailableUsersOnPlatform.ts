import { usePlatformRoleAvailableUsersQuery } from '@/core/apollo/generated/apollo-hooks';
import { AVAILABLE_USERS_PAGE_SIZE, AvailableUsersResponse } from './common';
import { useCallback, useMemo } from 'react';
import { Identifiable } from '@/core/utils/Identifiable';

type useRoleSetAvailableUsersOnPlatformParams = {
  usersAlreadyInRole?: Identifiable[];
  filter?: string;
  skip?: boolean;
};

interface useRoleSetAvailableUsersOnPlatformProvided extends AvailableUsersResponse {}

/**
 * @internal
 * Do not use this hook directly, normally you should use useRoleSetAvailableUsers instead
 */
const useRoleSetAvailableUsersOnPlatform = ({
  usersAlreadyInRole,
  filter,
  skip,
}: useRoleSetAvailableUsersOnPlatformParams): useRoleSetAvailableUsersOnPlatformProvided => {
  // Call the query hook directly instead of passing it to usePaginatedQuery
  const { data, loading, fetchMore: fetchMoreRaw, refetch } = usePlatformRoleAvailableUsersQuery({
    variables: {
      first: AVAILABLE_USERS_PAGE_SIZE,
      filter: { displayName: filter },
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    skip,
  });

  const pageInfo = data?.usersPaginated.pageInfo;
  const hasMore = pageInfo?.hasNextPage ?? false;

  const fetchMore = useCallback(
    async (itemsNumber = AVAILABLE_USERS_PAGE_SIZE) => {
      if (!data) {
        return;
      }

      await fetchMoreRaw({
        variables: {
          first: itemsNumber,
          after: pageInfo?.endCursor,
          filter: { displayName: filter },
        },
      });
    },
    [data, fetchMoreRaw, pageInfo?.endCursor, filter, AVAILABLE_USERS_PAGE_SIZE]
  );

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
    hasMore,
    fetchMore,
    refetch,
    loading,
  };
};

export default useRoleSetAvailableUsersOnPlatform;
