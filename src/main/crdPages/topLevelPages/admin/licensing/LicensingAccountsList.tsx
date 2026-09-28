import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchLicensingAdminOrganizationsQuery,
  refetchLicensingAdminUsersQuery,
  useAssignLicensePlanToAccountMutation,
  useLicensingAdminOrganizationsQuery,
  useLicensingAdminUsersQuery,
  useRevokeLicensePlanFromAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  AdminSearchableTable,
  type AdminTableColumn,
  type AdminTableRow,
} from '@/crd/components/admin/AdminSearchableTable';
import { AccountLicensePlansDialog } from '@/crd/components/admin/licensePlans/AccountLicensePlansDialog';
import { Button } from '@/crd/primitives/button';
import { ActivePlansCell } from './ActivePlansCell';
import { type ActivePlan, accountPlanOptions, type LicensingPlan, resolveActivePlans } from './licensingPlans';

const PAGE_SIZE = 10;

type AccountRow = AdminTableRow & {
  accountId?: string;
  plans: ActivePlan[];
};

type AccountListItem = {
  id: string;
  account?: { id: string; subscriptions: { name: string }[] } | null;
  profile: { url: string; displayName: string };
};

type LicensingAccountsListProps = {
  kind: 'organizations' | 'users';
  plans: LicensingPlan[];
  licensingId: string;
};

/**
 * Licensing → Organizations / Users: one server-paginated list of account
 * holders with their active ACCOUNT plans and the shared plan dialog (A12).
 * The users variant selects no email (READ_USER_PII stays with Users Admin):
 * a License Manager finds people by display name.
 */
export function LicensingAccountsList({ kind, plans, licensingId }: LicensingAccountsListProps) {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const notify = useNotification();
  const [searchTerm, setSearchTerm] = useState('');

  const orgs = useLicensingAdminOrganizationsQuery({
    variables: { first: PAGE_SIZE, filter: { displayName: searchTerm } },
    skip: kind !== 'organizations',
  });
  const users = useLicensingAdminUsersQuery({
    variables: { first: PAGE_SIZE, filter: { firstName: searchTerm, lastName: searchTerm } },
    skip: kind !== 'users',
  });

  const page =
    kind === 'organizations'
      ? {
          items: (orgs.data?.platformAdmin.organizations.organization ?? []) as AccountListItem[],
          total: orgs.data?.platformAdmin.organizations.total,
          pageInfo: orgs.data?.platformAdmin.organizations.pageInfo,
          loading: orgs.loading,
          fetchMore: orgs.fetchMore,
          refetch: refetchLicensingAdminOrganizationsQuery({
            first: PAGE_SIZE,
            filter: { displayName: searchTerm },
          }),
        }
      : {
          items: (users.data?.platformAdmin.users.users ?? []) as AccountListItem[],
          total: users.data?.platformAdmin.users.total,
          pageInfo: users.data?.platformAdmin.users.pageInfo,
          loading: users.loading,
          fetchMore: users.fetchMore,
          refetch: refetchLicensingAdminUsersQuery({
            first: PAGE_SIZE,
            filter: { firstName: searchTerm, lastName: searchTerm },
          }),
        };

  const rows: AccountRow[] = page.items.map(item => ({
    id: item.id,
    name: item.profile.displayName,
    url: item.profile.url,
    accountId: item.account?.id,
    plans: resolveActivePlans(plans, item.account?.subscriptions),
  }));

  const mutationOptions = {
    refetchQueries: [page.refetch],
    awaitRefetchQueries: true,
    onCompleted: () => notify(tApp('pages.admin.generic.sections.account.licenseUpdated'), 'success'),
  };
  const [assignPlan, { loading: assigning }] = useAssignLicensePlanToAccountMutation(mutationOptions);
  const [revokePlan, { loading: revoking }] = useRevokeLicensePlanFromAccountMutation(mutationOptions);

  const [dialogRowId, setDialogRowId] = useState<string | null>(null);
  // Re-derived from the live list so the active plans stay current after a refetch.
  const dialogRow = dialogRowId ? (rows.find(row => row.id === dialogRowId) ?? null) : null;
  const available = accountPlanOptions(plans);

  const columns: AdminTableColumn<AccountRow>[] = [
    { header: t('licensing.columns.plans'), render: row => <ActivePlansCell plans={row.plans} /> },
  ];

  return (
    <>
      <AdminSearchableTable<AccountRow>
        rows={rows}
        columns={columns}
        loading={page.loading}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        paginationMode="server"
        pageSize={PAGE_SIZE}
        totalCount={page.total}
        hasMore={page.pageInfo?.hasNextPage ?? false}
        fetchMore={() => {
          void page.fetchMore({ variables: { after: page.pageInfo?.endCursor } });
        }}
        rowActions={row => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('licensePlans.manage')}
            disabled={!row.accountId}
            onClick={() => setDialogRowId(row.id)}
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
          </Button>
        )}
      />

      <AccountLicensePlansDialog
        open={Boolean(dialogRow)}
        onOpenChange={open => {
          if (!open) setDialogRowId(null);
        }}
        title={dialogRow?.name ?? ''}
        available={available}
        activePlanIds={dialogRow?.plans.map(plan => plan.id) ?? []}
        loading={assigning || revoking}
        onAssign={licensePlanId => {
          if (dialogRow?.accountId)
            void assignPlan({ variables: { accountId: dialogRow.accountId, licensePlanId, licensingId } });
        }}
        onRevoke={licensePlanId => {
          if (dialogRow?.accountId)
            void revokePlan({ variables: { accountId: dialogRow.accountId, licensePlanId, licensingId } });
        }}
      />
    </>
  );
}
