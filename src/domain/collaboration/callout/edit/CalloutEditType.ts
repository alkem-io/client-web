import { Callout } from '../../../../core/apollo/generated/graphql-schema';
import { Reference, Tagset } from '../../../common/profile/Profile';
import { CalloutFormInput } from '../CalloutForm';
import { CalloutWhiteboardTemplate, CalloutPostTemplate } from '../creation-dialog/CalloutCreationDialog';

export type CalloutEditType = Omit<
  CalloutFormInput,
  'postTemplateType' | 'whiteboardTemplateData' | 'type' | 'sortOrder' | 'activity'
> & {
  id: Callout['id'];
  profile: {
    displayName?: string;
    description?: string;
    references?: Reference[];
    tagsets?: Tagset[];
  };
  group?: string;
} & {
  postTemplate?: CalloutPostTemplate;
  whiteboardTemplate?: CalloutWhiteboardTemplate;
};

export type CalloutDeleteType = Omit<CalloutFormInput, 'postTemplateType' | 'whiteboardTemplateData' | 'type'> & {
  id: Callout['id'];
};
