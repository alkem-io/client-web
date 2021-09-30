import { useMemo } from 'react';
import { AuthorizationCredential } from '../models/graphql-schema';
import { useCommunityMembersQuery, useUsersQuery, useUsersWithCredentialsQuery } from './generated/graphql';
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
 * @param parentCommunityId The parent entity community id (if applicable)
 * are the members of its parent ecoverse or challenge
 */
export const useAvailableMembers = (
  credential: AuthorizationCredential,
  resourceId?: string,
  parentCommunityId?: string,
  parentMembers?: Member[] // Just because the organizations doesn't have community.
): AvailableMembersResults => {
  const {
    data: _allUsers,
    loading: loadingUsers,
    error: userError,
  } = useUsersQuery({
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first', // Used for subsequent executions
    skip: Boolean(parentCommunityId || parentMembers),
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
  });

  const {
    data: _parentCommunityMembers,
    loading: loadingParentCommunityMembers,
    error: parentCommunityMembersError,
  } = useCommunityMembersQuery({
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first', // Used for subsequent executions
    variables: {
      communityId: parentCommunityId || '',
    },
    skip: Boolean(!parentCommunityId || parentMembers),
  });

  const current = _current?.usersWithAuthorizationCredential || [];

  const isLoading = loadingUsers || loadingMembers || loadingParentCommunityMembers;
  const hasError = !!(membersError || userError || parentCommunityMembersError);
  const entityMembers = parentMembers || _parentCommunityMembers?.community.members || allUsers || [];

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
