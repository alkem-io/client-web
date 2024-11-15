import { GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { SettingsSection } from '../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../layout/EntitySettingsLayout/types';
import SpaceSettingsLayout from '../SpaceSettingsLayout';
import { Box, BoxProps, CircularProgress, IconButton, Link, LinkProps, Skeleton, useTheme } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { useDeleteDocumentMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, DocumentDataFragment } from '@/core/apollo/generated/graphql-schema';
import { formatFileSize } from '@/core/utils/Storage';
import RouterLink from '@/core/ui/link/RouterLink';
import { buildUserProfileUrl } from '@/main/routing/urlBuilders';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { times } from 'lodash';
import { formatDateTime } from '@/core/utils/time/utils';
import DataGridTable from '@/core/ui/table/DataGridTable';
import useStorageAdminTree, { StorageAdminGridRow } from './useStorageAdminTree';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface SpaceStorageAdminPageProps extends SettingsPageProps {
  spaceId: string;
}

type RenderParams = GridRenderCellParams<string, StorageAdminGridRow>;
type GetterParams = GridValueGetterParams<string, StorageAdminGridRow>;

const PAGE_SIZE = 100;
const initialPagination = {
  pagination: {
    page: 0,
    pageSize: PAGE_SIZE,
  },
} as const;

const IconWrapper = (props: BoxProps) => <Box {...props} width={gutters(1)} marginX={gutters(0.5)} />;

const ExpandButton = ({ row, onClick }: { row: RenderParams['row']; onClick: LinkProps['onClick'] }) => {
  const theme = useTheme();
  return (
    <>
      {row.loading ? (
        <IconWrapper>
          <CircularProgress size={gutters(1)(theme)} />
        </IconWrapper>
      ) : row.collapsible ? (
        <IconWrapper>
          <Link onClick={onClick} sx={{ cursor: 'pointer' }}>
            {row.collapsed ? <ArrowRightIcon /> : <ArrowDropDownIcon />}
          </Link>
        </IconWrapper>
      ) : null}
    </>
  );
};
const FileTypeIcon = ({ row }: { row: RenderParams['row'] }) =>
  row.iconComponent ? <IconWrapper component={row.iconComponent} /> : <IconWrapper />;

const TitleIndent = ({ row }: { row: RenderParams['row'] }) => (
  <>
    {times(row.nestLevel, index => (
      <IconWrapper key={`indent_${index}`} />
    ))}
  </>
);

const SpaceStorageAdminPage: FC<SpaceStorageAdminPageProps> = ({ spaceId, routePrefix = '../' }) => {
  const { t } = useTranslation();

  const { data, openBranch, closeBranch, loading, reload } = useStorageAdminTree({
    spaceId,
  });

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

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'displayName',
        headerName: t('pages.admin.generic.sections.storage.grid.displayName'),
        minWidth: 400,
        renderCell: ({ row }: RenderParams) => (
          <>
            <TitleIndent row={row} />
            <ExpandButton row={row} onClick={() => (row.collapsed ? openBranch(row.id) : closeBranch(row.id))} />
            <FileTypeIcon row={row} />
            <Link href={row.url} target="_blank">
              {row.displayName}
            </Link>
          </>
        ),
        sortable: false,
        filterable: false,
      },
      {
        field: 'size',
        headerName: t('pages.admin.generic.sections.storage.grid.size'),
        type: 'number',
        width: 120,
        sortable: false,
        filterable: false,
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
        sortable: false,
        filterable: false,
      },
      {
        field: 'uploadedDate',
        headerName: t('pages.admin.generic.sections.storage.grid.uploadedAt'),
        type: 'date',
        minWidth: 200,
        renderCell: ({ row }: RenderParams) => (row.uploadedAt ? formatDateTime(row.uploadedAt) : undefined),
        sortable: false,
        filterable: false,
      },
    ],
    []
  );

  return (
    <SpaceSettingsLayout currentTab={SettingsSection.Storage} tabRoutePrefix={routePrefix}>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.admin.generic.sections.storage.title')} />
        {/*
        Search box removed temporarily
        <Box width={isMobile ? '100%' : '50%'}>
          <TextField
            value={filterString}
            onChange={event => setFilterString(event.target.value)}
            label={t('common.search')}
            placeholder={t('common.search')}
            size="small"
            fullWidth
          />
        </Box>
        */}
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
                  render: ({ row }) => {
                    const data = row as RenderParams['row'];
                    return data.url ? (
                      <IconButton component={Link} href={data.url} target="_blank" aria-label={t('buttons.open')}>
                        {data.collapsible ? (
                          <ArrowForwardIcon fontSize="small" color="primary" />
                        ) : (
                          <OpenInNewIcon fontSize="small" color="primary" />
                        )}
                      </IconButton>
                    ) : undefined;
                  },
                },
              ]}
              format={{
                size: file => formatFileSize(file.size),
              }}
              flex={{
                displayName: 1,
              }}
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
