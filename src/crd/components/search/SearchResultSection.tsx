import { ArrowRight, Filter } from 'lucide-react';
import type { ComponentType, ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

export type SearchFilterOption = { value: string; label: string };

export type SearchResultSectionProps = {
  ref?: Ref<HTMLElement>;
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  count: number;
  filterOptions?: SearchFilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  children: ReactNode;
};

export const SearchResultSection = ({
  ref,
  id,
  icon: Icon,
  label,
  count,
  filterOptions,
  activeFilter,
  onFilterChange,
  hasMore,
  onLoadMore,
  children,
}: SearchResultSectionProps) => {
  const { t } = useTranslation('crd-search');
  const activeFilterLabel = filterOptions?.find(f => f.value === activeFilter)?.label;
  const isFilterActive = activeFilter && activeFilter !== 'all';

  return (
    <section ref={ref} id={id} aria-label={t('search.a11y.categoryResults', { category: label })}>
      <div className="px-5 md:px-6 py-5 border-b border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
            <h3 className="text-subsection-title text-foreground">{label}</h3>
            <span className="rounded-full px-2 py-px text-caption font-semibold bg-muted text-muted-foreground">
              {count}
            </span>
          </div>

          {filterOptions && filterOptions.length > 0 && onFilterChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild={true}>
                <button
                  type="button"
                  aria-label={t('search.a11y.filterBy', { category: label })}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-control font-medium border border-border',
                    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isFilterActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                  )}
                >
                  <Filter aria-hidden="true" className="size-[13px]" />
                  {activeFilterLabel}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[102] w-40">
                {filterOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => onFilterChange(option.value)}
                    className={cn(option.value === activeFilter && 'bg-accent font-medium')}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Result grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0 m-0">{children}</ul>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm" onClick={onLoadMore}>
              {t('search.loadMore')}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
