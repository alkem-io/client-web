import { useMemo } from 'react';
import {
  refetchPlatformAdminInnovationPacksQuery,
  usePlatformAdminInnovationPacksQuery,
  useDeleteInnovationPackMutation,
} from '@/core/apollo/generated/apollo-hooks';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';
import { buildInnovationPackSettingsUrl } from '@/main/routing/urlBuilders';
import ListPage from '@/domain/platformAdmin/components/ListPage';
import { SearchableTableItem } from '@/domain/platformAdmin/components/SearchableTable';
import InnovationPackListItem from './InnovationPackListItem';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';

const AdminInnovationPacksPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { data, loading } = usePlatformAdminInnovationPacksQuery();

  const [deleteInnovationPack] = useDeleteInnovationPackMutation({
    refetchQueries: [refetchPlatformAdminInnovationPacksQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.innovation-pack.notifications.pack-removed'), 'success'),
  });

  const innovationPacksList = useMemo(() => {
    const packs = data?.platformAdmin.innovationPacks ?? [];

    return packs.map(pack => {
      const accountOwner = pack.provider?.profile?.displayName || 'N/A';

      return {
        id: pack.id,
        value: pack.profile.displayName,
        url: buildInnovationPackSettingsUrl(pack.profile.url),
        listedInStore: pack.listedInStore,
        searchVisibility: pack.searchVisibility,
        accountOwner,
      };
    });
  }, [data]);

  const handleDelete = (item: SearchableTableItem) => {
    deleteInnovationPack({
      variables: {
        innovationPackId: item.id,
      },
    });
  };

  if (loading) return <Loading text={'Loading innovation packs'} />;

  return (
    <AdminLayout currentTab={AdminSection.InnovationPacks}>
      <ListPage data={innovationPacksList} onDelete={handleDelete} itemViewComponent={InnovationPackListItem} />
    </AdminLayout>
  );
};

export default AdminInnovationPacksPage;
