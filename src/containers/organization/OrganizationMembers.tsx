import React, { FC, useCallback, useMemo } from 'react';
import { useUserContext } from '../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsOrganizationAdminMutation,
  useAssignUserAsOrganizationOwnerMutation,
  useAssignUserToOrganizationMutation,
  useRemoveUserAsOrganizationAdminMutation,
  useRemoveUserAsOrganizationOwnerMutation,
  useRemoveUserFromOrganizationMutation,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { AuthorizationCredential, Organization, UserDisplayNameFragment } from '../../models/graphql-schema';
import { Member } from '../../models/User';
import { useAvailableMembersWithCredential } from '../../domain/community/useAvailableMembersWithCredential';
import { AvailableMembersResults } from '../../domain/community/useAvailableMembersWithCredential/useAvailableMembersWithCredential';

const organizationMemberCredential = AuthorizationCredential.OrganizationMember;
const organizationAdminCredential = AuthorizationCredential.OrganizationAdmin;
const organizationOwnerCredential = AuthorizationCredential.OrganizationOwner;

export type AuthorizationCredentials =
  | AuthorizationCredential.OrganizationMember
  | AuthorizationCredential.OrganizationAdmin
  | AuthorizationCredential.OrganizationOwner;

export interface OrganizationMembersProps {
  entities: {
    organizationId: Organization['id'];
    parentMembers?: Member[];
    credential: AuthorizationCredentials;
  };
  children: (
    entities: OrganizationMembersEntities,
    actions: OrganizationMembersActions,
    state: OrganizationMembersState
  ) => React.ReactNode;
}

export interface OrganizationMembersActions {
  handleAssignMember: (memberId: string) => void;
  handleRemoveMember: (memberId: string) => void;
  handleAssignAdmin: (memberId: string) => void;
  handleRemoveAdmin: (memberId: string) => void;
  handleAssignOwner: (memberId: string) => void;
  handleRemoveOwner: (memberId: string) => void;
  handleLoadMore: () => Promise<void>;
  setSearchTerm: AvailableMembersResults['setSearchTerm'];
}

export interface OrganizationMembersState {
  addingUser: boolean;
  removingUser: boolean;
  addingAdmin: boolean;
  removingAdmin: boolean;
  addingOwner: boolean;
  removingOwner: boolean;
  loading: boolean;
  hasMoreUsers: boolean | undefined;
}

export interface OrganizationMembersEntities {
  availableMembers: UserDisplayNameFragment[];
  allMembers: Member[];
  currentMember?: Member;
}

export const OrganizationMembers: FC<OrganizationMembersProps> = ({ children, entities }) => {
  const handleError = useApolloErrorHandler();
  const { user } = useUserContext();

  const [grantMember, { loading: addingUser }] = useAssignUserToOrganizationMutation({
    onError: handleError,
  });

  const [revokeMember, { loading: removingUser }] = useRemoveUserFromOrganizationMutation({
    onError: handleError,
  });

  const [grantAdmin, { loading: addingAdmin }] = useAssignUserAsOrganizationAdminMutation({
    onError: handleError,
  });

  const [revokeAdmin, { loading: removingAdmin }] = useRemoveUserAsOrganizationAdminMutation({
    onError: handleError,
  });

  const [grantOwner, { loading: addingOwner }] = useAssignUserAsOrganizationOwnerMutation({
    onError: handleError,
  });

  const [revokeOwner, { loading: removingOwner }] = useRemoveUserAsOrganizationOwnerMutation({
    onError: handleError,
  });

  const handleAssignMember = useCallback(
    (memberId: string) => {
      grantMember({
        variables: {
          input: {
            organizationID: entities.organizationId,
            userID: memberId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organizationMemberCredential, resourceID: entities.organizationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleRemoveMember = useCallback(
    (memberId: string) => {
      revokeMember({
        variables: {
          input: {
            userID: memberId,
            organizationID: entities.organizationId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organizationMemberCredential, resourceID: entities.organizationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleAssignAdmin = useCallback(
    (memberId: string) => {
      grantAdmin({
        variables: {
          input: {
            organizationID: entities.organizationId,
            userID: memberId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organizationAdminCredential, resourceID: entities.organizationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleRemoveAdmin = useCallback(
    (memberId: string) => {
      revokeAdmin({
        variables: {
          input: {
            userID: memberId,
            organizationID: entities.organizationId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organizationAdminCredential, resourceID: entities.organizationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleAssignOwner = useCallback(
    (memberId: string) => {
      grantOwner({
        variables: {
          input: {
            organizationID: entities.organizationId,
            userID: memberId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organizationOwnerCredential, resourceID: entities.organizationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleRemoveOwner = useCallback(
    (memberId: string) => {
      revokeOwner({
        variables: {
          input: {
            userID: memberId,
            organizationID: entities.organizationId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organizationOwnerCredential, resourceID: entities.organizationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const {
    availableMembers,
    currentMembers: allMembers,
    loading,
    fetchMore,
    hasMore,
    setSearchTerm,
  } = useAvailableMembersWithCredential({
    credential: entities.credential,
    resourceId: entities.organizationId,
  });

  const handleLoadMore = fetchMore;

  const currentMember = useMemo<Member | undefined>(() => {
    if (user)
      return {
        id: user.user.id,
        displayName: user.user.displayName,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        email: user.user.email,
      };
  }, [user]);

  return (
    <>
      {children(
        { availableMembers, allMembers, currentMember },
        {
          handleAssignMember,
          handleRemoveMember,
          handleAssignAdmin,
          handleRemoveAdmin,
          handleAssignOwner,
          handleRemoveOwner,
          handleLoadMore,
          setSearchTerm,
        },
        {
          addingUser,
          removingUser,
          addingAdmin,
          removingAdmin,
          addingOwner,
          removingOwner,
          loading,
          hasMoreUsers: hasMore,
        }
      )}
    </>
  );
};

export default OrganizationMembers;
