import {
  refetchOpportunityCommunityMembersQuery,
  useOpportunityCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
import useMemberOrganizationAssignment from './useMemberOrganizationAssignment';

interface Options {
  hubId: string | undefined;
  opportunityId: string | undefined;
}

const useOpportunityMemberOrganizationAssignment = (options: Options) =>
  useMemberOrganizationAssignment({
    variables: options,
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useOpportunityCommunityMembersQuery({ variables, skip });

      return {
        communityId: data?.hub.opportunity?.community?.id,
        existingMembers: data?.hub.opportunity?.community?.memberOrganizations,
      };
    },
    refetchQueries: [refetchOpportunityCommunityMembersQuery],
  });

export default useOpportunityMemberOrganizationAssignment;
