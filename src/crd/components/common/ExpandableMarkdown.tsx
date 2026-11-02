import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';

type ExpandableMarkdownProps = {
  content: string;
  /** Lines of text to show when collapsed; defaults to 3 (post-card snippet). */
  maxLines?: number;
  /**
   * Initial expanded state once overflow has been detected. When the content
   * doesn't overflow, this is ignored — no toggle is rendered. Drives the
   * space-level `calloutDescriptionDisplayMode` setting (Expanded vs Collapsed).
   */
  defaultExpanded?: boolean;
  /** Override the collapsed-state toggle label (defaults to "Read more"). */
  expandLabel?: string;
  /** Override the expanded-state toggle label (defaults to "Show less"). */
  collapseLabel?: string;
  className?: string;
};

/**
 * What the collapsed view needs to know about the rendered content — independent
 * of the display mode. `cutAt` is the height (px, from the content's top) that ends
 * directly under text line `maxLines`; `null` when the text fits in `maxLines`.
 */
type Measurement = { overflow: 'unknown' } | { overflow: 'yes' | 'no'; cutAt: number | null };

// Before the first measurement: `text-body` (0.875rem) at `leading-relaxed` (1.625).
const fallbackMaxHeight = (maxLines: number) => `calc(${maxLines} * 1.625 * 0.875rem)`;

/**
 * Marks every image with how the collapsed view treats it: `hero` (it comes before
 * any text — shown, cropped to 160px) or `hidden` (it follows text — withheld until
 * expanded). With no text at all every image is a hero, so an image-only post is
 * cropped rather than emptied. Returns whether there are any images.
 */
function classifyImages(el: HTMLElement): boolean {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  const images: HTMLImageElement[] = [];
  let firstTrailing = -1;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeName === 'IMG') images.push(node as HTMLImageElement);
    else if (firstTrailing === -1 && node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      firstTrailing = images.length;
    }
  }
  images.forEach((img, index) => {
    const role = firstTrailing === -1 || index < firstTrailing ? 'hero' : 'hidden';
    if (img.dataset.collapse !== role) img.dataset.collapse = role;
  });
  return images.length > 0;
}

/**
 * The rendered lines of text inside `el`, top to bottom, relative to its top. Counting
 * real line boxes — not multiples of a line height — is what lets the cut land under a
 * full line: a paragraph gap or heading inside the first lines would otherwise put it
 * mid-line.
 */
function measureLines(el: HTMLElement) {
  const origin = el.getBoundingClientRect().top;
  const lines: { top: number; bottom: number }[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.height === 0) continue;
      const top = rect.top - origin;
      const bottom = rect.bottom - origin;
      // Fragments on the same line (bold, links) share a top; merge them.
      const line = lines.find(l => Math.abs(l.top - top) < rect.height / 2);
      if (line) line.bottom = Math.max(line.bottom, bottom);
      else lines.push({ top, bottom });
    }
  }
  return lines.sort((a, b) => a.top - b.top);
}

/**
 * Markdown body that collapses to a clean cut directly under its `maxLines`-th
 * rendered line of text, with a "Read more" / "Show less" link below it. Only text
 * that *exceeds* `maxLines` is cut. Images never get a fade or overlay: one before
 * the text (or every image of an image-only post) is cropped to 160px, any other is
 * hidden until expanded — so any image makes the content collapsible. Expanded, the
 * content renders exactly as authored.
 *
 * Two decoupled concerns: the measurement (images + line count, re-measured by a
 * `ResizeObserver` as layout settles / the container resizes) and the expanded mode
 * (`userExpanded ?? defaultExpanded` — the `calloutDescriptionDisplayMode` setting
 * drives it until the user clicks a toggle). An async settings load or admin change
 * flips `defaultExpanded` and switches the view instantly; whether there is a toggle
 * does not depend on the mode.
 */
export function ExpandableMarkdown({
  content,
  maxLines = 3,
  defaultExpanded = false,
  expandLabel,
  collapseLabel,
  className,
}: ExpandableMarkdownProps) {
  const { t } = useTranslation('crd-space');
  const [measurement, setMeasurement] = useState<Measurement>({ overflow: 'unknown' });
  // `null` → follow the `defaultExpanded` setting. Set only by an explicit
  // user click on "Read more" / "Show less", which then takes precedence.
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isExpanded = userExpanded ?? defaultExpanded;
  // Collapse only while not expanded (and the content overflows or is still unmeasured).
  // An expanded block renders as authored from its very first paint (issue #10043).
  const isCollapsed = !isExpanded && measurement.overflow !== 'no';
  const maxHeight =
    measurement.overflow === 'unknown'
      ? fallbackMaxHeight(maxLines)
      : measurement.cutAt !== null
        ? `${measurement.cutAt}px`
        : undefined;

  // A content change drops the user's explicit toggle so the new text follows the setting again.
  useLayoutEffect(() => {
    setUserExpanded(null);
  }, [content, maxLines]);

  // Measured synchronously before paint, and again by a ResizeObserver on the content
  // (react-markdown commits, web fonts, images loading) and the container (width changes
  // on sidebar resize / rotation). Re-run when the view flips: the cut depends on the
  // collapsed layout (hero crop, hidden images), while the line count and the images —
  // and so the toggle — do not, so flipping never removes the toggle.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const contentEl = contentRef.current;
    if (!container || !contentEl) return;

    const evaluate = () => {
      const hasImages = classifyImages(contentEl);
      const lines = measureLines(contentEl);
      const textOverflows = lines.length > maxLines;
      setMeasurement({
        overflow: textOverflows || hasImages ? 'yes' : 'no',
        cutAt: textOverflows ? Math.ceil(lines[maxLines - 1].bottom) : null,
      });
    };

    evaluate();

    const observer = new ResizeObserver(evaluate);
    observer.observe(contentEl);
    observer.observe(container);
    return () => observer.disconnect();
  }, [content, maxLines, isExpanded]);

  const showToggle = measurement.overflow === 'yes';
  const expandText = expandLabel ?? t('postSnippet.readMore');
  const collapseText = collapseLabel ?? t('postSnippet.showLess');

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={cn(
          isCollapsed && [
            maxHeight && 'overflow-hidden',
            '[&_img[data-collapse=hero]]:block [&_img[data-collapse=hero]]:max-h-[160px] [&_img[data-collapse=hero]]:w-full [&_img[data-collapse=hero]]:object-cover',
            '[&_img[data-collapse=hidden]]:hidden',
          ]
        )}
        style={isCollapsed && maxHeight ? { maxHeight } : undefined}
      >
        {/* `flow-root` makes the measured wrapper a block formatting context, so a leading
            heading's margin lands inside its box and line positions are measured from it. */}
        <div ref={contentRef} className="flow-root">
          <MarkdownContent content={content} className="text-muted-foreground" />
        </div>
      </div>
      {showToggle && (
        <button
          type="button"
          onClick={() => setUserExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="mt-1 block cursor-pointer rounded text-body-emphasis text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isExpanded ? collapseText : expandText}
        </button>
      )}
    </div>
  );
}
