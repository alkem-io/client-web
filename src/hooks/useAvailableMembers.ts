import { useMemo } from 'react';
import { AuthorizationCredential } from '../models/graphql-schema';
import { useUsersQuery, useUsersWithCredentialsQuery } from './generated/graphql';
import { Member } from '../models/User';

export interface AvailableMembersResults {
  available: Member[];
  current: Member[];
  loading: boolean;
  error: boolean;
}

/***
 * Hook to fetch available users in a curtain context, defined by the parent members (if applicable),
 * the credential type of the authorization group and the resource
 * @param credential The credential type of the authorization group
 * @param resourceId The resource
 * @param parentMembers The members of the parent entity (if applicable), e.g. parent members of a challenge
 * are the members of its parent ecoverse or challenge
 */
export const useAvailableMembers = (
  credential: AuthorizationCredential,
  resourceId: string,
  parentMembers?: Member[]
): AvailableMembersResults => {
  const {
    data: _allUsers,
    loading: loadingUsers,
    error: userError,
  } = useUsersQuery({
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first', // Used for subsequent executions
    skip: parentMembers != null,
  });
  const allUsers = _allUsers?.users;

  const {
    data: _current,
    loading: loadingMembers,
    error: membersError,
  } = useUsersWithCredentialsQuery({
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first', // Used for subsequent executions
    variables: {
      input: {
        type: credential,
        resourceID: resourceId,
      },
    },
    skip: !resourceId,
  });
  const current = _current?.usersWithAuthorizationCredential || [];

  const isLoading = loadingUsers || loadingMembers;
  const hasError = !!(membersError || userError);
  //parent members of all users if not applicable, e.g. ecoverse/organization
  const entityMembers = parentMembers || allUsers || [];
  const availableMembers = useMemo<Member[]>(
    () => entityMembers.filter(p => current.findIndex(m => m.id === p.id) < 0),
    [entityMembers, current]
  );

  return {
    available: availableMembers,
    current: current,
    error: hasError,
    loading: isLoading,
  };
};
