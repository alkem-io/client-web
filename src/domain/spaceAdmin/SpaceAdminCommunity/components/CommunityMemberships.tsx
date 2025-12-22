import { Box, Link } from '@mui/material';
import { useMemo, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import DataGridSkeleton from '@/core/ui/table/DataGridSkeleton';
import DataGridTable from '@/core/ui/table/DataGridTable';
import { GridColDef, GridInitialState, GridRenderCellParams } from '@mui/x-data-grid';
import { gutters } from '@/core/ui/grid/utils';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { RoleSetContributorType, User } from '@/core/apollo/generated/graphql-schema';
import { CommunityApplicationDialog } from '@/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityApplicationDialog/CommunityApplicationDialog';
import { CommunityInvitationDialog } from './CommunityInvitationDialog/CommunityInvitationDialog';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { formatDateTime } from '@/core/utils/time/utils';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { MembershipTableItem } from '../../../access/model/MembershipTableItem';
import { MembershipType } from '../../../access/model/MembershipType';
import { ApplicationModel } from '@/domain/access/model/ApplicationModel';
import { InvitationModel } from '@/domain/access/model/InvitationModel';
import DataGridActionButton from '@/core/ui/table/DataGridActionButton';
import {
  ApplicationEvent,
  ApplicationState,
  InvitationEvent,
  InvitationState,
} from '@/domain/community/invitations/InvitationApplicationConstants';

type RenderParams = GridRenderCellParams<MembershipTableItem>;
type GetterParams = MembershipTableItem | undefined;
enum ActionType {
  Approve = 'approve',
  Reject = 'reject',
  Delete = 'delete',
}

const PAGE_SIZE = 5;
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
        field: 'state',
        sort: 'desc',
      },
    ],
  },
};

const formatState = (item: MembershipTableItem, t: TFunction) => {
  if (item.type === MembershipType.Application) {
    switch (item.state) {
      case ApplicationState.NEW:
        return <strong>{t('community.applicationStatus.applicationReceived')}</strong>;
      case ApplicationState.APPROVED:
        return t('community.applicationStatus.applicationApproved');
      case ApplicationState.REJECTED:
        return t('community.applicationStatus.applicationRejected');
      case ApplicationState.ARCHIVED:
        return t('community.applicationStatus.applicationArchived');
    }
  } else if (item.type === MembershipType.Invitation) {
    switch (item.state) {
      case InvitationState.INVITED:
        return t('common.enums.invitationStatus.invited');
      case InvitationState.ACCEPTED:
        return t('common.enums.invitationStatus.accepted');
      case InvitationState.REJECTED:
        return t('common.enums.invitationStatus.rejected');
    }
  } else {
    return t('common.enums.invitationExternalStatus.invited');
  }
};

const sortState = (item: MembershipTableItem | undefined): number => {
  if (!item) {
    return 0;
  }
  const state = item.state;
  switch (state) {
    case ApplicationState.NEW:
      return 100;
    case ApplicationState.APPROVED:
      return 50;
    case ApplicationState.REJECTED:
      return 50;
    case ApplicationState.ARCHIVED:
      return 10;
    default: {
      switch (item.type) {
        case MembershipType.Application:
          return 20;
        case MembershipType.Invitation:
          return 30;
        case MembershipType.PlatformInvitation:
          return 40;
        default:
          return 0;
      }
    }
  }
};

type PlatformInvitation = {
  id: string;
  createdDate?: Date;
  email: string;
};

interface CommunityApplicationsProps {
  applications: ApplicationModel[] | undefined;
  onApplicationStateChange: (applicationId: string, state: string) => Promise<unknown>;
  invitations?: InvitationModel[] | undefined;
  platformInvitations?: PlatformInvitation[] | undefined;
  onInvitationStateChange?: (invitationId: string, state: string) => Promise<unknown>;
  onDeleteInvitation?: (invitationId: string) => Promise<unknown>;
  onDeletePlatformInvitation?: (invitationId: string) => Promise<unknown>;
  loading?: boolean;
}

const NO_DATA_PLACEHOLDER = '—';

const CreatePendingMembershipForApplication = (application: ApplicationModel) => {
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
  };
  return result;
};

const CreatePendingMembershipForInvitation = (invitation: InvitationModel) => {
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
  };
  return result;
};

