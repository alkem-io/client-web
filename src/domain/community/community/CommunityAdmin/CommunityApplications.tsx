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
import {
  AdminCommunityApplicationFragment,
  AdminCommunityInvitationExternalFragment,
  AdminCommunityInvitationFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import { ApplicationDialog } from '../../application/dialogs/ApplicationDialog';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { formatDateTime } from '../../../../core/utils/time/utils';
import useLoadingState from '../../../shared/utils/useLoadingState';
import RemoveIcon from '@mui/icons-material/Remove';
enum CandidateType {
  Application,
  Invitation,
  InvitationExternal,
}

type TableItem =
  | (AdminCommunityApplicationFragment & { type: CandidateType.Application })
  | (AdminCommunityInvitationFragment & { type: CandidateType.Invitation })
  | (AdminCommunityInvitationExternalFragment & {
      type: CandidateType.InvitationExternal;
      lifecycle?: undefined;
      user?: undefined;
    });

type RenderParams = GridRenderCellParams<string, TableItem>;
type GetterParams = GridValueGetterParams<string, TableItem>;

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

const getDeleteDialogTranslationNamespace = (row: TableItem) => {
  switch (row.type) {
    case CandidateType.Application:
      return 'confirmDeleteApplication';
    case CandidateType.Invitation:
      return 'confirmDeleteInvitation';
    case CandidateType.InvitationExternal:
      return 'confirmDeleteInvitationExternal';
  }
};

const formatState = (item: TableItem, t: TFunction<'translation', undefined>) => {
  if (item.type === CandidateType.Application) {
    switch (item.lifecycle.state) {
      case 'new':
        return <strong>{t('community.applicationStatus.applicationReceived')}</strong>;
      case 'approved':
        return t('community.applicationStatus.applicationApproved');
      case 'rejected':
        return t('community.applicationStatus.applicationRejected');
      case 'archived':
        return t('community.applicationStatus.applicationArchived');
    }
  } else if (item.type === CandidateType.Invitation) {
    switch (item.lifecycle.state) {
      case 'invited':
        return t('community.invitationStatus.invited');
      case 'accepted':
        return t('community.invitationStatus.accepted');
      case 'rejected':
        return t('community.invitationStatus.rejected');
    }
  } else {
    return t('community.invitationExternalStatus.invited');
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
    default:
      return 0;
  }
};

interface CommunityApplicationsProps {
  applications: AdminCommunityApplicationFragment[] | undefined;
  onApplicationStateChange: (applicationId: string, state: string) => Promise<unknown>;
  canHandleInvitations?: boolean;
  invitations?: AdminCommunityInvitationFragment[] | undefined;
  invitationsExternal?: AdminCommunityInvitationExternalFragment[] | undefined;
  onInvitationStateChange?: (invitationId: string, state: string) => Promise<unknown>;
  onDeleteInvitation?: (invitationId: string) => Promise<unknown>;
  onDeleteInvitationExternal?: (invitationId: string) => Promise<unknown>;
  loading?: boolean;
}

const NO_DATA_PLACEHOLDER = '—';

const CommunityApplications: FC<CommunityApplicationsProps> = ({
  applications = [],
  onApplicationStateChange,
  canHandleInvitations = false,
  invitations = [],
  invitationsExternal = [],
  onInvitationStateChange,
  onDeleteInvitation,
  onDeleteInvitationExternal,
  loading,
}) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<TableItem>();
  const [deletingItem, setDeletingItem] = useState<TableItem>();

  const tableItems = useMemo<TableItem[]>(
    () => [
      ...applications.map(application => ({ ...application, type: CandidateType.Application } as const)),
      ...invitations.map(invitation => ({ ...invitation, type: CandidateType.Invitation } as const)),
      ...invitationsExternal.map(
        invitationExternal => ({ ...invitationExternal, type: CandidateType.InvitationExternal } as const)
      ),
    ],
    [applications, invitations, invitationsExternal]
  );

  const columnDefinitions: GridColDef[] = [
    {
      field: 'user.profile.displayName',
      headerName: t('fields.name'),
      renderHeader: () => <>{t('fields.name')}</>,
      renderCell: ({ row }: RenderParams) => {
        if (row.type === CandidateType.InvitationExternal) {
          return NO_DATA_PLACEHOLDER;
        }
        return (
          <Link href={buildUserProfileUrl(row.user.nameID)} target="_blank">
            {row.user.profile.displayName}
          </Link>
        );
      },
      valueGetter: ({ row }: GetterParams) => row.user?.profile.displayName,
      resizable: true,
    },
    {
      field: 'user.email',
      headerName: t('common.email'),
      renderHeader: () => <>{t('common.email')}</>,
      renderCell: ({ row }: RenderParams) => (
        <>{row.type === CandidateType.InvitationExternal ? row.email : row.user.email}</>
      ),
      valueGetter: ({ row }: GetterParams) =>
        row.type === CandidateType.InvitationExternal ? row.email : row.user.email,
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
      renderCell: ({ row }: RenderParams) => formatState(row, t),
      valueGetter: ({ row }: GetterParams) => sortState(row.lifecycle?.state),
      filterable: false, // TODO maybe... (has to be a combobox, maybe when we implement invitations)
    },
  ];

  const visibleTableItems = useMemo(
    () => tableItems.filter(item => item.lifecycle?.state !== 'archived'),
    [tableItems]
  );

  const [handleDeleteItem, isDeletingItem] = useLoadingState(async (item: TableItem) => {
    if (item.type === CandidateType.Application) {
      switch (item.lifecycle.state) {
        case 'new': {
          await onApplicationStateChange(item.id, 'REJECT');
          await onApplicationStateChange(item.id, 'ARCHIVE');
          break;
        }
        case 'approved':
        case 'rejected': {
          await onApplicationStateChange(item.id, 'ARCHIVE');
          break;
        }
      }
    } else if (item.type === CandidateType.Invitation) {
      switch (item.lifecycle.state) {
        case 'invited': {
          await onDeleteInvitation?.(item.id);
          break;
        }
        // TODO: invitations do not have 'approved' state, they have 'accepted' state
        case 'approved':
        case 'rejected': {
          await onInvitationStateChange?.(item.id, 'ARCHIVE');
          break;
        }
      }
    } else {
      await onDeleteInvitationExternal?.(item.id);
    }
    setDeletingItem(undefined);
  });

  const renderDeleteColumn = (row: TableItem) => {
    return (
      // TODO: Disabled for approved Applications for now: see #2900
      <IconButton
        onClick={() => setDeletingItem(row)}
        disabled={row.lifecycle?.state === 'approved'}
        aria-label={t('buttons.delete')}
      >
        {row.type === CandidateType.Invitation &&
        (row.lifecycle.state === 'approved' || row.lifecycle.state === 'rejected') ? (
          <RemoveIcon color="error" />
        ) : (
          <DeleteIcon color={row.lifecycle?.state === 'approved' ? 'disabled' : 'error'} />
        )}
      </IconButton>
    );
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>
          {t(canHandleInvitations ? 'community.pendingMemberships' : 'community.pendingApplications')}
        </BlockTitle>
        <Tooltip title={t('community.applicationsHelp')} arrow>
          <IconButton aria-label={t('common.help')}>
            <HelpOutlineIcon sx={{ color: theme => theme.palette.common.black }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box minHeight={gutters(10)}>
        {loading ? (
          <DataGridSkeleton />
        ) : (
          <DataGridTable
            rows={visibleTableItems}
            columns={columnDefinitions}
            actions={[
              {
                name: 'view',
                render: ({ row }: { row: TableItem }) =>
                  /* TODO: handle row type here and decide if show button or not, Application, invitation ... */
                  row.__typename === 'Application' && (
                    <IconButton onClick={() => setSelectedItem(row)} aria-label={t('buttons.view')}>
                      <VisibilityOutlinedIcon color="primary" />
                    </IconButton>
                  ),
              },
              {
                name: 'delete',
                render: ({ row }: { row: TableItem }) => renderDeleteColumn(row),
              },
            ]}
            initialState={initialState}
            pageSize={10}
            disableDelete={() => true}
          />
        )}
      </Box>
      {selectedItem && selectedItem.type === CandidateType.Application && (
        <ApplicationDialog
          app={selectedItem}
          onClose={() => setSelectedItem(undefined)}
          onSetNewState={onApplicationStateChange}
        />
      )}
      {deletingItem && (
        <ConfirmationDialog
          actions={{
            onConfirm: () => handleDeleteItem(deletingItem),
            onCancel: () => setDeletingItem(undefined),
          }}
          options={{
            show: Boolean(deletingItem),
          }}
          entities={{
            title: t(`community.${getDeleteDialogTranslationNamespace(deletingItem)}.title` as const, {
              user: deletingItem.user?.profile.displayName,
            }),
            content: t(`community.${getDeleteDialogTranslationNamespace(deletingItem)}.content` as const),
            confirmButtonTextId: 'buttons.archive',
          }}
          state={{
            isLoading: isDeletingItem,
          }}
        />
      )}
    </>
  );
};

export default CommunityApplications;
