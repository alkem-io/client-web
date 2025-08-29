import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { ClassificationTagsetModel } from '../../calloutsSet/Classification/ClassificationTagset.model';

export interface CalloutModelLight {
  id: string;
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
    memo?: {
      profile: {
        preview?: {
          uri: string;
        };
      };
    };
  };
  sortOrder: number;
  activity?: number;
  classification?: {
    flowState?: ClassificationTagsetModel;
  };
}
