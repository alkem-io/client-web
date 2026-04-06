import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { ActivityItemData } from './ActivityItem';
import { ActivityItem } from './ActivityItem';

export type { ActivityItemData };

export type ActivityFilterOption = {
  value: string;
  label: string;
};

export type ActivityFeedVariant = 'spaces' | 'personal';

type ActivityFeedProps = {
  variant: ActivityFeedVariant;
  title: string;
  items: ActivityItemData[];
  loading?: boolean;
  spaceFilter: string;
  spaceFilterOptions: ActivityFilterOption[];
  onSpaceFilterChange: (value: string) => void;
  roleFilter?: string;
  roleFilterOptions?: ActivityFilterOption[];
  onRoleFilterChange?: (value: string) => void;
  onShowMore?: () => void;
  /** Max items to display before "Show more". Omit or 0 to show all. */
  maxItems?: number;
  /** When true, renders without card border/shadow (for use inside dialogs). */
  embedded?: boolean;
  className?: string;
};

export function ActivityFeed({
  variant,
  title,
  items,
  loading,
  spaceFilter,
  spaceFilterOptions,
  onSpaceFilterChange,
  roleFilter,
  roleFilterOptions,
  onRoleFilterChange,
  onShowMore,
  maxItems,
  embedded,
  className,
}: ActivityFeedProps) {
  const { t } = useTranslation('crd-dashboard');

  const visibleItems = maxItems && maxItems > 0 ? items.slice(0, maxItems) : items;
  const hasMore = maxItems && maxItems > 0 && items.length > maxItems;

  return (
    <div
      className={cn(
        'flex flex-col',
        !embedded && 'h-full rounded-lg border border-border bg-card p-6 shadow-sm',
        className
      )}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold">{title}</h3>
        </div>
      )}

      <div className="mb-6 flex gap-2 flex-wrap">
        <div>
          <label htmlFor={`space-filter-${variant}`} className="sr-only">
            {t('activity.filter.space.label')}
          </label>
          <Select value={spaceFilter} onValueChange={onSpaceFilterChange}>
            <SelectTrigger id={`space-filter-${variant}`} className="h-8 w-auto min-w-[140px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {spaceFilterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {variant === 'spaces' && roleFilterOptions && onRoleFilterChange && roleFilter !== undefined && (
          <div>
            <label htmlFor="role-filter" className="sr-only">
              {t('activity.filter.role.label')}
            </label>
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger id="role-filter" className="h-8 w-auto min-w-[130px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleFilterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div aria-busy="true" className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <output className="block py-8 text-center text-sm text-muted-foreground">{t('activity.noActivity')}</output>
      ) : (
        <div className="space-y-6">
          {visibleItems.map(item => (
            <ActivityItem key={item.id} {...item} />
          ))}
        </div>
      )}

      {(onShowMore || hasMore) && visibleItems.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <button
            type="button"
            onClick={onShowMore}
            className="w-full py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t('activity.showMore')}
          </button>
        </div>
      )}
    </div>
  );
}
