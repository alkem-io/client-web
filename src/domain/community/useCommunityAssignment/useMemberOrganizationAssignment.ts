import {
  useAllOrganizationsQuery,
  useAssignOrganizationAsCommunityMemberMutation,
  useRemoveOrganizationAsCommunityMemberMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment, { UseOrganizationAssignmentOptions } from './useCommunityMembersAssignment';
import {
  AssignOrganizationAsCommunityMemberMutation,
  OrganizationDetailsFragment,
  RemoveOrganizationAsCommunityMemberMutation,
} from '../../../models/graphql-schema';

type Options<OrganizationsQueryVariables extends {}> = Omit<
  UseOrganizationAssignmentOptions<
    OrganizationsQueryVariables,
    OrganizationDetailsFragment,
    AssignOrganizationAsCommunityMemberMutation,
    RemoveOrganizationAsCommunityMemberMutation
  >,
  'allPossibleMembers' | 'useAssignMemberMutation' | 'useRemoveMemberMutation'
>;

const useMemberOrganizationAssignment = <OrganizationsQueryVariables extends {}>(
  options: Options<OrganizationsQueryVariables>
) => {
  const { availableMembers, existingMembers, ...rest } = useCommunityMembersAssignment({
    allPossibleMembers: useAllOrganizationsQuery().data?.organizations,
    useAssignMemberMutation: useAssignOrganizationAsCommunityMemberMutation,
    useRemoveMemberMutation: useRemoveOrganizationAsCommunityMemberMutation,
    ...options,
  });

  return {
    availableOrganizations: availableMembers,
    existingOrganizations: existingMembers,
    ...rest,
  };
};

export default useMemberOrganizationAssignment;
