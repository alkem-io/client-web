import { ForumDiscussionCategory } from '@core/apollo/generated/graphql-schema';

export enum DiscussionCategoryExtEnum {
  All = 'ALL',
}

export type DiscussionCategoryExt = ForumDiscussionCategory | DiscussionCategoryExtEnum;
