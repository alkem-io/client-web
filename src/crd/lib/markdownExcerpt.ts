import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { EXIT, visit } from 'unist-util-visit';

/**
 * Two independent bounds are applied to a markdown source before it reaches the
 * parser, cheapest first:
 *
 * 1. **Parse-length ceiling** (`MAX_EXCERPT_SOURCE_LENGTH`, below) — an excerpt
 *    only ever renders a few clamped lines, so nothing beyond a few thousand
 *    characters can ever become visible. This bounds parse *cost*: an inline
 *    span with no container nesting at all (a long flat run of `*`/`_`/`[`/`]`
 *    delimiter characters either side of one visible character) still forces the
 *    parser's delimiter-matching into pathological, super-linear work — no
 *    blockquote/list nesting is involved, so the depth guard below does not see
 *    it (see `markdownExcerpt.test.ts`, "unbounded inline-span safety").
 * 2. **Nesting-depth guard** (`MAX_EXCERPT_NESTING_DEPTH`, below) — the ceiling
 *    above still leaves room for a couple of thousand characters of *container*
 *    nesting (blockquote `>` / list markers), which risks exhausting the
 *    parser's call stack independently of source length (see
 *    `markdownExcerpt.test.ts`, "unbounded source safety"). This second layer
 *    cuts at the start of the first line where that nesting crosses the bound.
 *
 * Ordinary prose — however long, up to the ceiling — never nests this deep and
 * is unaffected by the depth guard; it is only ever shortened by the length
 * ceiling, and only past that ceiling.
 */
export const MAX_EXCERPT_NESTING_DEPTH = 1000;

/**
 * Hard ceiling, in characters, on the markdown handed to the parser. Applied
 * before the nesting-depth guard (see the block comment above). When a source
 * exceeds it, the cut lands on the last whitespace character within the final
 * 200 characters of the ceiling, so a word is never split in two; when no
 * whitespace occurs there, it hard-cuts at the ceiling instead. The excerpt
 * this feeds renders at most three clamped lines, so nothing user-visible is
 * ever lost by this cut.
 */
export const MAX_EXCERPT_SOURCE_LENGTH = 2000;

const WORD_BOUNDARY_SEARCH_WINDOW = 200;

/**
 * Cut `markdown` to at most `MAX_EXCERPT_SOURCE_LENGTH` characters, preferring a
 * whitespace boundary near the end of the allowed range so a word is not split.
 * Source at or under the ceiling passes through unchanged.
 */
function clampToLength(markdown: string): string {
  if (markdown.length <= MAX_EXCERPT_SOURCE_LENGTH) return markdown;
  const hardCut = markdown.slice(0, MAX_EXCERPT_SOURCE_LENGTH);
  const searchFloor = Math.max(0, MAX_EXCERPT_SOURCE_LENGTH - WORD_BOUNDARY_SEARCH_WINDOW);
  for (let i = hardCut.length - 1; i >= searchFloor; i -= 1) {
    if (/\s/.test(hardCut[i])) return hardCut.slice(0, i);
  }
  return hardCut;
}

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
 * card-safe rendering: first to `MAX_EXCERPT_SOURCE_LENGTH` characters (cheap,
 * catches pathological inline-span cost regardless of nesting), then to
 * whatever prefix stays under `MAX_EXCERPT_NESTING_DEPTH` (catches pathological
 * container nesting within that length). Content short enough and never nested
 * past the depth bound passes through completely unchanged. Safe to call with
 * the same value multiple times.
 */
export function clampExcerptSource(markdown: string | null | undefined): string {
  if (!markdown) return '';
  const lengthClamped = clampToLength(markdown);
  const boundary = findSafeParseBoundary(lengthClamped);
  return boundary < lengthClamped.length ? lengthClamped.slice(0, boundary) : lengthClamped;
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
