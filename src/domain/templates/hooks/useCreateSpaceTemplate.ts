import { useCallback } from 'react';
import { TemplateSpaceFormSubmittedValues } from '../components/Forms/TemplateSpaceForm';
import {
  useCreateTemplateFromSpaceMutation,
  useSpaceTemplatesManagerLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { toCreateTemplateFromSpaceContentMutationVariables } from '../components/Forms/common/mappings';

export interface SpaceContentCreationUtils {
  handleCreateSpaceTemplate: (values: TemplateSpaceFormSubmittedValues, destinationSpaceId: string) => Promise<unknown>;
}

export const useCreateSpaceContentTemplate = (): SpaceContentCreationUtils => {
  const [createSpaceContentTemplate] = useCreateTemplateFromSpaceMutation();
  const [fetchTemplatesSetId] = useSpaceTemplatesManagerLazyQuery();

  const handleCreateSpaceTemplate = useCallback(
    async (values: TemplateSpaceFormSubmittedValues, destinationSpaceId: string) => {
      const { data: templatesData } = await fetchTemplatesSetId({ variables: { spaceId: destinationSpaceId } });
      const templatesSetId = templatesData?.lookup.space?.templatesManager?.templatesSet?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const variables = toCreateTemplateFromSpaceContentMutationVariables(templatesSetId, values);
      return createSpaceContentTemplate({ variables });
    },
    [createSpaceContentTemplate]
  );

  return {
    handleCreateSpaceTemplate,
  };
};
