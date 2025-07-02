import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { CalloutSettingsModelFull } from './CalloutSettingsModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { ContributionDefaultsModel } from './ContributionDefaultsModel';

export interface CalloutModel {
  id: string;
  framing: {
    profile: {
      displayName: string;
      description?: string;
      url: string;
      references?: ReferenceModel[];
      tagsets?: TagsetModel[];
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
  contributionDefaults?: ContributionDefaultsModel;
  sortOrder: number;
  activity?: number;
  classification?: {
    flowState?: {
      tags: string[];
    };
  };
  settings: CalloutSettingsModelFull;
}
