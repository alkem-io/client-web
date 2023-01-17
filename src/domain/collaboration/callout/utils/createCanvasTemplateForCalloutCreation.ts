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
    },
  };
  if (canvasTemplate.info.tagset) calloutCanvasTemplate.info.tags = canvasTemplate.info.tagset.tags;
  if (canvasTemplate.info.visual?.uri) calloutCanvasTemplate.info.visualUri = canvasTemplate.info.visual.uri;

  return calloutCanvasTemplate;
};
