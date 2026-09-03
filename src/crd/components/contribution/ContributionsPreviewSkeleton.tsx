import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';

export type ContributionPreviewKind = 'post' | 'whiteboard' | 'memo' | 'document' | 'link';

type ContributionsPreviewSkeletonProps = {
  kind: ContributionPreviewKind;
  /** Number of contributions the loaded preview will show — capped at the preview's 4 slots. */
  count: number;
  className?: string;
};

/** The feed preview renders at most 4 slots (3 + a "more" tile past that). */
const MAX_CELLS = 4;

/** Matches the `min-h-*` of the corresponding `Contribution*Card`. */
const CELL_HEIGHT: Record<Exclude<ContributionPreviewKind, 'link'>, string> = {
  whiteboard: 'min-h-[200px]',
  document: 'min-h-[200px]',
  memo: 'min-h-[180px]',
  post: 'min-h-[140px]',
};

/**
 * Decorative placeholder for a callout's contributions preview — mirrors the real
 * preview's footprint (a `space-y-2` list of link rows, or a 1/2-column grid of cards)
 * so the card doesn't grow when the lazily-fetched contributions arrive (issue #10043).
 * Purely decorative: the consumer supplies the `<output aria-label>` status wrapper.
 */
export function ContributionsPreviewSkeleton({ kind, count, className }: ContributionsPreviewSkeletonProps) {
  const cells = Array.from({ length: Math.min(count, MAX_CELLS) }, (_, index) => index);
  if (cells.length === 0) {
    return null;
  }

  if (kind === 'link') {
    return (
      <div className={cn('space-y-2', className)} aria-hidden="true">
        {cells.map(index => (
          <Skeleton key={index} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3', className)} aria-hidden="true">
      {cells.map(index => (
        <Skeleton key={index} className={cn('w-full rounded-lg', CELL_HEIGHT[kind])} />
      ))}
    </div>
  );
}
