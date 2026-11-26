import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { type CreateSpaceMutationOptions, useCreateSpaceMutation } from '@/core/apollo/generated-v2/apollo-hooks';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { mapCreatedSpace, type SpaceCreationProfile, spaceCreationBlueprint } from '../spaceCreationBlueprint';
import useUploadVisualsOnCreate, { type SpaceVisuals } from '../useUploadVisualsOnCreate/useUploadVisualsOnCreate';

type SpaceCreationInput = {
  accountId: string;
  nameId: string;
  planId: string | undefined;
  profile: SpaceCreationProfile;
  visuals: SpaceVisuals;
  addTutorialCallouts: boolean;
  spaceTemplateId?: string;
};

/** The L0 submit of 023 FR-020: `createSpace` on an account, with the template the picker holds. */
export const useSpaceCreation = (mutationOptions: CreateSpaceMutationOptions = {}) => {
  const [createSpace, { loading }] = useCreateSpaceMutation(mutationOptions);
  const { t } = useTranslation();
  // The native client has no global error link: a refusal (023 refusal table) is shown here, as legacy's link did.
  const handleError = useApolloErrorHandler();
  const { uploadVisuals } = useUploadVisualsOnCreate({ entityName: t('common.space') });

  const handleCreateSpace = async (value: SpaceCreationInput) => {
    const { data } = await createSpace({
      variables: {
        input: {
          account: value.accountId,
          plan: value.planId,
          handle: value.nameId,
          template: value.spaceTemplateId || undefined,
          tutorials: value.addTutorialCallouts,
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

  return { createSpace: handleCreateSpace, loading };
};
