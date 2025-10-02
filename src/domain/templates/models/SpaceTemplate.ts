import { InnovationFlowState, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { TemplateBase } from './TemplateBase';

export interface SpaceTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Space;
  /**
   * SpaceID Only used for creation, it's the spaceId that will be copied to a template
   */
  spaceId?: string;
  /**
   * contentSpace is the content of the template, used for preview and updating the template
   * Doesn't need to define the entire contentSpace, just the flow states to be shown in the template Card,
   * the rest of the data will be fetched by the preview using the contentSpace.id
   */
  contentSpace?: {
    id: string;
    about?: {
      profile?: {
        visual?: {
          uri: string;
        };
      };
    };
    collaboration: {
      innovationFlow: {
        states: InnovationFlowState[];
      };
    };
  };
}
