import { AspectTemplateFragment, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { AspectTemplateFormSubmittedValues } from '../../../platform/admin/templates/AspectTemplates/AspectTemplateForm';

export const createCardTemplateFromTemplateSet = <C extends { type?: CalloutType; cardTemplateType?: string }>(
  callout: C,
  cardTemplates: AspectTemplateFragment[]
): AspectTemplateFormSubmittedValues | undefined => {
  let calloutCardTemplate: AspectTemplateFormSubmittedValues | undefined;
  if (callout.type === CalloutType.Card) {
    const referenceCardTemplate = cardTemplates.find(t => t.type === callout.cardTemplateType);
    if (referenceCardTemplate) {
      calloutCardTemplate = {
        defaultDescription: referenceCardTemplate.defaultDescription,
        type: referenceCardTemplate.type,
        profile: {
          description: referenceCardTemplate.profile.description,
          displayName: referenceCardTemplate.profile.displayName,
        },
      };
      if (referenceCardTemplate.profile.tagset)
        calloutCardTemplate.profile.tags = referenceCardTemplate.profile.tagset.tags;
      if (referenceCardTemplate.profile.visual?.uri)
        calloutCardTemplate.profile.visual.uri = referenceCardTemplate.profile.visual.uri;
    }
  }

  return calloutCardTemplate;
};
