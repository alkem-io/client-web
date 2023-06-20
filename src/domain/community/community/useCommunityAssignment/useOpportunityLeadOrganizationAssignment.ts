import {
  refetchOpportunityCommunityMembersQuery,
  useOpportunityCommunityMembersQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import useLeadOrganizationAssignment from './useLeadOrganizationAssignment';

interface Options {
  spaceId: string | undefined;
  opportunityId: string | undefined;
}

const useOpportunityLeadOrganizationAssignment = (options: Options) =>
  useLeadOrganizationAssignment({
    variables: options,
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useOpportunityCommunityMembersQuery({ variables, skip });

      return {
        communityId: data?.space.opportunity?.community?.id,
        existingMembers: data?.space.opportunity?.community?.leadOrganizations,
      };
    },
    refetchQueries: [refetchOpportunityCommunityMembersQuery],
  });

export default useOpportunityLeadOrganizationAssignment;
