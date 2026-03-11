import type { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type { TemplateBase } from './TemplateBase';

export interface PostTemplate extends TemplateBase {
  type: TemplateType; // TemplateType.Post;
  postDefaultDescription?: string;
}
