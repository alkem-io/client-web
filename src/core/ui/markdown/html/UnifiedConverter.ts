import { unified } from 'unified';
import { Parent } from 'unist';
// HTML to Markdown
import rehypeParse from 'rehype-parse';
import rehypeRemark, { defaultHandlers as defaultHTMLHandlers, H } from 'rehype-remark';
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
import { Element } from 'hast-util-to-mdast/lib/handlers/strong';

const isEmptyLine = (node: HTML, parent: Parent | null) => node.value === '<br>' && parent?.type === 'root';

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
        `${value.startsWith(' ') ? space : ''}<${nodeType}>${trimmed}</${nodeType}>${value.endsWith(' ') ? space : ''}`
      );
    }
  }

  return defaultHTMLHandlers[nodeType](state, element);
};

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
        strong: trimmer('strong'),
        em: trimmer('em'),
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
