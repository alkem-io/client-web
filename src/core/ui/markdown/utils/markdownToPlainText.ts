import type { Root, Text } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Converts markdown content to plain text by stripping all formatting.
 * Useful for exporting content to formats that don't support markdown (e.g., ICS calendar files).
 *
 * @param markdown - The markdown string to convert
 * @returns Plain text version of the markdown content
 */
export const markdownToPlainText = (markdown: string): string => {
  const textParts: string[] = [];

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(() => (tree: Root) => {
      visit(tree, (node, _index, parent) => {
        // Extract text from text nodes
        if (node.type === 'text') {
          textParts.push((node as Text).value);
        }
        // Add space after inline code
        else if (node.type === 'inlineCode') {
          textParts.push((node as { value: string }).value);
        }
        // Add newlines for paragraph breaks
        else if (node.type === 'paragraph' && parent?.type !== 'listItem') {
          textParts.push('\n');
        }
        // Add newlines for breaks
        else if (node.type === 'break') {
          textParts.push('\n');
        }
        // Add newlines for headings
        else if (node.type === 'heading') {
          textParts.push('\n');
        }
        // Add newlines for list items
        else if (node.type === 'listItem') {
          textParts.push('\n- ');
        }
        // Handle code blocks
        else if (node.type === 'code') {
          textParts.push((node as { value: string }).value);
          textParts.push('\n');
        }
      });

      return tree;
    });

  processor.runSync(processor.parse(markdown));

  return textParts
    .join('')
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
    .trim();
};
