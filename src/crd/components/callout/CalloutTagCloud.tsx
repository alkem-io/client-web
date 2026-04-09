import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type TagItem = {
  name: string;
  count: number;
};

type CalloutTagCloudProps = {
  tags: TagItem[];
  selectedTags: string[];
  resultsCount: number;
  onSelectTag: (tag: string) => void;
  onDeselectTag: (tag: string) => void;
  onClear: () => void;
  className?: string;
};

export function CalloutTagCloud({
  tags,
  selectedTags,
  resultsCount,
  onSelectTag,
  onDeselectTag,
  onClear,
  className,
}: CalloutTagCloudProps) {
  const { t } = useTranslation('crd-space');
  const hasSelection = selectedTags.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <button
              key={tag.name}
              type="button"
              className={cn(
                'inline-flex items-center select-none gap-1.5 px-2.5 py-1 text-xs rounded-full border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
              onClick={() => (isSelected ? onDeselectTag(tag.name) : onSelectTag(tag.name))}
            >
              {tag.name}
              <span className="opacity-60">({tag.count})</span>
              {isSelected && <X className="w-3 h-3 ml-0.5" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {hasSelection && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('callout.resultsCount', { count: resultsCount })}</span>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClear}>
            {t('callout.clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}
