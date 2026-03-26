import { useTranslation } from 'react-i18next';
import {
  type CreateSubspaceMutationOptions,
  refetchCurrentUserLightQuery,
  SubspaceCardFragmentDoc,
  useCreateSubspaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  CommunityMembershipStatus,
  PlatformFeatureFlagName,
  SpaceLevel,
  SpaceVisibility,
  TagsetReservedName,
  TagsetType,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import type { VisualUploadModel } from '@/core/ui/upload/VisualUpload/VisualUpload.model';
import { useConfig } from '@/domain/platform/config/useConfig';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useUploadVisualsOnCreate from '../useUploadVisualsOnCreate/useUploadVisualsOnCreate';

interface SubspaceCreationInput {
  spaceID: string;
  about: {
    profile: {
      displayName: string;
      tagline: string;
      description?: string;
      visuals: {
        avatar?: VisualUploadModel;
        cardBanner?: VisualUploadModel;
      };
      tags: string[];
    };
    why?: string;
  };
  addTutorialCallouts: boolean;
  addCallouts?: boolean;
  spaceTemplateId?: string;
}

export const useSubspaceCreation = (mutationOptions: CreateSubspaceMutationOptions = {}) => {
  const { spaceId } = useUrlResolver();
  const { isFeatureEnabled } = useConfig();

  const { t } = useTranslation();
  const { uploadVisuals } = useUploadVisualsOnCreate({ entityName: t('common.subspace') });

  const subscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);
  const {
    refetchQueries = [refetchCurrentUserLightQuery()], // default to refetching user provider
    ...restMutationOptions
  } = mutationOptions;

  const [createSubspaceLazy, { loading }] = useCreateSubspaceMutation({
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
    refetchQueries,
    ...restMutationOptions,
  });

  const createSubspace = async (value: SubspaceCreationInput) => {
    const includeVisuals =
      Boolean(value.about.profile.visuals.avatar?.file) || Boolean(value.about.profile.visuals.cardBanner?.file);

    const { data } = await createSubspaceLazy({
      variables: {
        input: {
          spaceID: value.spaceID,
          spaceTemplateID: value.spaceTemplateId ? value.spaceTemplateId : undefined,
          about: {
            why: value.about.why,
            profileData: {
              displayName: value.about.profile.displayName,
              tagline: value.about.profile.tagline,
              description: value.about.profile.description,
              tags: value.about.profile.tags,
            },
          },
          collaborationData: {
            // addTutorialCallouts: value.addTutorialCallouts, // temporarily disabled
            addCallouts: value.addCallouts, // we always want to add the default callouts
            calloutsSetData: {},
          },
        },
        includeVisuals,
      },
      optimisticResponse: {
        createSubspace: {
          id: '',
          level: SpaceLevel.L1,
          visibility: SpaceVisibility.Active,
          pinned: false,
          sortOrder: 0,
          about: {
            id: '',
            why: value.about.why,
            profile: {
              id: '',
              displayName: value.about.profile.displayName ?? '',
              tagline: value.about.profile.tagline,
              url: '',
              cardBanner: {
                id: '',
                uri: '',
                name: VisualType.Card,
              },
              avatar: {
                id: '',
                uri: '',
                name: VisualType.Avatar,
              },
              tagset: {
                id: '-1',
                name: TagsetReservedName.Default,
                tags: value.about.profile.tags ?? [],
                allowedValues: [],
                type: TagsetType.Freeform,
              },
            },
            isContentPublic: true,
            membership: {
              myMembershipStatus: CommunityMembershipStatus.Member,
              leadUsers: [],
              leadOrganizations: [],
            },
          },
        },
      },
    });

    if (includeVisuals) {
      await uploadVisuals(data?.createSubspace.about.profile, value.about.profile.visuals);
    }

    return data?.createSubspace;
  };

  return { createSubspace, loading };
};
