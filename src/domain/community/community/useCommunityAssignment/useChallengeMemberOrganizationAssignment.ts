import {
  refetchChallengeCommunityMembersQuery,
  useChallengeCommunityMembersQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import useMemberOrganizationAssignment from './useMemberOrganizationAssignment';

interface Options {
  spaceId: string | undefined;
  challengeId: string | undefined;
}

const useChallengeMemberOrganizationAssignment = (options: Options) =>
  useMemberOrganizationAssignment({
    variables: options,
    useExistingMembersQuery: ({ variables, skip }) => {
      const { data } = useChallengeCommunityMembersQuery({ variables, skip });

      return {
        communityId: data?.space.challenge?.community?.id,
        existingMembers: data?.space.challenge?.community?.memberOrganizations,
      };
    },
    refetchQueries: [refetchChallengeCommunityMembersQuery],
  });

export default useChallengeMemberOrganizationAssignment;
