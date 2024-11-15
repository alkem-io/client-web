import { TemplateBase } from './TemplateBase';
import { InnovationFlowState, TemplateType } from '@/core/apollo/generated/graphql-schema';
export const MAX_INNOVATIONFLOW_STATES = 100;

export interface CollaborationTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Collaboration;
  collaboration?: {
    id: string;
    innovationFlow?: {
      id: string;
      states: InnovationFlowState[];
    };
  };
}
