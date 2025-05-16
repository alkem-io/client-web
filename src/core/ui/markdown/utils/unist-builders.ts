import { u } from 'unist-builder';
import { Node } from 'unist';

// Note: All direct editing of the markdown syntax tree is using unist-builder and not mdast-builder
export const text = (value: string) => u('text', value);
export const root = (value: Node[]) => u('root', value);
export const paragraph = (children: Node[]): Node => u('paragraph', children);
export const html = (value: string): Node => u('html', value);
export const emptyParagraph = () => u('element', { tagName: 'p', children: [], properties: {} });
