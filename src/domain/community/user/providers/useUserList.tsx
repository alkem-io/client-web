import { useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { SearchableListItem } from '../../../platform/admin/components/SearchableList';
import { useDeleteUserMutation, useUserListQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import usePaginatedQuery from '../../../shared/pagination/usePaginatedQuery';
import { UserListQuery, UserListQueryVariables } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import clearCacheForQuery from '../../../shared/utils/apollo-cache/clearCacheForQuery';

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
      (data?.usersPaginated.users ?? []).map<SearchableListItem>(({ id, nameID, profile, email }) => ({
        id,
        value: `${profile.displayName} (${email})`,
        url: `${nameID}/edit`,
      })),
    [data]
  );

  const [deleteUser, { loading: deleting }] = useDeleteUserMutation({
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
