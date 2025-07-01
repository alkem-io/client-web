import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { CalloutSettingsModelFull } from './CalloutSettingsModel';

export interface CalloutModel {
  id: string;
  framing: {
    profile: {
      displayName: string;
      description?: string;
      url: string;
    };
    type: CalloutFramingType;
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
  settings: CalloutSettingsModelFull;
}
