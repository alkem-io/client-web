import React, { PropsWithChildren, useCallback, useMemo } from 'react';
import { useUserContext } from '@/domain/community/user';
import { RoleName, UserDisplayNameFragment } from '@/core/apollo/generated/graphql-schema';
import { Member } from '@/domain/community/user/models/User';
import { AvailableMembersResults } from '@/domain/access/removeMe/useAvailableMembersWithCredential/useAvailableMembersWithCredential';
import { useAssignRoleToUserMutation, useRemoveRoleFromUserMutation } from '@/core/apollo/generated/apollo-hooks';

export interface OrganizationAssociatesProps {
  entities: {
    roleSetID: string;
    existingAssociatedUsers?: Member[];
    role: RoleName;
  };
  children: (provided: {
    entities: OrganizationAssociatesEntities;
    actions: OrganizationAssociatesActions;
    state: OrganizationAssociatesState;
  }) => React.ReactNode;
}

export interface OrganizationAssociatesActions {
  handleAssignAssociate: (memberId: string) => void;
  handleRemoveAssociate: (memberId: string) => void;
  handleAssignAdmin: (memberId: string) => void;
  handleRemoveAdmin: (memberId: string) => void;
  handleAssignOwner: (memberId: string) => void;
  handleRemoveOwner: (memberId: string) => void;
  fetchMoreUsers: () => Promise<void>;
  setSearchTerm: AvailableMembersResults['setSearchTerm'];
}

export interface OrganizationAssociatesState {
  updatingRoles: boolean;
  loadingUsers: boolean;
  hasMoreUsers: boolean | undefined;
}

export interface OrganizationAssociatesEntities {
  availableMembers: UserDisplayNameFragment[];
  allMembers: Member[];
  currentMember?: Member;
}

export const OrganizationAssociatesContainer = ({
  children,
  entities,
}: PropsWithChildren<OrganizationAssociatesProps>) => {
  const { user } = useUserContext();

  const [assignRoleToUser, { loading: loadingAssign }] = useAssignRoleToUserMutation();
  const [revokeRoleToUser, { loading: loadingRevoke }] = useRemoveRoleFromUserMutation();

  const handleAssignRole = useCallback(
    (memberId: string, role: RoleName) => {
      assignRoleToUser({
        variables: {
          roleData: {
            roleSetID: entities.roleSetID,
            contributorID: memberId,
            role,
          },
        },
        refetchQueries: [
          refetchUsersWithRoleQuery({
            input: { role, roleSetID: entities.roleSetID },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities, assignRoleToUser]
  );

  const handleRevokeRole = useCallback(
    (memberId: string, role: RoleName) => {
      revokeRoleToUser({
        variables: {
          roleData: {
            contributorID: memberId,
            roleSetID: entities.roleSetID,
            role,
          },
        },
        refetchQueries: [
          refetchUsersWithRoleQuery({
            input: { role, roleSetID: entities.roleSetID },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities, revokeRoleToUser]
  );

  const {
    availableMembers,
    currentMembers: allMembers,
    loading: loadingUsers,
    fetchMore: fetchMoreUsers,
    hasMore: hasMoreUsers,
    setSearchTerm,
  } = useAvailableUsers({
    role: entities.role,
    roleSetId: entities.roleSetID,
  });

  const currentMember = useMemo<Member | undefined>(() => {
    if (user)
      return {
        id: user.user.id,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        email: user.user.email,
        profile: {
          id: user.user.profile.id,
          displayName: user.user.profile.displayName,
        },
      };
  }, [user]);

  const actions = useMemo(
    () => ({
      handleAssignAssociate: (memberId: string) => handleAssignRole(memberId, RoleName.Associate),
      handleRemoveAssociate: (memberId: string) => handleRevokeRole(memberId, RoleName.Associate),
      handleAssignAdmin: (memberId: string) => handleAssignRole(memberId, RoleName.Admin),
      handleRemoveAdmin: (memberId: string) => handleRevokeRole(memberId, RoleName.Admin),
      handleAssignOwner: (memberId: string) => handleAssignRole(memberId, RoleName.Owner),
      handleRemoveOwner: (memberId: string) => handleRevokeRole(memberId, RoleName.Owner),
      fetchMoreUsers,
      setSearchTerm,
    }),
    [handleAssignRole, handleRevokeRole, fetchMoreUsers, setSearchTerm]
  );

  return (
    <>
      {children({
        entities: { availableMembers, allMembers, currentMember },
        actions,
        state: {
          updatingRoles: loadingAssign || loadingRevoke,
          loadingUsers,
          hasMoreUsers,
        },
      })}
    </>
  );
};

export default OrganizationAssociatesContainer;
