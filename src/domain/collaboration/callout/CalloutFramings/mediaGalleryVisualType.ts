import { VisualType } from '@/core/apollo/generated/graphql-schema';

const DEFAULT_VISUAL_TYPE = VisualType.Card;
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'avi', 'webm', 'mkv', 'ogg']);

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

const inferFromUri = (uri?: string): VisualType | undefined => {
  if (!uri) return undefined;

  const sanitizedUri = uri.split('?')[0]?.split('#')[0];
  const extension = sanitizedUri?.split('.').pop()?.toLowerCase();
  if (!extension) return undefined;
  if (IMAGE_EXTENSIONS.has(extension)) {
    return VisualType.MediaGalleryImage;
  }
  if (VIDEO_EXTENSIONS.has(extension)) {
    return VisualType.MediaGalleryVideo;
  }
  return undefined;
};

export const getMediaGalleryVisualType = (file?: File, uri?: string): VisualType => {
  const fromMime = inferFromMimeType(file?.type);
  if (fromMime) {
    return fromMime;
  }

  const fromUri = inferFromUri(uri);
  if (fromUri) {
    return fromUri;
  }

  return DEFAULT_VISUAL_TYPE;
};
