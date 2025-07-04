import { useCallback } from 'react';
import { TemplateCalloutFormSubmittedValues } from '../components/Forms/TemplateCalloutForm';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useCreateTemplateMutation, useSpaceTemplatesManagerLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { toCreateTemplateMutationVariables } from '../components/Forms/common/mappings';
import useHandlePreviewImages from '../utils/useHandlePreviewImages';

export interface CalloutCreationUtils {
  handleCreateCalloutTemplate: (values: TemplateCalloutFormSubmittedValues, targetSpaceId: string) => Promise<unknown>;
}

export const useCreateCalloutTemplate = (): CalloutCreationUtils => {
  const { handlePreviewTemplates } = useHandlePreviewImages();
  const [createCalloutTemplate] = useCreateTemplateMutation();
  const [fetchTemplatesSetId] = useSpaceTemplatesManagerLazyQuery();

  const handleCreateCalloutTemplate = useCallback(
    async (values: TemplateCalloutFormSubmittedValues, targetSpaceId: string) => {
      const { data: templatesData } = await fetchTemplatesSetId({ variables: { spaceId: targetSpaceId } });
      const templatesSetId = templatesData?.lookup.space?.templatesManager?.templatesSet?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const variables = toCreateTemplateMutationVariables(templatesSetId, TemplateType.Callout, values);
      const result = await createCalloutTemplate({ variables });
      // update whiteboard (framing) visuals
      await handlePreviewTemplates(
        values.callout?.framing.whiteboard?.previewImages,
        result.data?.createTemplate.callout?.framing.whiteboard
      );
    },
    [createCalloutTemplate]
  );

  return {
    handleCreateCalloutTemplate,
  };
};
