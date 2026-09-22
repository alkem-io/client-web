import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { EXIT, visit } from 'unist-util-visit';

/**
 * Upper bound, in characters, on the markdown source this module will parse. The
 * excerpt UI only ever shows a couple of clamped lines, so anything past this bound can
 * never become visible — but an unbounded parse of a much larger or more deeply nested
 * source still costs real time and stack depth. Every call site funnels its source
 * through `clampExcerptSource` first, so parse cost and AST depth stay bounded
 * regardless of how much text (or how much nesting) the field actually holds.
 */
export const MAX_EXCERPT_SOURCE_LENGTH = 2000;

/**
 * Bound a markdown source before it reaches excerpt-visibility parsing or card-safe
 * rendering. Safe to call with the same value multiple times — a value already within
 * the bound is returned unchanged.
 */
export function clampExcerptSource(markdown: string | null | undefined): string {
  if (!markdown) return '';
  return markdown.length > MAX_EXCERPT_SOURCE_LENGTH ? markdown.slice(0, MAX_EXCERPT_SOURCE_LENGTH) : markdown;
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
