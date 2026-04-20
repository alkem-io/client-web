import type { CollabStatus } from '@/crd/forms/markdown/collabProviderTypes';

type MapMemoFooterParams = {
  connectionStatus: CollabStatus;
  memberCount: number;
  isGuest: boolean;
  isReadOnly: boolean;
  hasContributePrivileges: boolean;
  hasDeletePrivileges: boolean;
  isContribution: boolean;
  onDelete?: () => void;
  readOnlyMessage?: string;
};

type MemoFooterMappedProps = {
  connectionStatus: CollabStatus;
  memberCount: number;
  isGuest: boolean;
  readonlyReason?: string;
  onDelete?: () => void;
};

/**
 * Pure mapper: collab + permissions + mode → MemoCollabFooter props.
 * Delete is surfaced only for memo contributions (not framings) with delete privileges.
 */
export function mapMemoFooterProps(params: MapMemoFooterParams): MemoFooterMappedProps {
  const {
    connectionStatus,
    memberCount,
    isGuest,
    isReadOnly,
    hasContributePrivileges,
    hasDeletePrivileges,
    isContribution,
    onDelete,
    readOnlyMessage,
  } = params;

  const canDelete = isContribution && hasDeletePrivileges && !!onDelete;

  let readonlyReason: string | undefined;
  if (isReadOnly) {
    readonlyReason = readOnlyMessage;
  } else if (!hasContributePrivileges) {
    readonlyReason = readOnlyMessage;
  }

  return {
    connectionStatus,
    memberCount,
    isGuest,
    readonlyReason,
    onDelete: canDelete ? onDelete : undefined,
  };
}
