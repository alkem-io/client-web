import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { cn } from '@/crd/lib/utils';

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
 * Does NOT depend on @tailwindcss/typography (prose classes). Typography is applied
 * via Tailwind's `[&_element]` descendant selector pattern.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'max-w-none text-sm leading-relaxed text-foreground',
        // Headings
        '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-foreground',
        '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-foreground',
        '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground',
        '[&_h4]:text-base [&_h4]:font-medium [&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:text-foreground',
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
        '[&_code]:text-foreground [&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs',
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
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
        {content}
      </Markdown>
    </div>
  );
}
