import type { AdminTableRow } from '@/crd/components/admin/AdminSearchableTable';
import type { SearchableListItem } from '@/domain/shared/components/SearchableList/SearchableListTypes';

export type AdminUserRow = AdminTableRow & {
  email: string;
  accountId?: string;
  activeLicensePlanIds: string[];
  /** Whether the current admin may change this user's email (global-admin only, FR-023). */
  canChangeEmail: boolean;
};

/**
 * Maps a platform-admin user list item (the shape returned by the reused
 * `useAdminGlobalUserList` hook) to the plain-TS row consumed by the CRD admin
 * table. The Name column mirrors MUI: `"<displayName> (<email>)"` (already
 * composed in `item.value`).
 */
export const mapUserToRow = (item: SearchableListItem, canChangeEmail: boolean): AdminUserRow => ({
  id: item.id,
  name: item.value,
  url: item.url,
  email: item.email ?? '',
  accountId: item.accountId,
  activeLicensePlanIds: item.activeLicensePlanIds ?? [],
  canChangeEmail,
});
