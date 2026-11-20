import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { EXIT, SKIP, visit } from 'unist-util-visit';

/**
 * Two independent bounds are applied to a markdown source before it reaches the
 * parser or the renderer, cheapest first:
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
 *    above still leaves room for hundreds of levels of *container* nesting
 *    (blockquote `>` / list markers) inside one line. The parser copes with far
 *    more of those than the renderer: building the React element tree recurses
 *    once per level and exhausts the call stack well under a thousand levels,
 *    so the bound is set where human-written content lives, not where the
 *    parser happens to give up. This second layer cuts at the start of the
 *    first line whose nesting crosses the bound.
 *
 * Ordinary prose — however long, up to the ceiling — never nests this deep and
 * is unaffected by the depth guard; it is only ever shortened by the length
 * ceiling, and only past that ceiling.
 */
export const MAX_EXCERPT_NESTING_DEPTH = 16;

/**
 * Hard ceiling, in characters, on the markdown handed to the parser. Applied
 * before the nesting-depth guard (see the block comment above). A source over
 * the ceiling is cut at its last block boundary inside the allowed range, so
 * the trailing partial block is dropped whole and no markdown construct is ever
 * split in two. A single block longer than the ceiling is cut at a whitespace
 * character near the end of the range instead, and any inline construct the
 * cut leaves unterminated (an image, a link, a raw tag) is dropped with it —
 * otherwise its opening half would render as literal text. The excerpt this
 * feeds renders at most three clamped lines, so nothing user-visible is ever
 * lost by the cut.
 */
export const MAX_EXCERPT_SOURCE_LENGTH = 2000;

const WORD_BOUNDARY_SEARCH_WINDOW = 200;

/**
 * Remove every complete inline image (`![alt](url)`) and raw `<img …>` tag.
 * Images never render in card-safe mode, so they are removed before the length
 * ceiling applies — a pasted screenshot at the top of a field (tens of kilobytes
 * of data: URL) must not consume the whole parse budget and hide the prose after
 * it.
 *
 * This runs on the raw field (up to the platform's save limit), so it is a
 * single left-to-right scan: the position of the next closing `]`, `)` and `>`
 * is cached and only looked up again once the scan passes it. A regex here
 * rescans to the end of the input from every unclosed `![` / `<img`, which is
 * quadratic — close to a second of main-thread time per field at the save limit.
 */
function stripImages(markdown: string): string {
  const lower = markdown.toLowerCase();
  // Each cursor remembers the next occurrence of its needle at or after the
  // last position asked for; `Infinity` means "none anywhere ahead". Positions
  // only ever move forward, so every needle is scanned for at most once over
  // the whole input.
  const cursor = (haystack: string, needle: string) => {
    let found = -1;
    return (pos: number): number => {
      if (found !== Number.POSITIVE_INFINITY && found < pos) {
        const hit = haystack.indexOf(needle, pos);
        found = hit === -1 ? Number.POSITIVE_INFINITY : hit;
      }
      return found;
    };
  };
  const nextMdImage = cursor(markdown, '![');
  const nextImgTag = cursor(lower, '<img');
  const nextBracket = cursor(markdown, ']');
  const nextParen = cursor(markdown, ')');
  const nextAngle = cursor(markdown, '>');

  let out = '';
  let from = 0;
  let i = 0;
  while (i < markdown.length) {
    const md = nextMdImage(i);
    const tag = nextImgTag(i);
    const start = Math.min(md, tag);
    if (start === Number.POSITIVE_INFINITY) break;

    let end = -1;
    if (start === md) {
      const close = nextBracket(start + 2);
      if (close !== Number.POSITIVE_INFINITY && markdown[close + 1] === '(') {
        const paren = nextParen(close + 2);
        if (paren !== Number.POSITIVE_INFINITY) end = paren + 1;
      }
    } else {
      const angle = nextAngle(start + 4);
      if (angle !== Number.POSITIVE_INFINITY) end = angle + 1;
    }

    if (end === -1) {
      i = start + 2;
      continue;
    }
    out += markdown.slice(from, start);
    from = end;
    i = end;
  }
  return out + markdown.slice(from);
}

