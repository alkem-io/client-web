import {
  useAssignUserAsCommunityLeadMutation,
  useAssignUserAsCommunityMemberMutation,
  useRemoveUserAsCommunityLeadMutation,
  useRemoveUserAsCommunityMemberMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, {
  MemberMutationHook,
  RefetchQuery,
} from '../../community/useCommunityAssignment/useCommunityMembersAssignment';
import { Member } from '../../../models/User';
import { PaginationVariables } from '../../shared/pagination/usePaginatedQuery';
import useAvailableCommunityUsers, {
  AvailableCommunityUsersOptions,
  UserFilterHolder,
} from './useAvailableCommunityUsers';
import { QueryHookOptions, QueryResult } from '@apollo/client/react/types/types';
import { Identifiable } from '../../shared/types/Identifiable';
import { PossiblyUndefinedProps } from '../../shared/types/PossiblyUndefinedProps';

type MemberTypes = 'member' | 'lead';

interface Community extends Identifiable {
  memberUsers?: Member[];
  leadUsers?: Member[];
}

interface Options<QueryVariables extends {}, ExistingMembersData, AvailableUsersData, MemberType extends MemberTypes> {
  variables: PossiblyUndefinedProps<QueryVariables>;
  availableUsersOptions: Omit<
    AvailableCommunityUsersOptions<AvailableUsersData, QueryVariables & UserFilterHolder & PaginationVariables>,
    'variables' | 'pageSize'
  > & {
    refetchQuery: RefetchQuery<QueryVariables & UserFilterHolder & PaginationVariables>;
  };
  memberType: MemberType;
  existingUsersOptions: {
    useQuery: (
      options: QueryHookOptions<ExistingMembersData, QueryVariables>
    ) => QueryResult<ExistingMembersData, QueryVariables>;
    readCommunity: (data: ExistingMembersData) => Community | undefined;
    refetchQuery: RefetchQuery<QueryVariables>;
  };
}

const AVAILABLE_USERS_PER_PAGE = 10;

const useCommunityUserAssignment = <
  QueryVariables extends {},
  ExistingMembersData,
  AvailableUsersData,
  MemberType extends MemberTypes
>({
  memberType,
  availableUsersOptions,
  existingUsersOptions,
  variables,
}: Options<QueryVariables, ExistingMembersData, AvailableUsersData, MemberType>) => {
  const { allPossibleMemberUsers, filter, setSearchTerm, ...availableQueryProps } = useAvailableCommunityUsers({
    ...availableUsersOptions,
    variables: variables as AvailableCommunityUsersOptions<
      AvailableUsersData,
      QueryVariables & UserFilterHolder & PaginationVariables
    >['variables'],
    pageSize: AVAILABLE_USERS_PER_PAGE,
  });

  const refetchAvailableMembersQuery = variables =>
    availableUsersOptions.refetchQuery({
      ...variables,
      filter,
      first: AVAILABLE_USERS_PER_PAGE,
    });

  const { existingMembers, availableMembers, ...communityAssignmentProps } = useCommunityMembersAssignment({
    variables,
    useExistingMembersQuery: queryOptions => {
      const { data } = existingUsersOptions.useQuery(
        queryOptions as QueryHookOptions<ExistingMembersData, QueryVariables>
      );
      const community = data && existingUsersOptions.readCommunity(data);
      return {
        communityId: community?.id,
        existingMembers: memberType === 'lead' ? community?.leadUsers : community?.memberUsers,
      };
    },
    allPossibleMembers: allPossibleMemberUsers as Member[], // TODO make possible to use different types for available and existing members
    useAssignMemberMutation: (memberType === 'lead'
      ? useAssignUserAsCommunityLeadMutation
      : useAssignUserAsCommunityMemberMutation) as MemberMutationHook,
    useRemoveMemberMutation: (memberType === 'lead'
      ? useRemoveUserAsCommunityLeadMutation
      : useRemoveUserAsCommunityMemberMutation) as MemberMutationHook,
    refetchQueries: [existingUsersOptions.refetchQuery, refetchAvailableMembersQuery],
  });

  return {
    members: existingMembers,
    availableMembers,
    onSearchTermChange: setSearchTerm,
    ...communityAssignmentProps,
    ...availableQueryProps,
  };
};

export default useCommunityUserAssignment;
