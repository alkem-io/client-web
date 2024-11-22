import { useCallback } from 'react';
import {
  refetchDashboardWithMembershipsQuery,
  refetchUserProviderQuery,
  SubspaceCardFragmentDoc,
  useCreateSubspaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { useConfig } from '@/domain/platform/config/useConfig';
import {
  CommunityMembershipStatus,
  PlatformFeatureFlagName,
  SpacePrivacyMode,
  TagsetType,
} from '@/core/apollo/generated/graphql-schema';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';

interface SubspaceCreationInput {
  spaceID: string;
  displayName: string;
  tagline: string;
  background?: string;
  vision: string;
  tags: string[];
  addTutorialCallouts: boolean;
  collaborationTemplateId?: string;
}

export const useSubspaceCreation = () => {
  const { spaceId } = useSpace();
  const { isFeatureEnabled } = useConfig();

  const subscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);

  const [createSubspaceLazy] = useCreateSubspaceMutation({
    update: (cache, { data }) => {
      if (subscriptionsEnabled || !data) {
        return;
      }

      const { createSubspace } = data;

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
          subspaces(existingChallenges = []) {
            const newChallengeRef = cache.writeFragment({
              data: createSubspace,
              fragment: SubspaceCardFragmentDoc,
              fragmentName: 'SubspaceCard',
            });
            return [...existingChallenges, newChallengeRef];
          },
        },
      });
    },

    refetchQueries: [refetchUserProviderQuery(), refetchDashboardWithMembershipsQuery()],
  });

  // add useCallback
  const createSubspace = useCallback(
    async (value: SubspaceCreationInput) => {
      const { data } = await createSubspaceLazy({
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
              addTutorialCallouts: value.addTutorialCallouts,
              addCallouts: true, // Always add Callouts from the template
              collaborationTemplateID: value.collaborationTemplateId,
            },
          },
        },
        optimisticResponse: {
          createSubspace: {
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
            community: {
              id: '',
              roleSet: {
                id: '',
                myMembershipStatus: CommunityMembershipStatus.Member,
              },
            },
            context: {
              id: '',
              vision: value.vision,
            },
            settings: {
              privacy: {
                mode: SpacePrivacyMode.Public,
              },
            },
          },
        },
      });

      return data?.createSubspace;
    },
    [createSubspaceLazy]
  );

  return { createSubspace };
};
