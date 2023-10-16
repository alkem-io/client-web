import {
  GridColDef,
  GridFilterModel,
  GridLinkOperator,
  GridRenderCellParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { SettingsSection } from '../../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../../layout/EntitySettingsLayout/types';
import SpaceSettingsLayout from '../SpaceSettingsLayout';
import { Box, IconButton, Link, Skeleton, TextField, Theme, useMediaQuery } from '@mui/material';
import { gutters } from '../../../../../core/ui/grid/utils';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  useDeleteDocumentMutation,
  useSpaceStorageAdminQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, DocumentDataFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { formatFileSize } from '../../../../../core/utils/Storage';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import {
  buildChallengeUrl,
  buildDocumentUrl,
  buildSpaceUrl,
  buildUserProfileUrl,
} from '../../../../../main/routing/urlBuilders';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { compact, sortBy } from 'lodash';
import journeyIcon from '../../../../shared/components/JourneyIcon/JourneyIcon';
import { formatDateTime } from '../../../../../core/utils/time/utils';
import DataGridTable from '../../../../../core/ui/table/DataGridTable';
import { useConfig } from '../../../config/useConfig';

interface SpaceStorageAdminPageProps extends SettingsPageProps {
  spaceId: string | undefined;
}

interface DocumentDataFragmentWithLocation extends DocumentDataFragment {
  location: {
    type: 'space' | 'challenge';
    displayName: string;
    url: string;
  };
}

type RenderParams = GridRenderCellParams<string, DocumentDataFragmentWithLocation>;
type GetterParams = GridValueGetterParams<string, DocumentDataFragmentWithLocation>;

const EmptyFilter = { items: [], linkOperator: GridLinkOperator.Or };

const initialPagination = {
  pagination: {
    page: 0,
    pageSize: 5,
  },
} as const;

const SpaceStorageAdminPage: FC<SpaceStorageAdminPageProps> = ({ spaceId, routePrefix = '../' }) => {
  const { t } = useTranslation();
  const { platform } = useConfig();
  const environmentDomain = platform?.domain ?? '';

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

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
    await refetchDocuments();
    setDeletingDocument(undefined);
  };

  const {
    data,
    loading,
    refetch: refetchDocuments,
  } = useSpaceStorageAdminQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const rows = useMemo(() => {
    return sortBy(
      [
        ...compact(
          data?.space.storageAggregator?.directStorageBucket?.documents.map<DocumentDataFragmentWithLocation>(doc => ({
            ...doc,
            location: {
              type: 'space',
              displayName: data?.space.profile.displayName,
              url: buildSpaceUrl(data?.space.nameID),
            },
          }))
        ),
        ...compact(
          data?.space.challenges?.flatMap(challenge =>
            challenge.storageAggregator?.directStorageBucket?.documents.map<DocumentDataFragmentWithLocation>(doc => ({
              ...doc,
              location: {
                type: 'challenge',
                displayName: challenge.profile.displayName,
                url: buildChallengeUrl(data?.space.nameID, challenge.nameID),
              },
            }))
          )
        ),
      ],
      row => row.displayName
    );
  }, [data]);

  const columns: GridColDef[] = [
    {
      field: 'displayName',
      minWidth: 400,
      renderCell: ({ row }: RenderParams) => (
        <Link href={buildDocumentUrl(environmentDomain, row.id)} target="_blank">
          {row.displayName}
        </Link>
      ),
    },
    {
      field: 'mimeType',
      headerName: t('pages.admin.generic.sections.storage.grid.mimeType'),
      width: 120,
    },
    {
      field: 'size',
      headerName: t('pages.admin.generic.sections.storage.grid.size'),
      type: 'number',
      width: 120,
    },
    {
      field: 'createdBy',
      headerName: t('pages.admin.generic.sections.storage.grid.uploadedBy'),
      minWidth: 150,
      renderCell: ({ row }: RenderParams) =>
        row.createdBy ? (
          <RouterLink to={buildUserProfileUrl(row.createdBy.nameID)}>{row.createdBy.profile.displayName}</RouterLink>
        ) : undefined,
      valueGetter: ({ row }: GetterParams) => row.createdBy?.profile.displayName,
    },
    {
      field: 'uploadedDate',
      headerName: t('pages.admin.generic.sections.storage.grid.uploadedAt'),
      type: 'date',
      minWidth: 200,
      renderCell: ({ row }: RenderParams) => formatDateTime(row.uploadedDate),
    },
    {
      field: 'location',
      headerName: t('common.location'),
      minWidth: 250,
      renderCell: ({ row }: RenderParams) => {
        const JourneyIcon = journeyIcon[row.location.type];
        return (
          <RouterLink to={row.location.url}>
            <JourneyIcon sx={{ verticalAlign: 'bottom', marginRight: gutters(0.5) }} />
            {row.location.displayName}
          </RouterLink>
        );
      },
      valueGetter: ({ row }: GetterParams) => row.location.displayName,
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

        <Box height={gutters(20)}>
          {loading ? (
            <Skeleton />
          ) : (
            <DataGridTable
              rows={rows}
              columns={columns}
              actions={[
                {
                  name: 'view',
                  render: ({ row }) => (
                    <IconButton component={Link} href={buildDocumentUrl(environmentDomain, row.id)} target="_blank">
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
              pageSize={5}
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
