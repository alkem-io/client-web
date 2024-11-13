import { TemplateBase } from './TemplateBase';
import { InnovationFlowState, TemplateType } from '@core/apollo/generated/graphql-schema';

export interface InnovationFlowTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.InnovationFlow;
  innovationFlow?: {
    id: string;
    states: InnovationFlowState[];
  };
}
