import { useCallback } from 'react';
import {
  CreateSubspaceMutationOptions,
  refetchDashboardWithMembershipsQuery,
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
  about: {
    profile: {
      displayName: string;
      tagline: string;
      description?: string;
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
      tags: string[];
    };
    why?: string;
  };
  addTutorialCallouts: boolean;
  collaborationTemplateId?: string;
}

export const useSubspaceCreation = (mutationOptions: CreateSubspaceMutationOptions = {}) => {
  const { spaceId } = useUrlResolver();
  const { isFeatureEnabled } = useConfig();

  const subscriptionsEnabled = isFeatureEnabled(PlatformFeatureFlagName.Subscriptions);
  const [uploadVisual] = useUploadVisualMutation();

  const {
    refetchQueries = [refetchUserProviderQuery(), refetchDashboardWithMembershipsQuery()], // default to refetching user provider and dashboard
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
      const includeVisuals =
        Boolean(value.about.profile.visuals.cardBanner.file) || Boolean(value.about.profile.visuals.avatar.file);

      const { data } = await createSubspaceLazy({
        variables: {
          input: {
            spaceID: value.spaceID,
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
                  name: '',
                },
                avatar: {
                  id: '',
                  uri: '',
                  name: '',
                },
                tagset: {
                  id: '-1',
                  name: DEFAULT_TAGSET,
                  tags: value.about.profile.tags ?? [],
                  allowedValues: [],
                  type: TagsetType.Freeform,
                },
              },
            },
            community: {
              id: '',
              roleSet: {
                id: '',
                myMembershipStatus: CommunityMembershipStatus.Member,
              },
            },

            settings: {
              privacy: {
                mode: SpacePrivacyMode.Public,
              },
            },
          },
        },
      });
      try {
        const uploadPromises: Promise<unknown>[] = [];
        if (value.about.profile.visuals.avatar.file && data?.createSubspace.about.profile?.avatar?.id) {
          uploadPromises.push(
            uploadVisual({
              variables: {
                file: value.about.profile.visuals.avatar.file,
                uploadData: {
                  visualID: data.createSubspace.about.profile.avatar?.id || '',
                  alternativeText: value.about.profile.visuals.avatar.altText,
                },
              },
            })
          );
        }
        if (value.about.profile.visuals.cardBanner.file && data?.createSubspace.about.profile?.cardBanner?.id) {
          uploadPromises.push(
            uploadVisual({
              variables: {
                file: value.about.profile.visuals.cardBanner.file,
                uploadData: {
                  visualID: data.createSubspace.about.profile?.cardBanner?.id || '',
                  alternativeText: value.about.profile.visuals.cardBanner.altText,
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
