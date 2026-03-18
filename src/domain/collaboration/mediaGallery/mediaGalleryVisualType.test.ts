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

  it('returns image visual type for urls ending with image extensions', () => {
    expect(getMediaGalleryVisualType(undefined, 'https://example.com/image.JPG?version=1')).toBe(
      VisualType.MediaGalleryImage
    );
  });

  it('returns video visual type for urls ending with video extensions', () => {
    expect(getMediaGalleryVisualType(undefined, 'https://cdn.example.com/video.webm')).toBe(
      VisualType.MediaGalleryVideo
    );
  });

  it('falls back to default visual type when no hints are present', () => {
    expect(getMediaGalleryVisualType(undefined, 'https://example.com/asset.bin')).toBe(VisualType.MediaGalleryImage);
  });
});
