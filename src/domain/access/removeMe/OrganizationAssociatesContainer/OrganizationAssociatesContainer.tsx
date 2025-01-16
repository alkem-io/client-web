import React, { PropsWithChildren, useMemo } from 'react';
import { useUserContext } from '@/domain/community/user';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { Member } from '@/domain/community/user/models/User';
import { AvailableMembersResults } from '@/domain/access/removeMe/useAvailableMembersWithCredential/useAvailableMembersWithCredential';
import useRoleSetAdmin from '../../RoleSet/RoleSetAdmin/useRoleSetAdmin';

export interface OrganizationAssociatesProps {
  entities: {
    roleSetID: string;
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
  fetchMoreUsers: () => Promise<unknown>;
  setSearchTerm: AvailableMembersResults['setSearchTerm'];
}

export interface OrganizationAssociatesState {
  updatingRoles: boolean;
  loadingUsers: boolean;
  hasMoreUsers: boolean | undefined;
}

export interface OrganizationAssociatesEntities {
  availableMembers: {
    id: string;
    profile: {
      displayName: string;
    }
  }[];
  allMembers: Member[];
  currentMember?: Member;
}
/**
 * @deprecated Use directly useRoleSetAdmin
 */
export const OrganizationAssociatesContainer = ({
  children,
  entities,
}: PropsWithChildren<OrganizationAssociatesProps>) => {
  const { user } = useUserContext();
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const {
    usersByRole,
    assignRoleToUser,
    removeRoleFromUser,
    availableUsersForRole,
    loading,
    updating,
  } = useRoleSetAdmin({
    roleSetId: entities.roleSetID,
    relevantRoles: [RoleName.Associate, RoleName.Admin, RoleName.Owner],
    availableUsersForRoleSearch: {
      enabled: true,
      mode: 'roleSet',
      role: entities.role,
      filter: searchTerm,
    },
  });
  const allMembers = usersByRole[entities.role] ?? [];

  const {
    users: availableMembers = [],
    fetchMore: fetchMoreUsers = () => Promise.resolve(),
    hasMore: hasMoreUsers,
  } = availableUsersForRole ?? {};


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
      handleAssignAssociate: (memberId: string) => assignRoleToUser(memberId, RoleName.Associate),
      handleRemoveAssociate: (memberId: string) => removeRoleFromUser(memberId, RoleName.Associate),
      handleAssignAdmin: (memberId: string) => assignRoleToUser(memberId, RoleName.Admin),
      handleRemoveAdmin: (memberId: string) => removeRoleFromUser(memberId, RoleName.Admin),
      handleAssignOwner: (memberId: string) => assignRoleToUser(memberId, RoleName.Owner),
      handleRemoveOwner: (memberId: string) => removeRoleFromUser(memberId, RoleName.Owner),
      fetchMoreUsers,
      setSearchTerm,
    }),
    [assignRoleToUser, removeRoleFromUser, fetchMoreUsers, setSearchTerm]
  );

  return (
    <>
      {children({
        entities: { availableMembers, allMembers, currentMember },
        actions,
        state: {
          updatingRoles: updating,
          loadingUsers: loading,
          hasMoreUsers,
        },
      })}
    </>
  );
};

export default OrganizationAssociatesContainer;
