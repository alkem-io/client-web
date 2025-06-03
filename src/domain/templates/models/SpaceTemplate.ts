import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { TemplateBase } from './TemplateBase';
import { TemplateContentSpaceModel } from '../contentSpace/TemplateContentSpaceModel';

export interface SpaceTemplateModel extends TemplateBase {
  type: TemplateType; // TemplateType.Post;
  contentSpace?: TemplateContentSpaceModel;
}
