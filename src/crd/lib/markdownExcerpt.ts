import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { EXIT, visit } from 'unist-util-visit';

/**
 * Maximum blockquote/list nesting depth this module will hand to the markdown
 * parser. Ordinary prose — however long — never nests this deep, so this bounds
 * pathological *structure*, not source length: a What/Why/Who field at the
 * platform's full save-time character limit parses in full, unmodified, as long
 * as it isn't stacked this deep. Deeper nesting risks exhausting the parser's
 * call stack while parsing — a real, reachable crash (see this file's
 * `markdownExcerpt.test.ts`, "unbounded source safety") — so the source is cut at
 * the start of the first line where nesting exceeds this bound, never at a fixed
 * character count.
 */
export const MAX_EXCERPT_NESTING_DEPTH = 1000;

// One level of CommonMark container nesting — a blockquote marker or a list-item
// marker — at the start of what is left of the line, allowing the up-to-3-space
// indent CommonMark permits before a marker.
const NESTING_MARKER = /^ {0,3}(?:>[ \t]?|[-*+][ \t]|\d{1,9}[.)][ \t])/;

/**
 * The offset up to which `markdown` is safe to hand to the parser: the whole
 * string, unless some line's blockquote/list nesting exceeds
 * `MAX_EXCERPT_NESTING_DEPTH`, in which case the offset stops at the start of
 * that line. A single forward scan over the source with no recursion — each
 * line's own scan also stops the moment the depth bound is crossed — so this
 * cannot itself exhaust the stack on the same input it is bounding.
 */
function findSafeParseBoundary(markdown: string): number {
  let offset = 0;
  for (const line of markdown.split('\n')) {
    let depth = 0;
    let rest = line;
    let match: RegExpExecArray | null;
    while (depth <= MAX_EXCERPT_NESTING_DEPTH && (match = NESTING_MARKER.exec(rest))) {
      rest = rest.slice(match[0].length);
      depth += 1;
    }
    if (depth > MAX_EXCERPT_NESTING_DEPTH) return offset;
    offset += line.length + 1;
  }
  return markdown.length;
}

/**
 * Bound a markdown source before it reaches excerpt-visibility parsing or
 * card-safe rendering, cutting only a pathologically nested tail (see
 * `findSafeParseBoundary`) — content of any length that never nests past the
 * bound passes through completely unchanged. Safe to call with the same value
 * multiple times.
 */
export function clampExcerptSource(markdown: string | null | undefined): string {
  if (!markdown) return '';
  const boundary = findSafeParseBoundary(markdown);
  return boundary < markdown.length ? markdown.slice(0, boundary) : markdown;
}

/**
 * Decide whether a markdown field would render at least one visible character
 * in card-safe excerpt mode (`InlineMarkdown` with `rawHtml="skip"`).
 *
 * A naive "is the string non-empty" check disagrees with the renderer: a field
 * holding only an image, an embed, or a raw HTML block is non-empty as a string
 * yet renders nothing in card-safe mode (images/iframes/raw HTML are suppressed).
 * This function mirrors that renderer's node filtering exactly, so
 * "show the label" and "render the body" come from one shared rule — a
 * label can never appear above empty content, and content can never be silently
 * dropped while its label stays hidden. See `markdownExcerpt.test.ts` for the
 * fixture table that runs the same inputs through both this function and
 * `InlineMarkdown`.
 */
export function hasVisibleExcerptText(markdown: string | null | undefined): boolean {
  if (!markdown || !markdown.trim()) return false;

  const tree = unified().use(remarkParse).use(remarkGfm).parse(clampExcerptSource(markdown));
  let found = false;
  visit(tree, node => {
    // `html`, `image` and `imageReference` never render in card-safe mode — they don't
    // count toward "has visible content", mirroring InlineMarkdown's `skipHtml` +
    // `disallowedElements={['img']}`.
    if (node.type === 'html' || node.type === 'image' || node.type === 'imageReference') return;
    if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') {
      const value = (node as { value?: unknown }).value;
      if (typeof value === 'string' && value.trim().length > 0) {
        found = true;
        return EXIT;
      }
    }
  });
  return found;
}
