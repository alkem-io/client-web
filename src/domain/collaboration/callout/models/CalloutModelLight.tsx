import { CalloutFramingType, CalloutType } from '@/core/apollo/generated/graphql-schema';
import { ClassificationTagsetModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import { MemoModelLight } from '../../memo/model/MemoModelLight';

export interface CalloutModelLight {
  id: string;
  calloutTypeDeprecated: CalloutType;
  framing: {
    profile: {
      displayName: string;
      description?: string;
      url?: string;
    };
    type: CalloutFramingType;
    whiteboard?: {
      profile: {
        preview?: {
          uri: string;
        };
      };
    };
    memo?: MemoModelLight;
  };
  sortOrder: number;
  activity?: number;
  classification?: {
    flowState?: ClassificationTagsetModel;
  };
}
