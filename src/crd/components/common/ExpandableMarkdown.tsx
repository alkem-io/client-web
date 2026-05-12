import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';

type ExpandableMarkdownProps = {
  content: string;
  /** Lines to show when collapsed; defaults to 3 (post-card snippet). */
  maxLines?: number;
  /**
   * Initial expanded state once overflow has been detected. When the content
   * doesn't overflow, this is ignored — no toggle is rendered. Drives the
   * space-level `calloutDescriptionDisplayMode` setting (Expanded vs Collapsed).
   */
  defaultExpanded?: boolean;
  className?: string;
};

type OverflowState = 'detecting' | 'no-overflow' | 'collapsed' | 'expanded';

const lineClampClassMap: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

/**
 * Markdown body with a "Read more" / "Read less" toggle that only appears when
 * the content actually overflows. Mirrors the MUI `ExpandableDescription` +
 * `AutomaticOverflowGradient` pattern (see `src/core/ui/markdown/ExpandableMarkdown.tsx`):
 *
 *  - Detecting → `line-clamp-N` applied so `scrollHeight > clientHeight` can be measured
 *  - Collapsed → `line-clamp-N` + a bottom fade gradient + "Read more" link
 *  - Expanded → full content + "Read less" link
 *  - No overflow → no toggle, no fade (renders identically to plain markdown)
 *
 * After the first layout pass we decide between Collapsed and Expanded based on
 * `defaultExpanded`. A `ResizeObserver` re-evaluates while collapsed so
 * resizing the container can drop the toggle if the content no longer overflows.
 */
export function ExpandableMarkdown({
  content,
  maxLines = 3,
  defaultExpanded = false,
  className,
}: ExpandableMarkdownProps) {
  const { t } = useTranslation('crd-space');
  const [state, setState] = useState<OverflowState>('detecting');
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-enter detection when `defaultExpanded` flips (e.g. space settings load
  // async, or an admin toggles the display mode at runtime).
  const prevDefaultExpandedRef = useRef(defaultExpanded);
  useEffect(() => {
    if (prevDefaultExpandedRef.current !== defaultExpanded) {
      prevDefaultExpandedRef.current = defaultExpanded;
      setState('detecting');
    }
  }, [defaultExpanded]);

  // Measure overflow while detecting. The container has `line-clamp-N` applied
  // (see `isClamped` below) so `scrollHeight > clientHeight` is meaningful.
  useLayoutEffect(() => {
    if (state !== 'detecting') return;
    const el = containerRef.current;
    if (!el) return;
    const overflowing = el.scrollHeight > el.clientHeight + 1; // +1px tolerance for sub-pixel rounding
    setState(overflowing ? (defaultExpanded ? 'expanded' : 'collapsed') : 'no-overflow');
  });

  // While collapsed, keep watching for container-size changes (sidebar resize,
  // device rotation) so the toggle is dropped if content stops overflowing.
  useEffect(() => {
    if (state !== 'collapsed') return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const overflowing = el.scrollHeight > el.clientHeight + 1;
      if (!overflowing) setState('no-overflow');
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [state]);

  const isClamped = state === 'detecting' || state === 'collapsed';
  const clampClass = lineClampClassMap[maxLines] ?? 'line-clamp-3';

  return (
    <div className={cn('relative', className)}>
      <div ref={containerRef} className={cn(isClamped && clampClass)}>
        <MarkdownContent content={content} className="text-muted-foreground" />
      </div>
      {state === 'collapsed' && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-card"
          />
          {/* Pinned to the bottom-right of the clipped block so it sits on the last
              visible line (matches the MUI ExpandableDescription / SeeMore layout).
              The fade gradient above provides contrast behind the label. */}
          <button
            type="button"
            onClick={() => setState('expanded')}
            aria-expanded={false}
            className="absolute bottom-0 right-0 z-10 cursor-pointer text-caption uppercase text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 bg-card"
          >
            {t('postSnippet.readMore')}
          </button>
        </>
      )}
      {state === 'expanded' && (
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={() => setState('collapsed')}
            aria-expanded={true}
            className="cursor-pointer text-caption uppercase text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {t('postSnippet.readLess')}
          </button>
        </div>
      )}
    </div>
  );
}
