import { describe, expect, it } from 'vitest';
import { type AssociateInput, mapAssociates } from '../organizationProfileMapper';

describe('mapAssociates', () => {
  it('returns an empty array for an empty input', () => {
    expect(mapAssociates([])).toEqual([]);
  });

  it('renames `avatar` → `avatarImageUrl` and falls back to null when missing', () => {
    const input: AssociateInput[] = [
      { id: 'u-1', displayName: 'Alice', avatar: 'https://cdn.example/alice.png', url: '/u/alice' },
      { id: 'u-2', displayName: 'Bob', url: '/u/bob' },
    ];
    expect(mapAssociates(input)).toEqual([
      { id: 'u-1', displayName: 'Alice', avatarImageUrl: 'https://cdn.example/alice.png', url: '/u/alice' },
      { id: 'u-2', displayName: 'Bob', avatarImageUrl: null, url: '/u/bob' },
    ]);
  });

  it('preserves order', () => {
    const input: AssociateInput[] = [
      { id: 'u-1', displayName: 'A', url: '/a' },
      { id: 'u-2', displayName: 'B', url: '/b' },
      { id: 'u-3', displayName: 'C', url: '/c' },
    ];
    expect(mapAssociates(input).map(a => a.id)).toEqual(['u-1', 'u-2', 'u-3']);
  });
});
