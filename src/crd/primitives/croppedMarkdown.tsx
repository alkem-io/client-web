import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';

export type CroppedMarkdownProps = {
  content: string;
  maxHeight?: string;
  className?: string;
};

export function CroppedMarkdown({ content, maxHeight = '8rem', className }: CroppedMarkdownProps) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        maxHeight,
        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
      }}
    >
      <MarkdownContent content={content} />
    </div>
  );
}
