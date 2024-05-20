import { useMemo, useState } from 'react';

import {
  useAdminGlobalOrganizationsListQuery,
  useDeleteOrganizationMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import usePaginatedQuery from '../../../../shared/pagination/usePaginatedQuery';
import { SearchableListItem } from '../../../../shared/components/SearchableList/SimpleSearchableList';
import clearCacheForQuery from '../../../../../core/apollo/utils/clearCacheForQuery';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '../../../../../main/routing/urlBuilders';

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

  const { t } = useTranslation();
  const notify = useNotification();

  const [deleteOrganization] = useDeleteOrganizationMutation({
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
        value: org.profile.displayName,
        url: buildSettingsUrl(org.profile.url),
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
