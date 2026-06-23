import type { AdminTableRow } from '@/crd/components/admin/AdminSearchableTable';
import type { SearchableListItem } from '@/domain/shared/components/SearchableList/SearchableListTypes';

export type AdminOrganizationRow = AdminTableRow & {
  verified: boolean;
  accountId?: string;
  activeLicensePlanIds: string[];
};

/**
 * Maps a platform-admin organization list item (from the reused
 * `usePlatformAdminOrganizationsList` hook) to the CRD table row.
 */
export const mapOrganizationToRow = (item: SearchableListItem): AdminOrganizationRow => ({
  id: item.id,
  name: item.value,
  url: item.url,
  verified: item.verified ?? false,
  accountId: item.accountId,
  activeLicensePlanIds: item.activeLicensePlanIds ?? [],
});
