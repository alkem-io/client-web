import { useCallback } from 'react';
import { CollaborationTemplateFormSubmittedValues } from '../components/Forms/CollaborationTemplateForm';
import { TemplateType } from '../../../core/apollo/generated/graphql-schema';
import {
  useCreateTemplateMutation,
  useSpaceTemplatesSetIdLazyQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { toCreateTemplateMutationVariables } from '../components/Forms/common/mappings';

export interface CollaborationCreationUtils {
  handleCreateCollaborationTemplate: (
    values: CollaborationTemplateFormSubmittedValues,
    spaceNameId: string
  ) => Promise<unknown>;
}

export const useCreateCollaborationTemplate = (): CollaborationCreationUtils => {
  const [createCollaborationTemplate] = useCreateTemplateMutation(); //!! Pending special mutation for CollaborationTemplates
  const [fetchTemplatesSetId] = useSpaceTemplatesSetIdLazyQuery();

  const handleCreateCollaborationTemplate = useCallback(
    async (values: CollaborationTemplateFormSubmittedValues, spaceNameId: string) => {
      const { data: templatesData } = await fetchTemplatesSetId({ variables: { spaceNameId } });
      const templatesSetId = templatesData?.space.templatesManager?.templatesSet?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const variables = toCreateTemplateMutationVariables(templatesSetId, TemplateType.Collaboration!, values);
      return createCollaborationTemplate({ variables });
    },
    [createCollaborationTemplate]
  );

  return {
    handleCreateCollaborationTemplate,
  };
};
