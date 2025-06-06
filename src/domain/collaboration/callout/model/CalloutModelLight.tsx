import { CalloutType } from '@/core/apollo/generated/graphql-schema';

export interface CalloutModelLight {
  id: string;
  type: CalloutType;
  framing: {
    profile: {
      displayName: string;
      description?: string;
      url?: string;
    };
    whiteboard?: {
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
    flowState?: {
      tags: string[];
    };
  };
}
