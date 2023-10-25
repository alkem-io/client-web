import {
  GridColDef,
  GridFilterModel,
  GridLinkOperator,
  GridRenderCellParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { SettingsSection } from '../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../layout/EntitySettingsLayout/types';
import SpaceSettingsLayout from '../SpaceSettingsLayout';
import {
  Box,
  BoxProps,
  CircularProgress,
  IconButton,
  Link,
  LinkProps,
  Skeleton,
  TextField,
  Theme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { gutters } from '../../../../../core/ui/grid/utils';
import { useDeleteDocumentMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, DocumentDataFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { formatFileSize } from '../../../../../core/utils/Storage';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import { buildUserProfileUrl } from '../../../../../main/routing/urlBuilders';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { times } from 'lodash';
import { formatDateTime } from '../../../../../core/utils/time/utils';
import DataGridTable from '../../../../../core/ui/table/DataGridTable';
import useStorageAdminTree, { StorageAdminGridRow } from './useStorageAdminTree';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Caption } from '../../../../../core/ui/typography';

interface SpaceStorageAdminPageProps extends SettingsPageProps {
  spaceNameId: string;
}

type RenderParams = GridRenderCellParams<string, StorageAdminGridRow>;
type GetterParams = GridValueGetterParams<string, StorageAdminGridRow>;

const EmptyFilter = { items: [], linkOperator: GridLinkOperator.Or };

const PAGE_SIZE = 100;
const initialPagination = {
  pagination: {
    page: 0,
    pageSize: PAGE_SIZE,
  },
} as const;

const IconWrapper = (props: BoxProps) => <Box {...props} sx={{ width: gutters(1), marginX: gutters(0.5) }} />;

const ExpandButton = ({ row, onClick }: { row: RenderParams['row']; onClick: LinkProps['onClick'] }) => {
  const theme = useTheme();
  return (
    <>
      {row.loading ? (
        <IconWrapper>
          <CircularProgress size={gutters(1)(theme)} />
        </IconWrapper>
      ) : row.expandable ? (
        <IconWrapper>
          <Link onClick={onClick} sx={{ cursor: 'pointer' }}>
            {row.open ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
          </Link>
        </IconWrapper>
      ) : (
        // Leave the space:
        <IconWrapper />
      )}
    </>
  );
};
const FileTypeIcon = ({ row }: { row: RenderParams['row'] }) =>
  row.iconComponent ? <IconWrapper component={row.iconComponent} /> : <IconWrapper />;

const TitleIndent = ({ row }: { row: RenderParams['row'] }) => (
  <>
    {times(row.nestLevel, () => (
      <IconWrapper />
    ))}
  </>
);

const SpaceStorageAdminPage: FC<SpaceStorageAdminPageProps> = ({ spaceNameId, routePrefix = '../' }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { data, openBranch, closeBranch, loading, reload } = useStorageAdminTree({ spaceNameId });

  const [filterString, setFilterString] = useState('');
  const [filterModel, setFilterModel] = useState<GridFilterModel>(EmptyFilter);
  const handleTopFilterChange = (terms: string) => {
    setFilterString(terms);
    if (terms) {
      setFilterModel({
        items: [
          {
            id: 1,
            columnField: 'displayName',
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

  const [deletingDocument, setDeletingDocument] = useState<Pick<DocumentDataFragment, 'id' | 'displayName'>>();
  const [deleteDocument, { loading: isDeleting }] = useDeleteDocumentMutation();
  const handleDeleteDocument = async () => {
    if (!deletingDocument) {
      return;
    }
    await deleteDocument({
      variables: { documentId: deletingDocument.id },
    });
    await reload();
    setDeletingDocument(undefined);
  };

  const columns: GridColDef[] = [
    {
      field: 'displayName',
      minWidth: 400,
      renderCell: ({ row }: RenderParams) => (
        <>
          <TitleIndent row={row} />
          <ExpandButton row={row} onClick={() => (row.open ? closeBranch(row.id) : openBranch(row.id))} />
          <FileTypeIcon row={row} />
          <Link href={row.url} target="_blank">
            <Caption sx={{ display: 'inline', color: 'red' }}>{row.type}</Caption> {row.displayName}
          </Link>
        </>
      ),
    },
    {
      field: 'size',
      headerName: t('pages.admin.generic.sections.storage.grid.size'),
      type: 'number',
      width: 120,
    },
    {
      field: 'uplodadedBy',
      headerName: t('pages.admin.generic.sections.storage.grid.uploadedBy'),
      minWidth: 150,
      renderCell: ({ row }: RenderParams) =>
        row.uplodadedBy ? (
          <RouterLink to={buildUserProfileUrl(row.uplodadedBy.nameId)}>{row.uplodadedBy.displayName}</RouterLink>
        ) : undefined,
      valueGetter: ({ row }: GetterParams) => row.uplodadedBy?.displayName,
    },
    {
      field: 'uploadedDate',
      headerName: t('pages.admin.generic.sections.storage.grid.uploadedAt'),
      type: 'date',
      minWidth: 200,
      renderCell: ({ row }: RenderParams) => (row.uploadedAt ? formatDateTime(row.uploadedAt) : undefined),
    },
  ];

  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Storage} tabRoutePrefix={routePrefix}>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.admin.generic.sections.storage.title')} />
        <Box width={isMobile ? '100%' : '50%'}>
          <TextField
            value={filterString}
            onChange={event => handleTopFilterChange(event.target.value)}
            label={t('common.search')}
            placeholder={t('common.search')}
            size="small"
            fullWidth
          />
        </Box>

        <Box>
          {loading ? (
            <Skeleton />
          ) : (
            <DataGridTable
              rows={data}
              columns={columns}
              actions={[
                {
                  name: 'view',
                  render: ({ row }) => (
                    <IconButton component={Link} href={(row as RenderParams['row']).url} target="_blank">
                      <VisibilityOutlinedIcon color="primary" />
                    </IconButton>
                  ),
                },
              ]}
              format={{
                size: file => formatFileSize(file.size),
              }}
              flex={{
                displayName: 1,
              }}
              filterModel={filterModel}
              onFilterModelChange={setFilterModel}
              initialState={initialPagination}
              pageSize={PAGE_SIZE}
              onDelete={file => setDeletingDocument(file)}
              canDelete={file => file.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete)}
              disableDelete={() => true}
            />
          )}
        </Box>
      </PageContentBlock>
      <ConfirmationDialog
        actions={{
          onConfirm: handleDeleteDocument,
          onCancel: () => setDeletingDocument(undefined),
        }}
        options={{
          show: Boolean(deletingDocument),
        }}
        entities={{
          titleId: 'pages.admin.generic.sections.storage.delete.title',
          content: t('pages.admin.generic.sections.storage.delete.content', {
            fileName: deletingDocument?.displayName,
          }),
          confirmButtonTextId: 'buttons.delete',
        }}
        state={{
          isLoading: isDeleting,
        }}
      />
    </SpaceSettingsLayout>
  );
};

export default SpaceStorageAdminPage;
