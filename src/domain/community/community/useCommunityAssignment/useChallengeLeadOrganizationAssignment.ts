import {
  refetchChallengeCommunityMembersQuery,
  useChallengeCommunityMembersQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import useLeadOrganizationAssignment from './useLeadOrganizationAssignment';

interface Options {
  spaceId: string | undefined;
  challengeId: string | undefined;
}

const useChallengeLeadOrganizationAssignment = (options: Options) =>
  useLeadOrganizationAssignment({
    variables: options,
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useChallengeCommunityMembersQuery({ variables, skip });

      return {
        communityId: data?.space.challenge.community?.id,
        existingMembers: data?.space.challenge?.community?.leadOrganizations,
      };
    },
    refetchQueries: [refetchChallengeCommunityMembersQuery],
  });

export default useChallengeLeadOrganizationAssignment;
