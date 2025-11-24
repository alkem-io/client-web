import { describe, expect, it } from 'vitest';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { getMediaGalleryVisualType } from './mediaGalleryVisualType';

describe('getMediaGalleryVisualType', () => {
  it('returns image visual type for image mime types', () => {
    const file = { type: 'image/png' } as File;
    expect(getMediaGalleryVisualType(file)).toBe(VisualType.MediaGalleryImage);
  });

  it('returns video visual type for video mime types', () => {
    const file = { type: 'video/mp4' } as File;
    expect(getMediaGalleryVisualType(file)).toBe(VisualType.MediaGalleryVideo);
  });

  it('falls back to default visual type when mime type is missing', () => {
    expect(getMediaGalleryVisualType()).toBe(VisualType.Card);
  });
});
