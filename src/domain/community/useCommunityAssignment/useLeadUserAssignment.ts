import {
  useAssignUserAsCommunityLeadMutation,
  useRemoveUserAsCommunityLeadMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, { UseOrganizationAssignmentOptions } from './useCommunityMembersAssignment';
import { AssignUserAsCommunityLeadMutation, RemoveUserAsCommunityLeadMutation } from '../../../models/graphql-schema';
import useAllPossibleMemberUsers, { UseAllPossibleMemberUsersOptions } from './useAllPossibleMemberUsers';
import { Member } from '../../../models/User';

type Options<ExistingUsersQueryVariables extends {}> = Omit<
  UseOrganizationAssignmentOptions<
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
  const { allPossibleMemberUsers, ...allPossibleProvided } = useAllPossibleMemberUsers(options);

  const { existingMembers, availableMembers, ...communityAssignmentProvided } = useCommunityMembersAssignment({
    // TODO possibility to use different types for allPossibleMembers/availableMembers and existingMembers
    allPossibleMembers: allPossibleMemberUsers as Member[],
    useAssignMemberMutation: useAssignUserAsCommunityLeadMutation,
    useRemoveMemberMutation: useRemoveUserAsCommunityLeadMutation,
    ...options,
  });

  return {
    existingUsers: existingMembers,
    availableUsers: availableMembers,
    ...communityAssignmentProvided,
    ...allPossibleProvided,
  };
};

export default useLeadUserAssignment;
