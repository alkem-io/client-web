import { useMemo } from 'react';
import { AuthorizationCredential, UserDisplayNameFragment } from '../../../models/graphql-schema';
import { useUsersWithCredentialsSimpleListQuery } from '../../../hooks/generated/graphql';
import { Member } from '../../../models/User';
import { UseUsersSearchResult } from './useUsersSearch';
import useAllPossibleMemberUsers from '../useCommunityAssignment/useAllPossibleMemberUsers';

export interface AvailableMembersResults {
  availableMembers: UserDisplayNameFragment[];
  currentMembers: Member[];
  fetchMore: (amount?: number) => Promise<void>;
  hasMore: boolean | undefined;
  loading: boolean;
  error: boolean;
  pageSize: number;
  firstPageSize: number;
  setSearchTerm: UseUsersSearchResult['setSearchTerm'];
}

interface CurrentUserAttrs {
  credential: AuthorizationCredential;
  resourceId?: string;
}

interface CommunityMembersAttrs {
  parentCommunityId?: string;
}

export type UseAvailableMembersOptions = CurrentUserAttrs & CommunityMembersAttrs;

const EMPTY_MEMBERS_LIST: UserDisplayNameFragment[] = [];

/***
 * Hook to fetch available users in a curtain context, defined by the parent members (if applicable),
 * the credential type of the authorization group and the resource
 * @param options.credential The credential type of the authorization group
 * @param options.resourceId The resource
 * @param options.parentCommunityId The parent entity community id (if applicable)
 * @param options.filter
 */
export const useAvailableMembersWithCredential = (options: UseAvailableMembersOptions): AvailableMembersResults => {
  const { credential, resourceId, parentCommunityId } = options;

  const {
    allPossibleMemberUsers,
    loading: loadingAllPossibleMembers,
    error: errorOnLoadingAllPossibleMembers,
    ...allPossibleMembersProvided
  } = useAllPossibleMemberUsers({
    parentCommunityId,
  });

  const {
    data: _current,
    loading: loadingMembers,
    error: membersError,
  } = useUsersWithCredentialsSimpleListQuery({
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        type: credential,
        resourceID: resourceId,
      },
    },
  });

  const current = _current?.usersWithAuthorizationCredential || [];

  const isLoading = loadingAllPossibleMembers || loadingMembers;
  const hasError = errorOnLoadingAllPossibleMembers || !!membersError;
  const entityMembers = allPossibleMemberUsers || EMPTY_MEMBERS_LIST;

  const availableMembers = useMemo<UserDisplayNameFragment[]>(
    () => entityMembers.filter(member => !current.some(user => user.id === member.id)),
    [entityMembers, current]
  );

  return {
    availableMembers: availableMembers,
    currentMembers: current,
    error: hasError,
    loading: isLoading,
    ...allPossibleMembersProvided,
  };
};
