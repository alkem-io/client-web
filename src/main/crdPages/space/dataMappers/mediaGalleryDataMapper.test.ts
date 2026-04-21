import { describe, expect, it } from 'vitest';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import type { MediaGalleryModel } from '@/domain/collaboration/mediaGallery/MediaGalleryModel';
import { mapMediaGalleryToViewProps } from './mediaGalleryDataMapper';

const makeVisual = (overrides: {
  id: string;
  uri?: string;
  sortOrder?: number;
  alternativeText?: string;
  name?: VisualType;
}) => ({
  id: overrides.id,
  uri: overrides.uri ?? `https://example.com/${overrides.id}.jpg`,
  name: overrides.name ?? VisualType.MediaGalleryImage,
  alternativeText: overrides.alternativeText,
  sortOrder: overrides.sortOrder,
});

describe('mapMediaGalleryToViewProps', () => {
  it('returns empty shape for an undefined model', () => {
    const result = mapMediaGalleryToViewProps(undefined);
    expect(result).toEqual({ feedThumbnails: [], totalCount: 0, carouselItems: [] });
  });

  it('returns empty shape for a model with no visuals', () => {
    const model: MediaGalleryModel = { id: 'gallery-1', visuals: undefined };
    const result = mapMediaGalleryToViewProps(model);
    expect(result).toEqual({ feedThumbnails: [], totalCount: 0, carouselItems: [] });
  });

  it('sorts visuals ascending by sortOrder in every field', () => {
    const model: MediaGalleryModel = {
      id: 'gallery-2',
      visuals: [
        makeVisual({ id: 'c', sortOrder: 3 }),
        makeVisual({ id: 'a', sortOrder: 1 }),
        makeVisual({ id: 'b', sortOrder: 2 }),
      ],
    };
    const result = mapMediaGalleryToViewProps(model);
    expect(result.feedThumbnails).toEqual([
      { id: 'a', url: 'https://example.com/a.jpg' },
      { id: 'b', url: 'https://example.com/b.jpg' },
      { id: 'c', url: 'https://example.com/c.jpg' },
    ]);
    expect(result.carouselItems.map(i => i.id)).toEqual(['a', 'b', 'c']);
    expect(result.totalCount).toBe(3);
  });

  it('caps feedThumbnails at 4 { id, url } pairs but preserves totalCount and carouselItems', () => {
    const model: MediaGalleryModel = {
      id: 'gallery-3',
      visuals: [1, 2, 3, 4, 5, 6].map(i => makeVisual({ id: `v${i}`, sortOrder: i })),
    };
    const result = mapMediaGalleryToViewProps(model);
    expect(result.feedThumbnails).toHaveLength(4);
    expect(result.feedThumbnails).toEqual([
      { id: 'v1', url: 'https://example.com/v1.jpg' },
      { id: 'v2', url: 'https://example.com/v2.jpg' },
      { id: 'v3', url: 'https://example.com/v3.jpg' },
      { id: 'v4', url: 'https://example.com/v4.jpg' },
    ]);
    expect(result.totalCount).toBe(6);
    expect(result.carouselItems).toHaveLength(6);
  });

  it('passes alternativeText through when present and leaves undefined when not', () => {
    const model: MediaGalleryModel = {
      id: 'gallery-4',
      visuals: [
        makeVisual({ id: 'a', sortOrder: 1, alternativeText: 'First image' }),
        makeVisual({ id: 'b', sortOrder: 2 }),
      ],
    };
    const result = mapMediaGalleryToViewProps(model);
    expect(result.carouselItems[0].alternativeText).toBe('First image');
    expect(result.carouselItems[1].alternativeText).toBeUndefined();
  });

  it('places visuals with undefined sortOrder at the end', () => {
    const model: MediaGalleryModel = {
      id: 'gallery-5',
      visuals: [
        makeVisual({ id: 'no-order' }),
        makeVisual({ id: 'first', sortOrder: 1 }),
        makeVisual({ id: 'second', sortOrder: 2 }),
      ],
    };
    const result = mapMediaGalleryToViewProps(model);
    expect(result.carouselItems.map(i => i.id)).toEqual(['first', 'second', 'no-order']);
  });
});
