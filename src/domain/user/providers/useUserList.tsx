import { useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { SearchableListItem } from '../../../components/Admin/SearchableList';
import { useDeleteUserMutation, useUserListQuery } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import usePaginatedQuery from '../../shared/pagination/usePaginatedQuery';
import { UserListQuery, UserListQueryVariables } from '../../../models/graphql-schema';

interface Provided {
  loading: boolean;
  deleting: boolean;
  error?: ApolloError;
  userList: SearchableListItem[];
  onDelete: (item: SearchableListItem) => void;
  fetchMore: (itemsNumber?: number) => Promise<void>;
  hasMore: boolean | undefined;
  pageSize: number;
  firstPageSize: number;
  searchTerm: string;
  onSearchTermChange: (filterTerm: string) => void;
}

const PAGE_SIZE = 10;

const useUserList = (): Provided => {
  const handleError = useApolloErrorHandler();

  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error, fetchMore, hasMore, pageSize, firstPageSize } = usePaginatedQuery<
    UserListQuery,
    UserListQueryVariables
  >({
    useQuery: useUserListQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
    },
    variables: {
      filter: { firstName: searchTerm, lastName: searchTerm, email: searchTerm },
    },
    pageSize: PAGE_SIZE,
    getPageInfo: result => result.usersPaginated.pageInfo,
  });

  const userList = useMemo(
    () =>
      (data?.usersPaginated.users ?? []).map<SearchableListItem>(({ id, displayName, email }) => ({
        id,
        value: `${displayName} (${email})`,
        url: `${id}/edit`,
      })),
    [data]
  );

  const [deleteUser, { loading: deleting }] = useDeleteUserMutation({
    onError: handleError,
  });

  const onDelete = (item: SearchableListItem) => {
    deleteUser({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  return {
    userList,
    loading,
    deleting,
    error,
    onDelete,
    fetchMore,
    hasMore,
    pageSize,
    firstPageSize,
    searchTerm,
    onSearchTermChange: setSearchTerm,
  };
};

export default useUserList;
