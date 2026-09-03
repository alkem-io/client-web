import { useLayoutEffect, useRef, useState } from 'react';
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
  /**
   * Surface the content sits on. Drives the colour the collapse fade gradient
   * (and the "read more" chip) blends into. `'card'` (default) for content on
   * a card (PostCard); `'background'` for content directly on the page
   * background (flow-state / tab descriptions). Matters in dark mode where
   * `--card` and `--background` differ.
   */
  surface?: 'card' | 'background';
  /** Override the collapsed-state toggle label (defaults to "… Read more"). */
  expandLabel?: string;
  /** Override the expanded-state toggle label (defaults to "Read less"). */
  collapseLabel?: string;
  className?: string;
};

const surfaceClasses = {
  card: { fade: 'bg-gradient-to-b from-transparent to-card', chip: 'bg-card' },
  background: { fade: 'bg-gradient-to-b from-transparent to-background', chip: 'bg-background' },
} as const;

/** Whether the content exceeds `maxLines` — independent of the display mode. */
type Overflow = 'unknown' | 'yes' | 'no';

// Collapsed height is a hard cap of `maxLines` text lines, applied as a
// `max-height` + `overflow: hidden` rather than `-webkit-line-clamp`. Line-clamp
// only bounds *text* lines, so a block image inside the markdown renders at full
// size and blows the collapsed box open. A fixed max-height clips any content
// (text, image, embed) to the same ~N-line band. `0.875rem` is the rendered
// `text-body` size (14px); `1.625` is the paragraph `leading-relaxed`.
const collapsedMaxHeight = (maxLines: number) => `calc(${maxLines} * 1.625 * 0.875rem)`;
/** The same clamp height in px, for comparing against the measured content height. */
const collapsedMaxHeightPx = (maxLines: number) => {
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return maxLines * 1.625 * 0.875 * rootFontSize;
};

/**
 * Markdown body with a "Read more" / "Read less" toggle that only appears when
 * the content actually overflows. Mirrors the MUI `ExpandableDescription` +
 * `AutomaticOverflowGradient` pattern (see `src/core/ui/markdown/ExpandableMarkdown.tsx`).
 *
 * Two decoupled concerns: overflow detection (does the content exceed
 * `maxLines`? — measured under the `max-height` clamp, re-measured by a
 * `ResizeObserver` as layout settles / the container resizes; depends only on
 * content + clamp height) and the
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
  surface = 'card',
  expandLabel,
  collapseLabel,
  className,
}: ExpandableMarkdownProps) {
  const { t } = useTranslation('crd-space');
  const [overflow, setOverflow] = useState<Overflow>('unknown');
  // `null` → follow the `defaultExpanded` setting. Set only by an explicit
  // user click on "Read more" / "Read less", which then takes precedence.
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isExpanded = userExpanded ?? defaultExpanded;
  // Clamp only while collapsed (and the content overflows or is still unmeasured).
  // An expanded block renders at full height from its very first paint: clamping it
  // "until measured" and then releasing the clamp a frame later made every
  // expanded-by-default post with a long description jump ~hundreds of px on each
  // load (issue #10043).
  const isClamped = !isExpanded && overflow !== 'no';

  // Overflow depends only on the rendered text and the clamp height — re-detect when
  // those change, NOT when the display-mode setting flips. Decoupling the two is what
  // makes the component adhere to the setting: when the space settings query resolves
  // (or an admin toggles the mode), `defaultExpanded` flips and the view switches
  // instantly via `isExpanded` — no re-measurement, no race that could leave a
  // "Collapse by default" post open. A content change also drops the user's explicit
  // toggle so the new text follows the setting again.
  //
  // Detection is independent of the clamp: compare the *content* element's own height
  // (unaffected by the container's `max-height` + `overflow: hidden`) with the clamp
  // height, synchronously before paint. Re-measured by a ResizeObserver on the content
  // (react-markdown commits, web fonts) and the container (width changes on sidebar
  // resize / rotation), so a first pass that measured too early never latches the
  // wrong result.
  useLayoutEffect(() => {
    setUserExpanded(null);
    const container = containerRef.current;
    const contentEl = contentRef.current;
    if (!container || !contentEl) return;

    const evaluate = () => {
      const overflowing = contentEl.getBoundingClientRect().height > collapsedMaxHeightPx(maxLines) + 1; // +1px tolerance for sub-pixel rounding
      setOverflow(overflowing ? 'yes' : 'no');
    };

    evaluate();

    const observer = new ResizeObserver(evaluate);
    observer.observe(contentEl);
    observer.observe(container);
    return () => observer.disconnect();
  }, [content, maxLines]);

  const showToggle = overflow === 'yes';
  const surfaceClass = surfaceClasses[surface];
  const expandText = expandLabel ?? t('postSnippet.readMore');
  const collapseText = collapseLabel ?? t('postSnippet.readLess');

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className={cn(isClamped && 'overflow-hidden')}
        style={isClamped ? { maxHeight: collapsedMaxHeight(maxLines) } : undefined}
      >
        <div ref={contentRef}>
          <MarkdownContent content={content} className="text-muted-foreground" />
        </div>
      </div>
      {showToggle && !isExpanded && (
        <>
          <div
            aria-hidden="true"
            className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-8', surfaceClass.fade)}
          />
          {/* Pinned to the bottom-right of the clipped block so it sits on the last
              visible line (matches the MUI ExpandableDescription / SeeMore layout).
              The fade gradient above provides contrast behind the label. */}
          <button
            type="button"
            onClick={() => setUserExpanded(true)}
            aria-expanded={false}
            className={cn(
              'absolute bottom-0 right-0 z-10 cursor-pointer text-caption uppercase text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1',
              surfaceClass.chip
            )}
          >
            {expandText}
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
            {collapseText}
          </button>
        </div>
      )}
    </div>
  );
}
