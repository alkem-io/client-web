import { useCallback } from 'react';
import { TemplateContentSpaceFormSubmittedValues } from './TemplateContentSpaceForm';
import {
  useCreateTemplateFromSpaceMutation,
  useSpaceTemplatesManagerLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { toCreateTemplateFromSpaceContentMutationVariables } from '../components/Forms/common/mappings';

export interface SpaceContentCreationUtils {
  handleCreateSpaceContentTemplate: (
    values: TemplateContentSpaceFormSubmittedValues,
    destinationSpaceId: string
  ) => Promise<unknown>;
}

export const useCreateSpaceContentTemplate = (): SpaceContentCreationUtils => {
  const [createSpaceContentTemplate] = useCreateTemplateFromSpaceMutation();
  const [fetchTemplatesSetId] = useSpaceTemplatesManagerLazyQuery();

  const handleCreateCollaborationTemplate = useCallback(
    async (values: TemplateContentSpaceFormSubmittedValues, destinationSpaceId: string) => {
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
    handleCreateSpaceContentTemplate: handleCreateCollaborationTemplate,
  };
};
