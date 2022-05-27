import {
  refetchChallengeCommunityMembersQuery,
  useChallengeCommunityMembersQuery,
} from '../../../hooks/generated/graphql';
import useMemberOrganizationAssignment from './useMemberOrganizationAssignment';

interface Options {
  hubId: string | undefined;
  challengeId: string | undefined;
}

const useChallengeMemberOrganizationAssignment = (options: Options) =>
  useMemberOrganizationAssignment({
    variables: options,
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useChallengeCommunityMembersQuery({ variables, skip });

      return {
        communityId: data?.hub.challenge?.community?.id,
        existingMembers: data?.hub.challenge?.community?.memberOrganizations,
      };
    },
    refetchMembersQuery: refetchChallengeCommunityMembersQuery,
  });

export default useChallengeMemberOrganizationAssignment;
