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
  readonlyReason: ReadonlyReason | null;
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
  // Whether the whiteboard still has an owner (`createdBy.profile`). When the policy locks the board and
  // the owner is gone, the footer points at a space admin instead of a (broken) owner link — mirrors the
  // MUI `contentUpdatePolicyNoOwner` branch in `WhiteboardDialogFooter.tsx`.
  hasOwner?: boolean;
};

export enum ReadonlyReason {
  Readonly = 'readonly',
  ContentUpdatePolicy = 'contentUpdatePolicy',
  ContentUpdatePolicyNoOwner = 'contentUpdatePolicyNoOwner',
  NoMembership = 'noMembership',
  Unauthenticated = 'unauthenticated',
}

export function getReadonlyReason(params: {
  canEdit: boolean;
  isAuthenticated: boolean;
  contentUpdatePolicy?: ContentUpdatePolicy;
  myMembershipStatus?: CommunityMembershipStatus;
  collaboratorMode: CollaboratorMode | null;
  hasOwner?: boolean;
}): ReadonlyReason | null {
  const { canEdit, isAuthenticated, contentUpdatePolicy, myMembershipStatus, collaboratorMode, hasOwner } = params;

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
  // Policy-locked: point at the owner when there is one, otherwise at a space admin (no broken owner link).
  return hasOwner ? ReadonlyReason.ContentUpdatePolicy : ReadonlyReason.ContentUpdatePolicyNoOwner;
}

export function mapWhiteboardFooterProps(params: MapWhiteboardFooterParams): WhiteboardCollabFooterMappedProps {
  const hasDeletePrivilege = params.myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false;

  const readonlyReason = getReadonlyReason({
    canEdit: params.canEdit,
    isAuthenticated: params.isAuthenticated,
    contentUpdatePolicy: params.contentUpdatePolicy,
    myMembershipStatus: params.myMembershipStatus,
    collaboratorMode: params.collaboratorMode,
    hasOwner: params.hasOwner,
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
    readonlyReason,
  };
}
