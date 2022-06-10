import {
  Provided as UseCommunityMembersAssignmentProvided,
  UseCommunityMembersAssignmentOptions,
} from './useCommunityMembersAssignment';
import {
  AssignOrganizationAsCommunityLeadMutation,
  AssignOrganizationAsCommunityMemberMutation,
  OrganizationDetailsFragment,
  RemoveOrganizationAsCommunityLeadMutation,
  RemoveOrganizationAsCommunityMemberMutation,
} from '../../../models/graphql-schema';
import { Provided as UseAllPossibleOrganizationsProvided } from './useAllPossibleOrganizations';

export type UseOrganizationAssignmentOptions<OrganizationsQueryVariables extends {}> = Omit<
  UseCommunityMembersAssignmentOptions<
    OrganizationsQueryVariables,
    OrganizationDetailsFragment,
    AssignOrganizationAsCommunityLeadMutation | AssignOrganizationAsCommunityMemberMutation,
    RemoveOrganizationAsCommunityLeadMutation | RemoveOrganizationAsCommunityMemberMutation
  >,
  'allPossibleMembers' | 'useAssignMemberMutation' | 'useRemoveMemberMutation'
>;

type CommunityOrganizationAssignmentProvided = UseCommunityMembersAssignmentProvided<OrganizationDetailsFragment>;

export interface UseOrganizationAssignmentProvided
  extends Omit<CommunityOrganizationAssignmentProvided, 'existingMembers' | 'availableMembers'>,
    Omit<UseAllPossibleOrganizationsProvided, 'allPossibleOrganizations'> {
  existingOrganizations: CommunityOrganizationAssignmentProvided['existingMembers'];
  availableOrganizations: CommunityOrganizationAssignmentProvided['availableMembers'];
}
