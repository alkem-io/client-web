import { Callout, CalloutDisplayLocation } from '../../../../core/apollo/generated/graphql-schema';
import { Reference, Tagset } from '../../../common/profile/Profile';
import { CalloutFormInput } from '../CalloutForm';

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
  displayLocation?: CalloutDisplayLocation;
  contributionDefaults?: {
    postDescription?: string;
    whiteboardContent?: string;
  };
};

export type CalloutDeleteType = Omit<CalloutFormInput, 'postTemplateType' | 'whiteboardTemplateData' | 'type'> & {
  id: Callout['id'];
};
