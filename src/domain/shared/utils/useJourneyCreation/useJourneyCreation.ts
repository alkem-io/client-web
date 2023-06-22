import { useCallback } from 'react';
import {
  ChallengeCardFragmentDoc,
  OpportunityCardFragmentDoc,
  refetchMeQuery,
  useCreateChallengeMutation,
  useCreateOpportunityMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useSpace } from '../../../challenge/space/SpaceContext/useSpace';
import { useConfig } from '../../../platform/config/useConfig';
import { FEATURE_SUBSCRIPTIONS } from '../../../platform/config/features.constants';
import { useChallenge } from '../../../challenge/challenge/hooks/useChallenge';

interface ChallengeCreationInput {
  spaceID: string;
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
  const { spaceId } = useSpace();
  const { challengeId } = useChallenge();
  const { isFeatureEnabled } = useConfig();

  const subscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

  const [createChallengeLazy] = useCreateChallengeMutation({
    update: (cache, { data }) => {
      if (subscriptionsEnabled || !data) {
        return;
      }

      const { createChallenge } = data;

      const spaceRefId = cache.identify({
        __typename: 'Space',
        id: spaceId,
      });

      if (!spaceRefId) {
        return;
      }

      cache.modify({
        id: spaceRefId,
        fields: {
          challenges(existingChallenges = []) {
            const newChallengeRef = cache.writeFragment({
              data: createChallenge,
              fragment: ChallengeCardFragmentDoc,
              fragmentName: 'ChallengeCard',
            });
            return [...existingChallenges, newChallengeRef];
          },
        },
      });
    },
    refetchQueries: [refetchMeQuery()],
  });
  const [createOpportunityLazy] = useCreateOpportunityMutation({
    update: (cache, { data }) => {
      if (subscriptionsEnabled || !data) {
        return;
      }

      const { createOpportunity } = data;

      const challengeRefId = cache.identify({
        __typename: 'Challenge',
        id: challengeId,
      });

      if (!challengeRefId) {
        return;
      }

      cache.modify({
        id: challengeRefId,
        fields: {
          challenges(existingOpportunity = []) {
            const newOpportunityRef = cache.writeFragment({
              data: createOpportunity,
              fragment: OpportunityCardFragmentDoc,
              fragmentName: 'OpportunityCard',
            });
            return [...existingOpportunity, newOpportunityRef];
          },
        },
      });
    },
    refetchQueries: [refetchMeQuery()],
  });

  // add useCallback
  const createChallenge = useCallback(
    async (value: ChallengeCreationInput) => {
      const { data } = await createChallengeLazy({
        variables: {
          input: {
            spaceID: value.spaceID,
            context: {
              vision: value.vision,
            },
            profileData: {
              displayName: value.displayName,
              tagline: value.tagline,
              description: value.background,
            },
            tags: value.tags,
          },
        },
        optimisticResponse: {
          createChallenge: {
            __typename: 'Challenge',
            id: '',
            nameID: '',
            metrics: [
              {
                id: '',
                name: '',
                value: '',
              },
            ],
            profile: {
              id: '',
              displayName: value.displayName ?? '',
              tagline: value.tagline,
              visuals: [
                {
                  id: '',
                  uri: '',
                  name: '',
                },
              ],
              tagset: {
                id: '-1',
                name: 'default',
                tags: value.tags ?? [],
              },
            },
          },
        },
      });

      return data?.createChallenge;
    },
    [createChallengeLazy]
  );

  const createOpportunity = useCallback(
    async (value: OpportunityCreationInput) => {
      const { data } = await createOpportunityLazy({
        variables: {
          input: {
            challengeID: value.challengeID,
            context: {
              vision: value.vision,
            },
            profileData: {
              displayName: value.displayName,
              tagline: value.tagline,
            },
            tags: value.tags,
          },
        },
        optimisticResponse: {
          createOpportunity: {
            __typename: 'Opportunity',
            id: '',
            nameID: '',
            metrics: [
              {
                id: '',
                name: '',
                value: '',
              },
            ],
            context: {
              id: '',
            },
            profile: {
              id: '',
              displayName: value.displayName ?? '',
              tagline: value.tagline,
              visuals: [
                {
                  id: '',
                  uri: '',
                  name: '',
                  allowedTypes: [],
                  aspectRatio: 1,
                  maxHeight: 1,
                  maxWidth: 1,
                  minHeight: 1,
                  minWidth: 1,
                },
              ],
              tagset: {
                id: '-1',
                name: 'default',
                tags: value.tags ?? [],
              },
            },
          },
        },
      });

      return data?.createOpportunity;
    },
    [createOpportunityLazy]
  );

  return { createChallenge, createOpportunity };
};
