import {
  useCreateGroupOnChallengeMutation,
  useCreateGroupOnEcoverseMutation,
  useCreateGroupOnOpportunityMutation,
} from '../generated/graphql';
import { QUERY_ECOVERSE_GROUPS_LIST, QUERY_CHALLENGE_GROUPS, QUERY_OPPORTUNITY_GROUPS } from '../graphql/admin';

export const useCreateGroup = (id?) => {
  const [createGroupOnEcoverse] = useCreateGroupOnEcoverseMutation({
    refetchQueries: [{ query: QUERY_ECOVERSE_GROUPS_LIST }],
    awaitRefetchQueries: true,
  });
  const [createGroupOnChallenge] = useCreateGroupOnChallengeMutation({
    refetchQueries: [{ query: QUERY_CHALLENGE_GROUPS, variables: { id: Number(id) } }],
    awaitRefetchQueries: true,
  });
  const [createGroupOnOpportunity] = useCreateGroupOnOpportunityMutation({
    refetchQueries: [{ query: QUERY_OPPORTUNITY_GROUPS, variables: { id: Number(id) } }],
    awaitRefetchQueries: true,
  });

  return {
    createEcoverseGroup: createGroupOnEcoverse,
    createChallengeGroup: createGroupOnChallenge,
    createOpportunityGroup: createGroupOnOpportunity,
  };
};
