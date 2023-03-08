import { unified } from 'unified';
import { Parent } from 'unist';
// HTML to Markdown
import rehypeParse from 'rehype-parse';
import rehypeRemark, { defaultHandlers as defaultHTMLHandlers } from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { html } from 'mdast-builder';
// Markdown to HTML
import remarkParse from 'remark-parse';
import remarkRehype, { defaultHandlers as defaultMarkdownHandlers } from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { u } from 'unist-builder';
import { HTML } from 'mdast-util-to-hast/lib/handlers/html';

import { Converter } from './Converter';

const isEmptyLine = (node: HTML, parent: Parent | null) => node.value === '<br>' && parent?.type === 'root';

const UnifiedConverter = (): Converter => {
  const htmlToMarkdownPipeline = unified()
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
      },
    })
    .use(remarkStringify);

  const markdownToHTMLPipeline = unified()
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
    .use(rehypeStringify);

  const markdownToHTML = async (markdown: string) => {
    const result = await markdownToHTMLPipeline.process(markdown);
    return String(result);
  };

  const HTMLToMarkdown = async (html: string) => {
    const result = await htmlToMarkdownPipeline.process(html);
    return String(result);
  };

  return { markdownToHTML, HTMLToMarkdown };
};

export default UnifiedConverter;
