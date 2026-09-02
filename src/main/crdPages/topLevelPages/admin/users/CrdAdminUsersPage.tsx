import { History, Mail, Pencil, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { AdminSearchableTable } from '@/crd/components/admin/AdminSearchableTable';
import { AccountLicensePlansDialog } from '@/crd/components/admin/licensePlans/AccountLicensePlansDialog';
import { Button } from '@/crd/primitives/button';
import useAdminGlobalUserList from '@/domain/platformAdmin/domain/users/useAdminGlobalUserList';
import { useAdminAccessGuard } from '../useAdminAccessGuard';
import { UserChangeEmailDialog } from './UserChangeEmailDialog';
import { UserEmailHistoryDialog } from './UserEmailHistoryDialog';
import { type AdminUserRow, mapUserToRow } from './userListMapper';

/**
 * CRD global-admin Users list. Reuses the existing `useAdminGlobalUserList`
 * data hook verbatim (search, server pagination, delete, license-plan
 * assign/revoke) and renders it through the shared `AdminSearchableTable`.
 * The Name column mirrors MUI (`"<displayName> (<email>)"`). Row actions:
 * change-email (global-admin only) and license-plan management. The detail/edit
 * + email-history sub-pages are migrated in a follow-up.
 */
const CrdAdminUsersPage = () => {
  const { t } = useTranslation('crd-admin');
  const navigate = useNavigate();
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

  const [emailRowId, setEmailRowId] = useState<string | null>(null);
  const emailRow = emailRowId ? (rows.find(row => row.id === emailRowId) ?? null) : null;

  const [historyRowId, setHistoryRowId] = useState<string | null>(null);
  const historyRow = historyRowId ? (rows.find(row => row.id === historyRowId) ?? null) : null;

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
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('users.edit')}
              onClick={() => navigate(`/admin/users/${row.id}/edit`)}
            >
              <Pencil aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('users.history.action')}
              onClick={() => setHistoryRowId(row.id)}
            >
              <History aria-hidden="true" className="size-4" />
            </Button>
            {row.canChangeEmail && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('users.changeEmail.action')}
                onClick={() => setEmailRowId(row.id)}
              >
                <Mail aria-hidden="true" className="size-4" />
              </Button>
            )}
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
          </>
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

      {emailRow && (
        <UserChangeEmailDialog userId={emailRow.id} currentEmail={emailRow.email} onClose={() => setEmailRowId(null)} />
      )}

      {historyRow && (
        <UserEmailHistoryDialog
          userId={historyRow.id}
          subjectName={historyRow.name}
          onClose={() => setHistoryRowId(null)}
        />
      )}
    </>
  );
};

export default CrdAdminUsersPage;
