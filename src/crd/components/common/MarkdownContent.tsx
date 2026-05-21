import { defaultSchema } from 'hast-util-sanitize';
import type { ComponentPropsWithoutRef } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { useMarkdownConfig } from '@/crd/lib/markdownConfig';
import { rehypeSanitizeStyles } from '@/crd/lib/rehypeSanitizeStyles';
import { remarkVerifyIframe } from '@/crd/lib/remarkVerifyIframe';
import { cn } from '@/crd/lib/utils';

const IFRAME_ALLOWED_ATTRIBUTES = [
  'src',
  'width',
  'height',
  'title',
  'allow',
  'loading',
  'frameborder',
  'referrerpolicy',
  'allowfullscreen',
  'webkitallowfullscreen',
  'mozallowfullscreen',
];

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'style'],
    iframe: IFRAME_ALLOWED_ATTRIBUTES,
  },
};

export type MarkdownContentProps = {
  /** Raw markdown string — rendered via react-markdown, not dangerouslySetInnerHTML */
  content: string;
  className?: string;
};

/**
 * Renders markdown content using react-markdown with GFM support and raw HTML passthrough.
 *
 * Mirrors the rendering stack of the MUI WrapperMarkdown (react-markdown + rehype-raw + remark-gfm)
 * but without MUI dependencies — styled entirely with Tailwind descendant selectors.
 *
 * Iframes are supported when a MarkdownConfigProvider is present in the tree.
 * The provider carries a whitelist of allowed iframe origins; iframes from
 * non-whitelisted origins are stripped. Without a provider (or with an empty
 * list), all iframes are stripped — the platform must configure the allowed
 * origins for embeds to render. Non-https iframes are always stripped.
 *
 * Does NOT depend on @tailwindcss/typography (prose classes). Typography is applied
 * via Tailwind's `[&_element]` descendant selector pattern.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const { iframeAllowedUrls } = useMarkdownConfig();

  return (
    <div
      className={cn(
        // `break-words` (overflow-wrap: break-word) so an unbreakable token
        // (long URL, gibberish word) wraps instead of forming one physical
        // line — otherwise `-webkit-line-clamp` can never overflow vertically
        // and the text spills out of the card.
        'max-w-none break-words text-body text-foreground',
        // Headings
        '[&_h1]:text-page-title [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-foreground',
        '[&_h2]:text-section-title [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-foreground',
        '[&_h3]:text-subsection-title [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground',
        '[&_h4]:text-card-title [&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:text-foreground',
        // Paragraphs
        '[&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-muted-foreground',
        '[&_p:last-child]:mb-0',
        // Links
        '[&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline',
        // Lists
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3',
        '[&_li]:mb-1 [&_li]:text-muted-foreground',
        // Code
        '[&_code]:text-foreground [&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-caption',
        '[&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:mb-3 [&_pre]:overflow-x-auto',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        // Inline formatting
        '[&_strong]:text-foreground [&_strong]:font-semibold',
        '[&_em]:italic',
        // Blockquotes
        '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:mb-3',
        // Tables
        '[&_table]:w-full [&_table]:border-collapse [&_table]:mb-3',
        '[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:bg-muted/50',
        '[&_td]:border [&_td]:border-border [&_td]:p-2',
        // Horizontal rule
        '[&_hr]:border-border [&_hr]:my-4',
        // Images
        '[&_img]:rounded-lg [&_img]:max-w-full',
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkGfm, [remarkVerifyIframe, { allowedIFrameOrigins: iframeAllowedUrls }]]}
        rehypePlugins={[
          [rehypeRaw, { passThrough: ['iframe'] }],
          [rehypeSanitize, sanitizeSchema],
          rehypeSanitizeStyles,
        ]}
        components={{ iframe: IframeRenderer }}
      >
        {content}
      </Markdown>
    </div>
  );
}

// Iframes arrive in two shapes:
//   1. Pixel-sized (e.g. pasted Figma `width="800" height="450"`) — render passthrough so the
//      iframe keeps its intrinsic box; only enforce `max-width: 100%` for narrow viewports.
//   2. Percent-sized or missing dimensions (the editor stores its embeds as `width="100%" height="100%"`) —
//      wrap in a 16:9 responsive container so the iframe doesn't collapse to zero height.
// The previous blanket `aspect-ratio: 16/9` on every iframe broke case #1 for Figma embeds, which
// reserved phantom layout space below the iframe equal to its own height.
function IframeRenderer({ width, height, className, ...props }: ComponentPropsWithoutRef<'iframe'>) {
  if (isPixelDimension(width) && isPixelDimension(height)) {
    return (
      <iframe
        {...props}
        width={width}
        height={height}
        className={cn('block max-w-full rounded-lg border-0 my-3', className)}
      />
    );
  }

  return (
    <div className="relative w-full my-3" style={{ paddingBottom: '56.25%' }}>
      <iframe {...props} className={cn('absolute inset-0 w-full h-full rounded-lg border-0', className)} />
    </div>
  );
}

function isPixelDimension(value: string | number | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  return /^\d+(\.\d+)?(px)?$/i.test(String(value).trim());
}
