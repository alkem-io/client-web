import { TemplateType } from '../../../core/apollo/generated/graphql-schema';
import { TemplateBase } from './TemplateBase';

export interface CollaborationTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.CollaborationTemplate;
  calloutData?: {
    framing: {
      profile: {
        displayName: string;
      };
    };
  }[];
}
