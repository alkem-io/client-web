import {
  refetchChallengeCommunityMembersQuery,
  useChallengeCommunityMembersQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import useLeadOrganizationAssignment from './useLeadOrganizationAssignment';

interface Options {
  hubId: string | undefined;
  challengeId: string | undefined;
}

const useChallengeLeadOrganizationAssignment = (options: Options) =>
  useLeadOrganizationAssignment({
    variables: options,
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useChallengeCommunityMembersQuery({ variables, skip });

      return {
        communityId: data?.hub.challenge.community?.id,
        existingMembers: data?.hub.challenge?.community?.leadOrganizations,
      };
    },
    refetchQueries: [refetchChallengeCommunityMembersQuery],
  });

export default useChallengeLeadOrganizationAssignment;
