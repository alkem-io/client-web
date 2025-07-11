import {
  CreateSpaceMutationOptions,
  refetchCurrentUserFullQuery,
  useCreateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useCallback } from 'react';
import useUploadVisualsOnCreate from '../useUploadVisualsOnCreate/useUploadVisualsOnCreate';
import { useTranslation } from 'react-i18next';

interface SpaceCreationInput {
  accountId: string;
  nameId: string;
  licensePlanId: string | undefined;

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
  addCallouts?: boolean;
  spaceTemplateId?: string;
}

export const useSpaceCreation = (mutationOptions: CreateSpaceMutationOptions = {}) => {
  const { t } = useTranslation();
  const { uploadVisuals } = useUploadVisualsOnCreate({ entityName: t('common.space') });

  const {
    refetchQueries = [refetchCurrentUserFullQuery()], // default to refetching user provider
    ...restMutationOptions
  } = mutationOptions;

  const [createSpace, { loading }] = useCreateSpaceMutation({
    refetchQueries,
    ...restMutationOptions,
  });
  const handleCreateSpace = useCallback(
    async (value: SpaceCreationInput) => {
      const includeVisuals =
        Boolean(value.about.profile.visuals.cardBanner.file) || Boolean(value.about.profile.visuals.avatar.file);

      const { data } = await createSpace({
        variables: {
          spaceData: {
            accountID: value.accountId,
            licensePlanID: undefined,
            nameID: value.nameId,
            spaceTemplateID: value.spaceTemplateId,
            about: {
              profileData: {
                displayName: value.about.profile.displayName,
                tagline: value.about.profile.tagline,
                description: value.about.profile.description,
                tags: value.about.profile.tags,
              },
              why: value.about.why,
            },
            collaborationData: {
              // addTutorialCallouts: value.addTutorialCallouts, // temporarily disabled
              addCallouts: value.addCallouts, // we always want to add the default callouts
              calloutsSetData: {},
            },
          },
          includeVisuals,
        },
      });

      if (includeVisuals) {
        await uploadVisuals(data?.createSpace.about.profile, value.about.profile.visuals);
      }

      return data?.createSpace;
    },
    [createSpace, uploadVisuals]
  );

  return { createSpace: handleCreateSpace, loading };
};
