import { useTranslation } from 'react-i18next';
import { Converter } from './Converter';
import { once } from 'lodash';
import type { Element, ElementContent } from 'hast';
import type { Html, Parent as MDASTParent, PhrasingContent } from 'mdast';
import { State as M2HState } from 'mdast-util-to-hast';
import { defaultHandlers as defaultHTMLHandlers, State as H2MState } from 'hast-util-to-mdast';
import { emptyParagraph, html, text } from '../utils/unist-builders';

// Not sure why it doesn't have the tagName property in TS, it's always there when debugging.
// Overriding children to cast it to Element[] for cleaner code.
type Parent = MDASTParent & { tagName?: string } & { children: Element[] };

const isNewLine = (node: Html) => /^\s*<br\s*\/?>\s*$/i.test(node.value);
const isTableCellNode = (parent: Parent | undefined) => ['td', 'th'].includes(parent?.tagName ?? '');

/**
 * The nightmare of the newlines:
 * Code below can be confusing, so I'm leaving log function for now also as documentation
 *
 * NewLines in html don't have any effect, but in markdown they do.
 * But in Markdown tables you just cannot use \n as line breaker, you need to use HTML <br> tags.
 * HTML Paragraphs <p> get turned into just text nodes in mdast. Empty paragraphs become <br>s.
 * The problem is that this code converts back and forth between HTML and Markdown, so we need to be 100% sure the results are consistent.
 *
 * When converting HTML to MD:
 * - if a <p> is empty and it's at the root of the document, it gets converted to <br>
 *     (not sure why this code checks that it's at the root, but it has been like that for long time and I don't want to break something else. delete this line at some point)
 * - if a <p> is inside a table cell, if it's empty it gets converted to <br> too.
 * - if it's not empty, we have two (or more) consecutive <p> inside a table cell, we need to add a <br> between them to preserve the line breaks the user expects.
 *
 * When converting MD to HTML:
 * - if we find a NewLine (<br>) at the root of the document, we convert it to an empty <p></p>
 * - if we find two (or more) consecutive NewLines (<br>), we convert them to empty <p></p>
 * - text nodes get converted to <p> if they are followed by a NewLine (<br>)
 */

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
  const log = (..._args) => {
    // console.log('[UnifiedConverter]', ..._args);
  };

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
            p: (state: H2MState, element: Element, parent: Parent | undefined) => {
              if (isTableCellNode(parent)) {
                log('paragraph inside a table cell', element, parent, state);
                if (element.children.length === 0) {
                  log('was an empty line, converting to <br>');
                  return html('<br>');
                } else {
                  // if it's a child after another p, prepend a <br>
                  const siblings: Element[] = parent?.children ?? [];
                  const position = siblings.indexOf(element);
                  const result = defaultHTMLHandlers.p(state, element);

                  if (position > 0) {
                    const previousSibling = siblings[position - 1];
                    if (previousSibling && previousSibling.tagName === 'p') {
                      result?.children.unshift(html('<br>') as PhrasingContent);
                      log('p inside a table cell after another p', element, parent, state, result);
                      return result;
                    }
                  }
                  log('was not after another p, returned as is', element, parent, state, result);
                  return result;
                }
              } else {
                log('p not in a table cell', element, parent, state);
                // If it's in the root of the document, convert it to <br>, if not just handle normally
                return element.children.length === 0 && parent?.type === 'root'
                  ? html('<br>')
                  : defaultHTMLHandlers.p(state, element);
              }
            },
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
          html: (state: M2HState, node: Html, parent: MDASTParent | undefined): ElementContent => {
            if (isNewLine(node)) {
              if (parent?.type === 'root') {
                log('NewLine at root level => new empty paragraph', node, parent);
                return emptyParagraph();
              }
              const siblings = parent?.children ?? [];
              const position = siblings.indexOf(node);
              if (position <= 0) {
                log('NewLine as the first node of the parent => new empty paragraph', node, parent);
                return emptyParagraph();
              } else {
                // Otherwise, only if the previous node is also a <br>, return an empty paragraph
                if (siblings[position - 1].type === 'html' && isNewLine(siblings[position - 1] as Html)) {
                  log('consecutive NewLine nodes => new empty paragraph', node, parent);
                  return emptyParagraph();
                } else {
                  // Else strip out this node, the texts are going to be converted to <p> below
                  log('NewLine node stripped', node, parent);
                  return text('');
                }
              }
            } else {
              log('Non NewLine HTML node', node, parent);
              return defaultMarkdownHandlers.html(state, node) ?? emptyParagraph();
            }
          },
          text: (state: M2HState, node, parent: MDASTParent | undefined): ElementContent => {
            if (parent?.children.length === 1) {
              log('Single text node', node, parent);
              return defaultMarkdownHandlers.text(state, node);
            } else {
              const siblings = parent?.children ?? [];
              const position = siblings.indexOf(node);
              // if the next node is a <br>, this must be a paragraph
              const nextNode = siblings[position + 1];
              if (nextNode && nextNode.type === 'html' && isNewLine(nextNode as Html)) {
                const paragraphNode = defaultMarkdownHandlers.paragraph(state, node);
                paragraphNode.children.push(defaultMarkdownHandlers.text(state, node)); // append the text to the paragraph
                log('Text node followed by <br>, converting to paragraph', node, parent, paragraphNode);
                return paragraphNode;
              }

              return defaultMarkdownHandlers.text(state, node);
            }
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
    log('HTML Result:', String(result));
    return String(result);
  };

  const HTMLToMarkdown = async (html: string) => {
    const htmlToMarkdownPipeline = await constructHtmlToMarkdownPipeline();
    const result = await htmlToMarkdownPipeline.process(html);
    log('Markdown Result:', String(result));
    return String(result);
  };

  return { markdownToHTML, HTMLToMarkdown };
};

export default UnifiedConverter;
