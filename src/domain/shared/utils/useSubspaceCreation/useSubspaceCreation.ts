import { useCallback } from 'react';
import {
  CreateSubspaceMutationOptions,
  refetchUserProviderQuery,
  SubspaceCardFragmentDoc,
  useCreateSubspaceMutation,
  useUploadVisualMutation,
} from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useConfig } from '@/domain/platform/config/useConfig';
import {
  CommunityMembershipStatus,
  PlatformFeatureFlagName,
  SpacePrivacyMode,
  TagsetType,
} from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';

interface SubspaceCreationInput {
  spaceID: string;
  displayName: string;
  tagline: string;
  background?: string;
  vision?: string;
  tags: string[];
  addTutorialCallouts: boolean;
  collaborationTemplateId?: string;
  visuals: {
    avatar: {
      file: File | undefined;
      altText?: string;
    };
    cardBanner: {
      file: File | undefined;
      altText?: string;
    };
  };
}

export const useSubspaceCreation = (mutationOptions: CreateSubspaceMutationOptions = {}) => {
  const { spaceId } = useUrlResolver();
  const { isFeatureEnabled } = useConfig();

  const subscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);
  const [uploadVisual] = useUploadVisualMutation();

  const {
    refetchQueries = [refetchUserProviderQuery()], // default to refetching user provider
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

  // add useCallback
  const createSubspace = useCallback(
    async (value: SubspaceCreationInput) => {
      const includeVisuals = Boolean(value.visuals.cardBanner.file) || Boolean(value.visuals.avatar.file);

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
              calloutsSetData: {},
            },
          },
          includeVisuals,
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
            visuals: {
              id: '',
              cardBanner: {
                id: '',
              },
              avatar: {
                id: '',
              },
            },
          },
        },
      });
      try {
        const uploadPromises: Promise<unknown>[] = [];
        if (value.visuals.avatar.file && data?.createSubspace.visuals.avatar?.id) {
          uploadPromises.push(
            uploadVisual({
              variables: {
                file: value.visuals.avatar.file,
                uploadData: {
                  visualID: data.createSubspace.visuals.avatar.id,
                  alternativeText: value.visuals.avatar.altText,
                },
              },
            })
          );
        }
        if (value.visuals.cardBanner.file && data?.createSubspace.visuals.cardBanner?.id) {
          uploadPromises.push(
            uploadVisual({
              variables: {
                file: value.visuals.cardBanner.file,
                uploadData: {
                  visualID: data.createSubspace.visuals.cardBanner.id,
                  alternativeText: value.visuals.cardBanner.altText,
                },
              },
            })
          );
        }
        await Promise.all(uploadPromises);
      } catch (error) {
        // Subspace is created anyway, just the images failed log the error and continue
        if (error instanceof Error) {
          logError(error);
        } else {
          logError(`Error uploading visuals for subspace: ${error}`, { label: 'TempStorage' });
        }
      }
      return data?.createSubspace;
    },
    [createSubspaceLazy, uploadVisual]
  );

  return { createSubspace, loading };
};
