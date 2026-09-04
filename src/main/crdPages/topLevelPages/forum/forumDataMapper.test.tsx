import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import { availableCategoriesFor, buildCategoryEntries, discussionCreationCategoriesFor } from './forumDataMapper';

const ALL_EIGHT: ForumDiscussionCategory[] = Object.values(ForumDiscussionCategory);

const t = ((key: string) => key) as TFunction<'crd-forum'>;
const tDefault = ((key: string) => key) as TFunction;

describe('discussionCreationCategoriesFor', () => {
  it('a platform admin sees every active category', () => {
    expect(discussionCreationCategoriesFor(ALL_EIGHT, true)).toEqual(ALL_EIGHT);
  });

  it('a non-admin never sees Releases or Newsletter', () => {
    const result = discussionCreationCategoriesFor(ALL_EIGHT, false);
    expect(result).not.toContain(ForumDiscussionCategory.Releases);
    expect(result).not.toContain(ForumDiscussionCategory.Newsletter);
  });

  it('non-admin-only categories pass through untouched', () => {
    const result = discussionCreationCategoriesFor(ALL_EIGHT, false);
    expect(result).toEqual(
      ALL_EIGHT.filter(c => c !== ForumDiscussionCategory.Releases && c !== ForumDiscussionCategory.Newsletter)
    );
  });
});

describe('availableCategoriesFor', () => {
  it('platform admin editing a post in a non-listed (retired) category gets active ∪ current', () => {
    const active = [ForumDiscussionCategory.Help, ForumDiscussionCategory.Other];
    const result = availableCategoriesFor(active, true, ForumDiscussionCategory.PlatformFunctionalities);
    expect(result).toEqual([...active, ForumDiscussionCategory.PlatformFunctionalities]);
  });

  it('non-admin list excludes Releases + Newsletter but keeps a current admin-only category', () => {
    const result = availableCategoriesFor(ALL_EIGHT, false, ForumDiscussionCategory.Newsletter);
    expect(result).toContain(ForumDiscussionCategory.Newsletter);
    expect(result.filter(c => c === ForumDiscussionCategory.Newsletter)).toHaveLength(1);
    expect(result).not.toContain(ForumDiscussionCategory.Releases);
  });

  it('never duplicates the current category when it is already in the active list', () => {
    const result = availableCategoriesFor(ALL_EIGHT, true, ForumDiscussionCategory.Help);
    expect(result.filter(c => c === ForumDiscussionCategory.Help)).toHaveLength(1);
  });

  it('non-admin keeps a currently-retired category alongside the visible ones', () => {
    const active = [ForumDiscussionCategory.Help, ForumDiscussionCategory.TipsAndTricks];
    const result = availableCategoriesFor(active, false, ForumDiscussionCategory.Other);
    expect(result).toEqual([...active, ForumDiscussionCategory.Other]);
  });
});

describe('buildCategoryEntries icons', () => {
  it('maps every enum member to a distinct icon component', () => {
    const entries = buildCategoryEntries(ALL_EIGHT, t, tDefault);
    // First entry is the synthetic "all" tab; the rest mirror ALL_EIGHT 1:1.
    const categoryIconTypes = entries.slice(1).map(entry => (entry.iconNode as { type: unknown }).type);
    expect(new Set(categoryIconTypes).size).toBe(categoryIconTypes.length);
  });

  it('falls back to the default icon for an unrecognized category value', () => {
    const unknown = 'SOME_FUTURE_CATEGORY' as ForumDiscussionCategory;
    const entries = buildCategoryEntries([unknown], t, tDefault);
    const knownIconTypes = buildCategoryEntries(ALL_EIGHT, t, tDefault)
      .slice(1)
      .map(entry => (entry.iconNode as { type: unknown }).type);
    const fallbackType = (entries[1].iconNode as { type: unknown }).type;
    expect(knownIconTypes).not.toContain(fallbackType);
  });
});
