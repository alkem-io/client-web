import { unified } from 'unified';
// HTML to Markdown
import rehypeParse from 'rehype-parse';
import rehypeRemark, { defaultHandlers } from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { html } from 'mdast-builder';
// Markdown to HTML
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

import { Converter } from './Converter';

const UnifiedConverter = (): Converter => {
  const htmlToMarkdownPipeline = unified()
    .use(rehypeParse, {
      fragment: true, // don't expect a full HTML Document
    })
    // @ts-ignore
    .use(rehypeRemark, {
      handlers: {
        p: (state, element) => {
          if (!element.children.length) {
            return html('<p></p>');
          }
          return defaultHandlers.p(state, element);
        },
      },
    })
    .use(remarkStringify);

  const markdownToHTMLPipeline = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
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
