import {
  useAssignUserAsCommunityMemberMutation,
  useRemoveUserAsCommunityMemberMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, { UseCommunityMembersAssignmentOptions } from './useCommunityMembersAssignment';
import {
  AssignUserAsCommunityMemberMutation,
  RemoveUserAsCommunityMemberMutation,
} from '../../../models/graphql-schema';
import { UseAllPossibleMemberUsersOptions } from './useAllPossibleMemberUsers';
import { Member } from '../../../models/User';
import useAvailableMemberUsers from '../useAvailableUsers/useAvailableMemberUsers';

type Options<ExistingUsersQueryVariables extends {}> = Omit<
  UseCommunityMembersAssignmentOptions<
    ExistingUsersQueryVariables,
    Member,
    AssignUserAsCommunityMemberMutation,
    RemoveUserAsCommunityMemberMutation
  >,
  'allPossibleMembers' | 'useAssignMemberMutation' | 'useRemoveMemberMutation'
> &
  UseAllPossibleMemberUsersOptions;

const useMemberUserAssignment = <OrganizationsQueryVariables extends {}>(
  options: Options<OrganizationsQueryVariables>
) => {
  const { allPossibleMemberUsers, setSearchTerm, ...allPossibleProvided } = useAvailableMemberUsers();

  const { existingMembers, availableMembers, ...communityAssignmentProvided } = useCommunityMembersAssignment({
    // TODO possibility to use different types for allPossibleMembers/availableMembers and existingMembers
    allPossibleMembers: allPossibleMemberUsers as Member[],
    useAssignMemberMutation: useAssignUserAsCommunityMemberMutation,
    useRemoveMemberMutation: useRemoveUserAsCommunityMemberMutation,
    ...options,
  });

  return {
    members: existingMembers,
    availableMembers,
    onSearchTermChange: setSearchTerm,
    ...communityAssignmentProvided,
    ...allPossibleProvided,
  };
};

export default useMemberUserAssignment;
