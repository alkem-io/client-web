import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  ContentUpdatePolicy,
} from '@/core/apollo/generated/graphql-schema';
import {
  type CollaboratorMode,
  CollaboratorModeReasons,
} from '@/domain/common/whiteboard/excalidraw/collab/excalidrawAppConstants';

type WhiteboardCollabFooterMappedProps = {
  canDelete: boolean;
  deleteDisabled: boolean;
  canRestart: boolean;
  guestWarningVisible: boolean;
};

type MapWhiteboardFooterParams = {
  myPrivileges?: AuthorizationPrivilege[];
  canEdit: boolean;
  preventWhiteboardDeletion?: boolean;
  updating?: boolean;
  collaboratorMode: CollaboratorMode | null;
  collaboratorModeReason: CollaboratorModeReasons | null;
  guestContributionsAllowed?: boolean;
  isAuthenticated: boolean;
  contentUpdatePolicy?: ContentUpdatePolicy;
  myMembershipStatus?: CommunityMembershipStatus;
};

enum ReadonlyReason {
  Readonly = 'readonly',
  ContentUpdatePolicy = 'contentUpdatePolicy',
  NoMembership = 'noMembership',
  Unauthenticated = 'unauthenticated',
}

export function getReadonlyReason(params: {
  canEdit: boolean;
  isAuthenticated: boolean;
  contentUpdatePolicy?: ContentUpdatePolicy;
  myMembershipStatus?: CommunityMembershipStatus;
  collaboratorMode: CollaboratorMode | null;
}): ReadonlyReason | null {
  const { canEdit, isAuthenticated, contentUpdatePolicy, myMembershipStatus, collaboratorMode } = params;

  if (canEdit) {
    return collaboratorMode === 'read' ? ReadonlyReason.Readonly : null;
  }
  if (!isAuthenticated) {
    return ReadonlyReason.Unauthenticated;
  }
  if (
    contentUpdatePolicy === ContentUpdatePolicy.Contributors &&
    myMembershipStatus !== CommunityMembershipStatus.Member
  ) {
    return ReadonlyReason.NoMembership;
  }
  return ReadonlyReason.ContentUpdatePolicy;
}

export function mapWhiteboardFooterProps(params: MapWhiteboardFooterParams): WhiteboardCollabFooterMappedProps {
  const hasDeletePrivilege = params.myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false;

  const readonlyReason = getReadonlyReason({
    canEdit: params.canEdit,
    isAuthenticated: params.isAuthenticated,
    contentUpdatePolicy: params.contentUpdatePolicy,
    myMembershipStatus: params.myMembershipStatus,
    collaboratorMode: params.collaboratorMode,
  });

  const canRestart =
    readonlyReason === ReadonlyReason.Readonly &&
    (!params.collaboratorModeReason || params.collaboratorModeReason === CollaboratorModeReasons.INACTIVITY);

  return {
    canDelete: hasDeletePrivilege && !params.preventWhiteboardDeletion,
    // Delete permission is independent from edit permission: a user may have Delete without UpdateContent
    // (e.g. the creator of a whiteboard contribution who isn't a space editor). Only block while a save is in flight.
    deleteDisabled: !!params.updating,
    canRestart,
    guestWarningVisible: params.guestContributionsAllowed === true,
  };
}
