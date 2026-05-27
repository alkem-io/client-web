import type { Parent, Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Merges directly-adjacent lists of the same kind (ordered/unordered) into a single list.
 *
 * The editor can hold two separate lists with nothing between them (e.g. after pasting from
 * Word, or loading content that was already split). remark-stringify deliberately renders the
 * second of two adjacent lists with a different bullet marker (`*` then `-`) so they don't merge
 * back into one on re-parse — which is exactly what then splits them into two `<ul>`s on render.
 * Merging them here keeps the output a single, consistent list.
 */
const mergeAdjacentLists = (parent: Parent) => {
  for (let i = parent.children.length - 1; i > 0; i--) {
    const current = parent.children[i];
    const previous = parent.children[i - 1];
    if (current.type === 'list' && previous.type === 'list' && current.ordered === previous.ordered) {
      previous.children.push(...current.children);
      parent.children.splice(i, 1);
    }
  }
  for (const child of parent.children) {
    if ('children' in child) {
      mergeAdjacentLists(child as Parent);
    }
  }
};

/**
 * Normalizes lists produced by the editor before they are serialized to markdown:
 * - merges directly-adjacent same-type lists (see {@link mergeAdjacentLists})
 * - forces every list tight (`spread = false`) so items aren't wrapped in `<p>` on render.
 *   The editor cannot express a loose/tight distinction (every `<li>` is wrapped in a `<p>`),
 *   so all of its lists should serialize as tight.
 */
export const remarkNormalizeLists: Plugin<[], Root> = () => tree => {
  mergeAdjacentLists(tree);
  visit(tree, ['list', 'listItem'], node => {
    if (node.type === 'list' || node.type === 'listItem') {
      node.spread = false;
    }
  });
};
