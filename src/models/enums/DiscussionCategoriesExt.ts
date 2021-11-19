import { DiscussionCategory } from '../graphql-schema';

export enum DiscussionCategoryExtEnum {
  All = 'all',
}

export type DiscussionCategoryExt = DiscussionCategory | DiscussionCategoryExtEnum;
