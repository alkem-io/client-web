import AddIcon from '@mui/icons-material/Add';
import { Box, Button, IconButton, Link, TextField } from '@mui/material';
import {
  GridColDef,
  GridFilterModel,
  GridInitialState,
  GridLinkOperator,
  GridRenderCellParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommunityMemberVirtualContributorFragment } from '../../../../core/apollo/generated/graphql-schema';
import { gutters } from '../../../../core/ui/grid/utils';
import DataGridSkeleton from '../../../../core/ui/table/DataGridSkeleton';
import DataGridTable from '../../../../core/ui/table/DataGridTable';
import { BlockTitle } from '../../../../core/ui/typography';
import CommunityAddMembersDialog from './CommunityAddMembersDialog';
import { Remove } from '@mui/icons-material';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { Actions } from '../../../../core/ui/actions/Actions';
import { Identifiable } from '../../../../core/utils/Identifiable';
import InviteVirtualContributorDialog from '../../invitations/InviteVirtualContributorDialog';
import { InviteContributorsData } from '../../invitations/useInviteUsers';

type RenderParams = GridRenderCellParams<string, CommunityMemberVirtualContributorFragment>;
type GetterParams = GridValueGetterParams<string, CommunityMemberVirtualContributorFragment>;

const EmptyFilter = { items: [], linkOperator: GridLinkOperator.Or };

const initialState: GridInitialState = {
  pagination: {
    page: 0,
    pageSize: 10,
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

interface CommunityVirtualContributorsProps {
  virtualContributors: CommunityMemberVirtualContributorFragment[] | undefined;
  onRemoveMember: (memberId: string) => Promise<unknown> | void;
  canAddVirtualContributors: boolean;
  fetchAvailableVirtualContributorsOnAccount: (filter?: string, all?: boolean) => Promise<Entity[] | undefined>;
  fetchAvailableVirtualContributors: (filter?: string) => Promise<Entity[] | undefined>;
  onAddMember: (memberId: string) => Promise<unknown> | undefined | void;
  loading?: boolean;
  inviteExistingUser: (params: InviteContributorsData) => Promise<void>;
  spaceDisplayName?: string;
}

const CommunityVirtualContributors: FC<CommunityVirtualContributorsProps> = ({
  virtualContributors = [],
  onRemoveMember,
  canAddVirtualContributors,
  fetchAvailableVirtualContributors,
  fetchAvailableVirtualContributorsOnAccount,
  onAddMember,
  loading,
  inviteExistingUser,
  spaceDisplayName = '',
}) => {
  const { t } = useTranslation();

  const usersColumns: GridColDef[] = [
    {
      field: 'profile.displayName',
      headerName: t('common.name'),
      renderHeader: () => <>{t('common.name')}</>,
      renderCell: ({ row }: RenderParams) => (
        <Link href={row.profile.url} target="_blank">
          {row.profile.displayName}
        </Link>
      ),
      valueGetter: ({ row }: GetterParams) => row.profile.displayName,
      resizable: true,
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
            columnField: 'profile.displayName',
            operatorValue: 'contains',
            value: terms,
          },
        ],
        linkOperator: GridLinkOperator.And,
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
      return fetchAvailableVirtualContributors(filter);
    } else {
      return fetchAvailableVirtualContributorsOnAccount(filter, false);
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

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>{t('community.virtualContributors.blockTitle', { count: virtualContributors.length })}</BlockTitle>
        {canAddVirtualContributors && (
          <Actions>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAvailableContributorsDialog()}>
              {t('common.add')}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAvailableContributorsDialog(true)}>
              {t('community.virtualContributors.inviteExternalVC')}
            </Button>
          </Actions>
        )}
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
                render: ({ row }: { row: CommunityMemberVirtualContributorFragment }) => {
                  return (
                    <IconButton onClick={() => setDeletingMemberId(row.id)} aria-label={t('buttons.remove')}>
                      <Remove color="primary" />
                    </IconButton>
                  );
                },
              },
            ]}
            initialState={initialState}
            filterModel={filterModel}
            pageSize={10}
            disableDelete={() => true}
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
          title={t('components.invitations.inviteExistingVCDialog.title')}
          spaceDisplayName={spaceDisplayName}
          open={isInvitingExternal}
          onClose={closeInvitationDialog}
          contributorId={selectedVirtualContributorId}
          onInviteUser={inviteExistingUser}
        />
      )}
    </>
  );
};

export default CommunityVirtualContributors;
