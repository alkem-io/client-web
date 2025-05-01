import { once } from 'lodash';
import type { Element, Root } from 'hast';
import { Text, HTML, Paragraph } from 'mdast';
// import { Strong, Emphasis  } from 'mdast';
import type { Parent } from 'unist';
import type { Converter } from './Converter';
import { visit } from 'unist-util-visit';
import { t } from 'i18next';

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
  const constructHtmlToMarkdownPipeline = once(async () => {
    const { unified } = await import('unified');
    const { default: rehypeParse } = await import('rehype-parse');
    const { default: rehypeRemark } = await import('rehype-remark');
    const { default: rehypeRaw } = await import('rehype-raw');
    const { default: remarkStringify } = await import('remark-stringify');

    return unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeRaw)
      .use(rehypeRemark)
      .use(alkemioCustomHtmlToMarkdownMdastPlugin)
      .use(remarkStringify);
  });

  const constructMarkdownToHTMLPipeline = once(async () => {
    const { unified } = await import('unified');
    const { default: remarkParse } = await import('remark-parse');
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
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(alkemioCustomMarkdownToHtmlHandlerPlugin)
      .use(rehypeRaw, { passThrough: ['iframe'] })
      .use(rehypeSanitize, sanitizeOptions)
      .use(rehypeStringify);
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

function alkemioCustomHtmlToMarkdownMdastPlugin() {
  return (tree: Root) => {
    // TODO: with the updated version, so we need the em, strong and paragraph changes
    // Add <br> to empty paragraphs
    visit(tree, 'paragraph', (node: Element, index: number, parent: Parent) => {
      if (!node.children || node.children.length === 0) {
        parent.children[index] = { type: 'html', value: '<br>' } as HTML;
      }
    });

    visit(tree, 'em', (node: Element) => {
      if (node.children && node.children[0]) {
        const firstChild = node.children[0];
        if (firstChild.type === 'text' && 'value' in firstChild) {
          const value = (firstChild as Text).value;
          const trimmed = value.trim();
          (firstChild as Text).value = trimmed;
        }
      }
    });

    visit(tree, 'strong', (node: Element) => {
      if (node.children && node.children[0]) {
        const firstChild = node.children[0];
        if (firstChild.type === 'text' && 'value' in firstChild) {
          const value = (firstChild as Text).value;
          const trimmed = value.trim();
          (firstChild as Text).value = trimmed;
        }
      }
    });

    // Make the iFrame properties safe
    visit(tree, 'iframe', (node: Element) => {
      node.properties.src = `${node.properties.src}`;
      node.properties.position = 'absolute';
      node.properties.width = '100%';
      node.properties.height = '100%';
      node.properties.frameborder = '0';
      node.properties.webkitallowfullscreen = true;
      node.properties.allowfullscreen = true;
      node.properties.allow = 'clipboard-write';
      node.properties.title = t('components.wysiwyg-editor.embed.iframeAria', {
        title: node.properties?.title ?? 'Embedded iframe',
      });
      node.properties.loading = 'lazy';
    });
  };
}

function alkemioCustomMarkdownToHtmlHandlerPlugin() {
  return (tree: Root) => {
    // Replace <br> html nodes at root with <p>
    visit(tree, 'html', (node: Element, index: number, parent: Parent) => {
      if ('value' in node) {
        if (typeof node.value === 'string' && node.value.trim() === '<br>' && parent?.type === 'root') {
          parent.children[index] = { type: 'paragraph', children: [] } as Paragraph;
        }
      }
    });
  };
}
