import { useCallback } from 'react';
import {
  ChallengeCardFragmentDoc,
  OpportunityCardFragmentDoc,
  refetchMeQuery,
  useCreateChallengeMutation,
  useCreateOpportunityMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useConfig } from '../../../platform/config/useConfig';
import { FEATURE_SUBSCRIPTIONS } from '../../../platform/config/features.constants';
import { useChallenge } from '../../../challenge/challenge/hooks/useChallenge';

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
  const { hubId } = useHub();
  const { challengeId } = useChallenge();
  const { isFeatureEnabled } = useConfig();

  const subscriptionsEnabled = isFeatureEnabled(FEATURE_SUBSCRIPTIONS);

  const [createChallengeLazy] = useCreateChallengeMutation({
    onError: handleError,
    update: (cache, { data }) => {
      if (subscriptionsEnabled || !data) {
        return;
      }

      const { createChallenge } = data;

      const hubRefId = cache.identify({
        __typename: 'Hub',
        id: hubId,
      });

      if (!hubRefId) {
        return;
      }

      cache.modify({
        id: hubRefId,
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
    onError: handleError,
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
        optimisticResponse: {
          createChallenge: {
            __typename: 'Challenge',
            id: '',
            nameID: '',
            displayName: value.displayName ?? '',
            metrics: [
              {
                id: '',
                name: '',
                value: '',
              },
            ],
            context: {
              id: '',
              tagline: value.tagline,
              visuals: [
                {
                  id: '',
                  uri: '',
                  name: '',
                },
              ],
            },
            tagset: {
              id: '-1',
              name: 'default',
              tags: value.tags ?? [],
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
            displayName: value.displayName,
            context: {
              tagline: value.tagline,
              vision: value.vision,
            },
            tags: value.tags,
          },
        },
        optimisticResponse: {
          createOpportunity: {
            __typename: 'Opportunity',
            id: '',
            nameID: '',
            displayName: value.displayName ?? '',
            metrics: [
              {
                id: '',
                name: '',
                value: '',
              },
            ],
            context: {
              id: '',
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
            },
            tagset: {
              id: '-1',
              name: 'default',
              tags: value.tags ?? [],
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
