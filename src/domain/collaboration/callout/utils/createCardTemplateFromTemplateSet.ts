import { AspectTemplate, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { AspectTemplateFormSubmittedValues } from '../../../platform/admin/templates/AspectTemplates/AspectTemplateForm';

export const createCardTemplateFromTemplateSet = <C extends { type?: CalloutType; cardTemplateType?: string }>(
  callout: C,
  cardTemplates: AspectTemplate[]
): AspectTemplateFormSubmittedValues | undefined => {
  let calloutCardTemplate: AspectTemplateFormSubmittedValues | undefined;
  if (callout.type === CalloutType.Card) {
    const referenceCardTemplate = cardTemplates.find(t => t.type === callout.cardTemplateType);
    if (referenceCardTemplate) {
      calloutCardTemplate = {
        defaultDescription: referenceCardTemplate.defaultDescription,
        type: referenceCardTemplate.type,
        info: {
          description: referenceCardTemplate.info.description,
          title: referenceCardTemplate.info.title,
        },
      };
      if (referenceCardTemplate.info.tagset) calloutCardTemplate.info.tags = referenceCardTemplate.info.tagset.tags;
      if (referenceCardTemplate.info.visual?.uri)
        calloutCardTemplate.info.visualUri = referenceCardTemplate.info.visual.uri;
    }
  }

  return calloutCardTemplate;
};
