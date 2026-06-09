import { Settings2, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchPlatformAdminSpacesListQuery,
  useDeleteSpaceMutation,
  usePlatformAdminSpacesListQuery,
  useUpdateSpacePlatformSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { AdminSearchableTable, type AdminTableColumn } from '@/crd/components/admin/AdminSearchableTable';
import { AccountOwnerCell } from '@/crd/components/admin/columns/AccountOwnerCell';
import { VisibilityChipCell, type VisibilityChipTone } from '@/crd/components/admin/columns/VisibilityChipCell';
import { SpaceSettingsDialog } from '@/crd/components/admin/spaces/SpaceSettingsDialog';
import { Button } from '@/crd/primitives/button';
import { useAdminListSearch } from '../useAdminListSearch';
import { SpaceLicensePlansDialog } from './SpaceLicensePlansDialog';
import { type AdminSpaceRow, mapSpaceToRow } from './spaceListMapper';

const VISIBILITY_VALUES = [
  SpaceVisibility.Active,
  SpaceVisibility.Archived,
  SpaceVisibility.Demo,
  SpaceVisibility.Inactive,
] as const;

const CrdAdminSpacesPage = () => {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const notify = useNotification();
  const { data, loading } = usePlatformAdminSpacesListQuery();

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [refetchPlatformAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(tApp('pages.admin.space.notifications.space-removed'), 'success'),
  });

  const [updateSpaceSettings, { loading: savingSettings }] = useUpdateSpacePlatformSettingsMutation({
    refetchQueries: [refetchPlatformAdminSpacesListQuery()],
    awaitRefetchQueries: true,
  });

  const rows = (data?.platformAdmin.spaces ?? []).map(mapSpaceToRow);
  const { searchTerm, onSearchTermChange, filteredRows } = useAdminListSearch(rows);

  const [licenseSpaceId, setLicenseSpaceId] = useState<string | null>(null);
  const licenseSpace = licenseSpaceId ? (rows.find(row => row.id === licenseSpaceId) ?? null) : null;

  // Space-settings dialog (alias + visibility) state.
  const [settingsSpaceId, setSettingsSpaceId] = useState<string | null>(null);
  const settingsSpace = settingsSpaceId ? (rows.find(row => row.id === settingsSpaceId) ?? null) : null;
  const [draftNameId, setDraftNameId] = useState('');
  const [draftVisibility, setDraftVisibility] = useState<string>(SpaceVisibility.Active);

  const openSettings = (row: AdminSpaceRow) => {
    setDraftNameId(row.nameId);
    setDraftVisibility(row.visibility);
    setSettingsSpaceId(row.id);
  };

  const saveSettings = () => {
    if (!settingsSpace) return;
    void updateSpaceSettings({
      variables: {
        spaceId: settingsSpace.id,
        nameId: draftNameId.trim(),
        visibility: draftVisibility as SpaceVisibility,
      },
    }).then(() => setSettingsSpaceId(null));
  };

  const visibilityLabels: Record<SpaceVisibility, string> = {
    [SpaceVisibility.Active]: t('spaces.visibilityActive'),
    [SpaceVisibility.Archived]: t('spaces.visibilityArchived'),
    [SpaceVisibility.Demo]: t('spaces.visibilityDemo'),
    [SpaceVisibility.Inactive]: t('spaces.visibilityInactive'),
  };
  const visibilityTones: Record<SpaceVisibility, VisibilityChipTone> = {
    [SpaceVisibility.Active]: 'secondary',
    [SpaceVisibility.Archived]: 'destructive',
    [SpaceVisibility.Demo]: 'outline',
    [SpaceVisibility.Inactive]: 'outline',
  };
  const visibilityOptions = VISIBILITY_VALUES.map(value => ({ value, label: visibilityLabels[value] }));

  const columns: AdminTableColumn<AdminSpaceRow>[] = [
    {
      header: t('columns.spaceVisibility'),
      render: row => (
        <VisibilityChipCell label={visibilityLabels[row.visibility]} tone={visibilityTones[row.visibility]} />
      ),
    },
    { header: t('columns.ownerHeader'), render: row => <AccountOwnerCell owner={row.accountOwner} /> },
  ];

  return (
    <>
      <AdminSearchableTable<AdminSpaceRow>
        rows={filteredRows}
        columns={columns}
        loading={loading}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        paginationMode="client"
        pageSize={10}
        rowActions={row => (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('spaces.editSettings')}
              disabled={!row.canUpdate}
              onClick={() => openSettings(row)}
            >
              <Settings2 aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('licensePlans.manage')}
              onClick={() => setLicenseSpaceId(row.id)}
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />
            </Button>
          </>
        )}
        onDelete={row => {
          void deleteSpace({ variables: { spaceId: row.id } });
        }}
        canDelete={row => row.canUpdate}
      />

      <SpaceSettingsDialog
        open={Boolean(settingsSpace)}
        onOpenChange={open => {
          if (!open) setSettingsSpaceId(null);
        }}
        nameId={draftNameId}
        visibility={draftVisibility}
        visibilityOptions={visibilityOptions}
        onNameIdChange={setDraftNameId}
        onVisibilityChange={setDraftVisibility}
        onSave={saveSettings}
        saving={savingSettings}
        canUpdate={settingsSpace?.canUpdate ?? false}
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
};

export default CrdAdminSpacesPage;
