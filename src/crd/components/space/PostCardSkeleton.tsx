import { useTranslation } from 'react-i18next';
import {
  type ContributionPreviewKind,
  ContributionsPreviewSkeleton,
} from '@/crd/components/contribution/ContributionsPreviewSkeleton';
import type { PostType } from '@/crd/components/space/PostCard';
import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';

export type PostCardSkeletonContributions = { kind: ContributionPreviewKind; count?: number };

type PostCardSkeletonProps = {
  /** Framing type of the callout being loaded — reserves the matching framing preview block. */
  type?: PostType;
  /** Contributions preview the loaded card will render — reserves its header + grid rows. */
  contributions?: PostCardSkeletonContributions;
  /**
   * Last measured height of the loaded card (remembered by the consumer). Applied as the
   * exact height — not a minimum — so the placeholder matches the card that replaces it in
   * both directions (the shape-based guess can overshoot, e.g. a card with no description)
   * and content below doesn't move. The decorative inner lines are clipped if needed.
   */
  height?: number;
  className?: string;
};

/** Same footprint as the framing preview `PostCard` renders for each type. */
function FramingPlaceholder({ type }: { type: PostType }) {
  switch (type) {
    case 'whiteboard':
    case 'mediaGallery':
      return <Skeleton className="w-full aspect-video rounded-lg" />;
    case 'memo':
      return <Skeleton className="w-full h-32 rounded-lg" />;
    case 'document':
      return <Skeleton className="w-full h-28 rounded-lg" />;
    case 'callToAction':
      return <Skeleton className="w-full h-9 rounded-md mt-1" />;
    case 'poll':
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      );
    case 'contributors':
    case 'spaces':
      return (
        <div className="space-y-3">
          <Skeleton className="h-9 w-full rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

/**
 * Loading placeholder shaped like the `PostCard` it stands in for: publisher row,
 * title + description lines, the framing preview block for `type`, the contributions
 * grid, and the comments footer. Reserving the loaded footprint up front is what keeps
 * the feed from jumping as each card's data arrives (issue #10043).
 */
export function PostCardSkeleton({ type = 'text', contributions, height, className }: PostCardSkeletonProps) {
  const { t } = useTranslation('crd-space');
  return (
    <output
      className={cn('flex flex-col gap-6 overflow-hidden rounded-xl border border-border/60 bg-card', className)}
      style={height ? { height } : undefined}
      aria-label={t('a11y.loadingPost')}
    >
      {/* Publisher row — mirrors the CardHeader (avatar + name/timestamp, action cluster). */}
      <div className="flex items-start justify-between px-6 pt-5">
        <div className="flex gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2 pt-0.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="size-8" />
      </div>

      {/* Body — title, three description lines, framing preview, contributions. */}
      <div className="px-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        {type !== 'text' && (
          <div className="mt-3">
            <FramingPlaceholder type={type} />
          </div>
        )}
        {contributions && (
          <>
            <Skeleton className="mt-4 mb-2 h-4 w-36" />
            <ContributionsPreviewSkeleton kind={contributions.kind} count={contributions.count} />
          </>
        )}
      </div>

      {/* Footer — the comments trigger row. */}
      <div className="border-t border-border bg-muted/5 px-6 py-3">
        <Skeleton className="h-4 w-28" />
      </div>
    </output>
  );
}
