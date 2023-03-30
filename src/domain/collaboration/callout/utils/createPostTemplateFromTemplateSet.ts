import { PostTemplateFragment, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { PostTemplateFormSubmittedValues } from '../../../platform/admin/templates/PostTemplates/PostTemplateForm';

export const createPostTemplateFromTemplateSet = <C extends { type?: CalloutType; postTemplateType?: string }>(
  callout: C,
  cardTemplates: PostTemplateFragment[]
): PostTemplateFormSubmittedValues | undefined => {
  let calloutPostTemplate: PostTemplateFormSubmittedValues | undefined;
  if (callout.type === CalloutType.Card) {
    const referenceCardTemplate = cardTemplates.find(t => t.type === callout.postTemplateType);
    if (referenceCardTemplate) {
      calloutPostTemplate = {
        defaultDescription: referenceCardTemplate.defaultDescription,
        type: referenceCardTemplate.type,
        profile: {
          description: referenceCardTemplate.profile.description,
          displayName: referenceCardTemplate.profile.displayName,
        },
      };
      if (referenceCardTemplate.profile.tagset) calloutPostTemplate.tags = referenceCardTemplate.profile.tagset.tags;
      if (referenceCardTemplate.profile.visual?.uri)
        calloutPostTemplate.visualUri = referenceCardTemplate.profile.visual.uri;
    }
  }

  return calloutPostTemplate;
};
