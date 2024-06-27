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
  AdminPlatformInvitationCommunityFragment,
  AdminCommunityInvitationFragment,
  CommunityContributorType,
  User,
} from '../../../../core/apollo/generated/graphql-schema';
import { ApplicationDialog } from '../../application/dialogs/ApplicationDialog';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { formatDateTime } from '../../../../core/utils/time/utils';
import useLoadingState from '../../../shared/utils/useLoadingState';
import RemoveIcon from '@mui/icons-material/Remove';

enum MembershipType {
  Application,
  Invitation,
  PlatformInvitation,
}

type MembershipTableItem = {
  id: string;
  type: MembershipType;
  contributorType: CommunityContributorType;
  url: string;
  displayName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lifecycle?: any;
  email?: string;
  createdDate: Date;
  updatedDate?: Date;
  questions: {
    id: string;
    name: string;
    value: string;
  }[];
  contributor?: {
    id: string;
    nameID: string;
    profile: {
      displayName: string;
      avatar?: {
        uri: string;
      };
      location?: {
        city: string;
        country: string;
      };
      url: string;
    };
  };
};

type RenderParams = GridRenderCellParams<string, MembershipTableItem>;
type GetterParams = GridValueGetterParams<string, MembershipTableItem>;

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

const getDeleteDialogTranslationNamespace = (row: MembershipTableItem) => {
  switch (row.type) {
    case MembershipType.Application:
      return 'confirmDeleteApplication';
    case MembershipType.Invitation:
      return 'confirmDeleteInvitation';
    case MembershipType.PlatformInvitation:
      return 'confirmDeletePlatformInvitation';
  }
};

const formatState = (item: MembershipTableItem, t: TFunction<'translation', undefined>) => {
  if (item.type === MembershipType.Application) {
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
  } else if (item.type === MembershipType.Invitation) {
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
  platformInvitations?: AdminPlatformInvitationCommunityFragment[] | undefined;
  onInvitationStateChange?: (invitationId: string, state: string) => Promise<unknown>;
  onDeleteInvitation?: (invitationId: string) => Promise<unknown>;
  onDeletePlatformInvitation?: (invitationId: string) => Promise<unknown>;
  loading?: boolean;
}

const NO_DATA_PLACEHOLDER = '—';

const CreatePendingMembershipForApplication = (application: AdminCommunityApplicationFragment) => {
  const applicant = application.contributor;
  const result: MembershipTableItem = {
    id: application.id,
    type: MembershipType.Application,
    contributorType: CommunityContributorType.User,
    displayName: applicant.profile.displayName,
    url: applicant.profile.url,
    lifecycle: application.lifecycle,
    email: (applicant as User).email,
    createdDate: new Date(application.createdDate),
    updatedDate: new Date(application.updatedDate),
    contributor: applicant,
    questions: application.questions,
  } as const;
  return result;
};

const CreatePendingMembershipForInvitation = (invitation: AdminCommunityInvitationFragment) => {
  const contributor = invitation.contributor;
  const result: MembershipTableItem = {
    id: invitation.id,
    type: MembershipType.Invitation,
    contributorType: invitation.contributorType,
    displayName: contributor.profile.displayName,
    url: contributor.profile.url,
    lifecycle: invitation.lifecycle,
    email: (contributor as User).email,
    createdDate: new Date(invitation.createdDate),
    updatedDate: new Date(invitation.updatedDate),
    contributor: contributor,
    questions: [],
  };
  return result;
};

const CreatePendingMembershipForPlatformInvitation = (invitation: AdminPlatformInvitationCommunityFragment) => {
  const result: MembershipTableItem = {
    id: invitation.id,
    type: MembershipType.PlatformInvitation,
    contributorType: CommunityContributorType.User,
    displayName: invitation.email,
    url: '',
    email: invitation.email,
    createdDate: new Date(invitation.createdDate),
    questions: [],
  };
  return result;
};

const CommunityApplications: FC<CommunityApplicationsProps> = ({
  applications = [],
  onApplicationStateChange,
  canHandleInvitations = false,
  invitations = [],
  platformInvitations = [],
  onInvitationStateChange,
  onDeleteInvitation,
  onDeletePlatformInvitation,
  loading,
}) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<MembershipTableItem>();
  const [deletingItem, setDeletingItem] = useState<MembershipTableItem>();

  const tableItems = useMemo<MembershipTableItem[]>(
    () => [
      ...applications.map(application => CreatePendingMembershipForApplication(application)),
      ...invitations.map(invitation => CreatePendingMembershipForInvitation(invitation)),
      ...platformInvitations.map(platformInvitation =>
        CreatePendingMembershipForPlatformInvitation(platformInvitation)
      ),
    ],
    [applications, invitations, platformInvitations]
  );

  const columnDefinitions: GridColDef[] = [
    {
      field: 'user.profile.displayName',
      headerName: t('fields.name'),
      renderHeader: () => <>{t('fields.name')}</>,
      renderCell: ({ row }: RenderParams) => {
        if (row.type === MembershipType.PlatformInvitation) {
          return NO_DATA_PLACEHOLDER;
        }
        return (
          <Link href={row.url} target="_blank">
            {row.displayName}
          </Link>
        );
      },
      valueGetter: ({ row }: GetterParams) => row.displayName,
      resizable: true,
    },
    {
      field: 'user.email',
      headerName: t('common.email'),
      renderHeader: () => <>{t('common.email')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.email}</>,
      valueGetter: ({ row }: GetterParams) => row.email,
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
    {
      field: 'contributorType',
      headerName: t('common.type'),
      renderHeader: () => <>{t('common.type')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.contributorType}</>,
      valueGetter: ({ row }: GetterParams) => row.contributorType,
      filterable: false, //
    },
  ];

  const visibleTableItems = useMemo(
    () => tableItems.filter(item => item.lifecycle?.state !== 'archived'),
    [tableItems]
  );

  const [handleDeleteItem, isDeletingItem] = useLoadingState(async (item: MembershipTableItem) => {
    if (item.type === MembershipType.Application) {
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
    } else if (item.type === MembershipType.Invitation) {
      switch (item.lifecycle.state) {
        case 'invited': {
          await onDeleteInvitation?.(item.id);
          break;
        }
        case 'approved':
        case 'rejected': {
          await onInvitationStateChange?.(item.id, 'ARCHIVE');
          break;
        }
      }
    } else {
      await onDeletePlatformInvitation?.(item.id);
    }
    setDeletingItem(undefined);
  });

  const renderDeleteColumn = (row: MembershipTableItem) => {
    return (
      // TODO: Disabled for approved Applications for now: see #2900
      <IconButton
        onClick={() => setDeletingItem(row)}
        disabled={row.lifecycle?.state === 'approved'}
        aria-label={t('buttons.delete')}
      >
        {row.type === MembershipType.Invitation &&
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
                render: ({ row }: { row: MembershipTableItem }) =>
                  /* TODO: handle row type here and decide if show button or not, Application, invitation ... */
                  row.type === MembershipType.Application && (
                    <IconButton onClick={() => setSelectedItem(row)} aria-label={t('buttons.view')}>
                      <VisibilityOutlinedIcon color="primary" />
                    </IconButton>
                  ),
              },
              {
                name: 'delete',
                render: ({ row }: { row: MembershipTableItem }) => renderDeleteColumn(row),
              },
            ]}
            initialState={initialState}
            pageSize={10}
            disableDelete={() => true}
          />
        )}
      </Box>
      {selectedItem && selectedItem.type === MembershipType.Application && (
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
              user: deletingItem.displayName,
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
