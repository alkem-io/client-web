import { CanvasTemplateWithValueFragment } from '../../../../core/apollo/generated/graphql-schema';
import { CanvasTemplateFormSubmittedValues } from '../../../platform/admin/templates/CanvasTemplates/CanvasTemplateForm';

export const createCanvasTemplateForCalloutCreation = (
  canvasTemplate?: CanvasTemplateWithValueFragment
): CanvasTemplateFormSubmittedValues | undefined => {
  if (!canvasTemplate) return undefined;
  const calloutCanvasTemplate: CanvasTemplateFormSubmittedValues = {
    value: canvasTemplate.value,
    info: {
      description: canvasTemplate.info.description,
      title: canvasTemplate.info.title,
      tags: canvasTemplate.info.tagset?.tags,
      visualUri: canvasTemplate.info.visual?.uri,
    },
  };

  return calloutCanvasTemplate;
};
