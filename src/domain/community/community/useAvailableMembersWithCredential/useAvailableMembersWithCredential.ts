import { useMemo } from 'react';
import { AuthorizationCredential, UserDisplayNameFragment } from '@core/apollo/generated/graphql-schema';
import { useUsersWithCredentialsQuery } from '@core/apollo/generated/apollo-hooks';
import { Member } from '../../user/models/User';
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

const EMPTY_LIST = [];

/***
 * Hook to fetch available users in a certain context, defined by the parent members (if applicable),
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
    data: existingMembers,
    loading: loadingMembers,
    error: membersError,
  } = useUsersWithCredentialsQuery({
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        type: credential,
        resourceID: resourceId,
      },
    },
  });

  const isLoading = loadingAllPossibleMembers || loadingMembers;
  const hasError = errorOnLoadingAllPossibleMembers || !!membersError;

  const availableMembers = useMemo<UserDisplayNameFragment[] | undefined>(() => {
    if (!existingMembers?.usersWithAuthorizationCredential) {
      return allPossibleMemberUsers;
    }
    return allPossibleMemberUsers?.filter(
      member => !existingMembers.usersWithAuthorizationCredential.some(user => user.id === member.id)
    );
  }, [allPossibleMemberUsers, existingMembers]);

  return {
    availableMembers: availableMembers ?? EMPTY_LIST,
    currentMembers: existingMembers?.usersWithAuthorizationCredential ?? EMPTY_LIST,
    error: hasError,
    loading: isLoading,
    ...allPossibleMembersProvided,
  };
};
