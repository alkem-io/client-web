import { describe, expect, it } from 'vitest';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { spaceTileImageUrl } from './spaceTileImageUrl';

const both = { avatar: { uri: 'avatar.png' }, cardBanner: { uri: 'card.png' } };

describe('spaceTileImageUrl', () => {
  it('uses the cardBanner for an L0 space, which has no avatar concept', () => {
    expect(spaceTileImageUrl(SpaceLevel.L0, both)).toBe('card.png');
  });

  it('uses the avatar for L1 and L2 subspaces', () => {
    expect(spaceTileImageUrl(SpaceLevel.L1, both)).toBe('avatar.png');
    expect(spaceTileImageUrl(SpaceLevel.L2, both)).toBe('avatar.png');
  });

  it('never substitutes one visual for the other', () => {
    expect(spaceTileImageUrl(SpaceLevel.L0, { avatar: { uri: 'avatar.png' } })).toBeUndefined();
    expect(spaceTileImageUrl(SpaceLevel.L1, { cardBanner: { uri: 'card.png' } })).toBeUndefined();
  });

  it('treats the backend\'s empty-string uri as "no image"', () => {
    // The server returns a Visual object with `uri: ""` when nothing is uploaded.
    expect(spaceTileImageUrl(SpaceLevel.L0, { cardBanner: { uri: '' } })).toBeUndefined();
    expect(spaceTileImageUrl(SpaceLevel.L1, { avatar: { uri: '' } })).toBeUndefined();
  });

  it('tolerates null visuals from the schema', () => {
    expect(spaceTileImageUrl(SpaceLevel.L0, { cardBanner: null, avatar: null })).toBeUndefined();
    expect(spaceTileImageUrl(SpaceLevel.L1, {})).toBeUndefined();
  });
});
