import type { VariantProps } from 'class-variance-authority';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TruncatedTag } from '@/crd/components/common/TruncatedTag';
import { cn } from '@/crd/lib/utils';
import { badgeVariants } from '@/crd/primitives/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type CollapsibleTagListProps = {
  tags: string[];
  /** Max rows before the overflow collapses into a `+N` chip. Default 2 (MUI parity). */
  maxRows?: number;
  /** Currently-selected tags — presence switches the list to interactive toggle mode. */
  selectedTags?: string[];
  /** Toggle handler. When provided the tags render as `aria-pressed` toggle buttons. */
  onTagClick?: (tag: string) => void;
  /** Badge variant for display (non-interactive) tags. Default `'secondary'`. */
  variant?: VariantProps<typeof badgeVariants>['variant'];
  className?: string;
};

const ROW_GAP_PX = 6; // matches `gap-1.5`
const ROW_TOLERANCE_PX = 4; // pills on the same visual row share an offsetTop within this delta

/**
 * A `flex-wrap` tag list capped at `maxRows` rows. Each tag truncates with an
 * ellipsis and reveals its full text on hover; tags that don't fit collapse
 * into a `+N` chip whose hidden tags surface in a tooltip on hover.
 *
 * Row fitting is measured off a hidden mirror layer (no pixel guessing): the
 * number of visible tags is chosen so the `+N` chip always lands on the SAME
 * row as the last visible tag and the whole block stays within `maxRows`. The
 * `+N` count is therefore always exact.
 */
