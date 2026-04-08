import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

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
      <p
        className="text-sm leading-relaxed opacity-90 mb-3"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {description}
      </p>
      {onReadMore && (
        <button
          type="button"
          className="text-sm font-medium text-primary-foreground opacity-80 hover:underline cursor-pointer"
          onClick={onReadMore}
        >
          {t('sidebar.readMore')}
        </button>
      )}
    </div>
  );
}
