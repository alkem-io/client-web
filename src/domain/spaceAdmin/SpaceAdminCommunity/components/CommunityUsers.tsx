import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, Link, TextField } from '@mui/material';
import {
  type GridColDef,
  type GridFilterModel,
  type GridInitialState,
  GridLogicOperator,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import DataGridSkeleton from '@/core/ui/table/DataGridSkeleton';
import DataGridTable from '@/core/ui/table/DataGridTable';
import { BlockTitle } from '@/core/ui/typography';
import CommunityAddMembersDialog, { type CommunityAddMembersDialogProps } from '../dialogs/CommunityAddMembersDialog';
import CommunityMemberSettingsDialog from '../dialogs/CommunityMemberSettingsDialog';
import type { CommunityMemberUserFragmentWithRoles } from '../hooks/useCommunityAdmin';
import useCommunityPolicyChecker from '../hooks/useCommunityPolicyChecker';

type RenderParams = GridRenderCellParams<CommunityMemberUserFragmentWithRoles>;
type GetterParams = CommunityMemberUserFragmentWithRoles | undefined;

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

interface CommunityUsersProps {
  users: CommunityMemberUserFragmentWithRoles[] | undefined;
  onUserLeadChange: (userId: string, newValue: boolean) => Promise<unknown> | undefined;
  onUserAuthorizationChange?: (userId: string, newValue: boolean) => Promise<unknown> | undefined;
  onRemoveMember: (userId: string) => Promise<unknown> | undefined;
  canAddUsers: boolean;
  onAddMember: (memberId: string) => Promise<unknown> | undefined;
  fetchAvailableUsers: CommunityAddMembersDialogProps['fetchAvailableEntities'];
  memberRoleDefinition?: {
    organizationPolicy: { minimum: number; maximum: number };
    userPolicy: { minimum: number; maximum: number };
  };
  leadRoleDefinition?: {
    organizationPolicy: { minimum: number; maximum: number };
    userPolicy: { minimum: number; maximum: number };
  };
  loading?: boolean;
}

const CommunityUsers = ({
  users = [],
  onUserLeadChange,
  onUserAuthorizationChange,
  onRemoveMember,
  canAddUsers,
  onAddMember,
  fetchAvailableUsers,
  memberRoleDefinition,
  leadRoleDefinition,
  loading,
}: CommunityUsersProps) => {
  const { t } = useTranslation();
  const { canAddLeadUser, canRemoveLeadUser } = useCommunityPolicyChecker(
    memberRoleDefinition,
    leadRoleDefinition,
    users
  );

  const usersColumns: GridColDef[] = [
    {
      field: 'profile.displayName',
      headerName: t('common.name'),
      renderCell: ({ row }: RenderParams) => (
        <Link href={row.profile?.url} target="_blank">
          {row.profile?.displayName}
        </Link>
      ),
      valueGetter: (_, row: GetterParams) => row?.profile?.displayName,
      flex: 1,
      filterable: false,
    },
    {
      field: 'email',
      headerName: t('common.email'),
      flex: 1,
      filterable: false,
    },
    {
      field: 'isLead',
      headerName: t('common.role'),
      renderCell: ({ row }: RenderParams) => <>{row.isLead ? t('common.lead') : t('common.member')}</>,
      filterable: false,
    },
    {
      field: 'isAdmin',
      headerName: t('common.authorization'),
      renderCell: ({ row }: RenderParams) => <>{row.isAdmin ? t('common.admin') : ''}</>,
      filterable: false,
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

  const [editingUser, setEditingUser] = useState<CommunityMemberUserFragmentWithRoles>();
  const [isAddingNewUser, setAddingNewUser] = useState(false);

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>{t('community.memberUsers', { count: users.length })}</BlockTitle>
        {canAddUsers && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddingNewUser(true)}>
            {t('common.add')}
          </Button>
        )}
      </Box>
      <TextField
        value={filterString}
        onChange={event => handleTopFilterChange(event.target.value)}
        label={t('common.search')}
        placeholder={t('common.search')}
        size="small"
        fullWidth={true}
      />
      <Box minHeight={gutters(25)}>
        {loading ? (
          <DataGridSkeleton />
        ) : (
          <DataGridTable
            rows={users}
            columns={usersColumns}
            actions={[
              {
                name: 'edit',
                render: ({ row }: RenderParams) => {
                  return (
                    <IconButton onClick={() => setEditingUser(row)} aria-label={t('buttons.edit')}>
                      <EditIcon color="primary" />
                    </IconButton>
                  );
                },
              },
            ]}
            initialState={initialState}
            pageSizeOptions={[PAGE_SIZE]}
            filterModel={filterModel}
            disableDelete={() => true}
          />
        )}
      </Box>
      {editingUser && (
        <CommunityMemberSettingsDialog
          member={editingUser}
          onLeadChange={onUserLeadChange}
          canAddLead={canAddLeadUser}
          canRemoveLead={canRemoveLeadUser}
          onAdminChange={onUserAuthorizationChange}
          onRemoveMember={onRemoveMember}
          onClose={() => setEditingUser(undefined)}
        />
      )}
      {isAddingNewUser && (
        <CommunityAddMembersDialog
          onAdd={onAddMember}
          fetchAvailableEntities={fetchAvailableUsers}
          onClose={() => setAddingNewUser(false)}
        />
      )}
    </>
  );
};

export default CommunityUsers;
