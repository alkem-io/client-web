import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { AdminTableRow } from '@/crd/components/admin/AdminSearchableTable';
import type { SearchableListItem } from '@/domain/shared/components/SearchableList/SearchableListTypes';

export type AdminOrganizationRow = AdminTableRow & {
  verified: boolean;
  accountId?: string;
  activeLicensePlanIds: string[];
  /** May the viewer edit this organization's profile? (Update on its own authorization) */
  canEdit: boolean;
  /** May the viewer toggle verification? (Update AND Grant on the verification's authorization) */
  canVerify: boolean;
  /** May the viewer delete this organization? (Delete, or the legacy DeleteOrganization) */
  canDelete: boolean;
};

/**
 * Maps a platform-admin organization list item (from the reused
 * `usePlatformAdminOrganizationsList` hook) to the CRD table row. Row actions
 * are gated on the viewer's own privileges on this organization (client-7),
 * not on admin-area access — an admin-area role can reach this list without
 * being able to act on every row.
 */
export const mapOrganizationToRow = (item: SearchableListItem): AdminOrganizationRow => {
  const orgPrivileges = item.orgPrivileges ?? [];
  const verificationPrivileges = item.verificationPrivileges ?? [];

  return {
    id: item.id,
    name: item.value,
    url: item.url,
    verified: item.verified ?? false,
    accountId: item.accountId,
    activeLicensePlanIds: item.activeLicensePlanIds ?? [],
    canEdit: orgPrivileges.includes(AuthorizationPrivilege.Update),
    canVerify:
      verificationPrivileges.includes(AuthorizationPrivilege.Update) &&
      verificationPrivileges.includes(AuthorizationPrivilege.Grant),
    canDelete:
      orgPrivileges.includes(AuthorizationPrivilege.Delete) ||
      orgPrivileges.includes(AuthorizationPrivilege.DeleteOrganization),
  };
};
