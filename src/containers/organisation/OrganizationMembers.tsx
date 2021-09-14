import React, { FC, useCallback, useMemo } from 'react';
import { useUserContext } from '../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsOrganisationAdminMutation,
  useAssignUserAsOrganisationOwnerMutation,
  useAssignUserToOrganisationMutation,
  useRemoveUserAsOrganisationAdminMutation,
  useRemoveUserAsOrganisationOwnerMutation,
  useRemoveUserFromOrganisationMutation,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler, useAvailableMembers } from '../../hooks';
import { AuthorizationCredential, Organisation } from '../../models/graphql-schema';
import { Member } from '../../models/User';

const organisationMemberCredential = AuthorizationCredential.OrganisationMember;
const organisationAdminCredential = AuthorizationCredential.OrganisationAdmin;
const organisationOwnerCredential = AuthorizationCredential.OrganisationOwner;

export type AuthorizationCredentials =
  | AuthorizationCredential.OrganisationMember
  | AuthorizationCredential.OrganisationAdmin
  | AuthorizationCredential.OrganisationOwner;

export interface OrganizationMembersProps {
  entities: {
    organisationId: Organisation['id'];
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
  handleAssignMember: (member: Member) => void;
  handleRemoveMember: (member: Member) => void;
  handleAssignAdmin: (member: Member) => void;
  handleRemoveAdmin: (member: Member) => void;
  handleAssignOwner: (member: Member) => void;
  handleRemoveOwner: (member: Member) => void;
}

export interface OrganizationMembersState {
  addingUser: boolean;
  removingUser: boolean;
  addingAdmin: boolean;
  removingAdmin: boolean;
  addingOwner: boolean;
  removingOwner: boolean;
  loading: boolean;
}

export interface OrganizationMembersEntities {
  availableMembers: Member[];
  allMembers: Member[];
  currentMember?: Member;
}

export const OrganizationMembers: FC<OrganizationMembersProps> = ({ children, entities }) => {
  const handleError = useApolloErrorHandler();
  const { user } = useUserContext();

  const [grantMember, { loading: addingUser }] = useAssignUserToOrganisationMutation({
    onError: handleError,
  });

  const [revokeMember, { loading: removingUser }] = useRemoveUserFromOrganisationMutation({
    onError: handleError,
  });

  const [grantAdmin, { loading: addingAdmin }] = useAssignUserAsOrganisationAdminMutation({
    onError: handleError,
  });

  const [revokeAdmin, { loading: removingAdmin }] = useRemoveUserAsOrganisationAdminMutation({
    onError: handleError,
  });

  const [grantOwner, { loading: addingOwner }] = useAssignUserAsOrganisationOwnerMutation({
    onError: handleError,
  });

  const [revokeOwner, { loading: removingOwner }] = useRemoveUserAsOrganisationOwnerMutation({
    onError: handleError,
  });

  const handleAssignMember = useCallback(
    (_member: Member) => {
      grantMember({
        variables: {
          input: {
            organisationID: entities.organisationId,
            userID: _member.id,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organisationMemberCredential, resourceID: entities.organisationId },
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
            organisationID: entities.organisationId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organisationMemberCredential, resourceID: entities.organisationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleAssignAdmin = useCallback(
    (_member: Member) => {
      grantAdmin({
        variables: {
          input: {
            organisationID: entities.organisationId,
            userID: _member.id,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organisationAdminCredential, resourceID: entities.organisationId },
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
            organisationID: entities.organisationId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organisationAdminCredential, resourceID: entities.organisationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleAssignOwner = useCallback(
    (_member: Member) => {
      grantOwner({
        variables: {
          input: {
            organisationID: entities.organisationId,
            userID: _member.id,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organisationOwnerCredential, resourceID: entities.organisationId },
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
            organisationID: entities.organisationId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: organisationOwnerCredential, resourceID: entities.organisationId },
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
  } = useAvailableMembers(entities.credential, entities.organisationId, entities.parentMembers);

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
        },
        {
          addingUser,
          removingUser,
          addingAdmin,
          removingAdmin,
          addingOwner,
          removingOwner,
          loading: loading,
        }
      )}
    </>
  );
};
export default OrganizationMembers;
