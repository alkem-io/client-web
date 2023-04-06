import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { PostTemplateFormSubmittedValues } from '../../../platform/admin/templates/PostTemplates/PostTemplateForm';
import { CalloutCreationDialogFields } from '../creation-dialog/CalloutCreationDialog';

export const createCalloutPostTemplate = (
  callout: CalloutCreationDialogFields
): PostTemplateFormSubmittedValues | undefined => {
  let calloutPostTemplate: PostTemplateFormSubmittedValues | undefined;
  if (callout.type === CalloutType.Card && callout.displayName && callout.postTemplateDefaultDescription) {
    calloutPostTemplate = {
      defaultDescription: callout.postTemplateDefaultDescription,
      type: callout.displayName,
      profile: {
        displayName: callout.displayName,
      },
    };
  }

  return calloutPostTemplate;
};
