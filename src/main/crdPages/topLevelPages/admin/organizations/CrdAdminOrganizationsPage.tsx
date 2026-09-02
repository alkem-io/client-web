import { BadgeCheck, Pencil, Plus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { AdminSearchableTable, type AdminTableColumn } from '@/crd/components/admin/AdminSearchableTable';
import { VisibilityChipCell } from '@/crd/components/admin/columns/VisibilityChipCell';
import { AccountLicensePlansDialog } from '@/crd/components/admin/licensePlans/AccountLicensePlansDialog';
import { Button } from '@/crd/primitives/button';
import usePlatformAdminOrganizationsList from '@/domain/platformAdmin/domain/organizations/usePlatformAdminOrganizationsList';
import { type AdminOrganizationRow, mapOrganizationToRow } from './orgListMapper';

/**
 * CRD global-admin Organizations list. Reuses `usePlatformAdminOrganizationsList`
 * verbatim (search, server pagination, delete, verification toggle, license
 * assign/revoke). Create/edit open the dedicated organization form routes.
 */
const CrdAdminOrganizationsPage = () => {
  const { t } = useTranslation('crd-admin');
  const navigate = useNavigate();
  const {
    organizations,
    loading,
    onDelete,
    handleVerification,
    searchTerm,
    onSearchTermChange,
    fetchMore,
    hasMore,
    total,
    pageSize,
    firstPageSize,
    licensePlans,
    assignLicensePlan,
    revokeLicensePlan,
  } = usePlatformAdminOrganizationsList();

  const rows = organizations.map(mapOrganizationToRow);
  const availablePlans = licensePlans.map(plan => ({ id: plan.id, name: plan.name }));

  const [licenseRowId, setLicenseRowId] = useState<string | null>(null);
  const licenseRow = licenseRowId ? (rows.find(row => row.id === licenseRowId) ?? null) : null;

  const columns: AdminTableColumn<AdminOrganizationRow>[] = [
    {
      header: t('organizations.verifiedHeader'),
      render: row => (
        <VisibilityChipCell
          label={row.verified ? t('organizations.verified') : t('organizations.notVerified')}
          tone={row.verified ? 'secondary' : 'outline'}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={() => navigate('/admin/organizations/new')}>
          <Plus aria-hidden="true" className="size-4" />
          {t('organizations.new')}
        </Button>
      </div>

      <AdminSearchableTable<AdminOrganizationRow>
        rows={rows}
        columns={columns}
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
              aria-label={t('organizations.edit')}
              onClick={() => navigate(`/admin/organizations/${row.id}/edit`)}
            >
              <Pencil aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('organizations.toggleVerification')}
              onClick={() => {
                void handleVerification({ id: row.id, value: row.name, url: row.url });
              }}
            >
              <BadgeCheck
                aria-hidden="true"
                className={row.verified ? 'size-4 text-primary' : 'size-4 text-muted-foreground'}
              />
            </Button>
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
    </>
  );
};

export default CrdAdminOrganizationsPage;
