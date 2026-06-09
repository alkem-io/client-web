import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminSearchableTable } from '@/crd/components/admin/AdminSearchableTable';
import { AccountLicensePlansDialog } from '@/crd/components/admin/licensePlans/AccountLicensePlansDialog';
import { Button } from '@/crd/primitives/button';
import useAdminGlobalUserList from '@/domain/platformAdmin/domain/users/useAdminGlobalUserList';
import { useAdminAccessGuard } from '../useAdminAccessGuard';
import { type AdminUserRow, mapUserToRow } from './userListMapper';

/**
 * CRD global-admin Users list. Reuses the existing `useAdminGlobalUserList`
 * data hook verbatim (search, server pagination, delete, license-plan
 * assign/revoke) and renders it through the shared `AdminSearchableTable`.
 * The Name column mirrors MUI (`"<displayName> (<email>)"`); the only row
 * action wired here is license-plan management — change-email and the
 * detail/edit + history sub-pages are migrated in a follow-up.
 */
const CrdAdminUsersPage = () => {
  const { t } = useTranslation('crd-admin');
  const { isPlatformAdmin } = useAdminAccessGuard();
  const {
    userList,
    loading,
    onDelete,
    fetchMore,
    hasMore,
    total,
    pageSize,
    firstPageSize,
    searchTerm,
    onSearchTermChange,
    licensePlans,
    assignLicensePlan,
    revokeLicensePlan,
  } = useAdminGlobalUserList();

  const rows = userList.map(item => mapUserToRow(item, isPlatformAdmin));
  const availablePlans = licensePlans.map(plan => ({ id: plan.id, name: plan.name }));

  const [licenseRowId, setLicenseRowId] = useState<string | null>(null);
  // Re-derive the dialog's row from the live list so its active plans stay
  // current after an assign/revoke refetch.
  const licenseRow = licenseRowId ? (rows.find(row => row.id === licenseRowId) ?? null) : null;

  return (
    <>
      <AdminSearchableTable<AdminUserRow>
        rows={rows}
        columns={[]}
        loading={loading}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        paginationMode="server"
        pageSize={pageSize}
        firstPageSize={firstPageSize}
        totalCount={total}
        hasMore={hasMore}
        fetchMore={() => {
          void fetchMore();
        }}
        rowActions={row => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('licensePlans.manage')}
            disabled={!row.accountId}
            onClick={() => setLicenseRowId(row.id)}
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
          </Button>
        )}
        onDelete={row => onDelete({ id: row.id, value: row.name, url: row.url })}
      />

      <AccountLicensePlansDialog
        open={Boolean(licenseRow)}
        onOpenChange={open => {
          if (!open) setLicenseRowId(null);
        }}
        title={licenseRow?.name ?? ''}
        available={availablePlans}
        activePlanIds={licenseRow?.activeLicensePlanIds ?? []}
        onAssign={planId => {
          if (licenseRow?.accountId) void assignLicensePlan(licenseRow.accountId, planId);
        }}
        onRevoke={planId => {
          if (licenseRow?.accountId) void revokeLicensePlan(licenseRow.accountId, planId);
        }}
      />
    </>
  );
};

export default CrdAdminUsersPage;
