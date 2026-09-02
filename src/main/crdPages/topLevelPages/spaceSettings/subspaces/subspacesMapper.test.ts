import { describe, expect, test } from 'vitest';
import { SpaceSortMode } from '@/core/apollo/generated/graphql-schema';
import { mapSortMode, mapSortModeToBackend } from './subspacesMapper';

describe('mapSortMode / mapSortModeToBackend', () => {
  test('round-trips Custom ↔ manual', () => {
    expect(mapSortMode(SpaceSortMode.Custom)).toBe('manual');
    expect(mapSortModeToBackend('manual')).toBe(SpaceSortMode.Custom);
    expect(mapSortModeToBackend(mapSortMode(SpaceSortMode.Custom))).toBe(SpaceSortMode.Custom);
  });

  test('round-trips Alphabetical ↔ alphabetical', () => {
    expect(mapSortMode(SpaceSortMode.Alphabetical)).toBe('alphabetical');
    expect(mapSortModeToBackend('alphabetical')).toBe(SpaceSortMode.Alphabetical);
    expect(mapSortModeToBackend(mapSortMode(SpaceSortMode.Alphabetical))).toBe(SpaceSortMode.Alphabetical);
  });
});
