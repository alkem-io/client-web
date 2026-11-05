import {
  useAdminUpdateVirtualContributorPromoteMutation,
  usePlatformAdminVirtualContributorsListQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { usePermissionDeniedNotifier } from '@/core/apollo/hooks/usePermissionDeniedNotifier';
import { StoreEntityList } from '../_shared/StoreEntityList';
import { type AdminStoreEntityRow, toSearchVisibility } from '../_shared/storeEntityRow';

/**
 * Virtual Contributors admin list — no delete, matching MUI; the only write
 * is the Promote checkbox.
 */
const CrdAdminVirtualContributorsPage = () => {
  const { data, loading } = usePlatformAdminVirtualContributorsListQuery();
  const guard = usePermissionDeniedNotifier();
  // No refetch: the mutation selects `{ id promote }`, so Apollo updates the
  // cached row in place.
  const [updatePromote, { loading: savingPromote }] = useAdminUpdateVirtualContributorPromoteMutation();

  const rows: AdminStoreEntityRow[] = (data?.platformAdmin.virtualContributors ?? []).map(vc => ({
    id: vc.id,
    name: vc.profile?.displayName ?? '',
    url: vc.profile?.url ?? '',
    listedInStore: vc.listedInStore,
    searchVisibility: toSearchVisibility(vc.searchVisibility),
    accountOwner: vc.account?.host?.profile?.displayName || 'N/A',
    promote: vc.promote ?? null,
  }));

  return (
    <StoreEntityList
      rows={rows}
      loading={loading}
      onPromoteChange={(row, next) => {
        void guard(() => updatePromote({ variables: { virtualContributorId: row.id, promote: next } })).catch(() => {});
      }}
      promoteSaving={savingPromote}
    />
  );
};

export default CrdAdminVirtualContributorsPage;
