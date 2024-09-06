import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { NewTemplateBase } from './TemplateBase';

export interface CollaborationTemplate extends NewTemplateBase {
  type: TemplateType; // TemplateType.CollaborationTemplate;
  calloutData?: {
    framing: {
      profile: {
        displayName: string;
      }
    }
  }[];
}
