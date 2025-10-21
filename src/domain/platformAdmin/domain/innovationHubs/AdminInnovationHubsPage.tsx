import { useMemo } from 'react';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';
import {
  refetchPlatformAdminInnovationHubsQuery,
  usePlatformAdminInnovationHubsQuery,
  useDeleteInnovationHubMutation,
} from '@/core/apollo/generated/apollo-hooks';
import ListPage from '@/domain/platformAdmin/components/ListPage';
import { SearchableTableItem } from '@/domain/platformAdmin/components/SearchableTable';
import InnovationHubListItem from './InnovationHubListItem';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';

const AdminInnovationHubsPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { data, loading } = usePlatformAdminInnovationHubsQuery();

  const [deleteInnovationHub] = useDeleteInnovationHubMutation({
    refetchQueries: [refetchPlatformAdminInnovationHubsQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.innovation-hub.notifications.hub-removed'), 'success'),
  });

  const innovationHubsList = useMemo(() => {
    const hubs = data?.platformAdmin.innovationHubs ?? [];

    return hubs.map(hub => {
      const accountOwner = hub.account?.host?.profile?.displayName || 'N/A';

      return {
        id: hub.id,
        value: hub.profile.displayName,
        url: hub.profile.url,
        listedInStore: hub.listedInStore,
        searchVisibility: hub.searchVisibility,
        accountOwner,
      };
    });
  }, [data]);

  const handleDelete = (item: SearchableTableItem) => {
    deleteInnovationHub({
      variables: {
        innovationHubId: item.id,
      },
    });
  };

  if (loading) return <Loading text={'Loading innovation hubs'} />;

  return (
    <AdminLayout currentTab={AdminSection.InnovationHubs}>
      <ListPage data={innovationHubsList} onDelete={handleDelete} itemViewComponent={InnovationHubListItem} />
    </AdminLayout>
  );
};

export default AdminInnovationHubsPage;
