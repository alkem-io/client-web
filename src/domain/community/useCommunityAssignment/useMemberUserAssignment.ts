import {
  useAssignUserAsCommunityMemberMutation,
  useRemoveUserAsCommunityMemberMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, { UseOrganizationAssignmentOptions } from './useCommunityMembersAssignment';
import {
  AssignUserAsCommunityMemberMutation,
  RemoveUserAsCommunityMemberMutation,
} from '../../../models/graphql-schema';
import useAllPossibleMemberUsers, { UseAllPossibleMemberUsersOptions } from './useAllPossibleMemberUsers';
import { Member } from '../../../models/User';

type Options<ExistingUsersQueryVariables extends {}> = Omit<
  UseOrganizationAssignmentOptions<
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
  const { allPossibleMemberUsers, ...allPossibleProvided } = useAllPossibleMemberUsers(options);

  const { existingMembers, availableMembers, ...communityAssignmentProvided } = useCommunityMembersAssignment({
    // TODO possibility to use different types for allPossibleMembers/availableMembers and existingMembers
    allPossibleMembers: allPossibleMemberUsers as Member[],
    useAssignMemberMutation: useAssignUserAsCommunityMemberMutation,
    useRemoveMemberMutation: useRemoveUserAsCommunityMemberMutation,
    ...options,
  });

  return {
    existingUsers: existingMembers,
    availableUsers: availableMembers,
    ...communityAssignmentProvided,
    ...allPossibleProvided,
  };
};

export default useMemberUserAssignment;
