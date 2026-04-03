import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { ScrollArea } from '@/crd/primitives/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { ActivityItemData } from '@/main/crdPages/dashboard/dashboardDataMappers';
import { ActivityItem } from './ActivityItem';

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
  className,
}: ActivityFeedProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="flex gap-3 flex-wrap">
        <div>
          <label htmlFor={`space-filter-${variant}`} className="sr-only">
            {t('activity.filter.space.label')}
          </label>
          <Select value={spaceFilter} onValueChange={onSpaceFilterChange}>
            <SelectTrigger id={`space-filter-${variant}`} className="h-8 text-xs min-w-[140px]">
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
              <SelectTrigger id="role-filter" className="h-8 text-xs min-w-[130px]">
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

      <ScrollArea className="max-h-[400px]">
        {loading ? (
          <div aria-busy="true" className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <output className="block text-sm text-muted-foreground py-6 text-center">{t('activity.noActivity')}</output>
        ) : (
          <div className="divide-y divide-border">
            {items.map(item => (
              <ActivityItem key={item.id} {...item} />
            ))}
          </div>
        )}
      </ScrollArea>

      {onShowMore && items.length > 0 && (
        <div className="text-center pt-1">
          <button type="button" onClick={onShowMore} className="text-sm text-primary hover:underline">
            {t('activity.showMore')}
          </button>
        </div>
      )}
    </section>
  );
}
