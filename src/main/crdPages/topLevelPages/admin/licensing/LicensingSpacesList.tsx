import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchLicensingAdminSpacesQuery,
  useLicensingAdminSpacesQuery,
  useLicensingUpdateSpaceVisibilityMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  AdminSearchableTable,
  type AdminTableColumn,
  type AdminTableRow,
} from '@/crd/components/admin/AdminSearchableTable';
import { Button } from '@/crd/primitives/button';
import { SpaceLicensePlansDialog } from '../spaces/SpaceLicensePlansDialog';
import { useAdminListSearch } from '../useAdminListSearch';
import { ActivePlansCell } from './ActivePlansCell';
import { LicensingVisibilitySelect } from './LicensingVisibilitySelect';
import { type ActivePlan, type LicensingPlan, resolveActivePlans } from './licensingPlans';

const VISIBILITY_VALUES = [
  SpaceVisibility.Active,
  SpaceVisibility.Archived,
  SpaceVisibility.Demo,
  SpaceVisibility.Inactive,
] as const;

type LicensingSpaceRow = AdminTableRow & {
  visibility: SpaceVisibility;
  owner: string;
  plans: ActivePlan[];
};

/**
 * Licensing → Spaces. Read-only rows apart from the two controls the License
 * Manager owns: inline visibility (A14 — `updateSpacePlatformSettings` with
 * visibility ONLY at Slice A; T078 renames it `adminUpdateSpaceVisibility` at
 * Slice B) and the plan dialog (A12). No delete, no settings, no admin links.
 */
export function LicensingSpacesList({ plans }: { plans: LicensingPlan[] }) {
  const { t } = useTranslation('crd-admin');
  const notify = useNotification();
  // `errorPolicy: 'all'`, as the Spaces section: one space with a corrupt
  // nested policy must not blank the whole list.
  const { data, loading } = useLicensingAdminSpacesQuery({ errorPolicy: 'all' });

  const [updateVisibility, { loading: saving }] = useLicensingUpdateSpaceVisibilityMutation({
    refetchQueries: [refetchLicensingAdminSpacesQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('licensing.visibilityUpdated'), 'success'),
  });

  const rows: LicensingSpaceRow[] = (data?.platformAdmin.spaces ?? []).map(space => ({
    id: space.id,
    name: space.about.profile.displayName,
    url: space.about.profile.url,
    visibility: space.visibility,
    owner: space.about.provider?.profile?.displayName || 'N/A',
    plans: resolveActivePlans(plans, space.subscriptions),
  }));
  const { searchTerm, onSearchTermChange, filteredRows } = useAdminListSearch(rows);

  const [licenseSpaceId, setLicenseSpaceId] = useState<string | null>(null);
  const licenseSpace = licenseSpaceId ? (rows.find(row => row.id === licenseSpaceId) ?? null) : null;

  const visibilityLabels: Record<SpaceVisibility, string> = {
    [SpaceVisibility.Active]: t('spaces.visibilityActive'),
    [SpaceVisibility.Archived]: t('spaces.visibilityArchived'),
    [SpaceVisibility.Demo]: t('spaces.visibilityDemo'),
    [SpaceVisibility.Inactive]: t('spaces.visibilityInactive'),
  };
  const visibilityOptions = VISIBILITY_VALUES.map(value => ({ value, label: visibilityLabels[value] }));

  const columns: AdminTableColumn<LicensingSpaceRow>[] = [
    { header: t('columns.ownerHeader'), render: row => row.owner },
    {
      header: t('columns.spaceVisibility'),
      render: row => (
        <LicensingVisibilitySelect
          value={row.visibility}
          options={visibilityOptions}
          ariaLabel={t('licensing.visibilityOf', { name: row.name })}
          disabled={saving}
          onValueChange={next => {
            if (next === row.visibility) return;
            // Visibility only — never the alias: the server treats a call
            // carrying `nameID` as a rename, which this role may not do.
            void updateVisibility({ variables: { spaceId: row.id, visibility: next as SpaceVisibility } });
          }}
        />
      ),
    },
    { header: t('licensing.columns.plans'), render: row => <ActivePlansCell plans={row.plans} /> },
  ];

  return (
    <>
      <AdminSearchableTable<LicensingSpaceRow>
        rows={filteredRows}
        columns={columns}
        loading={loading}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        paginationMode="client"
        pageSize={10}
        rowActions={row => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('licensePlans.manage')}
            onClick={() => setLicenseSpaceId(row.id)}
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
          </Button>
        )}
      />

      <SpaceLicensePlansDialog
        open={Boolean(licenseSpace)}
        onOpenChange={open => {
          if (!open) setLicenseSpaceId(null);
        }}
        spaceId={licenseSpace?.id ?? ''}
        title={licenseSpace?.name ?? ''}
      />
    </>
  );
}
