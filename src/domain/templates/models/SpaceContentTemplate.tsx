import { TemplateBase } from './TemplateBase';
import { InnovationFlowState, TemplateType } from '@/core/apollo/generated/graphql-schema';

export interface SpaceContentTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Space;
  contentSpace?: {
    id: string;
    collaboration?: {
      id: string;
      innovationFlow?: {
        id: string;
        states: InnovationFlowState[];
      };
    };
  };
}
