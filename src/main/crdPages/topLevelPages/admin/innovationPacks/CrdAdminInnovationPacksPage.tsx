import { useTranslation } from 'react-i18next';
import {
  refetchPlatformAdminInnovationPacksQuery,
  useAdminUpdateInnovationPackPromoteMutation,
  useDeleteInnovationPackMutation,
  usePlatformAdminInnovationPacksQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { usePermissionDeniedNotifier } from '@/core/apollo/hooks/usePermissionDeniedNotifier';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { canDeleteOrgResource } from '@/main/crdPages/innovationPack/innovationPackAccess';
import { buildInnovationPackSettingsUrl } from '@/main/routing/urlBuilders';
import { StoreEntityList } from '../_shared/StoreEntityList';
import { type AdminStoreEntityRow, toSearchVisibility } from '../_shared/storeEntityRow';

const CrdAdminInnovationPacksPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const guard = usePermissionDeniedNotifier();
  const { data, loading } = usePlatformAdminInnovationPacksQuery();

  const [deletePack] = useDeleteInnovationPackMutation({
    refetchQueries: [refetchPlatformAdminInnovationPacksQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.innovationPack.notifications.packRemoved'), 'success'),
  });

  // No refetch: the mutation selects `{ id promote }`, so Apollo updates the
  // cached row in place.
  const [updatePromote, { loading: savingPromote }] = useAdminUpdateInnovationPackPromoteMutation();

  const rows: AdminStoreEntityRow[] = (data?.platformAdmin.innovationPacks ?? []).map(pack => ({
    id: pack.id,
    name: pack.profile.displayName,
    url: buildInnovationPackSettingsUrl(pack.profile.url),
    listedInStore: pack.listedInStore,
    searchVisibility: toSearchVisibility(pack.searchVisibility),
    accountOwner: pack.provider?.profile?.displayName || 'N/A',
    // Platform Support reads this list (R-F.2) but may not delete the container (A8).
    canDelete: canDeleteOrgResource(pack.authorization?.myPrivileges),
    promote: pack.promote ?? null,
  }));

  return (
    <StoreEntityList
      rows={rows}
      loading={loading}
      onDelete={row => {
        void deletePack({ variables: { innovationPackId: row.id } });
      }}
      onPromoteChange={(row, next) => {
        void guard(() => updatePromote({ variables: { innovationPackId: row.id, promote: next } })).catch(() => {});
      }}
      promoteSaving={savingPromote}
    />
  );
};

export default CrdAdminInnovationPacksPage;
