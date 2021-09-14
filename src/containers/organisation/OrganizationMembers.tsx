import React, { FC, useCallback, useMemo } from 'react';
import { useUserContext } from '../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsOrganisationAdminMutation,
  useAssignUserToOrganisationMutation,
  useRemoveUserAsOrganisationAdminMutation,
  useRemoveUserFromOrganisationMutation,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler, useAvailableMembers } from '../../hooks';
import { AuthorizationCredential, Organisation } from '../../models/graphql-schema';
import { Member } from '../../models/User';

const organisationMemberCredential = AuthorizationCredential.OrganisationMember;
const organisationAdminCredential = AuthorizationCredential.OrganisationAdmin;

export interface OrganizationMembersProps {
  entities: {
    organisationId: Organisation['id'];
    parentMembers?: Member[];
    credential: AuthorizationCredential.OrganisationMember | AuthorizationCredential.OrganisationAdmin;
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
}

export interface OrganizationMembersState {
  addingUser: boolean;
  removingUser: boolean;
  addingAdmin: boolean;
  removingAdmin: boolean;
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
        { handleAssignMember, handleRemoveMember, handleAssignAdmin, handleRemoveAdmin },
        { addingUser, removingUser, addingAdmin, removingAdmin, loading }
      )}
    </>
  );
};
export default OrganizationMembers;
