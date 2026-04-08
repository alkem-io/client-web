import { StickyNote } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type ContributionMemoCardProps = {
  title: string;
  htmlContent?: string;
  onClick?: () => void;
  className?: string;
};

export function ContributionMemoCard({ title, htmlContent, onClick, className }: ContributionMemoCardProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full text-left p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <StickyNote className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
      </div>
      {htmlContent && (
        <div
          className="text-xs text-muted-foreground line-clamp-3 prose-sm"
          //!!
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </button>
  );
}
