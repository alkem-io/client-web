import { Box, IconButton, Link, Tooltip } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { BlockTitle } from '../../../../core/ui/typography';
import DataGridSkeleton from '../../../../core/ui/table/DataGridSkeleton';
import DataGridTable from '../../../../core/ui/table/DataGridTable';
import { GridColDef, GridInitialState, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { gutters } from '../../../../core/ui/grid/utils';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { ApplicationInfoFragment } from '../../../../core/apollo/generated/graphql-schema';
import { buildUserProfileUrl } from '../../../../common/utils/urlBuilders';
import { ApplicationDialog } from '../../application/dialogs/ApplicationDialog';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { formatDateTime } from '../../../../core/utils/time/utils';
import useLoadingState from '../../../shared/utils/useLoadingState';

type RenderParams = GridRenderCellParams<string, ApplicationInfoFragment>;
type GetterParams = GridValueGetterParams<string, ApplicationInfoFragment>;

const initialState: GridInitialState = {
  pagination: {
    page: 0,
    pageSize: 5,
  },
  sorting: {
    sortModel: [
      {
        field: 'state',
        sort: 'desc',
      },
    ],
  },
};

// Format of Application/Invitation states
const formatState = (state: string | undefined, t: TFunction<'translation', undefined>) => {
  switch (state) {
    case 'new':
      return <strong>{t('community.applicationStatus.applicationReceived')}</strong>;
    case 'approved':
      return t('community.applicationStatus.applicationApproved');
    case 'rejected':
      return t('community.applicationStatus.applicationRejected');
    case 'archived':
      return t('community.applicationStatus.applicationArchived');
    // TODO: (Handle Invitations)
    /*  InvitationAccepted,
    InvitationRejected,
    InvitedToAlkemio,
    InvitedToSpace,
    */
  }
};

const sortState = (state: string | undefined) => {
  switch (state) {
    case 'new':
      return 100;
    case 'approved':
      return 50;
    case 'rejected':
      return 50;
    case 'archived':
      return 10;
    // TODO: (Handle Invitations)
  }
};

interface CommunityApplicationsProps {
  // TODO: In the near future this will also receive invitations
  applications: ApplicationInfoFragment[] | undefined;
  onApplicationStateChange: (applicationId: string, state: string) => Promise<unknown>;
  loading?: boolean;
}

const CommunityApplications: FC<CommunityApplicationsProps> = ({
  applications = [],
  onApplicationStateChange,
  loading,
}) => {
  const { t } = useTranslation();
  const [applicationSelected, setApplicationSelected] = useState<ApplicationInfoFragment>();
  const [deletingApplication, setDeletingApplication] = useState<ApplicationInfoFragment>();

  const applicationsColumns: GridColDef[] = [
    {
      field: 'user.profile.displayName',
      headerName: t('fields.name'),
      renderHeader: () => <>{t('fields.name')}</>,
      renderCell: ({ row }: RenderParams) => (
        <Link href={buildUserProfileUrl(row.user.nameID)} target="_blank">
          {row.user.profile.displayName}
        </Link>
      ),
      valueGetter: ({ row }: GetterParams) => row.user.profile.displayName,
      resizable: true,
    },
    {
      field: 'user.email',
      headerName: t('common.email'),
      renderHeader: () => <>{t('common.email')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.user.email}</>,
      valueGetter: ({ row }: GetterParams) => row.user.email,
      resizable: true,
    },
    {
      field: 'createdDate',
      headerName: t('common.date'),
      minWidth: 200,
      type: 'date',
      renderHeader: () => <>{t('common.date')}</>,
      renderCell: ({ row }: RenderParams) => formatDateTime(row.createdDate),
    },
    {
      field: 'state',
      headerName: t('common.status'),
      minWidth: 200,
      renderHeader: () => <>{t('common.status')}</>,
      renderCell: ({ row }: RenderParams) => formatState(row.lifecycle.state, t),
      valueGetter: ({ row }: GetterParams) => sortState(row.lifecycle.state),
      filterable: false, // TODO maybe... (has to be a combobox, maybe when we implement invitations)
    },
  ];

  const visibleApplications = useMemo(
    () => applications.filter(application => application.lifecycle.state !== 'archived'),
    [applications]
  );

  const [handleApplicationDelete, loadingDeleteApplication] = useLoadingState(
    async (application: ApplicationInfoFragment) => {
      switch (application.lifecycle.state) {
        case 'new': {
          await onApplicationStateChange(application.id, 'REJECT');
          await onApplicationStateChange(application.id, 'ARCHIVE');
          break;
        }
        case 'approved': {
          await onApplicationStateChange(application.id, 'ARCHIVE');
          break;
        }
        case 'rejected': {
          await onApplicationStateChange(application.id, 'ARCHIVE');
          break;
        }
      }
      setDeletingApplication(undefined);
    }
  );

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>{t('community.pendingApplications')}</BlockTitle>
        <Tooltip title={t('community.applicationsHelp')} arrow>
          <IconButton>
            <HelpOutlineIcon sx={{ color: theme => theme.palette.common.black }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box minHeight={gutters(10)}>
        {loading ? (
          <DataGridSkeleton />
        ) : (
          <DataGridTable
            rows={visibleApplications}
            columns={applicationsColumns}
            actions={[
              {
                name: 'view',
                render: ({ row }) => (
                  /* TODO: handle row type here and decide if show button or not, Application, invitation ... */
                  <IconButton onClick={() => setApplicationSelected(row)}>
                    <VisibilityOutlinedIcon color="primary" />
                  </IconButton>
                ),
              },
              {
                name: 'delete',
                render: ({ row }: { row: ApplicationInfoFragment }) => (
                  // TODO: Disabled for approved Applications for now: see #2900
                  <IconButton onClick={() => setDeletingApplication(row)} disabled={row.lifecycle.state === 'approved'}>
                    <DeleteIcon color={row.lifecycle.state === 'approved' ? 'disabled' : 'error'} />
                  </IconButton>
                ),
              },
            ]}
            flex={{
              'user.profile.displayName': 1,
              'user.email': 1,
            }}
            initialState={initialState}
            pageSize={10}
            disableDelete={() => true}
          />
        )}
      </Box>
      {applicationSelected && (
        <ApplicationDialog
          app={applicationSelected}
          onClose={() => setApplicationSelected(undefined)}
          onSetNewState={onApplicationStateChange}
        />
      )}
      {deletingApplication && (
        <ConfirmationDialog
          actions={{
            onConfirm: () => handleApplicationDelete(deletingApplication),
            onCancel: () => setDeletingApplication(undefined),
          }}
          options={{
            show: Boolean(deletingApplication),
          }}
          entities={{
            title: t('community.confirmDeleteApplication.title', {
              user: deletingApplication.user.profile.displayName,
            }),
            content: t('community.confirmDeleteApplication.content'),
            confirmButtonTextId: 'buttons.archive',
          }}
          state={{
            isLoading: loadingDeleteApplication,
          }}
        />
      )}
    </>
  );
};

export default CommunityApplications;
