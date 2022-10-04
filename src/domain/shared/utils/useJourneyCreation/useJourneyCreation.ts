import { useCreateChallengeMutation, useCreateOpportunityMutation } from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';

interface ChallengeCreationInput {
  hubID: string;
  displayName: string;
  tagline: string;
  background: string;
  vision: string;
  tags: string[];
}

interface OpportunityCreationInput {
  challengeID: string;
  displayName: string;
  tagline: string;
  vision: string;
  tags: string[];
}

export const useJourneyCreation = () => {
  const handleError = useApolloErrorHandler();

  const [createChallengeLazy] = useCreateChallengeMutation({ onError: handleError });
  const [createOpportunityLazy] = useCreateOpportunityMutation({ onError: handleError });

  const createChallenge = async (value: ChallengeCreationInput) => {
    const { data } = await createChallengeLazy({
      variables: {
        input: {
          hubID: value.hubID,
          displayName: value.displayName,
          context: {
            tagline: value.tagline,
            background: value.background,
            vision: value.vision,
          },
          tags: value.tags,
        },
      },
    });

    return data?.createChallenge;
  };

  const createOpportunity = async (value: OpportunityCreationInput) => {
    const { data } = await createOpportunityLazy({
      variables: {
        input: {
          challengeID: value.challengeID,
          displayName: value.displayName,
          context: {
            tagline: value.tagline,
            vision: value.vision,
          },
          tags: value.tags,
        },
      },
    });

    return data?.createOpportunity;
  };

  return { createChallenge, createOpportunity };
};
