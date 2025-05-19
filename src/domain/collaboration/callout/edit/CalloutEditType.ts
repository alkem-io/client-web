import { Callout } from '@/core/apollo/generated/graphql-schema';
import { CalloutFormInput } from '../CalloutForm';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export type CalloutEditType = Omit<CalloutFormInput, 'type' | 'sortOrder'> & {
  id: Callout['id'];
  profile: {
    displayName?: string;
    description?: string;
    references?: ReferenceModel[];
    tagsets?: TagsetModel[];
  };
  contributionDefaults?: {
    postDescription?: string;
    whiteboardContent?: string;
  };
};

export type CalloutDeleteType = Omit<CalloutFormInput, 'type'> & {
  id: Callout['id'];
};
