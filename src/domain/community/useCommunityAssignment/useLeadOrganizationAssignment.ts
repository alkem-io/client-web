import {
  useAssignOrganizationAsCommunityLeadMutation,
  useRemoveOrganizationAsCommunityLeadMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment from './useCommunityMembersAssignment';
import useAllPossibleOrganizations from './useAllPossibleOrganizations';
import { UseOrganizationAssignmentOptions, UseOrganizationAssignmentProvided } from './OrganizationAssignmentTypes';

const useLeadOrganizationAssignment = <OrganizationsQueryVariables extends {}>(
  options: UseOrganizationAssignmentOptions<OrganizationsQueryVariables>
): UseOrganizationAssignmentProvided => {
  const { allPossibleOrganizations, ...availableOrganizationsQueryProps } = useAllPossibleOrganizations();

  const { existingMembers, availableMembers, ...rest } = useCommunityMembersAssignment({
    allPossibleMembers: allPossibleOrganizations,
    useAssignMemberMutation: useAssignOrganizationAsCommunityLeadMutation,
    useRemoveMemberMutation: useRemoveOrganizationAsCommunityLeadMutation,
    ...options,
  });

  return {
    existingOrganizations: existingMembers,
    availableOrganizations: availableMembers,
    ...rest,
    ...availableOrganizationsQueryProps,
  };
};

export default useLeadOrganizationAssignment;