// The opening half of an inline construct that a cut left unterminated:
// `![alt](partial-url`, `[text](partial-url`, `[partial`, or `<partial-tag`.
// Bounded, and `<` only where it can open a tag, so that a literal `<3` or
// `a < b` earlier in the paragraph can never swallow the prose after it — only
// a construct the cut itself split is dropped.
const UNTERMINATED_INLINE_TAIL = /(?:!?\[[^[\]\n]{0,300}(?:\]\([^()\s]{0,500})?|<[A-Za-z/][^<>\n]{0,500})$/;

// A blank line — the boundary between two markdown blocks.
const BLOCK_BOUNDARY = /\n[ \t]*\n/g;
const BLOCK_BOUNDARY_AT_START = /^\n[ \t]*\n/;

/**
 * Cut `markdown` to at most `MAX_EXCERPT_SOURCE_LENGTH` characters: at the last
 * block boundary inside the range when there is one, else at a whitespace
 * boundary near the end of the range with any unterminated inline construct
 * removed. Source at or under the ceiling passes through unchanged.
 */
function clampToLength(markdown: string): string {
  if (markdown.length <= MAX_EXCERPT_SOURCE_LENGTH) return markdown;
  const hardCut = markdown.slice(0, MAX_EXCERPT_SOURCE_LENGTH);

  // The ceiling landed exactly on a block boundary: the range holds whole blocks.
  if (BLOCK_BOUNDARY_AT_START.test(markdown.slice(MAX_EXCERPT_SOURCE_LENGTH))) return hardCut;

  let lastBlockBoundary = -1;
  for (const match of hardCut.matchAll(BLOCK_BOUNDARY)) {
    lastBlockBoundary = match.index;
  }
  if (lastBlockBoundary > 0) return hardCut.slice(0, lastBlockBoundary);

  let cut = hardCut;
  const searchFloor = Math.max(0, MAX_EXCERPT_SOURCE_LENGTH - WORD_BOUNDARY_SEARCH_WINDOW);
  for (let i = hardCut.length - 1; i >= searchFloor; i -= 1) {
    if (/\s/.test(hardCut[i])) {
      cut = hardCut.slice(0, i);
      break;
    }
  }
  return cut.replace(UNTERMINATED_INLINE_TAIL, '').trimEnd();
}

// One level of CommonMark container nesting — a blockquote marker or a list-item
// marker — at the start of what is left of the line, after ANY amount of leading
// whitespace (captured). CommonMark only allows 0-3 spaces before a marker at the
// top level, but inside a list item that allowance is measured from the item's
// content column, so an indented line (`10. x\n    - - - …`) still opens one
// container per marker.
const NESTING_MARKER = /^([ \t]*)(?:>[ \t]?|[-*+][ \t]|\d{1,9}[.)][ \t])/;

// The narrowest list item (`- `) moves the content column two to the right, so a
// marker indented by N columns can sit at most N/2 levels deeper than the markers
// on its own line show — nesting can be built up across lines, not only within one.
const MIN_COLUMNS_PER_LEVEL = 2;
const TAB_COLUMNS = 4;

function whitespaceColumns(whitespace: string): number {
  let columns = 0;
  for (const char of whitespace) columns += char === '\t' ? TAB_COLUMNS : 1;
  return columns;
}

/**
 * The offset up to which `markdown` is safe to hand to the parser and the
 * renderer: the whole string, unless some line's blockquote/list nesting may
 * exceed `MAX_EXCERPT_NESTING_DEPTH`, in which case the offset stops at the start
 * of that line. A line's nesting is estimated from above: every marker on it
 * counts as one level (`- - - -` is four deep whatever follows it), plus the
 * levels its markers' indentation could have inherited from the lines before it
 * (see `MIN_COLUMNS_PER_LEVEL`). The estimate can over-count (a marker-like line
 * in an indented code block), which only ever cuts earlier. A single forward
 * scan over the source with no recursion — each line's own scan also stops the
 * moment the depth bound is crossed — so this cannot itself exhaust the stack on
 * the same input it is bounding.
 */
