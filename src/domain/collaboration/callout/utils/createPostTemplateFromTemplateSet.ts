import { PostTemplateCardFragment, CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { PostTemplateFormSubmittedValues } from '../../../platform/admin/templates/PostTemplates/PostTemplateForm';

export const createPostTemplateFromTemplateSet = <C extends { type?: CalloutType; postTemplateType?: string }>(
  callout: C,
  postTemplates: PostTemplateCardFragment[]
): PostTemplateFormSubmittedValues | undefined => {
  let calloutPostTemplate: PostTemplateFormSubmittedValues | undefined;
  if (callout.type === CalloutType.Post) {
    const referencePostTemplate = postTemplates.find(t => t.type === callout.postTemplateType);
    if (referencePostTemplate) {
      calloutPostTemplate = {
        defaultDescription: referencePostTemplate.defaultDescription,
        type: referencePostTemplate.type,
        profile: {
          description: referencePostTemplate.profile.description,
          displayName: referencePostTemplate.profile.displayName,
        },
      };
      if (referencePostTemplate.profile.tagset) calloutPostTemplate.tags = referencePostTemplate.profile.tagset.tags;
      if (referencePostTemplate.profile.visual?.uri)
        calloutPostTemplate.visualUri = referencePostTemplate.profile.visual.uri;
    }
  }

  return calloutPostTemplate;
};
