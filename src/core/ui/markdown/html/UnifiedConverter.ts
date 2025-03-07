import type { Parent } from 'unist';
import type { H } from 'rehype-remark';
import { useTranslation } from 'react-i18next';
import type { Html } from 'mdast-util-to-hast/lib/handlers/html';
import type { Element } from 'hast-util-to-mdast/lib/handlers/strong';
import { html } from 'mdast-builder';
import { u } from 'unist-builder';
import { Converter } from './Converter';
import { once } from 'lodash';

const isEmptyLine = (node: Html, parent: Parent | null) => node.value === '<br>' && parent?.type === 'root';
const allowDangerousHtmlIframeProps = [
  'src',
  'width',
  'title',
  'allow',
  'height',
  'loading',
  'frameborder',
  'referrerpolicy',
  'allowfullscreen',
];

const UnifiedConverter = (): Converter => {
  const { t } = useTranslation();

  const constructHtmlToMarkdownPipeline = once(async () => {
    const { unified } = await import('unified');
    const { default: rehypeParse } = await import('rehype-parse');
    const { default: rehypeRemark, defaultHandlers: defaultHTMLHandlers } = await import('rehype-remark');
    const { default: rehypeRaw } = await import('rehype-raw');
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
        .use(rehypeParse, { fragment: true }) // don't expect a full HTML Document
        .use(rehypeRaw)
        // @ts-ignore
        .use(rehypeRemark, {
          handlers: {
            p: (state, element) =>
              element.children.length === 0 ? html('<br>') : defaultHTMLHandlers.p(state, element),
            strong: trimmer('strong'),
            em: trimmer('em'),
            iframe: (state, element) => ({
              type: 'html',
              value: `<iframe
                src="${element.properties.src}"
                position="absolute"
                width="100%"
                height="100%"
                frameborder="0"
                webkitallowfullscreen
                 mozallowfullscreen
                 allowfullscreen
                 allow="clipboard-write"
                  title="${t('components.wysiwyg-editor.embed.iframeAria', {
                    title: element.properties.title ?? 'Embeded video iframe',
                  })}"
              loading="lazy"></iframe>`,
            }),
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
    const { defaultSchema } = await import('hast-util-sanitize');

    const sanitizeOptions = {
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), 'iframe'],
      attributes: {
        ...(defaultSchema.attributes || {}),
        iframe: allowDangerousHtmlIframeProps,
      },
    };

    return (
      unified()
        .use(remarkParse)
        // @ts-ignore
        .use(remarkRehype, {
          allowDangerousHtml: true,
          handlers: {
            html: (state, node, parent = null) => {
              if (isEmptyLine(node, parent)) {
                return u('element', { tagName: 'p' });
              }

              return defaultMarkdownHandlers.html(state, node);
            },
          },
        })
        .use(rehypeRaw, { passThrough: ['iframe'] })
        .use(rehypeSanitize, sanitizeOptions)
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
