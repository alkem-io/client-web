import { CanvasTemplateWithValueFragment } from '../../../../core/apollo/generated/graphql-schema';
import { CanvasTemplateFormSubmittedValues } from '../../../platform/admin/templates/CanvasTemplates/CanvasTemplateForm';

export const createCanvasTemplateForCalloutCreation = (
  canvasTemplate?: CanvasTemplateWithValueFragment
): CanvasTemplateFormSubmittedValues | undefined => {
  if (!canvasTemplate) return undefined;
  const calloutCanvasTemplate: CanvasTemplateFormSubmittedValues = {
    value: canvasTemplate.value,
    tags: canvasTemplate.profile.tagset?.tags ?? [],
    visualUri: canvasTemplate.profile.visual?.uri ?? '',
    profile: {
      description: canvasTemplate.profile.description,
      displayName: canvasTemplate.profile.displayName,
    },
  };

  return calloutCanvasTemplate;
};
