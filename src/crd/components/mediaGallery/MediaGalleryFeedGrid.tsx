import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type MediaGalleryFeedThumbnail = { id: string; url: string };

type MediaGalleryFeedGridProps = {
  thumbnails: MediaGalleryFeedThumbnail[];
  totalCount: number;
  onOpenAt?: (index?: number) => void;
  className?: string;
};

/**
 * Feed-level preview grid for media-gallery-framed callouts. Shapes/classes deliberately
 * mirror `ContributionsPreviewConnector`'s whiteboard-contribution grid so the two
 * look identical at a glance. When `totalCount > thumbnails.length`, the last cell
 * renders as a "+N more" overlay reading `+{totalCount - (thumbnails.length - 1)} more`.
 */
export function MediaGalleryFeedGrid({ thumbnails, totalCount, onOpenAt, className }: MediaGalleryFeedGridProps) {
  const { t } = useTranslation('crd-space');

  if (thumbnails.length === 0) return null;

  const hasOverflow = totalCount > thumbnails.length;
  const visibleThumbnails = hasOverflow ? thumbnails.slice(0, thumbnails.length - 1) : thumbnails;
  const overflowThumbnail = hasOverflow ? thumbnails[thumbnails.length - 1] : undefined;
  const moreCount = hasOverflow ? totalCount - visibleThumbnails.length : 0;

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4', className)}>
      {visibleThumbnails.map((thumbnail, index) => (
        <button
          key={thumbnail.id}
          type="button"
          className="group/mg relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 aspect-video cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
          onClick={() => onOpenAt?.(index)}
          aria-label={t('mediaGallery.openImage')}
        >
          <img
            src={thumbnail.url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover/mg:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/mg:opacity-100 transition-opacity duration-200 bg-primary/40">
            <span className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground shadow-lg h-8 px-3 text-caption font-semibold">
              {t('mediaGallery.openImage')}
            </span>
          </div>
        </button>
      ))}

      {hasOverflow && overflowThumbnail && (
        <button
          key={overflowThumbnail.id}
          type="button"
          className="relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 aspect-video cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onOpenAt?.()}
          aria-label={t('mediaGallery.more', { count: moreCount })}
        >
          <img src={overflowThumbnail.url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
            <span className="text-white font-bold text-subsection-title">+{moreCount} more</span>
          </div>
        </button>
      )}
    </div>
  );
}
