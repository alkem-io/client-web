import React, { FC, useCallback, useMemo } from 'react';
import { useAvailableMembers, useUserContext } from '../../hooks';
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
  handleAssignMember: (member: UserDisplayNameFragment) => void;
  handleRemoveMember: (member: Member) => void;
  handleAssignAdmin: (member: UserDisplayNameFragment) => void;
  handleRemoveAdmin: (member: Member) => void;
  handleAssignOwner: (member: UserDisplayNameFragment) => void;
  handleRemoveOwner: (member: Member) => void;
  handleLoadMore: () => void;
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
    (_member: UserDisplayNameFragment) => {
      grantMember({
        variables: {
          input: {
            organizationID: entities.organizationId,
            userID: _member.id,
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
    (_member: Member) => {
      revokeMember({
        variables: {
          input: {
            userID: _member.id,
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
    (_member: UserDisplayNameFragment) => {
      grantAdmin({
        variables: {
          input: {
            organizationID: entities.organizationId,
            userID: _member.id,
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
    (_member: Member) => {
      revokeAdmin({
        variables: {
          input: {
            userID: _member.id,
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
    (_member: UserDisplayNameFragment) => {
      grantOwner({
        variables: {
          input: {
            organizationID: entities.organizationId,
            userID: _member.id,
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
    (_member: Member) => {
      revokeOwner({
        variables: {
          input: {
            userID: _member.id,
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
    available: availableMembers,
    current: allMembers,
    loading,
    fetchMore,
    hasMore,
  } = useAvailableMembers({
    credential: entities.credential,
    resourceId: entities.organizationId,
    parentMembers: entities.parentMembers,
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
