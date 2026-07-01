import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import type {
  CollaboraConnectedUser,
  CollaboraReadonlyReason,
  CollaboraSaveStatus,
} from '@/crd/components/collabora/CollaboraCollabFooter';
import type { CollaboraConnectionStatus, DisconnectCause } from './useCollaboraPostMessage';

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
  /** Why the session dropped, from the connection monitor; drives cause-specific messaging. */
  disconnectCause?: DisconnectCause | null;
};

export type CollaboraFooterMappedProps = {
  saveStatus: CollaboraSaveStatus;
  memberCount: number;
  connectedUsers: CollaboraConnectedUser[];
  isGuest: boolean;
  readonlyReason: CollaboraReadonlyReason;
  onDelete?: () => void;
  /** True once the session is in a hard disconnect (or terminal) state — drives the banner. */
  disconnected: boolean;
  /** The disconnect cause when `disconnected`, else null. */
  disconnectCause: DisconnectCause | null;
  /**
   * True only when the disconnected session could have unsaved edits — i.e. an authenticated
   * editor whose save state was not confirmed "saved" at the drop. Gates the "recent changes
   * may not be saved" wording so read-only viewers / guests / cleanly-saved docs never see a
   * false data-loss warning (FR-012).
   */
  changesAtRisk: boolean;
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
    disconnectCause,
  } = params;

  const canDelete = isContribution && hasDeletePrivileges && !!onDelete;

  const disconnected = connectionStatus === 'disconnected' || connectionStatus === 'terminal';
  // Edit-capable session whose work wasn't confirmed saved at the drop → warn about loss.
  const changesAtRisk = disconnected && isAuthenticated && hasEditPrivilege && saveStatus !== 'saved';

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
    disconnected,
    disconnectCause: disconnected ? (disconnectCause ?? 'unknown') : null,
    changesAtRisk,
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
  // While actively (re)connecting, surface the connecting hint. Once disconnected/terminal the
  // dedicated disconnect banner owns the messaging, so no readonly reason is shown.
  if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') return 'connecting';
  if (connectionStatus === 'disconnected' || connectionStatus === 'terminal') return null;
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
