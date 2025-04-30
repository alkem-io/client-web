import { u } from 'unist-builder';
import { html } from 'mdast-builder';
import { once } from 'lodash';
import { useTranslation } from 'react-i18next';
import type { Element } from 'hast';
import type { Parent } from 'unist';
import type { Converter } from './Converter';

// @ts-nocheck
const isEmptyLine = (node: any, parent: Parent | undefined) => node.value === '<br>' && parent?.type === 'root';

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
    const { default: rehypeRemark } = await import('rehype-remark');
    const { default: rehypeRaw } = await import('rehype-raw');
    const { default: remarkStringify } = await import('remark-stringify');

    const trimmer = (nodeType: 'strong' | 'em') => (_h: any, element: Element) => {
      const value = (element.children[0] as any)?.value || '';
      const trimmed = value.trim();
      const space = '<span> </span>';
      return html(
        `${value.startsWith(' ') ? space : ''}<${nodeType}>${trimmed}</${nodeType}>${
          value.endsWith(' ') ? space : ''
        }`
      );
    };

    return unified()
      .use(rehypeParse as any, { fragment: true })
      .use(rehypeRaw as any)
      .use(rehypeRemark as any, {
        handlers: {
          p: (h: any, element: Element) =>
            element.children.length === 0
              ? html('<br>')
              : h(element, 'p', element.children as any),
          strong: trimmer('strong'),
          em: trimmer('em'),
          iframe: (_h: any, element: Element) => ({
            type: 'html',
            value: `<iframe
              src="${element.properties?.src}"
              position="absolute"
              width="100%"
              height="100%"
              frameborder="0"
              webkitallowfullscreen
              allowfullscreen
              allow="clipboard-write"
              title="${t('components.wysiwyg-editor.embed.iframeAria', {
              title: element.properties?.title ?? 'Embedded iframe',
            })}"
              loading="lazy"
            ></iframe>`,
          }),
        },
      })
      .use(remarkStringify as any);
  });

  const constructMarkdownToHTMLPipeline = once(async () => {
    const { unified } = await import('unified');
    const { default: remarkRehype } = await import('remark-rehype');
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

    return unified()
      .use(remarkRehype as any, {
        allowDangerousHtml: true,
        handlers: {
          html: (h: any, node: any, parent?: Parent) =>
            isEmptyLine(node, parent) ? u('element', { tagName: 'p' }) : h(node, 'html', node.value),
        },
      })
      .use(rehypeRaw as any, { passThrough: ['iframe'] })
      .use(rehypeSanitize, sanitizeOptions)
      .use(rehypeStringify as any);
  });

  const markdownToHTML = async (markdown: string) => {
    const pipeline = await constructMarkdownToHTMLPipeline();
    const result = await pipeline.process(markdown);
    return String(result);
  };

  const HTMLToMarkdown = async (html: string) => {
    const pipeline = await constructHtmlToMarkdownPipeline();
    const result = await pipeline.process(html);
    return String(result);
  };

  return { markdownToHTML, HTMLToMarkdown };
};

export default UnifiedConverter;
