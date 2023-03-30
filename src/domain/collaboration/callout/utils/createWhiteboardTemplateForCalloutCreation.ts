import { WhiteboardTemplateWithValueFragment } from '../../../../core/apollo/generated/graphql-schema';
import { WhiteboardTemplateFormSubmittedValues } from '../../../platform/admin/templates/WhiteboardTemplates/WhiteboardTemplateForm';

export const createWhiteboardTemplateForCalloutCreation = (
  WhiteboardTemplate?: WhiteboardTemplateWithValueFragment
): WhiteboardTemplateFormSubmittedValues | undefined => {
  if (!WhiteboardTemplate) return undefined;
  const calloutWhiteboardTemplate: WhiteboardTemplateFormSubmittedValues = {
    value: WhiteboardTemplate.value,
    tags: WhiteboardTemplate.profile.tagset?.tags ?? [],
    visualUri: WhiteboardTemplate.profile.visual?.uri ?? '',
    profile: {
      description: WhiteboardTemplate.profile.description,
      displayName: WhiteboardTemplate.profile.displayName,
    },
  };

  return calloutWhiteboardTemplate;
};
