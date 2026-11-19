import {
  CONTRIBUTION_GRID_COLUMNS,
  type ContributionGridColumns,
} from '@/crd/components/contribution/ContributionGrid';
import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';

export type ContributionPreviewKind = 'post' | 'whiteboard' | 'memo' | 'document' | 'link';

type ContributionsPreviewSkeletonProps = {
  kind: ContributionPreviewKind;
  /**
   * Number of contributions the loaded preview will show — capped at the preview's slots: two rows
   * of the grid, or four rows of the link list. Unknown reserves one grid row.
   */
  count?: number;
  /** Column count of the grid this placeholder stands in for. */
  columns?: ContributionGridColumns;
  className?: string;
};

/** The feed preview's card grid shows two rows of its rendered column count. */
const PREVIEW_ROWS = 2;
/** The link list renders at most 4 slots (3 + a "more" button past that). */
const LINK_CELLS = 4;
/** One row of a two-column grid — the most common size of a populated preview. */
const DEFAULT_CELLS = 2;

/**
 * A cell is shown only from the breakpoint whose two rows hold it, mirroring the grid's
 * `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`: cells 1–2 always, 3–4 from `sm`, 5–6 from `lg`.
 */
const CELL_VISIBILITY = ['', 'hidden sm:block', 'hidden lg:block'];

/**
 * Matches the `min-h-*` of the corresponding `Contribution*Card`. `ContributionPostCard` has
 * no `min-h` (content-driven): 140px is a typical post — title, author row and a two-line
 * description — so a post without a description lands ~50px shorter than its placeholder.
 */
const CELL_HEIGHT: Record<Exclude<ContributionPreviewKind, 'link'>, string> = {
  whiteboard: 'min-h-[200px]',
  document: 'min-h-[200px]',
  memo: 'min-h-[180px]',
  post: 'min-h-[140px]',
};

/**
 * Decorative placeholder for a callout's contributions preview — mirrors the real
 * preview's footprint (a `space-y-2` list of link rows, or a grid of cards with the same columns)
 * so the card doesn't grow when the lazily-fetched contributions arrive (issue #10043).
 * Purely decorative: the consumer supplies the `<output aria-label>` status wrapper.
 */
export function ContributionsPreviewSkeleton({
  kind,
  count = DEFAULT_CELLS,
  columns = 2,
  className,
}: ContributionsPreviewSkeletonProps) {
  const maxCells = kind === 'link' ? LINK_CELLS : PREVIEW_ROWS * columns;
  const cells = Array.from({ length: Math.min(count, maxCells) }, (_, index) => index);
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
    <div className={cn('grid gap-3', CONTRIBUTION_GRID_COLUMNS[columns], className)} aria-hidden="true">
      {cells.map(index => (
        <Skeleton
          key={index}
          className={cn('w-full rounded-lg', CELL_HEIGHT[kind], CELL_VISIBILITY[Math.floor(index / PREVIEW_ROWS)])}
        />
      ))}
    </div>
  );
}
