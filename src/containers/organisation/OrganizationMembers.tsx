import React, { FC, useCallback, useMemo } from 'react';
import { useUserContext } from '../../hooks';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserAsOrganisationAdminMutation,
  useAssignUserToOrganisationMutation,
  useOrganisationMembersQuery,
  useRemoveUserAsOrganisationAdminMutation,
  useRemoveUserFromOrganisationMutation,
  useUsersWithCredentialsQuery,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks/graphql/useApolloErrorHandler';
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
  const { user } = useUserContext();

  const { data, loading: loadingMembers } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: entities.credential,
        resourceID: entities.organisationId,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: membersData, loading: loadingOrganisationMembers } = useOrganisationMembersQuery({
    variables: {
      id: entities.organisationId,
    },
    skip: entities.credential !== AuthorizationCredential.OrganisationAdmin,
    fetchPolicy: 'cache-and-network',
  });

  const members = useMemo(() => data?.usersWithAuthorizationCredential || [], [data]);
  const handleError = useApolloErrorHandler();

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

  // TODO [ATS]: Extract into hook to be reused.
  const availableMembers = useMemo(() => {
    if (entities.parentMembers) return entities.parentMembers.filter(p => members.findIndex(m => m.id === p.id) < 0);
    return membersData?.organisation.members?.filter(p => members.findIndex(m => m.id === p.id) < 0) || [];
  }, [entities, data, membersData]);

  const allMembers = useMemo(
    () =>
      data?.usersWithAuthorizationCredential.map<Member>(x => ({
        id: x.id,
        displayName: x.displayName,
        email: x.email,
        firstName: x.firstName,
        lastName: x.lastName,
      })) || [],
    [data]
  );

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
        { addingUser, removingUser, addingAdmin, removingAdmin, loading: loadingMembers || loadingOrganisationMembers }
      )}
    </>
  );
};
export default OrganizationMembers;
