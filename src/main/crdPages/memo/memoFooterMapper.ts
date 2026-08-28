import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import type { ConnectedUser, ReadonlyReason } from '@/crd/components/memo/MemoCollabFooter';
import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';
import type {
  CollaborationAccess,
  CollaborationPhase,
} from '@/domain/collaboration/realTimeCollaboration/collaborationPhase';
import type { SessionEndCode } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';

type MemoSessionEndCode = SessionEndCode | 'terminal-connection-close';

type MapMemoFooterParams = {
  connectionStatus: CollabStatus;
  phase: CollaborationPhase;
  access: CollaborationAccess;
  isAuthenticated: boolean;
  readOnlyCode?: ReadOnlyCode;
  sessionEndCode?: MemoSessionEndCode;
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
 * (the shared collaboration phase, authentication, and server read-only reason). Client-side
 * Apollo privileges do NOT drive the reason (they only affect the editor-disabled
 * state), because the server's readOnly signal is the authoritative permission truth.
 *
 * Delete is surfaced only for memo contributions (not framings) with delete privileges.
 */
export function mapMemoFooterProps(params: MapMemoFooterParams): MemoFooterMappedProps {
  const {
    connectionStatus,
    phase,
    access,
    isAuthenticated,
    readOnlyCode,
    sessionEndCode,
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
      phase,
      access,
      isAuthenticated,
      readOnlyCode,
      sessionEndCode,
      contentUpdatePolicy,
      hasOwner,
      myMembershipStatus,
    }),
    onDelete: canDelete ? onDelete : undefined,
    onResumeEditing:
      ((access === 'readOnly' && readOnlyCode === ReadOnlyCode.INACTIVITY) ||
        sessionEndCode === 'document-size-limit-exceeded') &&
      onResumeEditing
        ? onResumeEditing
        : undefined,
  };
}

type ResolveReadonlyReasonParams = {
  phase: CollaborationPhase;
  access: CollaborationAccess;
  isAuthenticated: boolean;
  readOnlyCode?: ReadOnlyCode;
  sessionEndCode?: MemoSessionEndCode;
  contentUpdatePolicy?: ContentUpdatePolicy;
  hasOwner?: boolean;
  myMembershipStatus?: CommunityMembershipStatus | string;
};

function resolveReadonlyReason({
  phase,
  access,
  isAuthenticated,
  readOnlyCode,
  sessionEndCode,
  contentUpdatePolicy,
  hasOwner,
  myMembershipStatus,
}: ResolveReadonlyReasonParams): ReadonlyReason {
  if (sessionEndCode === 'document-size-limit-exceeded') return 'sizeLimitExceeded';
  if (sessionEndCode) return 'sessionEnded';
  if (phase === 'initial' || phase === 'replaceGeneration') return 'connecting';
  if (!isAuthenticated) return 'unauthenticated';
  if (access !== 'readOnly') return null;
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
