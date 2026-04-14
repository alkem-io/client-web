/**
 * Stateless markdown ↔ HTML conversion using the unified pipeline.
 *
 * Two pure async functions that lazily build their pipelines on first call.
 * Custom handlers mirror UnifiedConverter.ts for round-trip fidelity,
 * minus iframe handling (deferred to the iframe-whitelist spec).
 */

import type { Element, ElementContent } from 'hast';
import type { Html, Parent as MDASTParent, PhrasingContent } from 'mdast';

// Extend MDAST Parent with optional tagName (always present at runtime for HTML elements)
type Parent = MDASTParent & { tagName?: string } & { children: Element[] };

const isNewLine = (node: Html) => /^\s*<br\s*\/?>\s*$/i.test(node.value);
const isTableCellNode = (parent: Parent | undefined) => ['td', 'th'].includes(parent?.tagName ?? '');

// Module-level cached pipelines — built once on first call
let htmlToMdPipeline: Awaited<ReturnType<typeof buildHtmlToMdPipeline>> | null = null;
let mdToHtmlPipeline: Awaited<ReturnType<typeof buildMdToHtmlPipeline>> | null = null;

async function buildHtmlToMdPipeline() {
  const [
    { unified },
    { default: rehypeParse },
    { default: rehypeRaw },
    { default: rehypeRemark },
    { default: remarkGfm },
    { default: remarkStringify },
    { defaultHandlers },
    { u },
  ] = await Promise.all([
    import('unified'),
    import('rehype-parse'),
    import('rehype-raw'),
    import('rehype-remark'),
    import('remark-gfm'),
    import('remark-stringify'),
    import('hast-util-to-mdast'),
    import('unist-builder'),
  ]);

  const html = (value: string) => u('html', value);

  // Move interior whitespace outside bold/italic markers to prevent rendering bugs
  const trimmer = (nodeType: 'strong' | 'emphasis') => (state: unknown, element: Element) => {
    if (element.children.length === 1) {
      if (element.children[0].type === 'text') {
        const value = (element.children[0] as unknown as { value: string }).value;
        const trimmed = value.trim();
        const space = '<span> </span>';
        if (trimmed === '' && value !== trimmed) {
          return html(space);
        }
        return html(
          `${value.startsWith(' ') ? space : ''}<${nodeType}>${trimmed}</${nodeType}>${
            value.endsWith(' ') ? space : ''
          }`
        );
      }
    }
    return defaultHandlers[nodeType](state as never, element);
  };

  return (
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeRaw)
      // @ts-expect-error rehype-remark handler types are loosely compatible
      .use(rehypeRemark, {
        handlers: {
          p: (state: unknown, element: Element, parent: Parent | undefined) => {
            if (isTableCellNode(parent)) {
              if (element.children.length === 0) {
                return html('<br>');
              }
              const siblings: Element[] = parent?.children ?? [];
              const position = siblings.indexOf(element);
              const result = defaultHandlers.p(state as never, element);
              if (position > 0) {
                const previousSibling = siblings[position - 1];
                if (previousSibling && previousSibling.tagName === 'p') {
                  result?.children.unshift(html('<br>') as PhrasingContent);
                  return result;
                }
              }
              return result;
            }
            return element.children.length === 0 && parent?.type === 'root'
              ? html('<br>')
              : defaultHandlers.p(state as never, element);
          },
          strong: trimmer('strong'),
          emphasis: trimmer('emphasis'),
        },
      })
      .use(remarkGfm)
      .use(remarkStringify)
  );
}

async function buildMdToHtmlPipeline() {
  const [
    { unified },
    { default: remarkParse },
    { default: remarkGfm },
    remarkRehypeModule,
    { default: rehypeRaw },
    { default: rehypeSanitize },
    { default: rehypeStringify },
    { defaultSchema },
    { u },
  ] = await Promise.all([
    import('unified'),
    import('remark-parse'),
    import('remark-gfm'),
    import('remark-rehype'),
    import('rehype-raw'),
    import('rehype-sanitize'),
    import('rehype-stringify'),
    import('hast-util-sanitize'),
    import('unist-builder'),
  ]);

  const remarkRehype = remarkRehypeModule.default;
  const defaultMarkdownHandlers = remarkRehypeModule.defaultHandlers;

  const text = (value: string) => u('text', value);
  const emptyParagraph = () => u('element', { tagName: 'p', children: [], properties: {} });

  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      handlers: {
        html: (state: unknown, node: Html, parent: MDASTParent | undefined): ElementContent => {
          if (isNewLine(node)) {
            if (parent?.type === 'root') {
              return emptyParagraph();
            }
            const siblings = parent?.children ?? [];
            const position = siblings.indexOf(node);
            if (position <= 0) {
              return emptyParagraph();
            }
            if (siblings[position - 1].type === 'html' && isNewLine(siblings[position - 1] as Html)) {
              return emptyParagraph();
            }
            return text('');
          }
          return defaultMarkdownHandlers.html(state as never, node) ?? emptyParagraph();
        },
        text: (state: unknown, node: unknown, parent: MDASTParent | undefined): ElementContent => {
          if (parent?.children.length === 1) {
            return defaultMarkdownHandlers.text(state as never, node as never);
          }
          const siblings = parent?.children ?? [];
          const position = siblings.indexOf(node as never);
          const nextNode = siblings[position + 1];
          if (nextNode && nextNode.type === 'html' && isNewLine(nextNode as Html)) {
            const paragraphNode = defaultMarkdownHandlers.paragraph(state as never, node as never);
            paragraphNode.children.push(defaultMarkdownHandlers.text(state as never, node as never));
            return paragraphNode;
          }
          return defaultMarkdownHandlers.text(state as never, node as never);
        },
      },
    })
    .use(rehypeRaw)
    .use(rehypeSanitize, defaultSchema)
    .use(rehypeStringify);
}

export async function markdownToHtml(markdown: string): Promise<string> {
  if (!mdToHtmlPipeline) {
    mdToHtmlPipeline = await buildMdToHtmlPipeline();
  }
  const result = await mdToHtmlPipeline.process(markdown);
  return String(result);
}

export async function htmlToMarkdown(html: string): Promise<string> {
  if (!htmlToMdPipeline) {
    htmlToMdPipeline = await buildHtmlToMdPipeline();
  }
  const result = await htmlToMdPipeline.process(html);
  return String(result);
}
