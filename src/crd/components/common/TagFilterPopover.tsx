import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';
import { ToolbarIconButton } from './ToolbarIconButton';

type TagFilterPopoverProps = {
  tags: string[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
  className?: string;
};

/**
 * A toolbar filter button that opens a popover listing every tag as a
 * clickable toggle chip — the tags never take up space on the board itself.
 * The button highlights while any tag filter is active. Renders nothing when
 * there are no tags to filter by.
 */
export function TagFilterPopover({ tags, selectedTags, onTagClick, className }: TagFilterPopoverProps) {
  const { t } = useTranslation('crd-common');

  if (tags.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <ToolbarIconButton active={selectedTags.length > 0} aria-label={t('filters.filterByTag')} className={className}>
          <Filter className="w-4 h-4" aria-hidden="true" />
        </ToolbarIconButton>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        collisionPadding={8}
        className="w-max max-w-[20rem] max-h-[20rem] overflow-y-auto p-2"
      >
        {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
        {/* biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset */}
        <ul role="list" className="flex flex-wrap gap-1.5 list-none p-0 m-0">
          {tags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <li key={tag}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onTagClick(tag)}
                  className={cn(
                    'inline-flex items-start max-w-full px-3 py-1.5 text-caption font-medium rounded-2xl border text-left whitespace-normal [overflow-wrap:anywhere] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {tag}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
