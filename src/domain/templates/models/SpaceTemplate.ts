import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { TemplateBase } from './TemplateBase';
import {
  EmptyTemplateContentSpaceModel,
  TemplateContentSpaceModel,
} from '../contentSpace/model/TemplateContentSpaceModel';

export interface SpaceTemplateModel extends TemplateBase {
  type: TemplateType;
  contentSpace?: TemplateContentSpaceModel;
  modelSpaceId?: string; // Optional, used for creating a new template
}

export const EmptySpaceTemplateModel: SpaceTemplateModel = {
  id: '',
  type: TemplateType.Space,
  contentSpace: EmptyTemplateContentSpaceModel,
  profile: {
    displayName: '',
  },
  modelSpaceId: undefined,
};
