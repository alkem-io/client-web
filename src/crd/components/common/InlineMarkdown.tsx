import { defaultSchema } from 'hast-util-sanitize';
import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { rehypeSanitizeStyles } from '@/crd/lib/rehypeSanitizeStyles';
import { cn } from '@/crd/lib/utils';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'style'],
  },
};

export type InlineMarkdownProps = {
  /** Raw markdown string. Rendered via react-markdown, never as HTML. */
  content: string;
  /**
   * Number of lines to clamp to via `line-clamp-N`. Pass 0 to disable clamping.
   * Defaults to 2 — suitable for notification/activity previews.
   */
  clampLines?: 0 | 1 | 2 | 3;
  /**
   * Render markdown links as plain (non-interactive) text instead of `<a>`. Use this
   * when the preview is rendered inside a clickable container (e.g. a card that is
   * itself an `<a>`), where a nested anchor is invalid HTML and causes a hydration error.
   */
  disableLinks?: boolean;
  /**
   * How raw HTML embedded in the markdown source is handled. Defaults to `'sanitize'`,
   * the existing behaviour: raw HTML is parsed and its attributes/styles sanitized, and
   * images/iframes are present in the DOM but CSS-hidden.
   *
   * Pass `'skip'` when content authored in one administrative scope is rendered inside
   * another (e.g. a subspace's About text excerpted onto the host space's page): raw HTML
   * is not interpreted at all (no author-supplied element, attribute or style reaches the
   * page — text inside inline tags still survives as plain text), and images are not
   * merely hidden but absent from the DOM, so the browser never requests them.
   */
  rawHtml?: 'sanitize' | 'skip';
  className?: string;
};

/**
 * Inline markdown renderer for previews (notification comments, activity descriptions,
 * list snippets) where user-provided markdown must be rendered — NOT displayed as
 * escaped HTML. Strips paragraph margins so the rendered output flows as a single
 * inline-ish block that can be truncated with `line-clamp`.
 *
 * Use this anywhere you would otherwise render a user-generated string as plain text
 * (e.g. `{comment}`) — rendering markdown/HTML-in-strings as plain text is the bug
 * this component exists to prevent. For full-width rich markdown content (callout
 * framing, post body, about view), use `MarkdownContent` instead.
 */
export function InlineMarkdown({
  content,
  clampLines = 2,
  disableLinks,
  rawHtml = 'sanitize',
  className,
}: InlineMarkdownProps) {
  const clampClass =
    clampLines === 0 ? '' : clampLines === 1 ? 'line-clamp-1' : clampLines === 3 ? 'line-clamp-3' : 'line-clamp-2';
  const isCardSafe = rawHtml === 'skip';

  // Render links as plain text inside clickable containers to avoid nested-<a> (invalid HTML).
  // In card-safe mode links are always plain text — the card itself is the only link.
  const components = {
    ...((disableLinks || isCardSafe) && { a: ({ children }: { children?: ReactNode }) => <span>{children}</span> }),
    // Card-safe table flatten: a trailing space text node (not CSS) keeps cell text apart once
    // the table's block structure is flattened away — CSS-generated spacing wouldn't show up in
    // rendered textContent.
    ...(isCardSafe && {
      td: ({ children }: { children?: ReactNode }) => <td>{children} </td>,
      th: ({ children }: { children?: ReactNode }) => <th>{children} </th>,
    }),
  };

  return (
    <div
      className={cn(
        'text-inherit',
        clampClass,
        // Flatten block elements so the preview reads as a single paragraph.
        '[&_p]:m-0 [&_p]:inline',
        '[&_h1]:text-inherit [&_h1]:font-inherit [&_h1]:m-0 [&_h1]:inline',
        '[&_h2]:text-inherit [&_h2]:font-inherit [&_h2]:m-0 [&_h2]:inline',
        '[&_h3]:text-inherit [&_h3]:font-inherit [&_h3]:m-0 [&_h3]:inline',
        '[&_h4]:text-inherit [&_h4]:font-inherit [&_h4]:m-0 [&_h4]:inline',
        '[&_ul]:inline [&_ul]:p-0 [&_ul]:m-0 [&_ul]:list-none',
        '[&_ol]:inline [&_ol]:p-0 [&_ol]:m-0 [&_ol]:list-none',
        '[&_li]:inline',
        '[&_blockquote]:inline [&_blockquote]:p-0 [&_blockquote]:m-0 [&_blockquote]:border-0',
        '[&_pre]:inline [&_pre]:m-0 [&_pre]:p-0 [&_pre]:bg-transparent',
        '[&_code]:bg-transparent [&_code]:p-0',
        '[&_img]:hidden',
        '[&_iframe]:hidden',
        '[&_hr]:hidden',
        // Keep inline emphasis visible.
        '[&_strong]:font-semibold',
        '[&_em]:italic',
        '[&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline',
        className,
        // Card-safe-only additions — never present in default ('sanitize') mode, whose class
        // list must stay byte-identical to the pre-076 behaviour for its ten existing consumers.
        isCardSafe && [
          '[&_h5]:text-inherit [&_h5]:font-inherit [&_h5]:m-0 [&_h5]:inline',
          '[&_h6]:text-inherit [&_h6]:font-inherit [&_h6]:m-0 [&_h6]:inline',
          '[&_table]:inline [&_thead]:inline [&_tbody]:inline [&_tr]:inline [&_td]:inline [&_th]:inline',
          '[&_table]:border-0 [&_td]:border-0 [&_th]:border-0 [&_td]:p-0 [&_th]:p-0',
          'break-words',
        ]
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={
          isCardSafe ? [] : [[rehypeRaw, { passThrough: [] }], [rehypeSanitize, sanitizeSchema], rehypeSanitizeStyles]
        }
        skipHtml={isCardSafe}
        // Card-safe mode renders inline text only: no images, no task-list checkboxes
        // (`input`), no footnote block (`section`) or footnote marker (`sup`) — each of
        // those either breaks the inline flow the clamp relies on or, for footnotes,
        // emits page-global ids that would collide across cards.
        disallowedElements={isCardSafe ? ['img', 'input', 'section', 'sup'] : undefined}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
