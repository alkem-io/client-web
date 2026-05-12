import { useState } from 'react';
import { ActorType, type RoleName } from '@/core/apollo/generated/graphql-schema';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';

export type AuthorizationRoleName = RoleName.Admin | RoleName.Owner;

export type PendingRoleRemove = {
  contributorId: string;
  displayName: string;
};

export type UseOrgRoleAssignmentResult = {
  // Current
  current: ReturnType<typeof useRoleSetManager>['usersByRole'][RoleName];
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
 * Wraps `useRoleSetManager` + `useRoleSetAvailableUsers` for the Org
 * Authorization tab's `Admin` and `Owner` sub-tabs (US11). Parameterized by
 * role; otherwise identical in shape to `useOrgAssociates` (US10): Add
 * fires immediately, Remove sets `pendingRemove` so the integration page
 * can render the destructive `ConfirmationDialog` (Rule #9 / FR-121).
 *
 * Available-users mode is `'roleSet'` (matches the existing MUI
 * Authorization page's behaviour) — promotes existing role-set members to
 * Admin / Owner rather than fanning out across the whole platform. Search
 * + load-more pass straight through to the underlying hook.
 */
export const useOrgRoleAssignment = (
  roleSetId: string | undefined,
  role: AuthorizationRoleName
): UseOrgRoleAssignmentResult => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingRemove, setPendingRemove] = useState<PendingRoleRemove | null>(null);

  const {
    usersByRole,
    assignRoleToUser,
    removeRoleFromUser,
    loading: loadingCurrent,
    updating,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: [role],
    contributorTypes: [ActorType.User],
    fetchContributors: true,
  });

  const availableResponse = useRoleSetAvailableUsers({
    roleSetId,
    mode: 'roleSet',
    role,
    filter: searchTerm,
  });

  const onAdd = (userId: string) => assignRoleToUser(userId, role);

  const onRequestRemove = (contributorId: string, displayName: string) => {
    setPendingRemove({ contributorId, displayName });
  };

  const onConfirmRemove = async () => {
    if (!pendingRemove) return;
    await removeRoleFromUser(pendingRemove.contributorId, role);
    setPendingRemove(null);
  };

  const onCancelRemove = () => setPendingRemove(null);

  return {
    current: usersByRole[role] ?? [],
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

export default useOrgRoleAssignment;
