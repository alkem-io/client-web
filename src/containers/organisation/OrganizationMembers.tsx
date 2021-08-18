import React, { FC, useCallback, useMemo } from 'react';
import {
  refetchUsersWithCredentialsQuery,
  useAssignUserToOrganisationMutation,
  useRemoveUserFromOrganisationMutation,
  useUsersWithCredentialsQuery,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks/graphql/useApolloErrorHandler';
import { AuthorizationCredential, Organisation } from '../../models/graphql-schema';
import { Member } from '../../models/User';

const credential = AuthorizationCredential.OrganisationMember;

export interface OrganizationMembersProps {
  entities: {
    organisationId: Organisation['id'];
    parentMembers: Member[];
  };
  children: (
    entities: OrganizationMembersEntities,
    actions: OrganizationMembersActions,
    state: OrganizationMembersState
  ) => React.ReactNode;
}

export interface OrganizationMembersActions {
  handleAdd: (member: Member) => void;
  handleRemove: (member: Member) => void;
}

export interface OrganizationMembersState {
  addingUser: boolean;
  removingUser: boolean;
  loading: boolean;
}

export interface OrganizationMembersEntities {
  availableMembers: Member[];
  allMembers: Member[];
}

export const OrganizationMembers: FC<OrganizationMembersProps> = ({ children, entities }) => {
  const { data, loading: loadingMembers } = useUsersWithCredentialsQuery({
    variables: {
      input: {
        type: credential,
        resourceID: entities.organisationId,
      },
    },
  });

  const members = useMemo(() => data?.usersWithAuthorizationCredential || [], [data]);
  const handleError = useApolloErrorHandler();

  const [grant, { loading: addingUser }] = useAssignUserToOrganisationMutation({
    onError: handleError,
  });

  const [revoke, { loading: removingUser }] = useRemoveUserFromOrganisationMutation({
    onError: handleError,
  });

  const handleAdd = useCallback(
    (_member: Member) => {
      grant({
        variables: {
          input: {
            organisationID: entities.organisationId,
            userID: _member.id,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: credential, resourceID: entities.organisationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  const handleRemove = useCallback(
    (_member: Member) => {
      revoke({
        variables: {
          input: {
            userID: _member.id,
            organisationID: entities.organisationId,
          },
        },
        refetchQueries: [
          refetchUsersWithCredentialsQuery({
            input: { type: credential, resourceID: entities.organisationId },
          }),
        ],
        awaitRefetchQueries: true,
      });
    },
    [entities]
  );

  // TODO [ATS]: Extract into hook to be reused.
  const availableMembers = useMemo(() => {
    return entities.parentMembers.filter(p => members.findIndex(m => m.id === p.id) < 0);
  }, [entities, data]);

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

  return (
    <>
      {children(
        { availableMembers, allMembers },
        { handleAdd, handleRemove },
        { addingUser, removingUser, loading: loadingMembers }
      )}
    </>
  );
};
export default OrganizationMembers;
