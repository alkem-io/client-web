import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { NewTemplateBase } from './TemplateBase';

export interface PostTemplate extends NewTemplateBase {
  type: TemplateType; // TemplateType.Post;
  postDefaultDescription?: string;
}
