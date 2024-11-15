import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { TemplateBase } from './TemplateBase';

export interface PostTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Post;
  postDefaultDescription?: string;
}
