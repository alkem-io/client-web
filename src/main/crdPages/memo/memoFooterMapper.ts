import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import type { ConnectedUser, ReadonlyReason } from '@/crd/components/memo/MemoCollabFooter';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';
import type { CollaborationSave } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';

type MapMemoFooterParams = {
  connectionStatus: CollabStatus;
  saveStatus?: CollaborationSave;
  synced: boolean;
  isAuthenticated: boolean;
  isReadOnly: boolean;
  // Why the collaboration service made this connection read-only (e.g. the single-editor licence).
  readOnlyCode?: ReadOnlyCode;
  memberCount: number;
  connectedUsers: ConnectedUser[];
  isContribution: boolean;
  hasDeletePrivileges: boolean;
  onDelete?: () => void;
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
  saveStatus?: CollaborationSave;
  memberCount: number;
  connectedUsers: ConnectedUser[];
  isGuest: boolean;
  readonlyReason: ReadonlyReason;
  onDelete?: () => void;
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
    saveStatus,
    synced,
    isAuthenticated,
    isReadOnly,
    readOnlyCode,
    memberCount,
    connectedUsers,
    isContribution,
    hasDeletePrivileges,
    onDelete,
    contentUpdatePolicy,
    hasOwner,
    myMembershipStatus,
  } = params;

  const canDelete = isContribution && hasDeletePrivileges && !!onDelete;

  return {
    connectionStatus,
    saveStatus,
    memberCount,
    connectedUsers,
    isGuest: !isAuthenticated,
    readonlyReason: resolveReadonlyReason({
      synced,
      isAuthenticated,
      isReadOnly,
      readOnlyCode,
      contentUpdatePolicy,
      hasOwner,
      myMembershipStatus,
    }),
    onDelete: canDelete ? onDelete : undefined,
  };
}

type ResolveReadonlyReasonParams = {
  synced: boolean;
  isAuthenticated: boolean;
  isReadOnly: boolean;
  readOnlyCode?: ReadOnlyCode;
  contentUpdatePolicy?: ContentUpdatePolicy;
  hasOwner?: boolean;
  myMembershipStatus?: CommunityMembershipStatus | string;
};

/**
 * Picks the footer message that explains why the memo is read-only. Server signals that the memo is
 * occupied (single-editor licence, capacity reached) win over the content-update-policy fallback.
 */
function resolveReadonlyReason({
  synced,
  isAuthenticated,
  isReadOnly,
  readOnlyCode,
  contentUpdatePolicy,
  hasOwner,
  myMembershipStatus,
}: ResolveReadonlyReasonParams): ReadonlyReason {
  if (!synced) return 'connecting';
  if (!isAuthenticated) return 'unauthenticated';
  if (!isReadOnly) return null;
  // The user may edit, but the collaboration room is occupied (parity with the whiteboard footer):
  // single-editor licence, or the multi-editor maximum is reached.
  if (readOnlyCode === ReadOnlyCode.MULTI_USER_NOT_ALLOWED) return 'multiUserNotAllowed';
  if (readOnlyCode === ReadOnlyCode.ROOM_CAPACITY_REACHED) return 'roomCapacityReached';
  if (
    contentUpdatePolicy === ContentUpdatePolicy.Contributors &&
    myMembershipStatus !== CommunityMembershipStatus.Member
  ) {
    return 'noMembership';
  }
  // Policy-locked: point at the owner when there is one, otherwise at a space admin (no broken owner link).
  return hasOwner ? 'contentUpdatePolicy' : 'contentUpdatePolicyNoOwner';
}
