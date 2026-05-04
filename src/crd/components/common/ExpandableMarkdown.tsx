import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';

type ExpandableMarkdownProps = {
  content: string;
  /** Lines to show when collapsed; defaults to 3 (post-card snippet). */
  maxLines?: number;
  className?: string;
};

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
 * `AutomaticOverflowGradient` pattern (see `src/domain/space/components/ExpandableDescription.tsx`):
 *
 *  - Collapsed → `line-clamp-N` + a bottom fade gradient + "Read more" link
 *  - Expanded → full content + "Read less" link
 *  - No overflow → no toggle, no fade (renders identically to plain markdown)
 *
 * Overflow is detected after layout via `scrollHeight > clientHeight` on the
 * clamped element, with a `ResizeObserver` to re-evaluate on container width
 * changes (mobile rotations, sidebar resize, etc.).
 */
export function ExpandableMarkdown({ content, maxLines = 3, className }: ExpandableMarkdownProps) {
  const { t } = useTranslation('crd-space');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only measure when collapsed: once expanded, line-clamp is off so scrollHeight
  // equals clientHeight and the naive check would flip `isOverflowing` back to
  // false — hiding the "Read less" toggle. While expanded we trust the prior
  // measurement (the user only got there by clicking "Read more").
  useLayoutEffect(() => {
    if (isExpanded) return;
    const el = containerRef.current;
    if (!el) return;
    const overflowing = el.scrollHeight > el.clientHeight + 1; // +1px tolerance for sub-pixel rounding
    setIsOverflowing(prev => (prev === overflowing ? prev : overflowing));
  });

  useEffect(() => {
    if (isExpanded) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const overflowing = el.scrollHeight > el.clientHeight + 1;
      setIsOverflowing(prev => (prev === overflowing ? prev : overflowing));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isExpanded]);

  const clampClass = lineClampClassMap[maxLines] ?? 'line-clamp-3';
  const showFade = !isExpanded && isOverflowing;

  return (
    <div className={cn('relative', className)}>
      <div ref={containerRef} className={cn(!isExpanded && clampClass)}>
        <MarkdownContent content={content} className="text-muted-foreground" />
      </div>
      {showFade && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-card"
        />
      )}
      {isOverflowing && !isExpanded && (
        // Pinned to the bottom-right of the clipped block so it sits on the last
        // visible line (matches the MUI ExpandableDescription / SeeMore layout).
        // The fade gradient above provides contrast behind the label.
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-expanded={false}
          className="absolute bottom-0 right-0 z-10 cursor-pointer text-caption uppercase text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 bg-card"
        >
          {t('postSnippet.readMore')}
        </button>
      )}
      {isOverflowing && isExpanded && (
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
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
