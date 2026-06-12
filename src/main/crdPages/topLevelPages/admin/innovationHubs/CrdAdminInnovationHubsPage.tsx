import { useTranslation } from 'react-i18next';
import {
  refetchPlatformAdminInnovationHubsQuery,
  useDeleteInnovationHubMutation,
  usePlatformAdminInnovationHubsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { StoreEntityList } from '../_shared/StoreEntityList';
import { type AdminStoreEntityRow, toSearchVisibility } from '../_shared/storeEntityRow';

const CrdAdminInnovationHubsPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { data, loading } = usePlatformAdminInnovationHubsQuery();

  const [deleteHub] = useDeleteInnovationHubMutation({
    refetchQueries: [refetchPlatformAdminInnovationHubsQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.innovationHub.notifications.hubRemoved'), 'success'),
  });

  const rows: AdminStoreEntityRow[] = (data?.platformAdmin.innovationHubs ?? []).map(hub => ({
    id: hub.id,
    name: hub.profile.displayName,
    // Hubs link to the profile URL directly (not the settings URL), matching MUI.
    url: hub.profile.url,
    listedInStore: hub.listedInStore,
    searchVisibility: toSearchVisibility(hub.searchVisibility),
    accountOwner: hub.account?.host?.profile?.displayName || 'N/A',
  }));

  return (
    <StoreEntityList
      rows={rows}
      loading={loading}
      onDelete={row => {
        void deleteHub({ variables: { innovationHubId: row.id } });
      }}
    />
  );
};

export default CrdAdminInnovationHubsPage;
