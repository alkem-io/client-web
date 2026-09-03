import { useState } from 'react';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';
import useActionPermission from '@/domain/access/permissions/useActionPermission';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import { ROLE_SET_ASSIGN_PRIVILEGES } from '@/main/crdPages/permissions/roleAssignmentPrivileges';
import usePermissionReasonText from '@/main/crdPages/permissions/usePermissionReasonText';

export type PendingRoleRemove = {
  contributorId: string;
  displayName: string;
};

export type UseOrgAssociatesResult = {
  /** Tooltip copy when the add controls are gated; undefined when permitted. */
  addDisabledReason?: string;
  /** Tooltip copy when the remove controls are gated; undefined when permitted. */
  removeDisabledReason?: string;
  // Current
  current: ReturnType<typeof useRoleSetManager>['usersByRole'][RoleName.Associate];
  loadingCurrent: boolean;

  // Available
  available: ReturnType<typeof useRoleSetAvailableUsers>['users'];
  hasMore: boolean;
  loadingAvailable: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onLoadMore: () => Promise<unknown>;

  // Mutations
  updating: boolean;
  onAdd: (userId: string) => Promise<unknown>;
  onRequestRemove: (contributorId: string, displayName: string) => void;
  onConfirmRemove: () => Promise<void>;
  onCancelRemove: () => void;
  pendingRemove: PendingRoleRemove | null;
};

/**
 * Wraps `useRoleSetManager` + `useRoleSetAvailableUsers` for the
 * Org Community tab's `Associate` role (US10 / Decision #5). Add fires
 * immediately; Remove sets `pendingRemove` so the integration page can
 * render the destructive `ConfirmationDialog` (Rule #9 / FR-112). Search
 * + load-more pass straight through to the underlying hooks.
 */
export const useOrgAssociates = (roleSetId: string | undefined): UseOrgAssociatesResult => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingRemove, setPendingRemove] = useState<PendingRoleRemove | null>(null);

  const {
    usersByRole,
    assignRoleToUser,
    removeRoleFromUser,
    loading: loadingCurrent,
    updating,
    myPrivileges,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Associate],
    contributorTypes: [ActorType.User],
    fetchContributors: true,
  });

  // Gate add/remove on the privilege the backend enforces for assignRoleToUser /
  // removeRoleFromUser, so the action is prevented rather than silently refused.
  const reasonText = usePermissionReasonText();
  const assignDisabledReason = reasonText(
    useActionPermission(myPrivileges, ROLE_SET_ASSIGN_PRIVILEGES, loadingCurrent)
  );

  const availableResponse = useRoleSetAvailableUsers({
    roleSetId,
    mode: 'platform',
    role: RoleName.Associate,
    filter: searchTerm,
    usersAlreadyInRole: usersByRole?.[RoleName.Associate],
  });

  const onAdd = (userId: string) => assignRoleToUser(userId, RoleName.Associate);

  const onRequestRemove = (contributorId: string, displayName: string) => {
    setPendingRemove({ contributorId, displayName });
  };

  const onConfirmRemove = async () => {
    if (!pendingRemove) return;
    await removeRoleFromUser(pendingRemove.contributorId, RoleName.Associate);
    setPendingRemove(null);
  };

  const onCancelRemove = () => setPendingRemove(null);

  return {
    addDisabledReason: assignDisabledReason,
    removeDisabledReason: assignDisabledReason,
    current: usersByRole[RoleName.Associate] ?? [],
    loadingCurrent,
    available: availableResponse.users ?? [],
    hasMore: availableResponse.hasMore,
    loadingAvailable: availableResponse.loading,
    searchTerm,
    onSearchChange: setSearchTerm,
    onLoadMore: availableResponse.fetchMore,
    updating,
    onAdd,
    onRequestRemove,
    onConfirmRemove,
    onCancelRemove,
    pendingRemove,
  };
};

export default useOrgAssociates;
