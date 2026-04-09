import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
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
            <Badge
              key={tag.name}
              variant={isSelected ? 'default' : 'secondary'}
              className="cursor-pointer select-none gap-1.5 px-2.5 py-1 text-xs"
              onClick={() => (isSelected ? onDeselectTag(tag.name) : onSelectTag(tag.name))}
            >
              {tag.name}
              <span className="opacity-60">({tag.count})</span>
              {isSelected && <X className="w-3 h-3 ml-0.5" aria-hidden="true" />}
            </Badge>
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
