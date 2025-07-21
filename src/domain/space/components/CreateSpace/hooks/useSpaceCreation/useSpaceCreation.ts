import {
  CreateSpaceMutationOptions,
  refetchCurrentUserFullQuery,
  useCreateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useCallback } from 'react';
import useUploadVisualsOnCreate from '../useUploadVisualsOnCreate/useUploadVisualsOnCreate';
import { useTranslation } from 'react-i18next';
import { VisualUploadModel } from '@/core/ui/upload/VisualUpload/VisualUpload.model';

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
        banner?: VisualUploadModel;
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
        Boolean(value.about.profile.visuals.banner?.file) || Boolean(value.about.profile.visuals.cardBanner?.file);

      const { data } = await createSpace({
        variables: {
          spaceData: {
            accountID: value.accountId,
            licensePlanID: value.licensePlanId,
            nameID: value.nameId,
            spaceTemplateID: value.spaceTemplateId ? value.spaceTemplateId : undefined,
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
              addTutorialCallouts: value.addTutorialCallouts,
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
