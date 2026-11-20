import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';

/** Rows per placeholder column — uneven on purpose so the grid reads as real content, not a pattern. */
const ROWS_PER_COLUMN = [4, 2, 1, 3];

type LayoutColumnsSkeletonProps = {
  /** Accessible name of the loading region. */
  label: string;
  className?: string;
};

/**
 * Placeholder for the Layout tab's column grid while the innovation flow (its
 * states and their callouts) loads. Mirrors `LayoutPoolColumn`'s shape — tinted
 * header band with title, count chip, menu dot and a two-line description,
 * then compact callout rows — in the same responsive grid, so nothing shifts
 * when the real columns arrive.
 */
export function LayoutColumnsSkeleton({ label, className }: LayoutColumnsSkeletonProps) {
  return (
    <output
      aria-label={label}
      aria-busy={true}
      className={cn(
        'grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 items-start',
        className
      )}
    >
      {ROWS_PER_COLUMN.map((rows, columnIndex) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list, never reordered
          key={columnIndex}
          aria-hidden="true"
          className="overflow-hidden rounded-xl border bg-card"
        >
          <div className="space-y-2 bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <span className="flex-1" />
              <Skeleton className="h-5 w-6" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="flex min-h-[60px] flex-col gap-1.5 p-1.5">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list, never reordered
                key={rowIndex}
                className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-2"
              >
                <Skeleton className="h-3.5 w-2" />
                <Skeleton className={cn('h-3', rowIndex % 2 === 0 ? 'w-3/4' : 'w-1/2')} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </output>
  );
}
