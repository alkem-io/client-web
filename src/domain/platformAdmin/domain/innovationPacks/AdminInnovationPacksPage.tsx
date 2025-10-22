import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  refetchPlatformAdminInnovationPacksQuery,
  usePlatformAdminInnovationPacksQuery,
  useDeleteInnovationPackMutation,
} from '@/core/apollo/generated/apollo-hooks';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';
import { buildInnovationPackSettingsUrl } from '@/main/routing/urlBuilders';
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
import { InnovationPackTableItem } from '@/domain/platformAdmin/types/AdminTableItems';

const INITIAL_PAGE_SIZE = 10;
const PAGE_SIZE = 10;

const AdminInnovationPacksPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { data, loading } = usePlatformAdminInnovationPacksQuery();

  const [deleteInnovationPack] = useDeleteInnovationPackMutation({
    refetchQueries: [refetchPlatformAdminInnovationPacksQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.innovation-pack.notifications.pack-removed'), 'success'),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [displayedItemsCount, setDisplayedItemsCount] = useState(INITIAL_PAGE_SIZE);

  // Reset pagination when search term changes
  useEffect(() => {
    setDisplayedItemsCount(INITIAL_PAGE_SIZE);
  }, [searchTerm]);

  const columns: AdminTableColumn<InnovationPackTableItem>[] = useMemo(
    () => [
      {
        header: 'Listed in Store',
        flex: 1,
        minWidth: '140px',
        render: (item: InnovationPackTableItem) => <ListedInStoreColumn listedInStore={item.listedInStore} />,
      },
      {
        header: 'Search Visibility',
        flex: 1,
        minWidth: '140px',
        render: (item: InnovationPackTableItem) => <SearchVisibilityColumn searchVisibility={item.searchVisibility} />,
      },
      {
        header: 'Account Owner',
        flex: 1,
        minWidth: '150px',
        render: (item: InnovationPackTableItem) => <AccountOwnerColumn accountOwner={item.accountOwner} />,
      },
    ],
    []
  );

  const allInnovationPacks = useMemo(() => {
    const packs = data?.platformAdmin.innovationPacks ?? [];

    return packs
      .map(pack => {
        const accountOwner = pack.provider?.profile?.displayName || 'N/A';

        return {
          id: pack.id,
          value: pack.profile.displayName,
          url: buildInnovationPackSettingsUrl(pack.profile.url),
          listedInStore: pack.listedInStore,
          searchVisibility: pack.searchVisibility,
          accountOwner,
        } as InnovationPackTableItem;
      })
      .filter(pack => !searchTerm || pack.value.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  // Paginated packs for display
  const innovationPacksList = useMemo(() => {
    return allInnovationPacks.slice(0, displayedItemsCount);
  }, [allInnovationPacks, displayedItemsCount]);

  const hasMore = displayedItemsCount < allInnovationPacks.length;

  const fetchMore = useCallback(async () => {
    setDisplayedItemsCount(prev => {
      const next = prev + PAGE_SIZE;
      return Math.min(next, allInnovationPacks.length);
    });
  }, [allInnovationPacks.length]);

  const handleDelete = async (item: InnovationPackTableItem) => {
    await deleteInnovationPack({
      variables: {
        innovationPackId: item.id,
      },
    });
  };

  if (loading) return <Loading text={'Loading innovation packs'} />;

  return (
    <AdminLayout currentTab={AdminSection.InnovationPacks}>
      <SearchableListLayout>
        <AdminSearchableTable
          data={innovationPacksList}
          columns={columns}
          onDelete={handleDelete}
          loading={false}
          fetchMore={fetchMore}
          pageSize={PAGE_SIZE}
          firstPageSize={INITIAL_PAGE_SIZE}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          totalCount={allInnovationPacks.length}
          hasMore={hasMore}
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminInnovationPacksPage;
