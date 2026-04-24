import { defaultSchema } from 'hast-util-sanitize';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
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
export function InlineMarkdown({ content, clampLines = 2, className }: InlineMarkdownProps) {
  const clampClass =
    clampLines === 0 ? '' : clampLines === 1 ? 'line-clamp-1' : clampLines === 3 ? 'line-clamp-3' : 'line-clamp-2';

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
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeRaw, { passThrough: [] }],
          [rehypeSanitize, sanitizeSchema],
        ]}
      >
        {content}
      </Markdown>
    </div>
  );
}
