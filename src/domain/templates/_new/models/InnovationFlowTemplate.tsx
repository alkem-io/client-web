import { NewTemplateBase } from './TemplateBase';
import { InnovationFlowState, TemplateType } from '../../../../core/apollo/generated/graphql-schema';

export interface InnovationFlowTemplate extends NewTemplateBase {
  type: TemplateType; // TemplateType.InnovationFlow;
  innovationFlowStates?: InnovationFlowState[];
  //!!
  /*innovationFlow?: {
    id: string;
    states: InnovationFlowState[];
  };*/
}
