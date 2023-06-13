import { Avatar, Box, Button, IconButton, Link, TextField } from '@mui/material';
import {
  GridColDef,
  GridFilterModel,
  GridInitialState,
  GridLinkOperator,
  GridRenderCellParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { FC, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { buildOrganizationUrl } from '../../../../common/utils/urlBuilders';
import { OrganizationDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import { gutters } from '../../../../core/ui/grid/utils';
import DataGridSkeleton from '../../../../core/ui/table/DataGridSkeleton';
import DataGridTable from '../../../../core/ui/table/DataGridTable';
import { BlockTitle } from '../../../../core/ui/typography';
import CommunityMemberSettingsDialog from './CommunityMemberSettingsDialog';

export interface OrganizationDetailsFragmentWithRoles extends OrganizationDetailsFragment {
  isMember: boolean;
  isLead: boolean;
  isFaicilitating: boolean;
}

type RenderParams = GridRenderCellParams<string, OrganizationDetailsFragmentWithRoles>;
type GetterParams = GridValueGetterParams<string, OrganizationDetailsFragmentWithRoles>;

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

interface CommunityOrganizationsProps {
  organizations: OrganizationDetailsFragmentWithRoles[] | undefined;
  onOrganizationLeadChange: (organizationId, newValue) => Promise<unknown> | void;
  onRemoveMember: (organizationId) => Promise<unknown> | void;
  loading?: boolean;
}

const CommunityOrganizations: FC<CommunityOrganizationsProps> = ({
  organizations = [],
  onOrganizationLeadChange,
  onRemoveMember,
  loading,
}) => {
  const { t } = useTranslation();

  const organizationsColumns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: t('common.avatar'),
      renderHeader: () => <>{t('common.avatar')}</>,
      sortable: false,
      filterable: false,
      renderCell: ({ row }: RenderParams) => (
        <Link href={buildOrganizationUrl(row.nameID)} target="_blank">
          <Avatar src={row.profile.visual?.uri} />
        </Link>
      ),
    },
    {
      field: 'profile.displayName',
      headerName: t('common.name'),
      renderHeader: () => <>{t('common.name')}</>,
      renderCell: ({ row }: RenderParams) => (
        <Link href={buildOrganizationUrl(row.nameID)} target="_blank">
          {row.profile.displayName}
        </Link>
      ),
      valueGetter: ({ row }: GetterParams) => row.profile.displayName,
      flex: 1,
      resizable: true,
    },
    {
      field: 'isLead',
      headerName: t('common.role'),
      renderHeader: () => <>{t('common.role')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.isLead ? t('common.lead') : t('common.member')}</>,
    },
    {
      field: 'isFaicilitating',
      headerName: t('common.authorization'),
      renderHeader: () => <>{t('common.authorization')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.isFaicilitating ? t('pages.community.hub-host.title') : ''}</>,
      width: 200,
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

  const [editingOrganization, setEditingOrganization] = useState<OrganizationDetailsFragmentWithRoles>();

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>{t('community.memberOrganizations', { count: organizations.length })}</BlockTitle>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {}}>
          {t('common.add')}
        </Button>
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
                render: ({ row }) => (
                  <IconButton onClick={() => setEditingOrganization(row)}>
                    <EditIcon color="primary" />
                  </IconButton>
                ),
              },
            ]}
            flex={{
              displayName: 1,
            }}
            initialState={initialState}
            filterModel={filterModel}
            pageSize={10}
            disableDelete={() => true}
          />
        )}
      </Box>
      {editingOrganization && (
        <CommunityMemberSettingsDialog
          member={editingOrganization}
          onLeadChange={onOrganizationLeadChange}
          onRemoveMember={onRemoveMember}
          onClose={() => setEditingOrganization(undefined)}
        />
      )}
    </>
  );
};

export default CommunityOrganizations;
