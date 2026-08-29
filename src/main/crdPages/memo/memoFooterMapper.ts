import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import type { ConnectedUser, ReadonlyReason } from '@/crd/components/memo/MemoCollabFooter';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';
import type { CollaborationSave } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';

type MapMemoFooterParams = {
  connectionStatus: CollabStatus;
  saveStatus?: CollaborationSave;
  synced: boolean;
  isAuthenticated: boolean;
  isReadOnly: boolean;
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
  contentUpdatePolicy?: ContentUpdatePolicy;
  hasOwner?: boolean;
  myMembershipStatus?: CommunityMembershipStatus | string;
};

function resolveReadonlyReason({
  synced,
  isAuthenticated,
  isReadOnly,
  contentUpdatePolicy,
  hasOwner,
  myMembershipStatus,
}: ResolveReadonlyReasonParams): ReadonlyReason {
  if (!synced) return 'connecting';
  if (!isAuthenticated) return 'unauthenticated';
  if (!isReadOnly) return null;
  if (
    contentUpdatePolicy === ContentUpdatePolicy.Contributors &&
    myMembershipStatus !== CommunityMembershipStatus.Member
  ) {
    return 'noMembership';
  }
  // Policy-locked: point at the owner when there is one, otherwise at a space admin (no broken owner link).
  return hasOwner ? 'contentUpdatePolicy' : 'contentUpdatePolicyNoOwner';
}
