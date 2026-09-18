import { describe, expect, it } from 'vitest';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import { ALL_SLUG, categoryFor, slugFor } from './useCategorySlug';

// Pins every live category slug so this delivery's derived transform never
// moves an existing URL. If one of these fails, a category's URL changed.
const LIVE_SLUGS: Record<ForumDiscussionCategory, string> = {
  [ForumDiscussionCategory.Releases]: 'releases',
  [ForumDiscussionCategory.PlatformFunctionalities]: 'platform-functionalities',
  [ForumDiscussionCategory.CommunityBuilding]: 'community-building',
  [ForumDiscussionCategory.ChallengeCentric]: 'challenge-centric',
  [ForumDiscussionCategory.Help]: 'help',
  [ForumDiscussionCategory.Other]: 'other',
  [ForumDiscussionCategory.Newsletter]: 'newsletter',
  [ForumDiscussionCategory.TipsAndTricks]: 'tips-and-tricks',
};

describe('slugFor', () => {
  it.each(Object.entries(LIVE_SLUGS))('derives %s -> %s', (category, expectedSlug) => {
    expect(slugFor(category as ForumDiscussionCategory)).toBe(expectedSlug);
  });

  it('falls back to ALL_SLUG for an undefined category', () => {
    expect(slugFor(undefined)).toBe(ALL_SLUG);
  });

  it.each(['new', 'discussion', 'all'])('never collides with the reserved route "%s"', reservedSlug => {
    for (const category of Object.values(ForumDiscussionCategory)) {
      expect(slugFor(category)).not.toBe(reservedSlug);
    }
  });
});

describe('categoryFor', () => {
  it.each(Object.entries(LIVE_SLUGS))('reverses %s <- %s', (category, slug) => {
    expect(categoryFor(slug)).toBe(category);
  });

  it('resolves the Help slug to the Help category (Q&A is a label-only relabel)', () => {
    expect(categoryFor('help')).toBe(ForumDiscussionCategory.Help);
  });

  it('returns undefined for the ALL_SLUG and for unknown slugs', () => {
    expect(categoryFor(ALL_SLUG)).toBeUndefined();
    expect(categoryFor(undefined)).toBeUndefined();
    expect(categoryFor('not-a-real-category')).toBeUndefined();
  });

  it.each(Object.entries(LIVE_SLUGS))('still reverses %s <- %s when an active list is supplied', (category, slug) => {
    expect(categoryFor(slug, [ForumDiscussionCategory.Help])).toBe(category);
  });

  it('keeps ALL_SLUG unresolved even if the server ever sends a category that derives it', () => {
    expect(categoryFor(ALL_SLUG, ['ALL' as ForumDiscussionCategory])).toBeUndefined();
  });

  // Deploy skew: the server runs ahead of this client build and sends a
  // category the compiled enum has never heard of. The derived slug must round
  // trip through the loaded active list, because resolving to `undefined` reads
  // as "no filter" at every call site.
  it('round-trips a wire value the client build does not know, via the loaded active list', () => {
    const unknownFromServer = 'FUTURE_CATEGORY' as ForumDiscussionCategory;
    const derivedSlug = slugFor(unknownFromServer);

    expect(derivedSlug).toBe('future-category');
    expect(categoryFor(derivedSlug)).toBeUndefined();
    expect(categoryFor(derivedSlug, [ForumDiscussionCategory.Help, unknownFromServer])).toBe(unknownFromServer);
  });

  it('leaves a slug absent from both the active list and the compiled enum unresolved', () => {
    expect(categoryFor('not-a-real-category', [ForumDiscussionCategory.Help])).toBeUndefined();
  });
});
