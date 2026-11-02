import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ReactNode, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGridColumnCount } from '@/crd/hooks/useGridColumnCount';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type ContributionGridColumns = 2 | 3;

/** Responsive column classes shared by every contribution grid and its loading skeleton. */
export const CONTRIBUTION_GRID_COLUMNS: Record<ContributionGridColumns, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

/** Collapsed, the grid shows its first row in full and cuts through the middle of the second. */
const COLLAPSED_ROWS = 2;

type ContributionGridProps = {
  children: ReactNode;
  /** Number of contribution cards in `children`. */
  contributionCount: number;
  /** True when `children` ends with one extra card (e.g. "add") that is never counted as hidden. */
  hasTrailingCard?: boolean;
  columns?: ContributionGridColumns;
  className?: string;
};

export function ContributionGrid({
  children,
  contributionCount,
  hasTrailingCard = false,
  columns = 2,
  className,
}: ContributionGridProps) {
  const { t } = useTranslation('crd-space');
  const [expanded, setExpanded] = useState(false);
  const [columnCount, setColumnCountNode] = useGridColumnCount();
  const [gridNode, setGridNode] = useState<HTMLDivElement | null>(null);
  const [collapsedHeight, setCollapsedHeight] = useState<number>();

  const collapsedCardCount = COLLAPSED_ROWS * columnCount;
  const cardCount = contributionCount + (hasTrailingCard ? 1 : 0);
  const shouldCollapse = cardCount > collapsedCardCount;
  const collapsed = shouldCollapse && !expanded;
  const hiddenCount = Math.max(0, contributionCount - collapsedCardCount);

  // Clip at the middle of the second row, measured from the rendered cards. Re-measured when any
  // card of the first two rows resizes — a whiteboard card grows once its preview image loads.
  useLayoutEffect(() => {
    if (!gridNode || !collapsed) return;
    const visibleCards = Array.from(gridNode.children).slice(0, collapsedCardCount) as HTMLElement[];
    const secondRow = visibleCards.slice(columnCount);
    const measure = () => {
      // Grid items are positioned relative to the grid (`relative`), so `offsetTop` is the row's top.
      // Taking the lowest midpoint keeps every second-row card cut no higher than its middle.
      setCollapsedHeight(Math.max(...secondRow.map(card => card.offsetTop + card.offsetHeight / 2)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const card of visibleCards) {
      observer.observe(card);
    }
    return () => observer.disconnect();
  }, [gridNode, collapsed, columnCount, collapsedCardCount, cardCount]);

  return (
    <div className={cn('space-y-3', className)}>
      <div
        ref={node => {
          setColumnCountNode(node);
          setGridNode(node);
        }}
        className={cn('relative grid gap-4', CONTRIBUTION_GRID_COLUMNS[columns], collapsed && 'overflow-hidden')}
        style={collapsed ? { maxHeight: collapsedHeight } : undefined}
      >
        {children}
      </div>

      {shouldCollapse && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
                {t('callout.collapse')}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                {hiddenCount > 0 ? t('callout.moreContributions', { count: hiddenCount }) : t('callout.expand')}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
