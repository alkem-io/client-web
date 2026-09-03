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

// The reverse transform. `loadedCategories` is the forum's active list as the
// server actually sent it; it is searched first so that a category added to
// the server ahead of this client build still resolves to a real category
// instead of `undefined`. That distinction matters because callers read
// `undefined` as "no category filter — show everything", so a server-added
// category resolving to `undefined` would silently turn its own page into an
// unfiltered listing. The compiled enum is kept as a fallback so known slugs
// still resolve before the forum query settles. A slug that matches neither
// stays `undefined`.
export const categoryFor = (
  slug: string | undefined,
  loadedCategories: readonly ForumDiscussionCategory[] = []
): ForumDiscussionCategory | undefined => {
  if (!slug || slug === ALL_SLUG) return undefined;
  const candidates = [...loadedCategories, ...Object.values(ForumDiscussionCategory)];
  return candidates.find(category => slugFor(category) === slug);
};
