import { Callout } from '../../../../core/apollo/generated/graphql-schema';
import { CalloutFormInput } from '../CalloutForm';
import { CalloutWhiteboardTemplate, CalloutPostTemplate } from '../creation-dialog/CalloutCreationDialog';

export type CalloutEditType = Omit<CalloutFormInput, 'postTemplateType' | 'whiteboardTemplateData' | 'type'> & {
  id: Callout['id'];
  profile: {
    displayName?: string;
    description?: string;
  };
} & {
  postTemplate?: CalloutPostTemplate;
  whiteboardTemplate?: CalloutWhiteboardTemplate;
};
