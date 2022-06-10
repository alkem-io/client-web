import {
  useAssignOrganizationAsCommunityMemberMutation,
  useRemoveOrganizationAsCommunityMemberMutation,
} from '../../../hooks/generated/graphql';
import useCommunityMembersAssignment from './useCommunityMembersAssignment';
import useAllPossibleOrganizations from './useAllPossibleOrganizations';
import { UseOrganizationAssignmentOptions, UseOrganizationAssignmentProvided } from './OrganizationAssignmentTypes';

const useMemberOrganizationAssignment = <OrganizationsQueryVariables extends {}>(
  options: UseOrganizationAssignmentOptions<OrganizationsQueryVariables>
): UseOrganizationAssignmentProvided => {
  const { allPossibleOrganizations, ...availableOrganizationsQueryProps } = useAllPossibleOrganizations();

  const { availableMembers, existingMembers, ...rest } = useCommunityMembersAssignment({
    allPossibleMembers: allPossibleOrganizations,
    useAssignMemberMutation: useAssignOrganizationAsCommunityMemberMutation,
    useRemoveMemberMutation: useRemoveOrganizationAsCommunityMemberMutation,
    ...options,
  });

  return {
    availableOrganizations: availableMembers,
    existingOrganizations: existingMembers,
    ...rest,
    ...availableOrganizationsQueryProps,
  };
};

export default useMemberOrganizationAssignment;
