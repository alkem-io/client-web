import { useMemo } from 'react';
import { AuthorizationCredential, UserDisplayNameFragment, UserFilterInput } from '../../../models/graphql-schema';
import {
  useAvailableUsers2Query,
  useAvailableUsersFilteredQuery,
  useCommunityMembersQuery,
  useUsersWithCredentialsSimpleListQuery,
} from '../../generated/graphql';
import { Member } from '../../../models/User';
import { useHub } from '../../useHub';

export interface AvailableMembersResults {
  available: UserDisplayNameFragment[];
  current: Member[];
  onLoadMore: (amount?: number) => void;
  isLastAvailableUserPage: boolean;
  loading: boolean;
  error: boolean;
}

const DEFAULT_FIRST = 9999;
const noop = () => {};

/***
 * Hook to fetch available users in a curtain context, defined by the parent members (if applicable),
 * the credential type of the authorization group and the resource
 * @param credential The credential type of the authorization group
 * @param resourceId The resource
 * @param parentCommunityId The parent entity community id (if applicable)
 * are the members of its parent hub or challenge
 * @param parentMembers
 * @param filter
 */
export const useAvailableMembers2 = (
  credential: AuthorizationCredential,
  resourceId?: string,
  parentCommunityId?: string,
  parentMembers?: Member[], // Just because the organizations doesn't have community.
  filter?: UserFilterInput
): AvailableMembersResults => {
  const { hubId, loading: loadingHub } = useHub();
  const {
    data: usersQueryData,
    loading: loadingUsers,
    error: userError,
  } = useAvailableUsers2Query({
    variables: { first: DEFAULT_FIRST },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first', // Used for subsequent executions
    skip: Boolean(parentCommunityId || parentMembers),
  });

  const {
    data: usersFilteredQueryData,
    loading: loadingFilteredUsers,
    error: userFilteredError,
  } = useAvailableUsersFilteredQuery({
    variables: {
      first: DEFAULT_FIRST,
      filter,
    },
    fetchPolicy: 'network-only', // Used for first execution
    nextFetchPolicy: 'cache-first', // Used for subsequent executions
    skip: Boolean(parentCommunityId || parentMembers || !filter),
  });

  const {
    data: _current,
    loading: loadingMembers,
    error: membersError,
  } = useUsersWithCredentialsSimpleListQuery({
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
      hubId: hubId,
      communityId: parentCommunityId || '',
    },
    skip: Boolean(!hubId || !parentCommunityId || parentMembers),
  });

  const current = _current?.usersWithAuthorizationCredential || [];

  const isLoading =
    loadingUsers || loadingFilteredUsers || loadingMembers || loadingParentCommunityMembers || loadingHub;
  const hasError = !!(membersError || userFilteredError || userError || parentCommunityMembersError);
  const entityMembers = (parentMembers ||
    _parentCommunityMembers?.hub.community?.members ||
    (filter && usersFilteredQueryData?.usersPaginated?.users) ||
    usersQueryData?.usersPaginated.users ||
    []) as UserDisplayNameFragment[];

  const availableMembers = useMemo<UserDisplayNameFragment[]>(
    () => entityMembers.filter(member => !current.some(m => m.id === member.id)),
    [entityMembers, current]
  );

  /*const onLoadMore = (amount = DEFAULT_FIRST) => {
    if (!usersQueryData) {
      return;
    }

    fetchMore({
      variables: {
        first: amount,
        after: usersQueryData.usersPaginated.pageInfo.endCursor
      }
    })
  };*/
  const onLoadMore = noop;

  //const isLastAvailableUserPage = !usersQueryData?.usersPaginated.pageInfo.hasNextPage ?? true;
  const isLastAvailableUserPage = true;

  return {
    available: availableMembers,
    current: current,
    error: hasError,
    loading: isLoading,
    // the rest is to keep contract intact until the pagination is re-introduced
    onLoadMore,
    isLastAvailableUserPage,
  };
};
