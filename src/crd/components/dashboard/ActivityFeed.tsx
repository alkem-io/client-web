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
  /** Unique ID prefix for filter controls. Prevents duplicate IDs when multiple feeds render simultaneously. */
  feedId?: string;
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
  feedId,
  className,
}: ActivityFeedProps) {
  const { t } = useTranslation('crd-dashboard');
  const idPrefix = feedId ?? variant;

  const visibleItems = maxItems && maxItems > 0 ? items.slice(0, maxItems) : items;
  const hasMore = maxItems && maxItems > 0 && items.length > maxItems;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden',
        !embedded && 'h-full rounded-lg border border-border bg-card p-6 shadow-sm',
        className
      )}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between shrink-0">
          <h3 className="text-subsection-title font-bold">{title}</h3>
        </div>
      )}

      {/* Filter row — render only when at least one filter has options. Dialog usage scoped
          to a single space passes no options and we hide the row entirely (avoiding the
          empty-Select bug where the dropdown opens with nothing to choose). */}
      {(spaceFilterOptions.length > 0 ||
        (variant === 'spaces' && roleFilterOptions && roleFilterOptions.length > 0)) && (
        <div className="mb-6 flex gap-2 flex-wrap shrink-0">
          {spaceFilterOptions.length > 0 && (
            <div>
              <label htmlFor={`${idPrefix}-space-filter`} className="sr-only">
                {t('activity.filter.space.label')}
              </label>
              <Select value={spaceFilter} onValueChange={onSpaceFilterChange}>
                <SelectTrigger
                  id={`${idPrefix}-space-filter`}
                  aria-label={t('activity.filter.space.label')}
                  className="h-8 w-auto min-w-[140px]"
                >
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
          )}

          {variant === 'spaces' &&
            roleFilterOptions &&
            roleFilterOptions.length > 0 &&
            onRoleFilterChange &&
            roleFilter !== undefined && (
              <div>
                <label htmlFor={`${idPrefix}-role-filter`} className="sr-only">
                  {t('activity.filter.role.label')}
                </label>
                <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                  <SelectTrigger
                    id={`${idPrefix}-role-filter`}
                    aria-label={t('activity.filter.role.label')}
                    className="h-8 w-auto min-w-[130px]"
                  >
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
      )}

      <div className="flex-1 min-w-0">
        {loading ? (
          <div aria-busy="true" className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
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
          <output className="block py-8 text-center text-body text-muted-foreground">{t('activity.noActivity')}</output>
        ) : (
          <div className="space-y-6 overflow-hidden">
            {visibleItems.map(item => (
              <ActivityItem key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>

      {(onShowMore || hasMore) && visibleItems.length > 0 && (
        <div className="mt-auto border-t border-border pt-4 shrink-0">
          <button
            type="button"
            onClick={onShowMore}
            className="w-full py-2 text-center text-body-emphasis text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
          >
            {t('activity.showMore')}
          </button>
        </div>
      )}
    </div>
  );
}
