import { cn } from '@/crd/lib/utils';

export type MarkdownContentProps = {
  content: string;
  className?: string;
};

/**
 * Renders pre-sanitized HTML content with Tailwind prose classes.
 * The `content` string is expected to be already sanitized by the server/data layer.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none text-foreground',
        'prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:rounded prose-code:px-1',
        className
      )}
      // Content is pre-sanitized by the server/data layer (research.md R3)
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Review this //!!
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
