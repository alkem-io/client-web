import { NewTemplateBase } from './TemplateBase';
import { InnovationFlowState, TemplateType } from '../../../../core/apollo/generated/graphql-schema';
export const MAX_INNOVATIONFLOW_STATES = 100;

export interface InnovationFlowTemplate extends NewTemplateBase {
  type: TemplateType; // TemplateType.InnovationFlow;
  innovationFlow?: {
    id: string;
    states: InnovationFlowState[];
  };
}
