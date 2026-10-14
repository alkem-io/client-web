import type { Html, Paragraph, Root, Text } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

// Containers whose children are blocks: an HTML block there needs a paragraph around its text.
const FLOW_PARENTS = new Set(['root', 'blockquote', 'listItem', 'footnoteDefinition']);

/**
 * Turns raw HTML in markdown into the literal text it was typed as. For plain
 * text that is only ever markdown — a chat message — a `<word>` is something the
 * writer typed to be read, not an element: rendered as HTML it is either dropped
 * by the sanitiser or turned into formatting the writer never asked for.
 */
export const remarkHtmlAsText: Plugin<[], Root> = () => tree => {
  visit(tree, 'html', (node: Html, index, parent) => {
    if (!parent || index === undefined) return;
    const text: Text = { type: 'text', value: node.value };
    const replacement: Text | Paragraph = FLOW_PARENTS.has(parent.type)
      ? { type: 'paragraph', children: [text] }
      : text;
    parent.children.splice(index, 1, replacement as (typeof parent.children)[number]);
  });
};
