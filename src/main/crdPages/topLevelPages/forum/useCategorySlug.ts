import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';

export const ALL_SLUG = 'all';

// Slugs are derived from the wire enum value (kebab-case) rather than
// enumerated in a hand-maintained map, so a category the client doesn't yet
// know about (server ahead of client during a deploy) still gets a stable,
// unique slug instead of collapsing onto ALL_SLUG.
export const slugFor = (category: ForumDiscussionCategory | undefined): string => {
  if (!category) return ALL_SLUG;
  return category.toLowerCase().replace(/_/g, '-');
};

export const categoryFor = (slug: string | undefined): ForumDiscussionCategory | undefined => {
  if (!slug || slug === ALL_SLUG) return undefined;
  return Object.values(ForumDiscussionCategory).find(category => slugFor(category) === slug);
};
