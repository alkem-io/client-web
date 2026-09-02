import { useTranslation } from 'react-i18next';
import {
  refetchPlatformAdminInnovationPacksQuery,
  useDeleteInnovationPackMutation,
  usePlatformAdminInnovationPacksQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { buildInnovationPackSettingsUrl } from '@/main/routing/urlBuilders';
import { StoreEntityList } from '../_shared/StoreEntityList';
import { type AdminStoreEntityRow, toSearchVisibility } from '../_shared/storeEntityRow';

const CrdAdminInnovationPacksPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { data, loading } = usePlatformAdminInnovationPacksQuery();

  const [deletePack] = useDeleteInnovationPackMutation({
    refetchQueries: [refetchPlatformAdminInnovationPacksQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.innovationPack.notifications.packRemoved'), 'success'),
  });

  const rows: AdminStoreEntityRow[] = (data?.platformAdmin.innovationPacks ?? []).map(pack => ({
    id: pack.id,
    name: pack.profile.displayName,
    url: buildInnovationPackSettingsUrl(pack.profile.url),
    listedInStore: pack.listedInStore,
    searchVisibility: toSearchVisibility(pack.searchVisibility),
    accountOwner: pack.provider?.profile?.displayName || 'N/A',
  }));

  return (
    <StoreEntityList
      rows={rows}
      loading={loading}
      onDelete={row => {
        void deletePack({ variables: { innovationPackId: row.id } });
      }}
    />
  );
};

export default CrdAdminInnovationPacksPage;
