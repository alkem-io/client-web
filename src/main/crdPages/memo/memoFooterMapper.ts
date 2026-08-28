import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import type { ConnectedUser, ReadonlyReason } from '@/crd/components/memo/MemoCollabFooter';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';

type MapMemoFooterParams = {
  connectionStatus: CollabStatus;
  synced: boolean;
  isAuthenticated: boolean;
  isReadOnly: boolean;
  readOnlyCode?: ReadOnlyCode;
  memberCount: number;
  connectedUsers: ConnectedUser[];
  isContribution: boolean;
  hasDeletePrivileges: boolean;
  onDelete?: () => void;
  onResumeEditing?: () => void;
  contentUpdatePolicy?: ContentUpdatePolicy;
  // Whether the memo still has an owner (`createdBy.profile`). When the policy locks the memo and the
  // owner is gone, the footer points at a space admin instead of a (broken) owner link — mirrors the MUI
  // `contentUpdatePolicyNoOwner` branch in `MemoFooter.tsx`.
  hasOwner?: boolean;
  // The Space/Subspace context types this as plain `string`; keep the wider type to match.
  myMembershipStatus?: CommunityMembershipStatus | string;
};

type MemoFooterMappedProps = {
  connectionStatus: CollabStatus;
  memberCount: number;
  connectedUsers: ConnectedUser[];
  isGuest: boolean;
  readonlyReason: ReadonlyReason;
  onDelete?: () => void;
  onResumeEditing?: () => void;
};

/**
 * Pure mapper: collab + permissions + mode → MemoCollabFooter props.
 *
 * Mirrors the decision tree in `src/domain/collaboration/memo/MemoDialog/MemoFooter.tsx`
 * `getReadonlyReason` — the primary reason is derived only from server/collab state
 * (connection status, sync state, authentication, server readOnly flag). Client-side
 * Apollo privileges do NOT drive the reason (they only affect the editor-disabled
 * state), because the server's readOnly signal is the authoritative permission truth.
 *
 * Delete is surfaced only for memo contributions (not framings) with delete privileges.
 */
export function mapMemoFooterProps(params: MapMemoFooterParams): MemoFooterMappedProps {
  const {
    connectionStatus,
    synced,
    isAuthenticated,
    isReadOnly,
    readOnlyCode,
    memberCount,
    connectedUsers,
    isContribution,
    hasDeletePrivileges,
    onDelete,
    onResumeEditing,
    contentUpdatePolicy,
    hasOwner,
    myMembershipStatus,
  } = params;

  const canDelete = isContribution && hasDeletePrivileges && !!onDelete;

  return {
    connectionStatus,
    memberCount,
    connectedUsers,
    isGuest: !isAuthenticated,
    readonlyReason: resolveReadonlyReason({
      connectionStatus,
      synced,
      isAuthenticated,
      isReadOnly,
      readOnlyCode,
      contentUpdatePolicy,
      hasOwner,
      myMembershipStatus,
    }),
    onDelete: canDelete ? onDelete : undefined,
    onResumeEditing:
      connectionStatus === 'connected' &&
      synced &&
      readOnlyCode === ReadOnlyCode.INACTIVITY &&
      isReadOnly &&
      onResumeEditing
        ? onResumeEditing
        : undefined,
  };
}

type ResolveReadonlyReasonParams = {
  connectionStatus: CollabStatus;
  synced: boolean;
  isAuthenticated: boolean;
  isReadOnly: boolean;
  readOnlyCode?: ReadOnlyCode;
  contentUpdatePolicy?: ContentUpdatePolicy;
  hasOwner?: boolean;
  myMembershipStatus?: CommunityMembershipStatus | string;
};

function resolveReadonlyReason({
  connectionStatus,
  synced,
  isAuthenticated,
  isReadOnly,
  readOnlyCode,
  contentUpdatePolicy,
  hasOwner,
  myMembershipStatus,
}: ResolveReadonlyReasonParams): ReadonlyReason {
  if (connectionStatus !== 'connected') return 'connecting';
  if (!isAuthenticated) return 'unauthenticated';
  if (!synced) return 'notSynced';
  if (!isReadOnly) return null;
  if (readOnlyCode === ReadOnlyCode.INACTIVITY) return 'inactivity';
  if (
    contentUpdatePolicy === ContentUpdatePolicy.Contributors &&
    myMembershipStatus !== CommunityMembershipStatus.Member
  ) {
    return 'noMembership';
  }
  // Policy-locked: point at the owner when there is one, otherwise at a space admin (no broken owner link).
  return hasOwner ? 'contentUpdatePolicy' : 'contentUpdatePolicyNoOwner';
}
