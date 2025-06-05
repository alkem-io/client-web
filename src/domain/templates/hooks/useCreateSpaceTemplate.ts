import { useCallback } from 'react';
import { TemplateSpaceFormSubmittedValues } from '../components/Forms/TemplateSpaceForm';
import { useCreateTemplateFromSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { toCreateTemplateFromSpaceContentMutationVariables } from '../components/Forms/common/mappings';

export interface SpaceContentCreationUtils {
  handleCreateSpaceTemplate: (values: TemplateSpaceFormSubmittedValues, templatesSetId: string) => Promise<unknown>;
}

export const useCreateSpaceContentTemplate = (): SpaceContentCreationUtils => {
  const [createSpaceContentTemplate] = useCreateTemplateFromSpaceMutation();

  const handleCreateSpaceTemplate = useCallback(
    async (values: TemplateSpaceFormSubmittedValues, templatesSetId: string) => {
      const variables = toCreateTemplateFromSpaceContentMutationVariables(templatesSetId, values);
      return createSpaceContentTemplate({ variables });
    },
    [createSpaceContentTemplate]
  );

  return {
    handleCreateSpaceTemplate,
  };
};
