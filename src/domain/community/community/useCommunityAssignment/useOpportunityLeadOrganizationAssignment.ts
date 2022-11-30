import {
  refetchOpportunityCommunityMembersQuery,
  useOpportunityCommunityMembersQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import useLeadOrganizationAssignment from './useLeadOrganizationAssignment';

interface Options {
  hubId: string | undefined;
  opportunityId: string | undefined;
}

const useOpportunityLeadOrganizationAssignment = (options: Options) =>
  useLeadOrganizationAssignment({
    variables: options,
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useOpportunityCommunityMembersQuery({ variables, skip });

      return {
        communityId: data?.hub.opportunity?.community?.id,
        existingMembers: data?.hub.opportunity?.community?.leadOrganizations,
      };
    },
    refetchQueries: [refetchOpportunityCommunityMembersQuery],
  });

export default useOpportunityLeadOrganizationAssignment;
