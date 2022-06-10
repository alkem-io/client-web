import React, { FC, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import makeStyles from '@mui/styles/makeStyles';
import { ClassNameMap } from '@mui/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { OrganizationDetailsFragment } from '../../../../models/graphql-schema';
import Avatar from '../../../../components/core/Avatar';
import { Filter } from '../../../../components/Admin/Common/Filter';
import DashboardGenericSection from '../../../../components/composite/common/sections/DashboardGenericSection';
import useLazyLoading from '../../../shared/pagination/useLazyLoading';
import { v4 as uuid } from 'uuid';
import FullWidthSkeleton from '../../../shared/components/FullWidthLoader';

const useStyles = makeStyles(theme => ({
  iconButtonSuccess: {
    color: theme.palette.success.main,
  },
  iconButtonNegative: {
    color: theme.palette.negative.main,
  },
  gridContainer: {
    height: 400,
    paddingTop: theme.spacing(1),
  },
}));

interface AdminCommunityOrganizationsViewProps extends Omit<EditOrganizationsProps, 'available' | 'existing'> {
  headerText: string;
  existingOrganizations: OrganizationDetailsFragment[];
  availableOrganizations: OrganizationDetailsFragment[];
}

const AdminCommunityOrganizationsView = ({
  headerText,
  existingOrganizations,
  availableOrganizations,
  ...editViewProps
}: AdminCommunityOrganizationsViewProps) => {
  return (
    <DashboardGenericSection headerText={headerText}>
      <EditOrganizations
        available={toOrganizationDetailsVm(availableOrganizations)}
        existing={toOrganizationDetailsVm(existingOrganizations)}
        {...editViewProps}
      />
    </DashboardGenericSection>
  );
};

interface OrganizationDetailsVm {
  id: string;
  avatarSrc: string;
  name: string;
  tags?: string;
}

const toOrganizationDetailsVm = (prop: OrganizationDetailsFragment[]) => {
  return prop.map(
    x =>
      ({
        id: x.id,
        avatarSrc: x.profile?.avatar?.uri ?? '',
        name: x.displayName,
        tags: (x.profile?.tagsets || []).flatMap(y => y.tags).join(', '),
      } as OrganizationDetailsVm)
  );
};

export interface EditOrganizationsProps {
  existing: OrganizationDetailsVm[];
  available: OrganizationDetailsVm[];
  onAdd: (orgId: string) => void;
  onRemove: (orgId: string) => void;
  updating: boolean;
  fetchMore: (amount?: number) => Promise<void>;
  onSearchTermChange: (term: string) => void;
  hasMore: boolean | undefined;
  loading: boolean;
}

const LoadingCellMarker = `__loading_${uuid()}`;

const optionallyAddLoaderRow = <Item,>(items: Item[], hasMore: boolean, ref: Ref<HTMLElement>) => {
  if (!hasMore) {
    return items;
  }
  return [
    ...items,
    {
      id: LoadingCellMarker,
      ref,
      avatarSrc: LoadingCellMarker,
    },
  ];
};

const EditOrganizations: FC<EditOrganizationsProps> = ({
  existing,
  available,
  onAdd,
  onRemove,
  updating = false,
  fetchMore,
  hasMore = false,
  loading,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const lazyLoading = useLazyLoading({
    fetchMore,
    loading,
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Filter
          data={existing}
          placeholder={t('pages.lead-organization.search.leading-placeholder')}
          limitKeys={['name', 'tags']}
        >
          {filteredData => (
            <div className={styles.gridContainer}>
              <DataGrid
                rows={filteredData}
                columns={existingColumns(t, styles, onRemove)}
                density="compact"
                hideFooter={true}
                loading={updating}
                disableColumnFilter={true}
              />
            </div>
          )}
        </Filter>
      </Grid>
      <Grid item xs={6}>
        <Filter
          data={available}
          placeholder={t('pages.lead-organization.search.available-placeholder')}
          limitKeys={['name']}
        >
          {filteredData => (
            <div className={styles.gridContainer}>
              <DataGrid
                rows={optionallyAddLoaderRow(filteredData, hasMore, lazyLoading.ref)}
                columns={availableColumns(t, styles, onAdd)}
                density="compact"
                hideFooter={true}
                loading={updating}
                disableColumnFilter={true}
              />
            </div>
          )}
        </Filter>
      </Grid>
    </Grid>
  );
};

export default AdminCommunityOrganizationsView;

const existingColumns = (t: TFunction, styles: ClassNameMap, onRemove: (orgId: string) => void): GridColDef[] => [
  {
    field: 'avatarSrc',
    headerName: t('common.avatar'),
    width: 130,
    renderCell: params => <Avatar src={params.value as string} />,
  },
  { field: 'name', headerName: 'Name', flex: 1 },
  {
    field: 'tags',
    headerName: t('common.tags'),
    flex: 1,
  },
  {
    field: 'id',
    width: 140,
    headerName: t('common.remove'),
    renderCell: params => (
      <IconButton
        aria-label="Remove"
        className={styles.iconButtonNegative}
        size="small"
        onClick={() => onRemove(params.value as string)}
      >
        <RemoveIcon />
      </IconButton>
    ),
    align: 'right',
  },
];

const availableColumns = (t: TFunction, styles: ClassNameMap, onAdd: (orgId: string) => void): GridColDef[] => [
  {
    field: 'id',
    width: 110,
    headerName: t('common.add'),
    renderCell: params =>
      params.value === LoadingCellMarker ? (
        <FullWidthSkeleton ref={params.row.ref} />
      ) : (
        <IconButton
          aria-label="Add"
          className={styles.iconButtonSuccess}
          size="small"
          onClick={() => onAdd(params.value as string)}
        >
          <AddIcon />
        </IconButton>
      ),
  },
  {
    field: 'avatarSrc',
    headerName: t('common.avatar'),
    width: 130,
    renderCell: params =>
      params.value === LoadingCellMarker ? <FullWidthSkeleton /> : <Avatar src={params.value as string} />,
  },
  {
    field: 'name',
    headerName: t('common.name'),
    flex: 1,
    renderCell: params => params.value ?? <FullWidthSkeleton />,
  },
];