function findSafeParseBoundary(markdown: string): number {
  let offset = 0;
  for (const line of markdown.split('\n')) {
    let markers = 0;
    let indentColumns = 0;
    let depth = 0;
    let rest = line;
    let match: RegExpExecArray | null;
    while (depth <= MAX_EXCERPT_NESTING_DEPTH && (match = NESTING_MARKER.exec(rest))) {
      rest = rest.slice(match[0].length);
      markers += 1;
      indentColumns += whitespaceColumns(match[1]);
      depth = markers + Math.floor(indentColumns / MIN_COLUMNS_PER_LEVEL);
    }
    if (depth > MAX_EXCERPT_NESTING_DEPTH) return offset;
    offset += line.length + 1;
  }
  return markdown.length;
}

/**
 * Bound a markdown source before it reaches excerpt-visibility parsing or
 * card-safe rendering: images are removed (they never render in card-safe
 * mode), then the source is cut to `MAX_EXCERPT_SOURCE_LENGTH` characters
 * (cheap, catches pathological inline-span cost regardless of nesting), then to
 * whatever prefix stays under `MAX_EXCERPT_NESTING_DEPTH` (catches container
 * nesting the renderer cannot take). Content short enough, image-free and never
 * nested past the depth bound passes through completely unchanged. Safe to call
 * with the same value multiple times.
 */
export function clampExcerptSource(markdown: string | null | undefined): string {
  if (!markdown) return '';
  const withoutImages = stripImages(markdown);
  const lengthClamped = clampToLength(withoutImages);
  const boundary = findSafeParseBoundary(lengthClamped);
  return boundary < lengthClamped.length ? lengthClamped.slice(0, boundary) : lengthClamped;
}

// Unicode format characters (zero-width joiners/spaces, soft hyphens, …): present
// in the string, invisible on screen.
const FORMAT_CHARACTERS = /\p{Cf}/gu;

function hasVisibleCharacters(value: string): boolean {
  return value.replace(FORMAT_CHARACTERS, '').trim().length > 0;
}

/**
 * Decide whether a markdown field would render at least one visible character
 * in card-safe excerpt mode (`InlineMarkdown` with `rawHtml="skip"`).
 *
 * A naive "is the string non-empty" check disagrees with the renderer: a field
 * holding only an image, an embed, a raw HTML block, a footnote definition or
 * invisible format characters is non-empty as a string yet renders nothing in
 * card-safe mode. This function mirrors that renderer's node filtering exactly,
 * so "show the label" and "render the body" come from one shared rule — a
 * label can never appear above empty content, and content can never be silently
 * dropped while its label stays hidden. See `markdownExcerpt.test.ts` for the
 * fixture table that runs the same inputs through both this function and
 * `InlineMarkdown`.
 */
export function hasVisibleExcerptText(markdown: string | null | undefined): boolean {
  if (!markdown || !hasVisibleCharacters(markdown)) return false;

  const tree = unified().use(remarkParse).use(remarkGfm).parse(clampExcerptSource(markdown));
  let found = false;
  visit(tree, node => {
    // `html`, `image` and `imageReference` never render in card-safe mode — they don't
    // count toward "has visible content", mirroring InlineMarkdown's `skipHtml` +
    // `disallowedElements`. A footnote definition renders as a footnotes section,
    // which card-safe mode drops whole, so its text does not count either.
    if (node.type === 'html' || node.type === 'image' || node.type === 'imageReference') return;
    if (node.type === 'footnoteDefinition') return SKIP;
    if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') {
      const value = (node as { value?: unknown }).value;
      if (typeof value === 'string' && hasVisibleCharacters(value)) {
        found = true;
        return EXIT;
      }
    }
  });
  return found;
}

/** Which of the What/Why/Who fields render at least one visible character in card-safe mode. */
export type ExcerptVisibility = { what: boolean; why: boolean; who: boolean };

/**
 * Compute {@link ExcerptVisibility} for one subspace's three About fields. Meant
 * to run once where the data is shaped (the data mapper), never inside a render,
 * so a list re-render — a width change, a search keystroke — parses no markdown.
 */
export function excerptVisibility(
  what: string | null | undefined,
  why: string | null | undefined,
  who: string | null | undefined
): ExcerptVisibility {
  return {
    what: hasVisibleExcerptText(what),
    why: hasVisibleExcerptText(why),
    who: hasVisibleExcerptText(who),
  };
}
