import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import type { ReadonlyReason } from '@/crd/components/memo/MemoCollabFooter';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';

type MapMemoFooterParams = {
  connectionStatus: CollabStatus;
  synced: boolean;
  isAuthenticated: boolean;
  isReadOnly: boolean;
  memberCount: number;
  isContribution: boolean;
  hasDeletePrivileges: boolean;
  onDelete?: () => void;
  contentUpdatePolicy?: ContentUpdatePolicy;
  // The Space/Subspace context types this as plain `string`; keep the wider type to match.
  myMembershipStatus?: CommunityMembershipStatus | string;
};

type MemoFooterMappedProps = {
  connectionStatus: CollabStatus;
  memberCount: number;
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
    synced,
    isAuthenticated,
    isReadOnly,
    memberCount,
    isContribution,
    hasDeletePrivileges,
    onDelete,
    contentUpdatePolicy,
    myMembershipStatus,
  } = params;

  const canDelete = isContribution && hasDeletePrivileges && !!onDelete;

  return {
    connectionStatus,
    memberCount,
    isGuest: !isAuthenticated,
    readonlyReason: resolveReadonlyReason({
      connectionStatus,
      synced,
      isAuthenticated,
      isReadOnly,
      contentUpdatePolicy,
      myMembershipStatus,
    }),
    onDelete: canDelete ? onDelete : undefined,
  };
}

type ResolveReadonlyReasonParams = {
  connectionStatus: CollabStatus;
  synced: boolean;
  isAuthenticated: boolean;
  isReadOnly: boolean;
  contentUpdatePolicy?: ContentUpdatePolicy;
  myMembershipStatus?: CommunityMembershipStatus | string;
};

function resolveReadonlyReason({
  connectionStatus,
  synced,
  isAuthenticated,
  isReadOnly,
  contentUpdatePolicy,
  myMembershipStatus,
}: ResolveReadonlyReasonParams): ReadonlyReason {
  if (connectionStatus !== 'connected') return 'connecting';
  if (!isAuthenticated) return 'unauthenticated';
  if (!synced) return 'notSynced';
  if (!isReadOnly) return null;
  if (
    contentUpdatePolicy === ContentUpdatePolicy.Contributors &&
    myMembershipStatus !== CommunityMembershipStatus.Member
  ) {
    return 'noMembership';
  }
  return 'contentUpdatePolicy';
}
