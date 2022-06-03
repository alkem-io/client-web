import {
  useAllOrganizationsQuery,
  useAssignOrganizationAsCommunityLeadMutation,
  useRemoveOrganizationAsCommunityLeadMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, { UseOrganizationAssignmentOptions } from './useCommunityMembersAssignment';
import {
  AssignOrganizationAsCommunityLeadMutation,
  OrganizationDetailsFragment,
  RemoveOrganizationAsCommunityLeadMutation,
} from '../../../models/graphql-schema';

type Options<OrganizationsQueryVariables extends {}> = Omit<
  UseOrganizationAssignmentOptions<
    OrganizationsQueryVariables,
    OrganizationDetailsFragment,
    AssignOrganizationAsCommunityLeadMutation,
    RemoveOrganizationAsCommunityLeadMutation
  >,
  'allPossibleMembers' | 'useAssignMemberMutation' | 'useRemoveMemberMutation'
>;

const useLeadOrganizationAssignment = <OrganizationsQueryVariables extends {}>(
  options: Options<OrganizationsQueryVariables>
) => {
  const { existingMembers, availableMembers, ...rest } = useCommunityMembersAssignment({
    allPossibleMembers: useAllOrganizationsQuery().data?.organizations,
    useAssignMemberMutation: useAssignOrganizationAsCommunityLeadMutation,
    useRemoveMemberMutation: useRemoveOrganizationAsCommunityLeadMutation,
    ...options,
  });

  return {
    existingOrganizations: existingMembers,
    availableOrganizations: availableMembers,
    ...rest,
  };
};

export default useLeadOrganizationAssignment;
