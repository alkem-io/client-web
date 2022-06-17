import { useMemo, useState } from 'react';

import {
  useAdminGlobalOrganizationsListQuery,
  useDeleteOrganizationMutation,
} from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler, useNotification } from '../../../../hooks';
import usePaginatedQuery from '../../../shared/pagination/usePaginatedQuery';
import { SearchableListItem } from '../../../shared/components/SimpleSearchableList';
import clearCacheForQuery from '../../../shared/utils/apollo-cache/clearCacheForQuery';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 10;

export const useAdminGlobalOrganizationsList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, ...paginationProvided } = usePaginatedQuery({
    useQuery: useAdminGlobalOrganizationsListQuery,
    variables: {
      filter: { displayName: searchTerm },
    },
    pageSize: PAGE_SIZE,
    getPageInfo: data => data?.organizationsPaginated.pageInfo,
  });

  const handleError = useApolloErrorHandler();
  const { t } = useTranslation();
  const notify = useNotification();

  const [deleteOrganization] = useDeleteOrganizationMutation({
    onError: handleError,
    update: cache => clearCacheForQuery(cache, 'organizationsPaginated'),
    onCompleted: () => notify(t('pages.admin.organization.notifications.organization-removed'), 'success'),
  });

  const handleDelete = (item: SearchableListItem) =>
    deleteOrganization({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });

  const organizations = useMemo<SearchableListItem[]>(
    () =>
      data?.organizationsPaginated.organization.map(org => ({
        id: org.id,
        value: org.displayName,
        url: `${org.nameID}`,
      })) || [],
    [data]
  );

  return {
    organizations,
    searchTerm,
    onSearchTermChange: setSearchTerm,
    onDelete: handleDelete,
    ...paginationProvided,
  };
};

export default useAdminGlobalOrganizationsList;
