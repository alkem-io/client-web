import {
  useAssignUserAsCommunityLeadMutation,
  useRemoveUserAsCommunityLeadMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, { UseCommunityMembersAssignmentOptions } from './useCommunityMembersAssignment';
import { AssignUserAsCommunityLeadMutation, RemoveUserAsCommunityLeadMutation } from '../../../models/graphql-schema';
import { UseAllPossibleMemberUsersOptions } from './useAllPossibleMemberUsers';
import { Member } from '../../../models/User';
import useAvailableLeadUsers from '../useAvailableUsers/useAvailableLeadUsers';

type Options<ExistingUsersQueryVariables extends {}> = Omit<
  UseCommunityMembersAssignmentOptions<
    ExistingUsersQueryVariables,
    Member,
    AssignUserAsCommunityLeadMutation,
    RemoveUserAsCommunityLeadMutation
  >,
  'allPossibleMembers' | 'useAssignMemberMutation' | 'useRemoveMemberMutation'
> &
  UseAllPossibleMemberUsersOptions;

const useLeadUserAssignment = <OrganizationsQueryVariables extends {}>(
  options: Options<OrganizationsQueryVariables>
) => {
  const { allPossibleMemberUsers, setSearchTerm, ...allPossibleProvided } = useAvailableLeadUsers();

  const { existingMembers, availableMembers, ...communityAssignmentProvided } = useCommunityMembersAssignment({
    // TODO possibility to use different types for allPossibleMembers/availableMembers and existingMembers
    allPossibleMembers: allPossibleMemberUsers as Member[],
    useAssignMemberMutation: useAssignUserAsCommunityLeadMutation,
    useRemoveMemberMutation: useRemoveUserAsCommunityLeadMutation,
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

export default useLeadUserAssignment;
