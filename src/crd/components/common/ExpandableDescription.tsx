import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type ExpandableDescriptionProps = {
  description: string;
  maxLines?: number;
  editHref?: string;
  canEdit?: boolean;
  onEdit?: () => void;
  className?: string;
};

export function ExpandableDescription({
  description,
  maxLines = 3,
  editHref,
  canEdit = false,
  onEdit,
  className,
}: ExpandableDescriptionProps) {
  const { t } = useTranslation('crd-space');
  const [isExpanded, setIsExpanded] = useState(false);

  const lineClampClasses: Record<number, string> = {
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4',
    5: 'line-clamp-5',
    6: 'line-clamp-6',
  };

  return (
    <div className={cn('relative', className)}>
      <p className={cn('text-body text-muted-foreground', !isExpanded && lineClampClasses[maxLines])}>{description}</p>
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-body-emphasis text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-expanded={isExpanded}
        >
          {isExpanded ? t('callout.collapse') : t('callout.expand')}
        </button>
        {canEdit &&
          (editHref ? (
            <a
              href={editHref}
              className="inline-flex items-center gap-1 text-body text-muted-foreground hover:text-foreground"
              aria-label={t('forms.descriptionLabel')}
            >
              <Pencil aria-hidden="true" className="size-3" />
            </a>
          ) : onEdit ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={onEdit}
              aria-label={t('forms.descriptionLabel')}
            >
              <Pencil aria-hidden="true" className="size-3" />
            </Button>
          ) : null)}
      </div>
    </div>
  );
}
