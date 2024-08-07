import type { Parent } from 'unist';
import type { H } from 'rehype-remark';
import type { HTML } from 'mdast-util-to-hast/lib/handlers/html';
import type { Element } from 'hast-util-to-mdast/lib/handlers/strong';
import { html } from 'mdast-builder';
import { u } from 'unist-builder';
import { Converter } from './Converter';
import { once } from 'lodash';

const isEmptyLine = (node: HTML, parent: Parent | null) => node.value === '<br>' && parent?.type === 'root';

const UnifiedConverter = (): Converter => {
  const constructHtmlToMarkdownPipeline = once(async () => {
    const { unified } = await import('unified');

    const { default: rehypeParse } = await import('rehype-parse');
    const { default: rehypeRemark, defaultHandlers: defaultHTMLHandlers } = await import('rehype-remark');
    const { default: remarkStringify } = await import('remark-stringify');

    const trimmer = (nodeType: 'strong' | 'em') => (state: H, element: Element) => {
      if (element.children.length === 1) {
        if (element.children[0].type === 'text') {
          const value = element.children[0].value;
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

      return defaultHTMLHandlers[nodeType](state, element);
    };

    return (
      unified()
        .use(rehypeParse, {
          fragment: true, // don't expect a full HTML Document
        })
        // @ts-ignore
        .use(rehypeRemark, {
          handlers: {
            p: (state, element) => {
              if (element.children.length === 0) {
                return html('<br>');
              }
              return defaultHTMLHandlers.p(state, element);
            },
            strong: trimmer('strong'),
            em: trimmer('em'),
          },
        })
        .use(remarkStringify)
    );
  });

  const constructMarkdownToHTMLPipeline = once(async () => {
    const { unified } = await import('unified');

    const { default: remarkParse } = await import('remark-parse');
    const { default: remarkRehype, defaultHandlers: defaultMarkdownHandlers } = await import('remark-rehype');
    const { default: rehypeRaw } = await import('rehype-raw');
    const { default: rehypeSanitize } = await import('rehype-sanitize');
    const { default: rehypeStringify } = await import('rehype-stringify');

    return (
      unified()
        .use(remarkParse)
        // @ts-ignore
        .use(remarkRehype, {
          allowDangerousHtml: true,
          handlers: {
            html: (state, node, parent) => {
              if (isEmptyLine(node, parent)) {
                return u('element', { tagName: 'p' });
              }
              return defaultMarkdownHandlers.html(state, node);
            },
          },
        })
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeStringify)
    );
  });

  const markdownToHTML = async (markdown: string) => {
    const markdownToHTMLPipeline = await constructMarkdownToHTMLPipeline();
    const result = await markdownToHTMLPipeline.process(markdown);
    return String(result);
  };

  const HTMLToMarkdown = async (html: string) => {
    const htmlToMarkdownPipeline = await constructHtmlToMarkdownPipeline();
    const result = await htmlToMarkdownPipeline.process(html);
    return String(result);
  };

  return { markdownToHTML, HTMLToMarkdown };
};

export default UnifiedConverter;
