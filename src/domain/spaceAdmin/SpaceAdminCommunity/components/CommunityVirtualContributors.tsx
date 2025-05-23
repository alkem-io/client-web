import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton, Link, TextField } from '@mui/material';
import {
  GridColDef,
  GridFilterModel,
  GridInitialState,
  GridLogicOperator,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import DataGridSkeleton from '@/core/ui/table/DataGridSkeleton';
import DataGridTable from '@/core/ui/table/DataGridTable';
import { BlockTitle } from '@/core/ui/typography';
import CommunityAddMembersDialog from '../dialogs/CommunityAddMembersDialog';
import { Remove } from '@mui/icons-material';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { Actions } from '@/core/ui/actions/Actions';
import { Identifiable } from '@/core/utils/Identifiable';
import InviteVirtualContributorDialog from '@/domain/community/inviteContributors/virtualContributors/InviteVirtualContributorDialog';
import { ContributorViewModel } from '@/domain/community/community/utils/ContributorViewModel';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import { InviteContributorsData } from '@/domain/access/model/InvitationDataModel';

type RenderParams = GridRenderCellParams<ContributorViewModel>;
type GetterParams = ContributorViewModel | undefined;

const EmptyFilter = { items: [], linkOperator: GridLogicOperator.Or };

const PAGE_SIZE = 10;
const initialState: GridInitialState = {
  pagination: {
    paginationModel: {
      page: 0,
      pageSize: PAGE_SIZE,
    },
  },
  sorting: {
    sortModel: [
      {
        field: 'isLead',
        sort: 'desc',
      },
    ],
  },
};

interface Entity extends Identifiable {
  email?: string;
  profile: {
    displayName: string;
  };
}

type CommunityVirtualContributorsProps = {
  virtualContributors: ContributorViewModel[] | undefined;
  onRemoveMember: (memberId: string) => Promise<unknown> | void;
  canAddVirtualContributors: boolean;
  fetchAvailableVirtualContributors: (filter?: string, all?: boolean) => Promise<Entity[] | undefined>;
  fetchAvailableVirtualContributorsInLibrary: (filter?: string) => Promise<Entity[] | undefined>;
  onAddMember: (memberId: string) => Promise<unknown> | undefined | void;
  loading?: boolean;
  inviteContributors: (params: InviteContributorsData) => Promise<unknown>;
  spaceDisplayName?: string;
};

const CommunityVirtualContributors = ({
  virtualContributors = [],
  onRemoveMember,
  canAddVirtualContributors,
  fetchAvailableVirtualContributorsInLibrary,
  fetchAvailableVirtualContributors,
  onAddMember,
  loading,
  inviteContributors,
  spaceDisplayName = '',
}: CommunityVirtualContributorsProps) => {
  const { t } = useTranslation();

  const usersColumns: GridColDef[] = [
    {
      field: 'profile.displayName',
      headerName: t('common.name'),
      renderCell: ({ row }: RenderParams) => (
        <Link href={row.profile.url} target="_blank">
          {row.profile.displayName}
        </Link>
      ),
      valueGetter: (_, row: GetterParams) => row?.profile.displayName,
      filterable: false,
      flex: 1,
    },
  ];

  const [filterString, setFilterString] = useState('');
  const [filterModel, setFilterModel] = useState<GridFilterModel>(EmptyFilter);
  const handleTopFilterChange = (terms: string) => {
    setFilterString(terms);
    if (terms) {
      setFilterModel({
        items: [
          {
            id: 1,
            field: 'profile.displayName',
            operator: 'contains',
            value: terms,
          },
        ],
        logicOperator: GridLogicOperator.And,
      });
    } else {
      setFilterModel(EmptyFilter);
    }
  };

  const [deletingMemberId, setDeletingMemberId] = useState<string>();
  const [isAddingNewMember, setAddingNewMember] = useState(false);
  const [isInvitingExternal, setIsInvitingExternal] = useState(false);
  const [allVirtualContributors, setAllVirtualContributors] = useState(false);
  const [selectedVirtualContributorId, setSelectedVirtualContributorId] = useState<string>('');

  const openAvailableContributorsDialog = (external: boolean = false) => {
    setAllVirtualContributors(external);

    setAddingNewMember(true);
  };

  const getFilteredVirtualContributors = async (filter?: string) => {
    if (allVirtualContributors) {
      return fetchAvailableVirtualContributorsInLibrary(filter);
    } else {
      return fetchAvailableVirtualContributors(filter, false);
    }
  };

  const onAddClick = (virtualContributorId: string) => {
    if (allVirtualContributors) {
      setAddingNewMember(false);
      setIsInvitingExternal(true);
      setSelectedVirtualContributorId(virtualContributorId);
    } else {
      onAddMember(virtualContributorId);
    }
  };

  const closeInvitationDialog = () => setIsInvitingExternal(false);

  const renderInviteButton = (external: boolean = false) => (
    <ButtonWithTooltip
      tooltip={canAddVirtualContributors ? undefined : t('community.virtualContributors.permissionRequiredTooltip')}
      tooltipPlacement="top"
      variant="contained"
      startIcon={<AddIcon />}
      disabled={!canAddVirtualContributors}
      onClick={() => openAvailableContributorsDialog(external)}
    >
      {external ? t('community.invitations.inviteContributorsDialog.vcs.inviteExternalVC') : t('common.add')}
    </ButtonWithTooltip>
  );

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>{t('community.virtualContributors.blockTitle', { count: virtualContributors.length })}</BlockTitle>
        <Actions>
          {renderInviteButton()}
          {renderInviteButton(true)}
        </Actions>
      </Box>
      <TextField
        value={filterString}
        onChange={event => handleTopFilterChange(event.target.value)}
        label={t('common.search')}
        placeholder={t('common.search')}
        size="small"
        fullWidth
      />
      <Box minHeight={gutters(25)}>
        {loading ? (
          <DataGridSkeleton />
        ) : (
          <DataGridTable
            rows={virtualContributors}
            columns={usersColumns}
            actions={[
              {
                name: 'remove',
                render: ({ row }: RenderParams) => {
                  return (
                    <IconButton onClick={() => setDeletingMemberId(row.id)} aria-label={t('buttons.remove')}>
                      <Remove color="primary" />
                    </IconButton>
                  );
                },
              },
            ]}
            initialState={initialState}
            pageSizeOptions={[PAGE_SIZE]}
            filterModel={filterModel}
          />
        )}
      </Box>
      {deletingMemberId && (
        <ConfirmationDialog
          actions={{
            onConfirm: () => {
              onRemoveMember(deletingMemberId!);
              setDeletingMemberId(undefined);
            },
            onCancel: () => setDeletingMemberId(undefined),
          }}
          options={{
            show: Boolean(deletingMemberId),
          }}
          entities={{
            titleId: 'community.virtualContributors.removeDialog.title',
            contentId: 'community.virtualContributors.removeDialog.confirm',
            confirmButtonTextId: 'buttons.remove',
          }}
        />
      )}
      {isAddingNewMember && (
        <CommunityAddMembersDialog
          onAdd={onAddClick}
          fetchAvailableEntities={getFilteredVirtualContributors}
          allowSearchByURL
          onClose={() => setAddingNewMember(false)}
        />
      )}
      {isInvitingExternal && (
        <InviteVirtualContributorDialog
          title={t('community.invitations.inviteContributorsDialog.vcs.dialogTitle')}
          spaceDisplayName={spaceDisplayName}
          open={isInvitingExternal}
          onClose={closeInvitationDialog}
          contributorId={selectedVirtualContributorId}
          onInviteVirtualContributor={inviteContributors}
        />
      )}
    </>
  );
};

export default CommunityVirtualContributors;
