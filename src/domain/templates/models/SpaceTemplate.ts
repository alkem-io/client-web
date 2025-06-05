import { InnovationFlowState, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { TemplateBase } from './TemplateBase';
import { EmptyTemplateContentSpaceModel } from '../contentSpace/model/TemplateContentSpaceModel';

export interface SpaceTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Space;
  /**
   * SpaceID Only used for creation, it's the spaceId that will be copied to a template
   */
  spaceId?: string;
  /**
   * This is the content of the template, used for preview and updating the template
   * Doesn't need to define the entire contentSpace, just the innovationFlow to be used in //!! (we were not defining callouts before, is that fine? maybe we can remove it entirely)
   */
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

//!! needed?
export const EmptySpaceTemplateModel: SpaceTemplate = {
  id: '',
  type: TemplateType.Space,
  contentSpace: EmptyTemplateContentSpaceModel,
  profile: {
    displayName: '',
  },
};
