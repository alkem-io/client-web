import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { type CreateSubspaceMutationOptions, useCreateSubspaceMutation } from '@/core/apollo/generated-v2/apollo-hooks';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { mapCreatedSpace, type SpaceCreationProfile, spaceCreationBlueprint } from '../spaceCreationBlueprint';
import useUploadVisualsOnCreate, { type SpaceVisuals } from '../useUploadVisualsOnCreate/useUploadVisualsOnCreate';

type SubspaceCreationInput = {
  parentId: string;
  profile: SpaceCreationProfile;
  visuals: SpaceVisuals;
  spaceTemplateId?: string;
};

/** The subspace submit of 023 FR-020: `createSpace` under a parent, with the template the picker holds. */
export const useSubspaceCreation = (mutationOptions: CreateSubspaceMutationOptions = {}) => {
  const [createSubspace, { loading }] = useCreateSubspaceMutation(mutationOptions);
  const { t } = useTranslation();
  // The native client has no global error link: a refusal (023 refusal table) is shown here, as legacy's link did.
  const handleError = useApolloErrorHandler();
  const { uploadVisuals } = useUploadVisualsOnCreate({ entityName: t('common.subspace') });

  const handleCreateSubspace = async (value: SubspaceCreationInput) => {
    const { data } = await createSubspace({
      variables: {
        input: {
          parent: value.parentId,
          template: value.spaceTemplateId || undefined,
          blueprint: spaceCreationBlueprint(value.profile),
        },
      },
    }).catch((error: unknown) => {
      if (error instanceof ApolloError) handleError(error);
      throw error;
    });
    const created = mapCreatedSpace(data?.createSpace);
    if (created) await uploadVisuals(created.id, value.visuals);
    return created;
  };

  return { createSubspace: handleCreateSubspace, loading };
};
