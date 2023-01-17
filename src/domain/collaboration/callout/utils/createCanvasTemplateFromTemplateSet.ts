import { CanvasTemplateFragment, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { CanvasTemplateFormSubmittedValues } from '../../../platform/admin/templates/CanvasTemplates/CanvasTemplateForm';

export type CanvasTemplateWithoutValue = Omit<CanvasTemplateFormSubmittedValues, 'value'>;

export const createCanvasTemplateFromTemplateSet = <C extends { type?: CalloutType; canvasTemplateTitle?: string }>(
  callout: C,
  canvasTemplates: CanvasTemplateFragment[]
): CanvasTemplateWithoutValue | undefined => {
  let calloutCanvasTemplate: CanvasTemplateWithoutValue | undefined;
  if (callout.type === CalloutType.Card) {
    const referenceCardTemplate = canvasTemplates.find(t => t.info.title === callout.canvasTemplateTitle);
    if (referenceCardTemplate) {
      calloutCanvasTemplate = {
        info: {
          description: referenceCardTemplate.info.description,
          title: referenceCardTemplate.info.title,
        },
      };
      if (referenceCardTemplate.info.tagset) calloutCanvasTemplate.info.tags = referenceCardTemplate.info.tagset.tags;
      if (referenceCardTemplate.info.visual?.uri)
        calloutCanvasTemplate.info.visualUri = referenceCardTemplate.info.visual.uri;
    }
  }

  return calloutCanvasTemplate;
};
