import { DiscussionCategory } from '../../../../core/apollo/generated/graphql-schema';

export enum DiscussionCategoryExtEnum {
  All = 'all',
}

export type DiscussionCategoryExt = DiscussionCategory | DiscussionCategoryExtEnum;
