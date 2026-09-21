import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Decide whether a markdown field would render at least one visible character
 * in card-safe excerpt mode (`InlineMarkdown` with `rawHtml="skip"`).
 *
 * A naive "is the string non-empty" check disagrees with the renderer: a field
 * holding only an image, an embed, or a raw HTML block is non-empty as a string
 * yet renders nothing in card-safe mode (images/iframes/raw HTML are suppressed —
 * FR-022/FR-023). This function mirrors that renderer's node filtering exactly, so
 * "show the label" and "render the body" come from one shared rule (FR-016) — a
 * label can never appear above empty content, and content can never be silently
 * dropped while its label stays hidden. See `markdownExcerpt.test.ts` for the
 * fixture table that runs the same inputs through both this function and
 * `InlineMarkdown`.
 */
export function hasVisibleExcerptText(markdown: string | null | undefined): boolean {
  if (!markdown || !markdown.trim()) return false;

  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  let found = false;
  visit(tree, node => {
    if (found) return;
    // `html`, `image` and `imageReference` never render in card-safe mode — they don't
    // count toward "has visible content", mirroring InlineMarkdown's `skipHtml` +
    // `disallowedElements={['img']}`.
    if (node.type === 'html' || node.type === 'image' || node.type === 'imageReference') return;
    if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') {
      const value = (node as { value?: unknown }).value;
      if (typeof value === 'string' && value.trim().length > 0) {
        found = true;
      }
    }
  });
  return found;
}
