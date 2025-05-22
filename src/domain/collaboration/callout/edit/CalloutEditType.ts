import { CalloutFormInput } from '../CalloutForm';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { Identifiable } from '@/core/utils/Identifiable';

export type CalloutEditType = Omit<CalloutFormInput, 'type' | 'sortOrder'> &
  Identifiable & {
    profile: {
      displayName: string;
      description?: string;
      references?: ReferenceModel[];
      tagsets?: TagsetModel[];
    };
    contributionDefaults?: {
      postDescription?: string;
      whiteboardContent?: string;
    };
  };

export type CalloutDeleteType = Omit<CalloutFormInput, 'type'> & Identifiable;
