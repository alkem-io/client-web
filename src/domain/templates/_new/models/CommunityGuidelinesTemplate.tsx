import { NewTemplateBase } from './TemplateBase';
import { Reference } from '../../../common/profile/Profile';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';

export interface CommunityGuidelinesTemplate extends NewTemplateBase {
  type: TemplateType.CommunityGuidelines;
  guidelines?: {
    id: string;
    profile: {
      displayName: string;
      description?: string;
      references?: Reference[];
    };
  };
}
