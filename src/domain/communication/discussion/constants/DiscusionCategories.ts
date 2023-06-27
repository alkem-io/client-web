import { DiscussionCategory } from '../../../../core/apollo/generated/graphql-schema';

export enum DiscussionCategoryExtEnum {
  All = 'ALL',
}

export type DiscussionCategoryExt = DiscussionCategory | DiscussionCategoryExtEnum;
