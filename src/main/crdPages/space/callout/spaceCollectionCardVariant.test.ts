import { describe, expect, test } from 'vitest';
import { SpaceCollectionCardVariant } from '@/core/apollo/generated/graphql-schema';
import { cardVariantFromServer, cardVariantToServer } from './spaceCollectionCardVariant';

describe('cardVariantFromServer', () => {
  test('EXPANDED -> expanded', () => {
    expect(cardVariantFromServer(SpaceCollectionCardVariant.Expanded)).toBe('expanded');
  });
  test('COMPACT -> compact', () => {
    expect(cardVariantFromServer(SpaceCollectionCardVariant.Compact)).toBe('compact');
  });
  test('null -> compact', () => {
    expect(cardVariantFromServer(null)).toBe('compact');
  });
  test('undefined -> compact', () => {
    expect(cardVariantFromServer(undefined)).toBe('compact');
  });
  test('an unknown future enum value -> compact (risk R-11)', () => {
    expect(cardVariantFromServer('SOMETHING_NEW' as unknown as SpaceCollectionCardVariant)).toBe('compact');
  });
});

describe('cardVariantToServer', () => {
  test('expanded -> EXPANDED', () => {
    expect(cardVariantToServer('expanded')).toBe(SpaceCollectionCardVariant.Expanded);
  });
  test('compact -> COMPACT', () => {
    expect(cardVariantToServer('compact')).toBe(SpaceCollectionCardVariant.Compact);
  });
});
