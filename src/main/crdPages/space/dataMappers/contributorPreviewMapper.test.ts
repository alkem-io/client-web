import { describe, expect, it } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { canMessageContributor, keywordTags, mapContributorPreview } from './contributorPreviewMapper';
import { contributorTypeFromActor } from './contributorType';

describe('mapContributorPreview', () => {
  const profile = {
    displayName: 'Bob',
    url: '/user/bob',
    avatar: { uri: 'https://example.org/bob.png' },
  };

  it('maps the display fields and joins city and country', () => {
    const preview = mapContributorPreview(
      'bob',
      'user',
      { ...profile, location: { city: 'Utrecht', country: 'NL' } },
      'me'
    );
    expect(preview).toEqual({
      id: 'bob',
      type: 'user',
      name: 'Bob',
      avatarUrl: 'https://example.org/bob.png',
      href: '/user/bob',
      locationLabel: 'Utrecht, NL',
      tagline: undefined,
      tags: [],
      canMessage: true,
      self: false,
    });
  });

  it('uses the city alone, and no location when neither is set', () => {
    expect(mapContributorPreview('bob', 'user', { location: { city: 'Utrecht' } }, 'me').locationLabel).toBe('Utrecht');
    expect(
      mapContributorPreview('bob', 'user', { location: { city: null, country: '' } }, 'me').locationLabel
    ).toBeUndefined();
    expect(mapContributorPreview('bob', 'user', {}, 'me').locationLabel).toBeUndefined();
  });

  it('trims the tagline and drops a blank one', () => {
    expect(mapContributorPreview('bob', 'user', { tagline: '  Builder  ' }, 'me').tagline).toBe('Builder');
    expect(mapContributorPreview('bob', 'user', { tagline: '   ' }, 'me').tagline).toBeUndefined();
  });

  it('shows the keywords it is given, and none when there are none', () => {
    expect(mapContributorPreview('bob', 'user', { keywords: ['climate', 'energy'] }, 'me').tags).toEqual([
      'climate',
      'energy',
    ]);
    expect(mapContributorPreview('bob', 'user', { keywords: null }, 'me').tags).toEqual([]);
  });

  it('marks only users as messageable; an organisation never gets the card Message action', () => {
    expect(mapContributorPreview('bob', 'user', {}, 'me').canMessage).toBe(true);
    expect(mapContributorPreview('org', 'organization', {}, 'me').canMessage).toBe(false);
    expect(mapContributorPreview('vc', 'virtualContributor', {}, 'me').canMessage).toBe(false);
  });

  it('marks the viewer as self, and nobody when signed out', () => {
    expect(mapContributorPreview('me', 'user', {}, 'me').self).toBe(true);
    expect(mapContributorPreview('bob', 'user', {}, 'me').self).toBe(false);
    expect(mapContributorPreview('bob', 'user', {}, undefined).self).toBe(false);
  });
});

describe('keywordTags', () => {
  it('takes the keywords tagset in any case and ignores skills and capabilities', () => {
    const tagsets = (keywordsName: string) => [
      { name: 'skills', tags: ['typescript'] },
      { name: 'capabilities', tags: ['hosting'] },
      { name: keywordsName, tags: ['climate', 'energy'] },
    ];
    expect(keywordTags(tagsets('KEYWORDS'))).toEqual(['climate', 'energy']);
    expect(keywordTags(tagsets('Keywords'))).toEqual(['climate', 'energy']);
    expect(keywordTags([{ name: 'skills', tags: ['ts'] }])).toBeUndefined();
    expect(keywordTags(undefined)).toBeUndefined();
  });
});

describe('contributorTypeFromActor', () => {
  it('maps the contributor actor types to card kinds', () => {
    expect(contributorTypeFromActor(ActorType.User)).toBe('user');
    expect(contributorTypeFromActor(ActorType.Organization)).toBe('organization');
    expect(contributorTypeFromActor(ActorType.VirtualContributor)).toBe('virtualContributor');
  });

  it('gives no kind for other actor types or a missing type', () => {
    expect(contributorTypeFromActor(ActorType.Space)).toBeUndefined();
    expect(contributorTypeFromActor(undefined)).toBeUndefined();
  });
});

describe('canMessageContributor', () => {
  it('allows a signed-in viewer to message another user', () => {
    expect(canMessageContributor({ type: 'user', id: 'bob' }, 'me')).toBe(true);
  });

  it('refuses self, a signed-out viewer and a virtual contributor', () => {
    expect(canMessageContributor({ type: 'user', id: 'me' }, 'me')).toBe(false);
    expect(canMessageContributor({ type: 'user', id: 'bob' }, undefined)).toBe(false);
    expect(canMessageContributor({ type: 'virtualContributor', id: 'vc' }, 'me')).toBe(false);
  });

  it('allows an organisation for a signed-in viewer (its own message dialog, not the card)', () => {
    expect(canMessageContributor({ type: 'organization', id: 'org' }, 'me')).toBe(true);
  });
});
