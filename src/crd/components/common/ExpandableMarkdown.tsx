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
 * Marks every image and embed (`MarkdownContent` tags an embed's outer box `data-embed`)
 * with how the collapsed view treats it: `hero` (it comes before any text — shown,
 * cropped to 160px) or `hidden` (it follows text — withheld until expanded). With no
 * text at all every one is a hero, so an image-only post is cropped rather than emptied.
 * Returns whether there are any.
 */
function classifyMedia(el: HTMLElement): boolean {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  const media: HTMLElement[] = [];
  let firstTrailing = -1;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeName === 'IMG' || (node as HTMLElement).dataset?.embed !== undefined) {
      media.push(node as HTMLElement);
    } else if (firstTrailing === -1 && node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      firstTrailing = media.length;
    }
  }
  media.forEach((item, index) => {
    const role = firstTrailing === -1 || index < firstTrailing ? 'hero' : 'hidden';
    if (item.dataset.collapse !== role) item.dataset.collapse = role;
  });
  return media.length > 0;
}

type Line = { top: number; bottom: number };

const middle = (top: number, bottom: number) => (top + bottom) / 2;

/**
 * The first `limit` rendered lines of text inside `el`, top to bottom, relative to its
 * top. Counting real line boxes — not multiples of a line height — is what lets the cut
 * land under a full line: a paragraph gap or heading inside the first lines would
 * otherwise put it mid-line. Text is walked in document order, which is not always visual
 * order (table cells side by side), so a fragment may belong anywhere among the kept
 * lines; anything below the `limit`-th is dropped, so each fragment costs O(limit).
 */
function measureLines(el: HTMLElement, limit: number) {
  const origin = el.getBoundingClientRect().top;
  const lines: Line[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.height === 0) continue;
      const top = rect.top - origin;
      const bottom = rect.bottom - origin;
      // Fragments of one visual line (bold, links, inline code in a heading) overlap at
      // their vertical middles, whatever their font sizes; merge them.
      const fragmentMiddle = middle(top, bottom);
      const line = lines.find(l => {
        const lineMiddle = middle(l.top, l.bottom);
        return (fragmentMiddle >= l.top && fragmentMiddle <= l.bottom) || (lineMiddle >= top && lineMiddle <= bottom);
      });
      if (line) {
        line.top = Math.min(line.top, top);
        line.bottom = Math.max(line.bottom, bottom);
        continue;
      }
      const index = lines.findIndex(l => l.top > top);
      if (index === -1) {
        if (lines.length < limit) lines.push({ top, bottom });
      } else {
        lines.splice(index, 0, { top, bottom });
        if (lines.length > limit) lines.pop();
      }
    }
  }
  return lines;
}

/**
 * Markdown body that collapses to a clean cut directly under its `maxLines`-th
 * rendered line of text, with a "Read more" / "Show less" link below it. Only text
 * that *exceeds* `maxLines` is cut. Images and embeds never get a fade or overlay: one
 * before the text (or every one of a post without text) is cropped to 160px, any other
 * is hidden until expanded — so any image or embed makes the content collapsible.
 * Expanded, the content renders exactly as authored.
 *
 * Two decoupled concerns: the measurement (media + line count, re-measured by a
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
  // An expanded block renders as authored from its very first paint.
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
  // collapsed layout (hero crop, hidden media), while the line count and the media —
  // and so the toggle — do not, so flipping never removes the toggle.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const contentEl = contentRef.current;
    if (!container || !contentEl) return;

    const evaluate = () => {
      const hasMedia = classifyMedia(contentEl);
      const lines = measureLines(contentEl, maxLines + 1);
      const textOverflows = lines.length > maxLines;
      const overflow = textOverflows || hasMedia ? 'yes' : 'no';
      const cutAt = textOverflows ? Math.ceil(lines[maxLines - 1].bottom) : null;
      // Keep the previous object when nothing changed, so a resize that moves no line
      // (every observed callback, including the one on `observe()`) re-renders nothing.
      setMeasurement(prev =>
        prev.overflow === overflow && 'cutAt' in prev && prev.cutAt === cutAt ? prev : { overflow, cutAt }
      );
    };

    evaluate();

    const observer = new ResizeObserver(evaluate);
    observer.observe(contentEl);
    observer.observe(container);
    return () => observer.disconnect();
  }, [content, maxLines, isExpanded]);

  const showToggle = measurement.overflow === 'yes';

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={cn(
          // `!important`: the authored inline styles markdown keeps (display, sizes,
          // overflow) must not undo the preview; expanded, they apply again.
          isCollapsed && [
            maxHeight && 'overflow-hidden',
            '[&_[data-collapse=hero]]:!block [&_[data-collapse=hero]]:!w-full [&_[data-collapse=hero]]:!min-h-0 [&_[data-collapse=hero]]:!max-h-[160px] [&_[data-collapse=hero]]:!overflow-hidden [&_[data-collapse=hero]]:object-cover',
            '[&_[data-collapse=hidden]]:!hidden',
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
          {isExpanded ? t('postSnippet.showLess') : t('postSnippet.readMore')}
        </button>
      )}
    </div>
  );
}
