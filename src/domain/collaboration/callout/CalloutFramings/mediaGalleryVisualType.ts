import { VisualType } from '@/core/apollo/generated/graphql-schema';

const DEFAULT_VISUAL_TYPE = VisualType.MediaGalleryImage;

const inferFromMimeType = (mimeType?: string): VisualType | undefined => {
  if (!mimeType) return undefined;
  const normalized = mimeType.toLowerCase();
  if (normalized.startsWith('image/')) {
    return VisualType.MediaGalleryImage;
  }
  if (normalized.startsWith('video/')) {
    return VisualType.MediaGalleryVideo;
  }
  return undefined;
};

export const getMediaGalleryVisualType = (file?: File): VisualType => {
  const fromMime = inferFromMimeType(file?.type);
  if (fromMime) {
    return fromMime;
  }

  return DEFAULT_VISUAL_TYPE;
};
