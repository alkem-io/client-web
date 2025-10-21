import { useMemo, useState } from 'react';
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

  const innovationPacksList = useMemo(() => {
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
          loading={loading}
          fetchMore={() => Promise.resolve()}
          pageSize={innovationPacksList.length}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          hasMore={false}
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminInnovationPacksPage;
