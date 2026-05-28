import { describe, expect, test } from 'vitest';
import type { InnovationHubSettingsFragment } from '@/core/apollo/generated/graphql-schema';
import { TagsetReservedName, TagsetType, VisualType } from '@/core/apollo/generated/graphql-schema';
import { mapInnovationHubToAboutValues } from '../dataMappers/mapInnovationHubToAboutValues';
import { mapInnovationHubToSettingsHeader } from '../dataMappers/mapInnovationHubToSettingsHeader';

const baseHub: InnovationHubSettingsFragment = {
  id: 'hub-1',
  subdomain: 'demo',
  spaceVisibilityFilter: undefined,
  profile: {
    id: 'profile-1',
    displayName: 'Demo Innovation Hub',
    description: 'long description',
    tagline: 'innovation everywhere',
    tagset: {
      id: 'tagset-1',
      name: TagsetReservedName.Default,
      tags: ['alpha', 'beta'],
      allowedValues: [],
      type: TagsetType.Freeform,
    },
    visual: {
      id: 'banner-1',
      uri: 'https://example.com/banner.png',
      alternativeText: 'banner alt',
      name: VisualType.Banner,
      maxHeight: 800,
      maxWidth: 1200,
      minHeight: 100,
      minWidth: 200,
      aspectRatio: 1.5,
      allowedTypes: ['image/png'],
    },
    url: '/hub/demo',
  },
  spaceListFilter: [],
};

describe('mapInnovationHubToSettingsHeader', () => {
  test('maps display name, tagline, banner image, color, and canonical path URL', () => {
    const result = mapInnovationHubToSettingsHeader(baseHub);
    expect(result.name).toBe('Demo Innovation Hub');
    expect(result.tagline).toBe('innovation everywhere');
    expect(result.bannerImageUrl).toBe('https://example.com/banner.png');
    expect(result.thumbnailColor).toMatch(/^#/);
    expect(result.initials).toBeTruthy();
    expect(result.viewHubUrl).toBe('/hub/demo');
  });

  test('falls back when banner is absent', () => {
    const result = mapInnovationHubToSettingsHeader({
      ...baseHub,
      profile: { ...baseHub.profile, visual: undefined },
    });
    expect(result.bannerImageUrl).toBeUndefined();
  });

  test('falls back when tagline is empty', () => {
    const result = mapInnovationHubToSettingsHeader({
      ...baseHub,
      profile: { ...baseHub.profile, tagline: undefined },
    });
    expect(result.tagline).toBe('');
  });
});

describe('mapInnovationHubToAboutValues', () => {
  test('maps all editable fields', () => {
    const result = mapInnovationHubToAboutValues(baseHub);
    expect(result.subdomain).toBe('demo');
    expect(result.name).toBe('Demo Innovation Hub');
    expect(result.tagline).toBe('innovation everywhere');
    expect(result.description).toBe('long description');
    expect(result.tags).toEqual(['alpha', 'beta']);
    expect(result.bannerImageUrl).toBe('https://example.com/banner.png');
  });

  test('handles missing tags', () => {
    const result = mapInnovationHubToAboutValues({
      ...baseHub,
      profile: { ...baseHub.profile, tagset: undefined },
    });
    expect(result.tags).toEqual([]);
  });
});
