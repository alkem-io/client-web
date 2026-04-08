import { Presentation } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type ContributionWhiteboardCardProps = {
  title: string;
  previewUrl?: string;
  onClick?: () => void;
  className?: string;
};

export function ContributionWhiteboardCard({ title, previewUrl, onClick, className }: ContributionWhiteboardCardProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full text-left border border-border rounded-lg overflow-hidden bg-card hover:shadow-sm transition-all cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="aspect-[4/3] bg-muted/30 relative">
        {previewUrl ? (
          <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Presentation className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-foreground truncate">{title}</p>
      </div>
    </button>
  );
}
