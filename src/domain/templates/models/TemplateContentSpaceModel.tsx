import { InnovationFlowCalloutsPreviewProps } from '@/domain/collaboration/callout/CalloutsPreview/InnovationFlowCalloutsPreview';
import { TemplateBase } from './TemplateBase';
import { InnovationFlowState, TemplateType } from '@/core/apollo/generated/graphql-schema';

export interface TemplateContentSpaceModel extends TemplateBase {
  type: TemplateType; // TemplateType.Space;
  contentSpace?: {
    id: string;
    collaboration: {
      id: string;
      innovationFlow: {
        id: string;
        states: InnovationFlowState[];
      };
      calloutsSet: {
        callouts: InnovationFlowCalloutsPreviewProps['callouts'];
      };
    };
  };
}
