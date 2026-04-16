import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

const lineClampClasses: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

type InfoBlockProps = {
  description: string;
  maxLines?: number;
  onReadMore?: () => void;
  className?: string;
};

export function InfoBlock({ description, maxLines = 4, onReadMore, className }: InfoBlockProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('bg-primary text-primary-foreground rounded-lg p-5', className)}>
      <p className={cn('text-body opacity-90 mb-3', lineClampClasses[maxLines])}>{description}</p>
      {onReadMore && (
        <button
          type="button"
          className="text-sm font-medium text-primary-foreground opacity-80 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={onReadMore}
        >
          {t('sidebar.readMore')}
        </button>
      )}
    </div>
  );
}
