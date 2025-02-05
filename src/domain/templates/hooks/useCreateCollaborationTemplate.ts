import { useCallback } from 'react';
import { CollaborationTemplateFormSubmittedValues } from '../components/Forms/CollaborationTemplateForm';
import {
  useCreateTemplateFromCollaborationMutation,
  useSpaceTemplatesSetIdLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { toCreateTemplateFromCollaborationMutationVariables } from '../components/Forms/common/mappings';

export interface CollaborationCreationUtils {
  handleCreateCollaborationTemplate: (
    values: CollaborationTemplateFormSubmittedValues,
    destinationSpaceId: string
  ) => Promise<unknown>;
}

export const useCreateCollaborationTemplate = (): CollaborationCreationUtils => {
  const [createCollaborationTemplate] = useCreateTemplateFromCollaborationMutation();
  const [fetchTemplatesSetId] = useSpaceTemplatesSetIdLazyQuery();

  const handleCreateCollaborationTemplate = useCallback(
    async (values: CollaborationTemplateFormSubmittedValues, destinationSpaceId: string) => {
      const { data: templatesData } = await fetchTemplatesSetId({ variables: { spaceId: destinationSpaceId } });
      const templatesSetId = templatesData?.lookup.space?.templatesManager?.templatesSet?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const variables = toCreateTemplateFromCollaborationMutationVariables(templatesSetId, values);
      return createCollaborationTemplate({ variables });
    },
    [createCollaborationTemplate]
  );

  return {
    handleCreateCollaborationTemplate,
  };
};
