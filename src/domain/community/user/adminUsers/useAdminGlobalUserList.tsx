import { useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { SearchableListItem } from '../../../platform/admin/components/SearchableList';
import { useDeleteUserMutation, useUserListQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import usePaginatedQuery from '../../../shared/pagination/usePaginatedQuery';
import { UserListQuery, UserListQueryVariables } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import clearCacheForQuery from '../../../../core/apollo/utils/clearCacheForQuery';
import { buildSettingsUrl } from '../../../../main/routing/urlBuilders';

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

const DEFAULT_PAGE_SIZE = 10;

interface UseAdminGlobalUserListOptions {
  skip?: boolean;
  pageSize?: number;
}

const useAdminGlobalUserList = ({
  skip = false,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseAdminGlobalUserListOptions = {}): Provided => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [searchTerm, setSearchTerm] = useState('');

  const {
    data,
    loading,
    error,
    fetchMore,
    hasMore,
    pageSize: actualPageSize,
    firstPageSize,
  } = usePaginatedQuery<UserListQuery, UserListQueryVariables>({
    useQuery: useUserListQuery,
    options: {
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      skip,
    },
    variables: {
      filter: { firstName: searchTerm, lastName: searchTerm, email: searchTerm },
    },
    pageSize,
    getPageInfo: result => result.usersPaginated.pageInfo,
  });

  const userList = useMemo(
    () =>
      (data?.usersPaginated.users ?? []).map<SearchableListItem>(({ id, profile, email }) => ({
        id,
        value: `${profile.displayName} (${email})`,
        url: buildSettingsUrl(profile.url),
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
    pageSize: actualPageSize,
    firstPageSize,
    searchTerm,
    onSearchTermChange: setSearchTerm,
  };
};

export default useAdminGlobalUserList;
