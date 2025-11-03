import { useMemo, useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';
import {
  refetchPlatformAdminInnovationHubsQuery,
  usePlatformAdminInnovationHubsQuery,
  useDeleteInnovationHubMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';
import SearchableListLayout from '@/domain/shared/components/SearchableList/SearchableListLayout';
import AdminSearchableTable, { AdminTableColumn } from '@/domain/platformAdmin/components/AdminSearchableTable';
import {
  ListedInStoreColumn,
  SearchVisibilityColumn,
  AccountOwnerColumn,
} from '@/domain/platformAdmin/components/AdminListItemLayout';
import { InnovationHubTableItem } from '@/domain/platformAdmin/types/AdminTableItems';

const INITIAL_PAGE_SIZE = 10;
const PAGE_SIZE = 10;

const AdminInnovationHubsPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { data, loading } = usePlatformAdminInnovationHubsQuery();

  const [deleteInnovationHub] = useDeleteInnovationHubMutation({
    refetchQueries: [refetchPlatformAdminInnovationHubsQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.innovationHub.notifications.hubRemoved'), 'success'),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [displayedItemsCount, setDisplayedItemsCount] = useState(INITIAL_PAGE_SIZE);

  // Reset pagination when search term changes
  useEffect(() => {
    setDisplayedItemsCount(INITIAL_PAGE_SIZE);
  }, [searchTerm]);

  const columns: AdminTableColumn<InnovationHubTableItem>[] = useMemo(
    () => [
      {
        header: 'Listed in Store',
        flex: 1,
        minWidth: '140px',
        render: (item: InnovationHubTableItem) => <ListedInStoreColumn listedInStore={item.listedInStore} />,
      },
      {
        header: 'Search Visibility',
        flex: 1,
        minWidth: '140px',
        render: (item: InnovationHubTableItem) => <SearchVisibilityColumn searchVisibility={item.searchVisibility} />,
      },
      {
        header: 'Account Owner',
        flex: 1,
        minWidth: '150px',
        render: (item: InnovationHubTableItem) => <AccountOwnerColumn accountOwner={item.accountOwner} />,
      },
    ],
    []
  );

  const allInnovationHubs = useMemo(() => {
    const hubs = data?.platformAdmin.innovationHubs ?? [];

    return hubs
      .map(hub => {
        const accountOwner = hub.account?.host?.profile?.displayName || 'N/A';

        return {
          id: hub.id,
          value: hub.profile.displayName,
          url: hub.profile.url,
          listedInStore: hub.listedInStore,
          searchVisibility: hub.searchVisibility,
          accountOwner,
        } as InnovationHubTableItem;
      })
      .filter(hub => !searchTerm || hub.value.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  // Paginated hubs for display
  const innovationHubsList = useMemo(() => {
    return allInnovationHubs.slice(0, displayedItemsCount);
  }, [allInnovationHubs, displayedItemsCount]);

  const hasMore = displayedItemsCount < allInnovationHubs.length;

  const fetchMore = useCallback(async () => {
    setDisplayedItemsCount(prev => {
      const next = prev + PAGE_SIZE;
      return Math.min(next, allInnovationHubs.length);
    });
  }, [allInnovationHubs.length]);

  const handleDelete = async (item: InnovationHubTableItem) => {
    await deleteInnovationHub({
      variables: {
        innovationHubId: item.id,
      },
    });
  };

  if (loading) return <Loading text={'Loading innovation hubs'} />;

  return (
    <AdminLayout currentTab={AdminSection.InnovationHubs}>
      <SearchableListLayout>
        <AdminSearchableTable
          data={innovationHubsList}
          columns={columns}
          onDelete={handleDelete}
          loading={false}
          fetchMore={fetchMore}
          pageSize={PAGE_SIZE}
          firstPageSize={INITIAL_PAGE_SIZE}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          totalCount={allInnovationHubs.length}
          hasMore={hasMore}
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminInnovationHubsPage;
