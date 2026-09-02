import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';

export const ALL_SLUG = 'all';

const slugByCategory: Record<ForumDiscussionCategory, string> = {
  [ForumDiscussionCategory.Releases]: 'releases',
  [ForumDiscussionCategory.PlatformFunctionalities]: 'platform-functionalities',
  [ForumDiscussionCategory.CommunityBuilding]: 'community-building',
  [ForumDiscussionCategory.ChallengeCentric]: 'challenge-centric',
  [ForumDiscussionCategory.Help]: 'help',
  [ForumDiscussionCategory.Other]: 'other',
};

const categoryBySlug: Record<string, ForumDiscussionCategory> = Object.fromEntries(
  Object.entries(slugByCategory).map(([cat, slug]) => [slug, cat as ForumDiscussionCategory])
);

export const slugFor = (category: ForumDiscussionCategory | undefined): string => {
  if (!category) return ALL_SLUG;
  return slugByCategory[category] ?? ALL_SLUG;
};

export const categoryFor = (slug: string | undefined): ForumDiscussionCategory | undefined => {
  if (!slug || slug === ALL_SLUG) return undefined;
  return categoryBySlug[slug];
};
