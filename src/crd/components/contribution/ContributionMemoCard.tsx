import { StickyNote } from 'lucide-react';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';

type ContributionMemoCardProps = {
  title: string;
  /** Raw markdown content for preview */
  markdownContent?: string;
  onClick?: () => void;
  className?: string;
};

export function ContributionMemoCard({ title, markdownContent, onClick, className }: ContributionMemoCardProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full text-left p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'min-h-[180px] flex flex-col',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <StickyNote className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <p className="text-body-emphasis text-foreground truncate">{title}</p>
      </div>
      {markdownContent && (
        <div className="line-clamp-3">
          <MarkdownContent content={markdownContent} className="text-caption text-muted-foreground" />
        </div>
      )}
    </button>
  );
}
