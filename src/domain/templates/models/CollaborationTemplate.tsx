import { TemplateBase } from './TemplateBase';
import { InnovationFlowState, TemplateType } from '../../../core/apollo/generated/graphql-schema';

export interface CollaborationTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Collaboration;
  collaboration?: {
    innovationFlow?: {
      id: string;
      states: InnovationFlowState[];
    };
  };
}
