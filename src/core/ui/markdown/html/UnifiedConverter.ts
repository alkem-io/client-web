import { useTranslation } from 'react-i18next';
import { Converter } from './Converter';
import { once } from 'lodash';
import type { Element, ElementContent } from 'hast';
import type { Html, Parent, Parents } from 'mdast';
import { State as M2HState } from 'mdast-util-to-hast';
import { defaultHandlers as defaultHTMLHandlers, State as H2MState } from 'hast-util-to-mdast';
import { emptyParagraph, html } from '../utils/unist-builders';

/*const isEmptyLine = (node: Html, parent: Parent | null | undefined) => {
  if (node.value === '<br>' && parent?.type === 'root') {
    return true;
  } else {
    return /^\s*<br\s*\/?>\s*$/i.test(node.value);
  }
}
  */
const isNewLine = (node: Html, parent: Parent | null | undefined) => {
  const result = /^\s*<br\s*\/?>\s*$/i.test(node.value);
  console.log('isNewLine check for node:', node, result, parent);
  return result;
};

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
    const { default: remarkGfm } = await import('remark-gfm');

    const trimmer = (nodeType: 'strong' | 'emphasis') => (state: H2MState, element: Element) => {
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
            /*            p: (state: H2MState, element: Element, parent: (Parent & { tagName: string }) | undefined) => {
              console.log('Processing paragraph element:', { element, state, parent });
              if (['th', 'td'].includes(parent?.tagName ?? '')) {
                const siblings = parent?.children as ElementContent[] ?? [];
                if (element.children.length === 0) {
                  // It's an empty paragraph inside a table cell
                  if (siblings.length === 1) {
                    // It's the only child
                    console.log('returning empty text node for empty table cell');
                    return { type: 'text', value: '' };
                  } else {
                    // It's not the only child, return a line break
                    console.log('returning <br> for non empty table cell');
                    console.log(html('<br>'));
                    return html('<br>');
                  }
                } else {
                  // It's a non-empty paragraph inside a table cell
                  if (siblings.length === 1) {
                    // It's the only child in the cell
                    console.log('handling default for table cell with a single child');
                    const result = defaultHTMLHandlers.p(state, element);
                    console.log('Result for table cell paragraph:', result, state, element);
                    return result;
                  } else {
                    if (siblings.indexOf(element) === -1) {
                      console.log('something weird, just handle it');
                      return defaultHTMLHandlers.p(state, element);
                    } else if (siblings.indexOf(element) === 0) {
                      console.log('its the first child just handle normally');
                      return defaultHTMLHandlers.p(state, element);
                    } else {
                      console.log('its some other child, should prepend a line break');
                      console.log({ siblings, element });
                      const result = defaultHTMLHandlers.p(state, element);
                      result?.children.unshift({ type: 'html', value: '<br>' });
                      console.log({ result, state, element })
                      return result;
                    }
                  }
                }
              } else {
                if (element.children.length === 0) {
                  console.log('returning <br>');
                  return html('<br>');
                } else {
                  console.log('handling default');
                  return defaultHTMLHandlers.p(state, element);
                }
              }
            },
            */
            p: (state: H2MState, element: Element) =>
              element.children.length === 0 ? html('<br>') : defaultHTMLHandlers.p(state, element),
            strong: trimmer('strong'),
            emphasis: trimmer('emphasis'),
            iframe: (_state: H2MState, element: Element) => ({
              type: 'html',
              value: `<iframe
                src="${element.properties.src}"
                position="absolute"
                width="100%" height="100%" frameborder="0"
                webkitallowfullscreen mozallowfullscreen allowfullscreen
                allow="clipboard-write"
                title="${t('components.wysiwyg-editor.embed.iframeAria', {
                  title: element.properties.title ?? 'Embedded video iframe',
                })}"
              loading="lazy"></iframe>`,
            }),
          },
        })
        .use(remarkGfm)
        .use(remarkStringify)
    );
  });

  const constructMarkdownToHTMLPipeline = once(async () => {
    const { unified } = await import('unified');
    const { default: remarkParse } = await import('remark-parse');
    const { default: remarkGfm } = await import('remark-gfm');
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

    return unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, {
        allowDangerousHtml: true,
        handlers: {
          html: (state: M2HState, node: Html, parent: Parents | undefined): ElementContent => {
            if (isNewLine(node, parent)) {
              return emptyParagraph();
            }
            return defaultMarkdownHandlers.html(state, node) ?? emptyParagraph();
          },
        },
      })
      .use(rehypeRaw, { passThrough: ['iframe'] })
      .use(rehypeSanitize, sanitizeOptions)
      .use(rehypeStringify);
  });

  const markdownToHTML = async (markdown: string) => {
    const markdownToHTMLPipeline = await constructMarkdownToHTMLPipeline();
    const result = await markdownToHTMLPipeline.process(markdown);
    console.log('HTML Result:', String(result));
    return String(result);
  };

  const HTMLToMarkdown = async (html: string) => {
    const htmlToMarkdownPipeline = await constructHtmlToMarkdownPipeline();
    const result = await htmlToMarkdownPipeline.process(html);
    console.log('Markdown Result:', String(result));
    return String(result);
  };

  return { markdownToHTML, HTMLToMarkdown };
};

export default UnifiedConverter;
