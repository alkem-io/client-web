import { useCallback } from 'react';
import {
  ChallengeCardFragmentDoc,
  OpportunityCardFragmentDoc,
  refetchUserProviderQuery,
  useCreateChallengeMutation,
  useCreateOpportunityMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { useConfig } from '../../../platform/config/useConfig';
import { useChallenge } from '../../../journey/challenge/hooks/useChallenge';
import { PlatformFeatureFlagName, TagsetType } from '../../../../core/apollo/generated/graphql-schema';
import { DEFAULT_TAGSET } from '../../../common/tags/tagset.constants';

interface ChallengeCreationInput {
  spaceID: string;
  displayName: string;
  tagline: string;
  background: string;
  vision: string;
  tags: string[];
  addDefaultCallouts: boolean;
}

interface OpportunityCreationInput {
  challengeID: string;
  displayName: string;
  tagline: string;
  vision: string;
  tags: string[];
  addDefaultCallouts: boolean;
}

export const useJourneyCreation = () => {
  const { spaceId } = useSpace();
  const { challengeId } = useChallenge();
  const { isFeatureEnabled } = useConfig();

  const subscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);

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
    refetchQueries: [refetchUserProviderQuery()],
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
    refetchQueries: [refetchUserProviderQuery()],
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
            collaborationData: {
              addDefaultCallouts: value.addDefaultCallouts,
            },
          },
        },
        optimisticResponse: {
          createChallenge: {
            __typename: 'Challenge',
            id: '',
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
              url: '',
              cardBanner: {
                id: '',
                uri: '',
                name: '',
              },
              tagset: {
                id: '-1',
                name: DEFAULT_TAGSET,
                tags: value.tags ?? [],
                allowedValues: [],
                type: TagsetType.Freeform,
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
            collaborationData: {
              addDefaultCallouts: value.addDefaultCallouts,
            },
          },
        },
        optimisticResponse: {
          createOpportunity: {
            __typename: 'Opportunity',
            id: '',
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
              url: '',
              cardBanner: {
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
              tagset: {
                id: '-1',
                name: DEFAULT_TAGSET,
                tags: value.tags ?? [],
                allowedValues: [],
                type: TagsetType.Freeform,
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
