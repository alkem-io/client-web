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

/** Whether the content exceeds `maxLines` — independent of the display mode. */
type Overflow = 'unknown' | 'yes' | 'no';

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
 * `AutomaticOverflowGradient` pattern (see `src/core/ui/markdown/ExpandableMarkdown.tsx`).
 *
 * Two decoupled concerns: overflow detection (does the text exceed `maxLines`?
 * — measured under `line-clamp-N`, re-measured by a `ResizeObserver` as layout
 * settles / the container resizes; depends only on text + clamp) and the
 * expanded mode (`userExpanded ?? defaultExpanded` — the
 * `calloutDescriptionDisplayMode` setting drives it until the user clicks a
 * toggle). Keeping them independent is what makes the component adhere to the
 * setting: an async settings load or admin change flips `defaultExpanded` and
 * switches the view instantly, with no re-measurement race.
 */
export function ExpandableMarkdown({
  content,
  maxLines = 3,
  defaultExpanded = false,
  className,
}: ExpandableMarkdownProps) {
  const { t } = useTranslation('crd-space');
  const [overflow, setOverflow] = useState<Overflow>('unknown');
  // `null` → follow the `defaultExpanded` setting. Set only by an explicit
  // user click on "Read more" / "Read less", which then takes precedence.
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Overflow depends only on the rendered text and the clamp height — re-detect
  // when those change, NOT when the display-mode setting flips. Decoupling the
  // two is what makes the component adhere to the setting: when the space
  // settings query resolves (or an admin toggles the mode), `defaultExpanded`
  // flips and the view switches instantly via `isExpanded` below — no
  // re-measurement, no race that could leave a "Collapse by default" post open.
  useEffect(() => {
    setOverflow('unknown');
    setUserExpanded(null);
  }, [content, maxLines]);

  const isExpanded = userExpanded ?? defaultExpanded;
  // Clamp while we still need to measure, or while collapsed.
  const isClamped = overflow === 'unknown' || (overflow === 'yes' && !isExpanded);

  // Measure while clamped. The clamped container's own box is fixed by
  // `line-clamp`, so it never resizes as the markdown grows — observe the
  // *content* element (its height reflects the unclamped markdown once
  // react-markdown commits / web fonts load) plus the container (width changes
  // on sidebar resize / rotation) and re-evaluate on either. This re-measures
  // whenever layout settles, so a first pass that measured too early no longer
  // latches the wrong result. While expanded the clamp is off and we trust the
  // prior measurement (the user explicitly opened it), matching MUI.
  useLayoutEffect(() => {
    if (!isClamped) return;
    const container = containerRef.current;
    const contentEl = contentRef.current;
    if (!container || !contentEl) return;

    const evaluate = () => {
      const overflowing = container.scrollHeight > container.clientHeight + 1; // +1px tolerance for sub-pixel rounding
      setOverflow(overflowing ? 'yes' : 'no');
    };

    evaluate();

    const observer = new ResizeObserver(evaluate);
    observer.observe(contentEl);
    observer.observe(container);
    return () => observer.disconnect();
  }, [isClamped, content, maxLines]);

  const showToggle = overflow === 'yes';
  const clampClass = lineClampClassMap[maxLines] ?? 'line-clamp-3';

  return (
    <div className={cn('relative', className)}>
      <div ref={containerRef} className={cn(isClamped && clampClass)}>
        <div ref={contentRef}>
          <MarkdownContent content={content} className="text-muted-foreground" />
        </div>
      </div>
      {showToggle && !isExpanded && (
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
            onClick={() => setUserExpanded(true)}
            aria-expanded={false}
            className="absolute bottom-0 right-0 z-10 cursor-pointer text-caption uppercase text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 bg-card"
          >
            {t('postSnippet.readMore')}
          </button>
        </>
      )}
      {showToggle && isExpanded && (
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={() => setUserExpanded(false)}
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
