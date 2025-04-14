import { Avatar, Box, Button, IconButton, Link, TextField } from '@mui/material';
import {
  GridColDef,
  GridFilterModel,
  GridInitialState,
  GridLogicOperator,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { gutters } from '@/core/ui/grid/utils';
import DataGridSkeleton from '@/core/ui/table/DataGridSkeleton';
import DataGridTable from '@/core/ui/table/DataGridTable';
import { BlockTitle } from '@/core/ui/typography';
import CommunityMemberSettingsDialog from '../dialogs/CommunityMemberSettingsDialog';
import CommunityAddMembersDialog, { CommunityAddMembersDialogProps } from '../dialogs/CommunityAddMembersDialog';
import useCommunityPolicyChecker from '../hooks/useCommunityPolicyChecker';
import { ContributorViewProps } from '../../../community/community/EntityDashboardContributorsSection/Types';

export interface OrganizationDetailsFragmentWithRoles extends ContributorViewProps {
  isMember: boolean;
  isLead: boolean;
}

type RenderParams = GridRenderCellParams<OrganizationDetailsFragmentWithRoles>;
type GetterParams = OrganizationDetailsFragmentWithRoles | undefined;

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

interface CommunityOrganizationsProps {
  organizations: OrganizationDetailsFragmentWithRoles[] | undefined;
  onOrganizationLeadChange: (organizationId, newValue) => Promise<unknown> | void;
  canAddMembers: boolean;
  onAddMember: (organizationId) => Promise<unknown> | undefined;
  fetchAvailableOrganizations: CommunityAddMembersDialogProps['fetchAvailableEntities'];
  onRemoveMember: (organizationId) => Promise<unknown> | void;
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

const CommunityOrganizations = ({
  organizations = [],
  onOrganizationLeadChange,
  canAddMembers,
  onAddMember,
  fetchAvailableOrganizations,
  onRemoveMember,
  memberRoleDefinition,
  leadRoleDefinition,
  loading,
}: CommunityOrganizationsProps) => {
  const { t } = useTranslation();
  const { canAddLeadOrganization, canRemoveLeadOrganization } = useCommunityPolicyChecker(
    memberRoleDefinition,
    leadRoleDefinition,
    organizations
  );

  const organizationsColumns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: t('common.avatar'),
      sortable: false,
      filterable: false,
      renderCell: ({ row }: RenderParams) => (
        <Link href={row.profile.url} target="_blank">
          <Avatar src={row.profile.avatar?.uri} alt={t('common.avatar-of', { user: row.profile.displayName })} />
        </Link>
      ),
    },
    {
      field: 'profile.displayName',
      headerName: t('common.name'),
      renderCell: ({ row }: RenderParams) => (
        <Link href={row.profile.url} target="_blank">
          {row.profile.displayName}
        </Link>
      ),
      valueGetter: (_, row: GetterParams) => row?.profile.displayName,
      flex: 1,
      resizable: true,
      filterable: false,
    },
    {
      field: 'isLead',
      headerName: t('common.role'),
      renderCell: ({ row }: RenderParams) => <>{row.isLead ? t('common.lead') : t('common.member')}</>,
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

  const [editingOrganization, setEditingOrganization] = useState<OrganizationDetailsFragmentWithRoles>();
  const [isAddingNewOrganization, setAddingNewOrganization] = useState(false);

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>{t('community.memberOrganizations', { count: organizations.length })}</BlockTitle>
        {canAddMembers && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddingNewOrganization(true)}>
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
            rows={organizations}
            columns={organizationsColumns}
            actions={[
              {
                name: 'edit',
                render: ({ row }: RenderParams) => (
                  <IconButton onClick={() => setEditingOrganization(row)} aria-label={t('buttons.edit')}>
                    <EditIcon color="primary" />
                  </IconButton>
                ),
              },
            ]}
            initialState={initialState}
            pageSizeOptions={[PAGE_SIZE]}
            filterModel={filterModel}
            disableDelete={() => true}
          />
        )}
      </Box>
      {editingOrganization && (
        <CommunityMemberSettingsDialog
          member={editingOrganization}
          onLeadChange={onOrganizationLeadChange}
          canAddLead={canAddLeadOrganization}
          canRemoveLead={canRemoveLeadOrganization}
          onRemoveMember={onRemoveMember}
          onClose={() => setEditingOrganization(undefined)}
        />
      )}
      {isAddingNewOrganization && (
        <CommunityAddMembersDialog
          onAdd={onAddMember}
          fetchAvailableEntities={fetchAvailableOrganizations}
          onClose={() => setAddingNewOrganization(false)}
        />
      )}
    </>
  );
};

export default CommunityOrganizations;
