import type { MediaGalleryFeedThumbnail } from '@/crd/components/mediaGallery/MediaGalleryFeedGrid';
import type { MediaGalleryModel } from '@/domain/collaboration/mediaGallery/MediaGalleryModel';

export type MediaGalleryCarouselItem = {
  id: string;
  uri: string;
  alternativeText?: string;
};

export type MediaGalleryViewProps = {
  feedThumbnails: MediaGalleryFeedThumbnail[];
  totalCount: number;
  carouselItems: MediaGalleryCarouselItem[];
};

/**
 * Pure mapper: MediaGalleryModel → props for the CRD feed grid + inline carousel.
 *
 * - Sorts visuals ascending by `sortOrder` (undefined sortOrder sorts last, stable).
 * - `feedThumbnails` is the first 4 `{ id, url }` pairs; carrying the id through lets
 *   `MediaGalleryFeedGrid` use stable React keys across reorders / deletions.
 * - `MediaGalleryFeedGrid` decides whether the 4th cell is a full tile (when
 *   totalCount === thumbnails.length) or an overlay "+N more" card (when
 *   totalCount > thumbnails.length).
 */
export function mapMediaGalleryToViewProps(model: MediaGalleryModel | undefined): MediaGalleryViewProps {
  const visuals = model?.visuals ?? [];
  const sorted = [...visuals].sort((a, b) => {
    const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });

  return {
    feedThumbnails: sorted.slice(0, 4).map(v => ({ id: v.id, url: v.uri, alternativeText: v.alternativeText })),
    totalCount: sorted.length,
    carouselItems: sorted.map(v => ({
      id: v.id,
      uri: v.uri,
      alternativeText: v.alternativeText,
    })),
  };
}
