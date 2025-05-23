import { useCallback } from 'react';
import { CalloutTemplateFormSubmittedValues } from '../components/Forms/CalloutTemplateForm';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useCreateTemplateMutation, useSpaceTemplatesManagerLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { toCreateTemplateMutationVariables } from '../components/Forms/common/mappings';
import { AnyTemplateFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateForm';
import { WhiteboardTemplateFormSubmittedValues } from '@/domain/templates/components/Forms/WhiteboardTemplateForm';
import { useUploadWhiteboardVisuals } from '@/domain/collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface CalloutCreationUtils {
  handleCreateCalloutTemplate: (values: CalloutTemplateFormSubmittedValues, targetSpaceId: string) => Promise<unknown>;
}

export const useCreateCalloutTemplate = (): CalloutCreationUtils => {
  const { uploadVisuals } = useUploadWhiteboardVisuals();
  const [createCalloutTemplate] = useCreateTemplateMutation();
  const [fetchTemplatesSetId] = useSpaceTemplatesManagerLazyQuery();

  const handlePreviewTemplates = async (
    values: AnyTemplateFormSubmittedValues,
    mutationResult?: { profile?: { cardVisual?: { id: string }; previewVisual?: { id: string } }; nameID: string }
  ) => {
    const whiteboardTemplate = values as WhiteboardTemplateFormSubmittedValues;
    const previewImages = whiteboardTemplate.whiteboardPreviewImages;
    if (mutationResult && previewImages) {
      await uploadVisuals(
        previewImages,
        {
          cardVisualId: mutationResult.profile?.cardVisual?.id,
          previewVisualId: mutationResult.profile?.previewVisual?.id,
        },
        mutationResult.nameID // To upload the screenshots with the whiteboard nameId
      );
    }
  };

  const handleCreateCalloutTemplate = useCallback(
    async (values: CalloutTemplateFormSubmittedValues, targetSpaceId: string) => {
      const { data: templatesData } = await fetchTemplatesSetId({ variables: { spaceId: targetSpaceId } });
      const templatesSetId = templatesData?.lookup.space?.templatesManager?.templatesSet?.id;
      if (!templatesSetId) {
        throw new TypeError('TemplateSet not found!');
      }

      const variables = toCreateTemplateMutationVariables(templatesSetId, TemplateType.Callout, values);
      const result = await createCalloutTemplate({ variables });
      // update whiteboard (framing) visuals
      await handlePreviewTemplates(values, result.data?.createTemplate.callout?.framing.whiteboard);
    },
    [createCalloutTemplate]
  );

  return {
    handleCreateCalloutTemplate,
  };
};
