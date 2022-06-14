import {
  refetchChallengeCommunityMembersQuery,
  useChallengeCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
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
    refetchMembersQuery: refetchChallengeCommunityMembersQuery,
  });

export default useChallengeLeadOrganizationAssignment;
