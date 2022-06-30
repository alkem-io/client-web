import {
  useAssignUserAsCommunityLeadMutation,
  useAssignUserAsCommunityMemberMutation,
  useRemoveUserAsCommunityLeadMutation,
  useRemoveUserAsCommunityMemberMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, {
  MemberMutationHook,
  UseCommunityMembersAssignmentOptions,
} from '../../community/useCommunityAssignment/useCommunityMembersAssignment';
import {
  AssignUserAsCommunityLeadMutation,
  AssignUserAsCommunityMemberMutation,
  RemoveUserAsCommunityLeadMutation,
  RemoveUserAsCommunityMemberMutation,
} from '../../../models/graphql-schema';
import { Member } from '../../../models/User';
import { PaginationVariables } from '../../shared/pagination/usePaginatedQuery';
import useAvailableCommunityUsers, {
  AvailableCommunityUsersOptions,
  UserFilterHolder,
} from './useAvailableCommunityUsers';

type MemberTypes = 'member' | 'lead';

interface Options<QueryVariables extends {}, AvailableUsersData, MemberType extends MemberTypes>
  extends Omit<
    UseCommunityMembersAssignmentOptions<
      QueryVariables,
      Member,
      MemberType extends 'lead' ? AssignUserAsCommunityLeadMutation : AssignUserAsCommunityMemberMutation,
      MemberType extends 'lead' ? RemoveUserAsCommunityLeadMutation : RemoveUserAsCommunityMemberMutation
    >,
    'allPossibleMembers' | 'useAssignMemberMutation' | 'useRemoveMemberMutation'
  > {
  availableUsers: Omit<
    AvailableCommunityUsersOptions<AvailableUsersData, QueryVariables & UserFilterHolder & PaginationVariables>,
    'variables'
  >;
  memberType: MemberType;
}

const useCommunityUserAssignment = <QueryVariables extends {}, AvailableUsersData, MemberType extends MemberTypes>({
  memberType,
  ...options
}: Options<QueryVariables, AvailableUsersData, MemberType>) => {
  const { allPossibleMemberUsers, setSearchTerm, ...availableQueryProps } = useAvailableCommunityUsers({
    ...options.availableUsers,
    variables: options.variables as AvailableCommunityUsersOptions<
      AvailableUsersData,
      QueryVariables & UserFilterHolder & PaginationVariables
    >['variables'],
  });

  const { existingMembers, availableMembers, ...communityAssignmentProps } = useCommunityMembersAssignment({
    // TODO possibility to use different types for allPossibleMembers/availableMembers and existingMembers
    allPossibleMembers: allPossibleMemberUsers as Member[],
    useAssignMemberMutation: (memberType === 'lead'
      ? useAssignUserAsCommunityLeadMutation
      : useAssignUserAsCommunityMemberMutation) as MemberMutationHook,
    useRemoveMemberMutation: (memberType === 'lead'
      ? useRemoveUserAsCommunityLeadMutation
      : useRemoveUserAsCommunityMemberMutation) as MemberMutationHook,
    ...options,
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
