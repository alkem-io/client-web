import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import type {
  CollaboraConnectedUser,
  CollaboraReadonlyReason,
  CollaboraSaveStatus,
} from '@/crd/components/collabora/CollaboraCollabFooter';
import type { CollaboraConnectionStatus } from './useCollaboraPostMessage';

export type MapCollaboraFooterParams = {
  connectionStatus: CollaboraConnectionStatus;
  saveStatus: CollaboraSaveStatus;
  connectedUsers: CollaboraConnectedUser[];
  isAuthenticated: boolean;
  hasEditPrivilege: boolean;
  isContribution: boolean;
  hasDeletePrivileges: boolean;
  onDelete?: () => void;
  contentUpdatePolicy?: ContentUpdatePolicy;
  // The Space/Subspace context types this as plain `string` in some callers; keep the wider type.
  myMembershipStatus?: CommunityMembershipStatus | string;
};

export type CollaboraFooterMappedProps = {
  saveStatus: CollaboraSaveStatus;
  memberCount: number;
  connectedUsers: CollaboraConnectedUser[];
  isGuest: boolean;
  readonlyReason: CollaboraReadonlyReason;
  onDelete?: () => void;
};

/**
 * Mirrors `mapMemoFooterProps` for Collabora documents. The readonly reason is derived
 * from the iframe's connection state first, then from authentication and client-side
 * privilege — Collabora doesn't give the embedder a synced/isReadOnly flag, so privilege
 * is the authoritative client signal for whether edits will be accepted.
 *
 * Delete is surfaced only for Collabora contributions (not framings): framing docs are
 * deleted by deleting the whole callout.
 */
export function mapCollaboraFooterProps(params: MapCollaboraFooterParams): CollaboraFooterMappedProps {
  const {
    connectionStatus,
    saveStatus,
    connectedUsers,
    isAuthenticated,
    hasEditPrivilege,
    isContribution,
    hasDeletePrivileges,
    onDelete,
    contentUpdatePolicy,
    myMembershipStatus,
  } = params;

  const canDelete = isContribution && hasDeletePrivileges && !!onDelete;

  return {
    saveStatus,
    memberCount: connectedUsers.length,
    connectedUsers,
    isGuest: !isAuthenticated,
    readonlyReason: resolveReadonlyReason({
      connectionStatus,
      isAuthenticated,
      hasEditPrivilege,
      contentUpdatePolicy,
      myMembershipStatus,
    }),
    onDelete: canDelete ? onDelete : undefined,
  };
}

type ResolveReadonlyReasonParams = {
  connectionStatus: CollaboraConnectionStatus;
  isAuthenticated: boolean;
  hasEditPrivilege: boolean;
  contentUpdatePolicy?: ContentUpdatePolicy;
  myMembershipStatus?: CommunityMembershipStatus | string;
};

function resolveReadonlyReason({
  connectionStatus,
  isAuthenticated,
  hasEditPrivilege,
  contentUpdatePolicy,
  myMembershipStatus,
}: ResolveReadonlyReasonParams): CollaboraReadonlyReason {
  if (connectionStatus !== 'connected') return 'connecting';
  if (!isAuthenticated) return 'unauthenticated';
  if (hasEditPrivilege) return null;
  if (
    contentUpdatePolicy === ContentUpdatePolicy.Contributors &&
    myMembershipStatus !== CommunityMembershipStatus.Member
  ) {
    return 'noMembership';
  }
  return 'contentUpdatePolicy';
}