const CommunityMemberships = ({
  applications = [],
  onApplicationStateChange,
  invitations = [],
  platformInvitations = [],
  onInvitationStateChange,
  onDeleteInvitation,
  onDeletePlatformInvitation,
  loading,
}: CommunityApplicationsProps) => {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<MembershipTableItem>();

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
      field: 'displayName',
      headerName: t('fields.name'),
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
      valueGetter: (_, row: GetterParams) => row?.displayName,
      filterable: false,
      flex: 1,
    },
    {
      field: 'email',
      headerName: t('common.email'),
      renderCell: ({ row }: RenderParams) => <>{row.email}</>,
      valueGetter: (_, row: GetterParams) => row?.email,
      filterable: false,
      flex: 1,
    },
    {
      field: 'createdDate',
      headerName: t('common.date'),
      minWidth: 200,
      type: 'date',
      renderCell: ({ row }: RenderParams) => (row.createdDate ? formatDateTime(row.createdDate) : ''),
    },
    {
      field: 'state',
      headerName: t('common.status'),
      minWidth: 200,
      renderCell: ({ row }: RenderParams) => formatState(row, t),
      valueGetter: (_, row: GetterParams) => sortState(row),
      filterable: false,
      flex: 1,
    },
    {
      field: 'contributorType',
      headerName: t('common.type'),
      renderCell: ({ row }: RenderParams) => <>{t(`common.enums.roleSetContributorType.${row.contributorType}`)}</>,
      valueGetter: (_, row: GetterParams) => row?.contributorType,
      filterable: false,
      flex: 1,
    },
  ];

  const visibleTableItems = useMemo(() => tableItems.filter(item => item.state !== 'archived'), [tableItems]);

  const [handleDeleteItem, isDeletingItem] = useLoadingState(async (item: GetterParams) => {
    if (item?.type === MembershipType.Application) {
      switch (item.state) {
        case ApplicationState.NEW: {
          await onApplicationStateChange(item.id, ApplicationEvent.REJECT);
          await onApplicationStateChange(item.id, ApplicationEvent.ARCHIVE);
          break;
        }
        case ApplicationState.APPROVED:
        case ApplicationState.REJECTED: {
          await onApplicationStateChange(item.id, ApplicationEvent.ARCHIVE);
          break;
        }
      }
    } else if (item?.type === MembershipType.Invitation) {
      switch (item.state) {
        case InvitationState.INVITED: {
          await onDeleteInvitation?.(item.id);
          break;
        }
        case InvitationState.ACCEPTED:
        case InvitationState.REJECTED: {
          await onInvitationStateChange?.(item.id, InvitationEvent.ARCHIVE);
          break;
        }
      }
    } else if (item?.type === MembershipType.PlatformInvitation) {
      await onDeletePlatformInvitation?.(item.id);
    }
    setConfirmActionOnItem(undefined);
  });

  const [handleApproveApplication, isApprovingApplication] = useLoadingState(async (item: GetterParams) => {
    if (item?.type === MembershipType.Application) {
      switch (item.state) {
        case ApplicationState.NEW: {
          await onApplicationStateChange(item.id, ApplicationEvent.APPROVE);
          break;
        }
        case ApplicationState.APPROVED:
        case ApplicationState.REJECTED: {
          await onApplicationStateChange(item.id, ApplicationEvent.ARCHIVE);
          break;
        }
      }
    }
    setConfirmActionOnItem(undefined);
  });

  const [handleRejectApplication, isRejectingApplication] = useLoadingState(async (item: GetterParams) => {
    if (item?.type === MembershipType.Application) {
      switch (item.state) {
        case ApplicationState.NEW: {
          await onApplicationStateChange(item.id, ApplicationEvent.REJECT);
          break;
        }
        case ApplicationState.APPROVED:
        case ApplicationState.REJECTED: {
          await onApplicationStateChange(item.id, ApplicationEvent.ARCHIVE);
          break;
        }
      }
    }
    setConfirmActionOnItem(undefined);
  });

  const [confirmActionOnItem, setConfirmActionOnItem] = useState<{ action: ActionType; item: GetterParams }>();
  const confirmableActions = {
    [ActionType.Delete]: {
      confirmationDialog: {
        getTitle(item: GetterParams) {
          switch (item?.type) {
            case MembershipType.Application:
              return t('community.confirmationDialogs.delete.application.title', {
                user: item.displayName,
              });
            case MembershipType.Invitation:
              return t('community.confirmationDialogs.delete.invitation.title', {
                user: item.displayName,
              });
            case MembershipType.PlatformInvitation:
              return t('community.confirmationDialogs.delete.platformInvitation.title', {
                user: item.displayName,
              });
          }
        },
        getContent(item: GetterParams) {
          switch (item?.type) {
            case MembershipType.Application:
              return t('community.confirmationDialogs.delete.application.content');
            case MembershipType.Invitation:
              return t('community.confirmationDialogs.delete.invitation.content');
            case MembershipType.PlatformInvitation:
              return t('community.confirmationDialogs.delete.platformInvitation.content');
          }
        },
        getConfirmButtonText(item: GetterParams) {
          switch (item?.type) {
            case MembershipType.Application:
              return t('buttons.archive');
            case MembershipType.Invitation:
              return t('buttons.delete');
            case MembershipType.PlatformInvitation:
              return t('buttons.delete');
          }
        },
        onConfirm: handleDeleteItem,
      },
    },
    [ActionType.Approve]: {
      confirmationDialog: {
        getTitle(item: GetterParams) {
          return t('community.confirmationDialogs.approve.title', {
            user: item?.displayName,
          });
        },
        getContent() {
          return t('community.confirmationDialogs.approve.content');
        },
        getConfirmButtonText: () => t('community.confirmationDialogs.approve.confirmButton'),
        onConfirm: handleApproveApplication,
      },
    },
    [ActionType.Reject]: {
      confirmationDialog: {
        getTitle(item: GetterParams) {
          return t('community.confirmationDialogs.reject.title', {
            user: item?.displayName,
          });
        },
        getContent() {
          return t('community.confirmationDialogs.reject.content');
        },
        getConfirmButtonText: () => t('community.confirmationDialogs.reject.confirmButton'),
        onConfirm: handleRejectApplication,
      },
    },
  };

  const isConfirmingAction = isDeletingItem || isApprovingApplication || isRejectingApplication;

  return (
    <>
      <Box minHeight={gutters(10)} data-testid="communityMemberships">
        {loading ? (
          <DataGridSkeleton />
        ) : (
          <DataGridTable
            rows={visibleTableItems}
            columns={columnDefinitions}
            actions={[
              {
                name: 'view',
                render: ({ row }: RenderParams) => (
                  <DataGridActionButton
                    item={row}
                    tooltip={t('buttons.view')}
                    icon={VisibilityOutlinedIcon}
                    onClick={() => setSelectedItem(row)}
                  />
                ),
              },
              {
                name: 'approve',
                render: ({ row }: RenderParams) =>
                  row.type === MembershipType.Application && (
                    <DataGridActionButton
                      item={row}
                      tooltip={t('buttons.approveApplication')}
                      icon={CheckCircleOutlineIcon}
                      isDisabled={item => item.state !== ApplicationState.NEW}
                      onClick={() => setConfirmActionOnItem({ action: ActionType.Approve, item: row })}
                    />
                  ),
              },
              {
                name: 'reject',
                render: ({ row }: RenderParams) =>
                  row.type === MembershipType.Application && (
                    <DataGridActionButton
                      item={row}
                      tooltip={t('buttons.rejectApplication')}
                      icon={HighlightOffIcon}
                      isDisabled={item => item.state !== ApplicationState.NEW}
                      onClick={() => setConfirmActionOnItem({ action: ActionType.Reject, item: row })}
                    />
                  ),
              },
            ]}
            initialState={initialState}
            pageSizeOptions={[PAGE_SIZE]}
            canDelete={() => true}
            disableDelete={(row: GetterParams) => row?.state === ApplicationState.APPROVED}
            onDelete={(row: GetterParams) => setConfirmActionOnItem({ action: ActionType.Delete, item: row })}
          />
        )}
      </Box>
      {selectedItem && selectedItem.type === MembershipType.Application && (
        <CommunityApplicationDialog
          application={selectedItem}
          onClose={() => setSelectedItem(undefined)}
          onSetNewState={onApplicationStateChange}
        />
      )}
      {selectedItem &&
        (selectedItem.type === MembershipType.Invitation ||
          selectedItem.type === MembershipType.PlatformInvitation) && (
          <CommunityInvitationDialog invitation={selectedItem} onClose={() => setSelectedItem(undefined)} />
        )}
      {confirmActionOnItem && (
        <ConfirmationDialog
          actions={{
            onConfirm: () =>
              confirmableActions[confirmActionOnItem.action].confirmationDialog.onConfirm(confirmActionOnItem.item),
            onCancel: () => setConfirmActionOnItem(undefined),
          }}
          options={{
            show: true,
          }}
          entities={{
            title: confirmableActions[confirmActionOnItem.action].confirmationDialog.getTitle(confirmActionOnItem.item),
            content: confirmableActions[confirmActionOnItem.action]?.confirmationDialog.getContent(
              confirmActionOnItem.item
            ),
            confirmButtonText: confirmableActions[confirmActionOnItem.action]?.confirmationDialog.getConfirmButtonText(
              confirmActionOnItem.item
            ),
          }}
          state={{
            isLoading: isConfirmingAction,
          }}
        />
      )}
    </>
  );
};

export default CommunityMemberships;
