import { useCallback } from 'react';
import { CalloutTemplateFormSubmittedValues } from '../components/Forms/CalloutTemplateForm';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useCreateTemplateMutation, useSpaceTemplatesManagerLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { toCreateTemplateMutationVariables } from '../components/Forms/common/mappings';

export interface CalloutCreationUtils {
  handleCreateCalloutTemplate: (values: CalloutTemplateFormSubmittedValues, targetSpaceId: string) => Promise<unknown>;
}

export const useCreateCalloutTemplate = (): CalloutCreationUtils => {
  const [createCalloutTemplate] = useCreateTemplateMutation();
  const [fetchTemplatesSetId] = useSpaceTemplatesManagerLazyQuery();

  const handleCreateCalloutTemplate = useCallback(
    async (values: CalloutTemplateFormSubmittedValues, targetSpaceId: string) => {
      const { data: templatesData } = await fetchTemplatesSetId({ variables: { spaceId: targetSpaceId } });
      const templatesSetId = templatesData?.lookup.space?.templatesManager?.templatesSet?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const variables = toCreateTemplateMutationVariables(templatesSetId, TemplateType.Callout!, values);
      return createCalloutTemplate({ variables });
    },
    [createCalloutTemplate]
  );

  return {
    handleCreateCalloutTemplate,
  };
};
