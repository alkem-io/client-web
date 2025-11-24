import { VisualType } from '@/core/apollo/generated/graphql-schema';

const DEFAULT_VISUAL_TYPE = VisualType.Card;

export const getMediaGalleryVisualType = (file?: File): VisualType => {
  const mimeType = file?.type?.toLowerCase();

  if (!mimeType) {
    return DEFAULT_VISUAL_TYPE;
  }

  if (mimeType.startsWith('image/')) {
    return VisualType.MediaGalleryImage;
  }

  if (mimeType.startsWith('video/')) {
    return VisualType.MediaGalleryVideo;
  }

  return DEFAULT_VISUAL_TYPE;
};
