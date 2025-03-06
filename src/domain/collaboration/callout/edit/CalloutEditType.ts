import { Callout } from '@/core/apollo/generated/graphql-schema';
import { Reference, Tagset } from '@/domain/common/profile/Profile';
import { CalloutFormInput } from '../CalloutForm';

export type CalloutEditType = Omit<CalloutFormInput, 'type' | 'sortOrder'> & {
  id: Callout['id'];
  profile: {
    displayName?: string;
    description?: string;
    references?: Reference[];
    tagsets?: Tagset[];
  };
  contributionDefaults?: {
    postDescription?: string;
    whiteboardContent?: string;
  };
};

export type CalloutDeleteType = Omit<CalloutFormInput, 'type'> & {
  id: Callout['id'];
};
