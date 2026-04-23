import { Presentation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type ContributionWhiteboardCardProps = {
  title: string;
  previewUrl?: string;
  author?: string;
  onClick?: () => void;
  className?: string;
};

export function ContributionWhiteboardCard({
  title,
  previewUrl,
  author,
  onClick,
  className,
}: ContributionWhiteboardCardProps) {
  const { t } = useTranslation('crd-space');

  return (
    <button
      type="button"
      className={cn(
        'group/wb relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 min-h-[180px] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left',
        className
      )}
      onClick={onClick}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/wb:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Presentation className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
        </div>
      )}

      {/* Hover "Open Whiteboard" button overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/wb:opacity-100 transition-opacity duration-200 bg-primary/40">
        <span className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground shadow-lg h-8 px-3 text-caption font-semibold">
          {t('callout.openWhiteboard')}
        </span>
      </div>

      {/* Title/author gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent p-3 flex flex-col justify-end pointer-events-none">
        <p className="text-white text-caption font-semibold truncate">{title}</p>
        {author && <p className="text-white/70 text-badge truncate">{author}</p>}
      </div>
    </button>
  );
}
