import { useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { SearchableListItem } from '../../admin/components/SearchableList';
import { useDeleteUserMutation, useUserListQuery } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useNotification } from '../../../hooks';
import usePaginatedQuery from '../../shared/pagination/usePaginatedQuery';
import { UserListQuery, UserListQueryVariables } from '../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';
import clearCacheForQuery from '../../shared/utils/apollo-cache/clearCacheForQuery';

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
  const { t } = useTranslation();
  const notify = useNotification();

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
      (data?.usersPaginated.users ?? []).map<SearchableListItem>(({ id, nameID, displayName, email }) => ({
        id,
        value: `${displayName} (${email})`,
        url: `${nameID}/edit`,
      })),
    [data]
  );

  const [deleteUser, { loading: deleting }] = useDeleteUserMutation({
    onError: handleError,
    update: cache => clearCacheForQuery(cache, 'usersPaginated'),
    onCompleted: () => notify(t('pages.admin.users.notifications.user-removed'), 'success'),
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
