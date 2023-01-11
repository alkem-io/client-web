import { Plugin } from 'unified';
import { link, paragraph, root, text } from 'mdast-builder';
import { Literal, Node, Parent } from 'unist';

type HandledNode = Parent | Literal;

interface ImageNode {
  url: string;
  alt?: string;
}

const pad = (...nodes: Node[]) => [text(' '), ...nodes, text(' ')];

const getTextFromHTML = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent;
};

const collect = (node: HandledNode): Node[] => {
  if (node.type === 'html') {
    const { value } = node as Literal<string>;
    const textContent = getTextFromHTML(value);
    if (!textContent) {
      return [];
    }
    return pad(text(textContent));
  }
  if (node.type === 'code') {
    const { value } = node as Literal<string>;
    return pad(text(value));
  }
  if (node.type === 'link') {
    return [node];
  }
  if (node.type === 'image') {
    const imageNode = node as unknown as ImageNode;
    return pad(link(imageNode.url, imageNode.alt, text(imageNode.alt || imageNode.url)));
  }
  if ('children' in node) {
    return pad(...(node.children as HandledNode[]).flatMap(collect));
  }
  return [node];
};

interface Options {
  enabled?: boolean;
}

/**
 * Recursively collects node contents from the syntax tree and joins into a single "flat" paragraph.
 * TODO handle lists.
 * @constructor
 */
const PlainText: Plugin =
  ({ enabled = true }: Options = {}) =>
  tree => {
    if (!enabled) {
      return tree;
    }

    return root(paragraph(collect(tree as Parent)));
  };

export default PlainText;
