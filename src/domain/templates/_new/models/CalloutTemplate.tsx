import { NewTemplateBase } from './TemplateBase';
import { Reference } from '../../../common/profile/Profile';
import { CalloutType, TemplateType } from '../../../../core/apollo/generated/graphql-schema';

export interface CalloutTemplate extends NewTemplateBase {
  type: TemplateType.Callout;
  callout?: {
    id: string;
    type: CalloutType;
    profile: {
      displayName: string;
      description?: string;
      references?: Reference[];
    };
  };
}
