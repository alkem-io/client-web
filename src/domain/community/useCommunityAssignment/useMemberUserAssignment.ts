import {
  useAssignUserAsCommunityMemberMutation,
  useRemoveUserAsCommunityMemberMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, { UseCommunityMembersAssignmentOptions } from './useCommunityMembersAssignment';
import {
  AssignUserAsCommunityMemberMutation,
  RemoveUserAsCommunityMemberMutation,
} from '../../../models/graphql-schema';
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
    AssignUserAsCommunityMemberMutation,
    RemoveUserAsCommunityMemberMutation
  >,
  'allPossibleMembers' | 'useAssignMemberMutation' | 'useRemoveMemberMutation'
> & {
  useAvailableLeadUsersOptions: UseAvailableLeadUsersOptions<AvailableLeadUsersQuery, AvailableLeadUsersQueryVariables>;
};

const useMemberUserAssignment = <
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
    allPossibleMembers: availableMembers as Member[],
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
