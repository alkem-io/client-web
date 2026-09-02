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

  it('resolves the Help slug to the Help category (Q&A is a label-only relabel, D-01)', () => {
    expect(categoryFor('help')).toBe(ForumDiscussionCategory.Help);
  });

  it('returns undefined for the ALL_SLUG and for unknown slugs', () => {
    expect(categoryFor(ALL_SLUG)).toBeUndefined();
    expect(categoryFor(undefined)).toBeUndefined();
    expect(categoryFor('not-a-real-category')).toBeUndefined();
  });
});
