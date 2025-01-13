import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, Link, TextField } from '@mui/material';
import {
  GridColDef,
  GridFilterModel,
  GridInitialState,
  GridLinkOperator,
  GridRenderCellParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RoleSetMemberUserFragment, RoleDefinitionPolicyFragment } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import DataGridSkeleton from '@/core/ui/table/DataGridSkeleton';
import DataGridTable from '@/core/ui/table/DataGridTable';
import { BlockTitle } from '@/core/ui/typography';
import CommunityAddMembersDialog, { CommunityAddMembersDialogProps } from './CommunityAddMembersDialog';
import CommunityMemberSettingsDialog from './CommunityMemberSettingsDialog';
import useCommunityPolicyChecker from './useCommunityPolicyChecker';

export interface CommunityMemberUserFragmentWithRoles extends RoleSetMemberUserFragment {
  isMember: boolean;
  isLead: boolean;
  isAdmin: boolean;
  isContactable: boolean;
}

type RenderParams = GridRenderCellParams<string, CommunityMemberUserFragmentWithRoles>;
type GetterParams = GridValueGetterParams<string, CommunityMemberUserFragmentWithRoles>;

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

interface CommunityUsersProps {
  users: CommunityMemberUserFragmentWithRoles[] | undefined;
  onUserLeadChange: (userId: string, newValue: boolean) => Promise<unknown> | void;
  onUserAuthorizationChange?: (userId: string, newValue: boolean) => Promise<unknown> | void;
  onRemoveMember: (userId: string) => Promise<unknown> | void;
  canAddMembers: boolean;
  onAddMember: (memberId: string) => Promise<unknown> | undefined;
  fetchAvailableUsers: CommunityAddMembersDialogProps['fetchAvailableEntities'];
  memberRoleDefinition?: RoleDefinitionPolicyFragment;
  leadRoleDefinition?: RoleDefinitionPolicyFragment;
  loading?: boolean;
}

const CommunityUsers = ({
  users = [],
  onUserLeadChange,
  onUserAuthorizationChange,
  onRemoveMember,
  canAddMembers,
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
      renderHeader: () => <>{t('common.name')}</>,
      renderCell: ({ row }: RenderParams) => (
        <Link href={row.profile.url} target="_blank">
          {row.profile.displayName}
        </Link>
      ),
      valueGetter: ({ row }: GetterParams) => row.profile.displayName,
      resizable: true,
    },
    {
      field: 'email',
      headerName: t('common.email'),
      renderHeader: () => <>{t('common.email')}</>,
      resizable: true,
    },
    {
      field: 'isLead',
      headerName: t('common.role'),
      renderHeader: () => <>{t('common.role')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.isLead ? t('common.lead') : t('common.member')}</>,
    },
    {
      field: 'isAdmin',
      headerName: t('common.authorization'),
      renderHeader: () => <>{t('common.authorization')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.isAdmin ? t('common.admin') : ''}</>,
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

  const [editingUser, setEditingUser] = useState<CommunityMemberUserFragmentWithRoles>();
  const [isAddingNewUser, setAddingNewUser] = useState(false);

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>{t('community.memberUsers', { count: users.length })}</BlockTitle>
        {canAddMembers && (
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
        fullWidth
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
                render: ({ row }: { row: CommunityMemberUserFragmentWithRoles }) => {
                  return (
                    <IconButton onClick={() => setEditingUser(row)} aria-label={t('buttons.edit')}>
                      <EditIcon color="primary" />
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
