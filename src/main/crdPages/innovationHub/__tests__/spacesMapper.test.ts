import { describe, expect, test } from 'vitest';
import { type InnovationHubSpaceFragment, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import {
  mapInnovationHubSpaceToTableRow,
  normalizeSpaceVisibility,
} from '../dataMappers/mapInnovationHubSpaceToTableRow';

const t = (key: string) => key;

const buildSpace = (overrides: Partial<InnovationHubSpaceFragment> = {}): InnovationHubSpaceFragment => ({
  id: 'space-1',
  visibility: SpaceVisibility.Active,
  about: {
    id: 'about-1',
    profile: {
      id: 'profile-1',
      displayName: 'Digital Twin',
      url: '/space/digital-twin',
    },
    provider: {
      id: 'org-1',
      profile: {
        id: 'org-profile-1',
        displayName: 'VNG',
      },
    },
  },
  ...overrides,
});

describe('normalizeSpaceVisibility', () => {
  test('maps all enum values', () => {
    expect(normalizeSpaceVisibility(SpaceVisibility.Active)).toBe('active');
    expect(normalizeSpaceVisibility(SpaceVisibility.Demo)).toBe('demo');
    expect(normalizeSpaceVisibility(SpaceVisibility.Inactive)).toBe('inactive');
    expect(normalizeSpaceVisibility(SpaceVisibility.Archived)).toBe('archived');
  });
  test('falls back to unknown for null/undefined', () => {
    expect(normalizeSpaceVisibility(undefined)).toBe('unknown');
    expect(normalizeSpaceVisibility(null)).toBe('unknown');
  });
});

describe('mapInnovationHubSpaceToTableRow', () => {
  test('maps id, name, visibility variant, label, host account, and URL', () => {
    const row = mapInnovationHubSpaceToTableRow(buildSpace(), t);
    expect(row).toEqual({
      id: 'space-1',
      name: 'Digital Twin',
      visibility: 'active',
      visibilityLabel: 'settings.spaces.visibility.active',
      hostAccount: 'VNG',
      spaceUrl: '/space/digital-twin',
    });
  });
  test('falls back to em-dash when no provider', () => {
    const row = mapInnovationHubSpaceToTableRow(
      buildSpace({ about: { ...buildSpace().about, provider: undefined } }),
      t
    );
    expect(row.hostAccount).toBe('—');
  });
  test('emits demo variant for SpaceVisibility.Demo', () => {
    const row = mapInnovationHubSpaceToTableRow(buildSpace({ visibility: SpaceVisibility.Demo }), t);
    expect(row.visibility).toBe('demo');
    expect(row.visibilityLabel).toBe('settings.spaces.visibility.demo');
  });
});
