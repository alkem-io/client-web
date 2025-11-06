import React, { FC, useMemo, useState, useEffect, useCallback } from 'react';
import {
  refetchPlatformAdminSpacesListQuery,
  usePlatformAdminSpacesListQuery,
  useDeleteSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import Loading from '@/core/ui/loading/Loading';
import { SpaceVisibility, SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import SearchableListLayout from '@/domain/shared/components/SearchableList/SearchableListLayout';
import AdminSearchableTable, { AdminTableColumn } from '@/domain/platformAdmin/components/AdminSearchableTable';
import { Chip, IconButton } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { AccountOwnerColumn } from '@/domain/platformAdmin/components/AdminListItemLayout';
import { SpaceTableItem } from '@/domain/platformAdmin/types/AdminTableItems';
import SpaceSettingsDialog from '@/domain/platformAdmin/domain/space/AdminSpaceListPage/SpaceSettingsDialog';

const INITIAL_PAGE_SIZE = 10;
const PAGE_SIZE = 10;

/**
 * SpaceList - Optimized version that loads minimal data upfront
 * Supports client-side pagination with "show more" functionality
 */
export const SpaceList: FC = () => {
  const notify = useNotification();
  const { t } = useTranslation();

  const { data: spacesData, loading: loadingSpaces } = usePlatformAdminSpacesListQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedItemsCount, setDisplayedItemsCount] = useState(INITIAL_PAGE_SIZE);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<SpaceTableItem | null>(null);

  // Reset pagination when search term changes
  useEffect(() => {
    setDisplayedItemsCount(INITIAL_PAGE_SIZE);
  }, [searchTerm]);

  const columns: AdminTableColumn<SpaceTableItem>[] = useMemo(
    () => [
      {
        header: 'Visibility',
        flex: 1,
        minWidth: '120px',
        render: (item: SpaceTableItem) => (
          <Chip
            label={item.visibility}
            size="small"
            color={item.visibility === SpaceVisibility.Active ? 'success' : 'default'}
            variant="outlined"
          />
        ),
      },
      {
        header: 'Privacy Mode',
        flex: 1,
        minWidth: '120px',
        render: (item: SpaceTableItem) =>
          item.privacyMode ? (
            <Chip
              label={item.privacyMode}
              size="small"
              color={item.privacyMode === SpacePrivacyMode.Public ? 'info' : 'default'}
              variant="outlined"
            />
          ) : (
            ''
          ),
      },
      {
        header: 'Account Owner',
        flex: 1,
        minWidth: '150px',
        render: (item: SpaceTableItem) => <AccountOwnerColumn accountOwner={item.accountOwner} />,
      },
    ],
    []
  );

  const allSpaces = useMemo(() => {
    const spaces = spacesData?.platformAdmin.spaces ?? [];

    return spaces
      .map(space => {
        const displayName =
          space.visibility !== SpaceVisibility.Active
            ? `${space.about.profile.displayName} [${space.visibility.toUpperCase()}]`
            : space.about.profile.displayName;

        // ideally we should check for privileges but this prevents managing the license from a License Manger
        // note that the settings are visible to all global roles but only GA and LicenseManger can update the Licenses
        const canUpdate = true; // (space.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Update);
        const accountOwner = space.about.provider?.profile?.displayName || 'N/A';
        const privacyMode: SpacePrivacyMode | undefined = undefined; // TODO: server#5565 GlobalSupport doesn't have access to settings yet

        return {
          id: space.id,
          spaceId: space.id,
          nameId: space.nameID,
          visibility: space.visibility,
          privacyMode,
          accountOwner,
          url: buildSettingsUrl(space.about.profile.url),
          value: displayName,
          canUpdate,
        } as SpaceTableItem;
      })
      .filter(space => !searchTerm || space.value.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [spacesData, searchTerm]);

  // Paginated spaces for display
  const spaceList = useMemo(() => {
    return allSpaces.slice(0, displayedItemsCount);
  }, [allSpaces, displayedItemsCount]);

  const hasMore = displayedItemsCount < allSpaces.length;

  // Use useCallback WITHOUT isFetchingMore in dependencies to prevent recreation
  const fetchMore = useCallback(async () => {
    setDisplayedItemsCount(prev => {
      const next = prev + PAGE_SIZE;
      return Math.min(next, allSpaces.length);
    });
  }, [allSpaces.length]);

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [refetchPlatformAdminSpacesListQuery()],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.space.notifications.space-removed'), 'success'),
  });

  const handleDelete = (item: SpaceTableItem) => {
    deleteSpace({
      variables: {
        spaceId: item.id,
      },
    });
  };

  const handleSettingsClick = (item: SpaceTableItem) => {
    setSelectedSpace(item);
    setSettingsDialogOpen(true);
  };

  if (loadingSpaces) return <Loading text={'Loading spaces'} />;

  const itemActions = (item: SpaceTableItem) => (
    <IconButton
      onClick={() => handleSettingsClick(item)}
      size="large"
      aria-label={t('pages.admin.spaces.spaceSettings')}
      disabled={!item.canUpdate}
    >
      <SettingsOutlinedIcon />
    </IconButton>
  );

  return (
    <SearchableListLayout>
      <AdminSearchableTable
        data={spaceList}
        columns={columns}
        onDelete={handleDelete}
        loading={false}
        fetchMore={fetchMore}
        pageSize={PAGE_SIZE}
        firstPageSize={INITIAL_PAGE_SIZE}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        totalCount={allSpaces.length}
        hasMore={hasMore}
        itemActions={itemActions}
      />
      <SpaceSettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        space={selectedSpace}
      />
    </SearchableListLayout>
  );
};

export default SpaceList;
