import { describe, expect, it } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { canMessageContributor, contributorTypeFromActor, mapContributorPreview } from './contributorPreviewMapper';

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

  it('takes tags from the keywords tagset in any case and ignores skills and capabilities', () => {
    const tagsets = (keywordsName: string) => [
      { name: 'skills', tags: ['typescript'] },
      { name: 'capabilities', tags: ['hosting'] },
      { name: keywordsName, tags: ['climate', 'energy'] },
    ];
    expect(mapContributorPreview('bob', 'user', { tagsets: tagsets('KEYWORDS') }, 'me').tags).toEqual([
      'climate',
      'energy',
    ]);
    expect(mapContributorPreview('bob', 'user', { tagsets: tagsets('Keywords') }, 'me').tags).toEqual([
      'climate',
      'energy',
    ]);
    expect(mapContributorPreview('bob', 'user', { tagsets: [{ name: 'skills', tags: ['ts'] }] }, 'me').tags).toEqual(
      []
    );
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

  it('allows an organisation for a signed-in viewer (the hover card hides it by type)', () => {
    expect(canMessageContributor({ type: 'organization', id: 'org' }, 'me')).toBe(true);
  });
});
