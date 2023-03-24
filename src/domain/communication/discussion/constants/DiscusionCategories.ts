import { DiscussionCategory } from '../../../../core/apollo/generated/graphql-schema';

export enum DiscussionCategoryExtEnum {
  All = 'ALL',
}

export type DiscussionCategoryExt = DiscussionCategory | DiscussionCategoryExtEnum;

// Categories available in the public forum
export const ForumCategories = [
  DiscussionCategory.PlatformFunctionalities,
  DiscussionCategory.CommunityBuilding,
  DiscussionCategory.ChallengeCentric,
  DiscussionCategory.Help,
  DiscussionCategory.Other,
];
