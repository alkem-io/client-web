import {
  useAssignUserAsCommunityLeadMutation,
  useRemoveUserAsCommunityLeadMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, { UseCommunityMembersAssignmentOptions } from './useCommunityMembersAssignment';
import { AssignUserAsCommunityLeadMutation, RemoveUserAsCommunityLeadMutation } from '../../../models/graphql-schema';
import { Member } from '../../../models/User';
import useAvailableUsers, { UseAvailableLeadUsersOptions } from '../useAvailableUsers/useAvailableUsers';

type Options<
  ExistingUsersQueryVariables extends {},
  AvailableLeadUsersQuery,
  AvailableLeadUsersQueryVariables extends {}
> = Omit<
  UseCommunityMembersAssignmentOptions<
    ExistingUsersQueryVariables,
    Member,
    AssignUserAsCommunityLeadMutation,
    RemoveUserAsCommunityLeadMutation
  >,
  'allPossibleMembers' | 'useAssignMemberMutation' | 'useRemoveMemberMutation'
> & {
  useAvailableLeadUsersOptions: UseAvailableLeadUsersOptions<AvailableLeadUsersQuery, AvailableLeadUsersQueryVariables>;
};

const useLeadUserAssignment = <
  ExistingUsersQueryVariables extends {},
  AvailableLeadUsersQuery,
  AvailableLeadUsersQueryVariables extends {}
>(
  options: Options<ExistingUsersQueryVariables, AvailableLeadUsersQuery, AvailableLeadUsersQueryVariables>
) => {
  const { availableMembers, setSearchTerm, ...allPossibleProvided } = useAvailableUsers(
    options.useAvailableLeadUsersOptions
  );

  const {
    existingMembers,
    availableMembers: _availableMembers,
    ...communityAssignmentProvided
  } = useCommunityMembersAssignment({
    // TODO possibility to use different types for allPossibleMembers/availableMembers and existingMembers
    // allPossibleMembers: allPossibleMemberUsers as Member[],
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
