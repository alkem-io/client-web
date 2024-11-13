import React, { FC, useCallback, useMemo } from 'react';
import { useUserContext } from '../../../user';
import {
  refetchUsersWithCredentialsQuery,
  useAssignOrganizationRoleToUserMutation,
  useRemoveOrganizationRoleFromUserMutation,
} from '@core/apollo/generated/apollo-hooks';
import {
  AuthorizationCredential,
  Organization,
  OrganizationRole,
  UserDisplayNameFragment,
} from '@core/apollo/generated/graphql-schema';
import { Member } from '../../../user/models/User';
import { useAvailableMembersWithCredential } from '../../../community/useAvailableMembersWithCredential/useAvailableMembersWithCredential';
import { AvailableMembersResults } from '../../../community/useAvailableMembersWithCredential/useAvailableMembersWithCredential';

const organizationAssociateCredential = AuthorizationCredential.OrganizationAssociate;
const organizationAdminCredential = AuthorizationCredential.OrganizationAdmin;
const organizationOwnerCredential = AuthorizationCredential.OrganizationOwner;

export type AuthorizationCredentials =
  | AuthorizationCredential.OrganizationAssociate
  | AuthorizationCredential.OrganizationAdmin
  | AuthorizationCredential.OrganizationOwner;

export interface OrganizationAssociatesProps {
  entities: {
    organizationId: Organization['id'];
    parentAssociates?: Member[];
    credential: AuthorizationCredentials;
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

export const OrganizationAssociatesContainer: FC<OrganizationAssociatesProps> = ({ children, entities }) => {
  const { user } = useUserContext();

  const [assignOrganizationRoleToUser, { loading: loadingAssign }] = useAssignOrganizationRoleToUserMutation();
  const [revokeOrganizationRoleToUser, { loading: loadingRevoke }] = useRemoveOrganizationRoleFromUserMutation();

  const handleAssignRole = useCallback(
    (memberId: string, role: OrganizationRole) => {
      const refetchType =
        role === OrganizationRole.Admin
          ? organizationAdminCredential
          : role === OrganizationRole.Owner
          ? organizationOwnerCredential
          : organizationAssociateCredential;

      assignOrganizationRoleToUser({
        variables: {
          input: {
            organizationID: entities.organizationId,
            userID: memberId,
            role,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: refetchType, resourceID: entities.organizationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities, assignOrganizationRoleToUser]
  );

  const handleRevokeRole = useCallback(
    (memberId: string, role: OrganizationRole) => {
      const refetchType =
        role === OrganizationRole.Admin
          ? organizationAdminCredential
          : role === OrganizationRole.Owner
          ? organizationOwnerCredential
          : organizationAssociateCredential;

      revokeOrganizationRoleToUser({
        variables: {
          input: {
            userID: memberId,
            organizationID: entities.organizationId,
            role,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: refetchType, resourceID: entities.organizationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities, revokeOrganizationRoleToUser]
  );

  const {
    availableMembers,
    currentMembers: allMembers,
    loading: loadingUsers,
    fetchMore: fetchMoreUsers,
    hasMore: hasMoreUsers,
    setSearchTerm,
  } = useAvailableMembersWithCredential({
    credential: entities.credential,
    resourceId: entities.organizationId,
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
      handleAssignAssociate: (memberId: string) => handleAssignRole(memberId, OrganizationRole.Associate),
      handleRemoveAssociate: (memberId: string) => handleRevokeRole(memberId, OrganizationRole.Associate),
      handleAssignAdmin: (memberId: string) => handleAssignRole(memberId, OrganizationRole.Admin),
      handleRemoveAdmin: (memberId: string) => handleRevokeRole(memberId, OrganizationRole.Admin),
      handleAssignOwner: (memberId: string) => handleAssignRole(memberId, OrganizationRole.Owner),
      handleRemoveOwner: (memberId: string) => handleRevokeRole(memberId, OrganizationRole.Owner),
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