export function CollapsibleTagList({
  tags,
  maxRows = 2,
  selectedTags,
  onTagClick,
  variant = 'secondary',
  className,
}: CollapsibleTagListProps) {
  const { t } = useTranslation('crd-common');
  const interactive = Boolean(onTagClick);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);
  const itemsKey = tags.join('\u0001');

  // Shared pill geometry so the hidden mirror measures exactly what the real
  // row renders (selected-state classes don't change box size).
  const tagClass = interactive
    ? 'block max-w-full truncate px-3 py-1.5 text-caption font-medium rounded-full border border-border bg-background'
    : cn(badgeVariants({ variant }), 'block max-w-full truncate text-badge px-2 py-0 rounded-full');
  // The +N chip uses the SAME geometry as a row tag (padding, text token,
  // radius, border) so it's visually indistinguishable in size/shape — only
  // the muted text color marks it as the "more" affordance.
  const moreClass = interactive
    ? 'block text-center px-3 py-1.5 text-caption font-medium rounded-full border border-border bg-background text-muted-foreground'
    : cn(badgeVariants({ variant }), 'block text-center text-badge px-2 py-0 rounded-full text-muted-foreground');
  // Same pill look/size as a row tag, but instead of truncating it wraps its
  // full text (and hard-breaks unbroken strings) so a long tag can never leave
  // the tooltip box.
  const tooltipPillClass = cn(
    interactive
      ? 'px-3 py-1.5 text-caption font-medium rounded-2xl border border-border bg-background text-muted-foreground'
      : cn(badgeVariants({ variant }), 'text-badge px-2 py-0.5 rounded-2xl'),
    'inline-flex items-start max-w-full whitespace-normal text-left h-auto [overflow-wrap:anywhere]'
  );

  const recompute = () => {
    const el = measureRef.current;
    if (!el || tags.length === 0) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-measure-tag]'));
    const moreEl = el.querySelector<HTMLElement>('[data-measure-more]');
    if (items.length === 0) return;

    // Bucket offsetTop into visual rows (tolerant of sub-pixel jitter).
    const rowTops: number[] = [];
    const rowOf = (top: number) => {
      const found = rowTops.findIndex(rt => Math.abs(rt - top) <= ROW_TOLERANCE_PX);
      if (found !== -1) return found;
      rowTops.push(top);
      rowTops.sort((a, b) => a - b);
      return rowTops.findIndex(rt => Math.abs(rt - top) <= ROW_TOLERANCE_PX);
    };
    for (const it of items) rowOf(it.offsetTop);

    const maxRowIdx = maxRows - 1;
    const lastRow = rowOf(items[items.length - 1].offsetTop);
    // Everything already fits within the row cap → show all, no +N.
    if (lastRow <= maxRowIdx) {
      setVisibleCount(tags.length);
      return;
    }

    // Overflow: pick the largest prefix whose last tag is within the row cap
    // AND leaves room for the +N chip on that same row. Truncating only
    // trailing tags doesn't shift the kept prefix's layout, so positions
    // measured on the full set are valid for any prefix.
    const containerWidth = el.clientWidth;
    const moreWidth = moreEl?.offsetWidth ?? 0;
    let best = 0;
    for (let i = 0; i < items.length; i++) {
      if (rowOf(items[i].offsetTop) > maxRowIdx) break;
      const rightEdge = items[i].offsetLeft + items[i].offsetWidth;
      const roomForMore = containerWidth - rightEdge >= moreWidth + ROW_GAP_PX;
      if (roomForMore) best = i + 1;
    }
    setVisibleCount(Math.max(1, best));
  };

  // Re-measure on mount, when tags change, and when the available width changes.
  useLayoutEffect(() => {
    recompute();
  }, [itemsKey, maxRows, interactive, variant]);

  useEffect(() => {
    const wrap = wrapperRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [itemsKey, maxRows]);

  if (tags.length === 0) return null;

  const showMore = visibleCount < tags.length;
  const hiddenTags = tags.slice(visibleCount);

  const renderTag = (tag: string, index: number) => {
    if (!interactive) {
      return (
        <li key={`${tag}-${index}`} className="min-w-0 max-w-full">
          <TruncatedTag text={tag} variant={variant} className="text-badge px-2 py-0 rounded-full" />
        </li>
      );
    }
    const isSelected = selectedTags?.includes(tag) ?? false;
    return (
      <li key={`${tag}-${index}`} className="min-w-0 max-w-full">
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onTagClick?.(tag)}
              className={cn(
                tagClass,
                'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tag}
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm break-words">{tag}</TooltipContent>
        </Tooltip>
      </li>
    );
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Hidden mirror: full tag set + worst-case +N, measured for row fitting. */}
      <ul
        ref={measureRef}
        aria-hidden="true"
        className={cn(
          'pointer-events-none invisible absolute inset-x-0 top-0 flex flex-wrap items-start list-none p-0 m-0 gap-1.5',
          className
        )}
      >
        {tags.map((tag, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: hidden measurement mirror; key only needs uniqueness across duplicate tags
          <li key={`m-${tag}-${i}`} data-measure-tag={true} className="min-w-0 max-w-full">
            <span className={tagClass}>{tag}</span>
          </li>
        ))}
        <li data-measure-more={true} className="shrink-0">
          <span className={moreClass}>+{tags.length}</span>
        </li>
      </ul>

      {/* Real, capped row. */}
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset */}
      <ul role="list" className={cn('flex flex-wrap items-start list-none p-0 m-0 gap-1.5', className)}>
        {tags.slice(0, visibleCount).map(renderTag)}
        {showMore && (
          <li key="__more__" className="shrink-0">
            <Tooltip>
              <TooltipTrigger asChild={true}>
                <button
                  type="button"
                  aria-label={t('tags.moreAria', { count: hiddenTags.length })}
                  className={moreClass}
                >
                  +{hiddenTags.length}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="start"
                sideOffset={6}
                collisionPadding={8}
                className="bg-card !text-card-foreground border border-border shadow-md w-max max-w-[20rem] p-2 [&_svg]:fill-card [&_svg]:bg-card"
              >
                {/* Hidden tags shown as pills — identical style and size to the row tags.
                    In interactive mode they stay clickable so the user can filter by a
                    collapsed tag without expanding the row. */}
                {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
                {/* biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset */}
                <ul role="list" className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                  {hiddenTags.map(tag => {
                    if (!interactive) {
                      return (
                        <li key={tag}>
                          <span className={tooltipPillClass}>{tag}</span>
                        </li>
                      );
                    }
                    const isSelected = selectedTags?.includes(tag) ?? false;
                    return (
                      <li key={tag}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => onTagClick?.(tag)}
                          className={cn(
                            tooltipPillClass,
                            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {tag}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </TooltipContent>
            </Tooltip>
          </li>
        )}
      </ul>
    </div>
  );
}
