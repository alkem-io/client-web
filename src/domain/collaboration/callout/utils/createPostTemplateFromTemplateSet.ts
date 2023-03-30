import { PostTemplateFragment, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { PostTemplateFormSubmittedValues } from '../../../platform/admin/templates/PostTemplates/PostTemplateForm';

export const createPostTemplateFromTemplateSet = <C extends { type?: CalloutType; cardTemplateType?: string }>(
  callout: C,
  cardTemplates: PostTemplateFragment[]
): PostTemplateFormSubmittedValues | undefined => {
  let calloutPostTemplate: PostTemplateFormSubmittedValues | undefined;
  if (callout.type === CalloutType.Card) {
    const referenceCardTemplate = cardTemplates.find(t => t.type === callout.cardTemplateType);
    if (referenceCardTemplate) {
      calloutPostTemplate = {
        defaultDescription: referenceCardTemplate.defaultDescription,
        type: referenceCardTemplate.type,
        profile: {
          description: referenceCardTemplate.profile.description,
          displayName: referenceCardTemplate.profile.displayName,
        },
      };
      // // TODO server-2452: to be refactored
      // if (referenceCardTemplate.profile.tagset)
      //   calloutCardTemplate.profile.tags = referenceCardTemplate.profile.tagset.tags;
      // if (referenceCardTemplate.profile.visual?.uri)
      //   calloutCardTemplate.profile.visual.uri = referenceCardTemplate.profile.visual.uri;
    }
  }

  return calloutPostTemplate;
};
