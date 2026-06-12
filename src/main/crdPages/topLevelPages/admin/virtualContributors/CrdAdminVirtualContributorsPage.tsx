import { usePlatformAdminVirtualContributorsListQuery } from '@/core/apollo/generated/apollo-hooks';
import { StoreEntityList } from '../_shared/StoreEntityList';
import { type AdminStoreEntityRow, toSearchVisibility } from '../_shared/storeEntityRow';

/**
 * Virtual Contributors admin list — read-only (no delete), matching MUI.
 */
const CrdAdminVirtualContributorsPage = () => {
  const { data, loading } = usePlatformAdminVirtualContributorsListQuery();

  const rows: AdminStoreEntityRow[] = (data?.platformAdmin.virtualContributors ?? []).map(vc => ({
    id: vc.id,
    name: vc.profile?.displayName ?? '',
    url: vc.profile?.url ?? '',
    listedInStore: vc.listedInStore,
    searchVisibility: toSearchVisibility(vc.searchVisibility),
    accountOwner: vc.account?.host?.profile?.displayName || 'N/A',
  }));

  return <StoreEntityList rows={rows} loading={loading} />;
};

export default CrdAdminVirtualContributorsPage;
