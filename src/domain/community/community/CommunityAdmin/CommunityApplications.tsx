import { Box, IconButton, Link, Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { BlockTitle } from '@/core/ui/typography';
import DataGridSkeleton from '@/core/ui/table/DataGridSkeleton';
import DataGridTable from '@/core/ui/table/DataGridTable';
import { GridColDef, GridInitialState, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { gutters } from '@/core/ui/grid/utils';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { RoleSetContributorType, User } from '@/core/apollo/generated/graphql-schema';
import { ApplicationDialog } from '@/domain/community/application/dialogs/ApplicationDialog';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { formatDateTime } from '@/core/utils/time/utils';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import RemoveIcon from '@mui/icons-material/Remove';

enum MembershipType {
  Application,
  Invitation,
  PlatformInvitation,
}

type MembershipTableItem = {
  id: string;
  type: MembershipType;
  contributorType: RoleSetContributorType;
  url: string;
  displayName: string;
  state?: string;
  nextEvents: string[];
  email?: string;
  createdDate: Date | undefined;
  updatedDate?: Date;
  questions: {
    id: string;
    name: string;
    value: string;
  }[];
  contributor?: {
    id: string;
    profile: {
      displayName: string;
      avatar?: {
        uri: string;
      };
      location?: {
        city?: string;
        country?: string;
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
    switch (item.state) {
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
    switch (item.state) {
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

type CommunityApplication = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: Array<string>;
  contributorType: RoleSetContributorType;
  contributor: {
    id: string;
    profile: {
      displayName: string;
      email?: string;
      url: string;
      avatar?: { uri: string; name: string };
      location?: { city?: string; country?: string };
    };
  };
  questions: { id: string; name: string; value: string }[];
};

type CommunityInvitation = {
  id: string;
  createdDate: Date;
  updatedDate: Date;
  state: string;
  nextEvents: Array<string>;
  contributorType: RoleSetContributorType;
  contributor: {
    id: string;
    profile: {
      displayName: string;
      url: string;
      avatar?: { uri: string };
      location?: { city?: string; country?: string };
    };
  };
};

type PlatformInvitation = {
  id: string;
  createdDate?: Date;
  email: string;
};

interface CommunityApplicationsProps {
  applications: CommunityApplication[] | undefined;
  onApplicationStateChange: (applicationId: string, state: string) => Promise<unknown>;
  canHandleInvitations?: boolean;
  invitations?: CommunityInvitation[] | undefined;
  platformInvitations?: PlatformInvitation[] | undefined;
  onInvitationStateChange?: (invitationId: string, state: string) => Promise<unknown>;
  onDeleteInvitation?: (invitationId: string) => Promise<unknown>;
  onDeletePlatformInvitation?: (invitationId: string) => Promise<unknown>;
  loading?: boolean;
}

const NO_DATA_PLACEHOLDER = '—';

const CreatePendingMembershipForApplication = (application: CommunityApplication) => {
  const applicant = application.contributor;
  const result: MembershipTableItem = {
    id: application.id,
    type: MembershipType.Application,
    contributorType: RoleSetContributorType.User,
    displayName: applicant.profile.displayName,
    url: applicant.profile.url,
    state: application.state,
    nextEvents: application.nextEvents || [],
    email: (applicant as User).email,
    createdDate: new Date(application.createdDate),
    updatedDate: new Date(application.updatedDate),
    contributor: applicant,
    questions: application.questions,
  } as const;
  return result;
};

const CreatePendingMembershipForInvitation = (invitation: CommunityInvitation) => {
  const contributor = invitation.contributor;
  const result: MembershipTableItem = {
    id: invitation.id,
    type: MembershipType.Invitation,
    contributorType: invitation.contributorType,
    displayName: contributor.profile.displayName,
    nextEvents: invitation.nextEvents || [],
    url: contributor.profile.url,
    state: invitation.state,
    email: (contributor as User).email,
    createdDate: new Date(invitation.createdDate),
    updatedDate: new Date(invitation.updatedDate),
    contributor: contributor,
    questions: [],
  };
  return result;
};

const CreatePendingMembershipForPlatformInvitation = (invitation: PlatformInvitation) => {
  const result: MembershipTableItem = {
    id: invitation.id,
    type: MembershipType.PlatformInvitation,
    contributorType: RoleSetContributorType.User,
    nextEvents: [],
    displayName: invitation.email,
    url: '',
    email: invitation.email,
    createdDate: invitation.createdDate ? new Date(invitation.createdDate) : undefined,
    questions: [],
  };
  return result;
};

const CommunityApplications = ({
  applications = [],
  onApplicationStateChange,
  canHandleInvitations = false,
  invitations = [],
  platformInvitations = [],
  onInvitationStateChange,
  onDeleteInvitation,
  onDeletePlatformInvitation,
  loading,
}: CommunityApplicationsProps) => {
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
      renderCell: ({ row }: RenderParams) => (row.createdDate ? formatDateTime(row.createdDate) : ''),
    },
    {
      field: 'state',
      headerName: t('common.status'),
      minWidth: 200,
      renderHeader: () => <>{t('common.status')}</>,
      renderCell: ({ row }: RenderParams) => formatState(row, t),
      valueGetter: ({ row }: GetterParams) => sortState(row.state),
      filterable: false, // TODO maybe... (has to be a combobox, maybe when we implement invitations)
    },
    {
      field: 'contributorType',
      headerName: t('common.type'),
      renderHeader: () => <>{t('common.type')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.contributorType}</>,
      valueGetter: ({ row }: GetterParams) => row.contributorType,
      filterable: false,
    },
  ];

  const visibleTableItems = useMemo(() => tableItems.filter(item => item.state !== 'archived'), [tableItems]);

  const [handleDeleteItem, isDeletingItem] = useLoadingState(async (item: MembershipTableItem) => {
    if (item.type === MembershipType.Application) {
      switch (item.state) {
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
      switch (item.state) {
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
        disabled={row?.state === 'approved'}
        aria-label={t('buttons.delete')}
      >
        {row.type === MembershipType.Invitation && (row.state === 'approved' || row.state === 'rejected') ? (
          <RemoveIcon color="error" />
        ) : (
          <DeleteIcon color={row?.state === 'approved' ? 'disabled' : 'error'} />
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
